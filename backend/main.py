import datetime

import pandas as pd
from langgraph.graph import END, START, StateGraph
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from src.graph_state.state import AgentState
from src.agents.fundamental import *
from src.agents.risk_management_agent import *
from src.agents.sentiment import *
from src.agents.technicals import *
from src.agents.valuation import *
from src.agents.bill_ackman import bill_ackman_agent
from src.agents.warren_buffet import warren_buffett_agent
from src.agents.portfolio_manager import *
from src.request_validation.validation import ChatRequest
from src.tools.api import get_price_data

app = FastAPI(description="AI Hedge Fund")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app_router = APIRouter()

load_dotenv()


@app_router.post(path="/hedge-fund-request")
def interact_bot_with_request(request: Request, chatRequest: ChatRequest):
    """Create the workflow with selected analysts."""

    ticker = chatRequest.ticker
    start_date = chatRequest.startDate
    end_date = chatRequest.endDate
    portfolio = chatRequest.portfolio
    selected_analysts = chatRequest.selectedAnalyst
    workflow = StateGraph(AgentState)
    # workflow.set_entry_point(START)

    # Default to all analysts if none selected
    if not selected_analysts:
        selected_analysts = ["Technical Analyst", "Fundamentals Analyst", "Sentiment Analyst", "Valuation Analyst",
                             "Bill Ackman Analyst", "Warren Buffet Analyst"]

    # Dictionary of all available analysts
    analyst_nodes = {
        "Technical Analyst": ("technical_analyst_agent", technical_analyst_agent),
        "Fundamentals Analyst": ("fundamentals_agent", fundamentals_agent),
        "Sentiment Analyst": ("sentiment_agent", sentiment_agent),
        "Valuation Analyst": ("valuation_agent", valuation_agent),
        "Bill Ackman Analyst": ("bill_ackman_agent", bill_ackman_agent),
        "Warren Buffet Analyst": ("warren_buffet_agent", warren_buffett_agent),
    }

    # Add selected analyst nodes
    for analyst_key in selected_analysts:
        node_name, node_func = analyst_nodes[analyst_key]
        workflow.add_node(node_name, node_func)
        workflow.add_edge(start_key=START, end_key=node_name)

    # Always add risk and portfolio management
    workflow.add_node("risk_management_agent", risk_management_agent)
    workflow.add_node("portfolio_management_agent", portfolio_management_agent)

    # Connect selected analysts to risk management
    for analyst_key in selected_analysts:
        node_name = analyst_nodes[analyst_key][0]
        workflow.add_edge(start_key=node_name, end_key="risk_management_agent")

    workflow.add_edge(start_key="risk_management_agent", end_key="portfolio_management_agent")
    workflow.add_edge(start_key="portfolio_management_agent", end_key=END)

    # workflow.set_entry_point("start_node")
    app = workflow.compile()
    final_state = app.invoke(
        {
            "messages": [
                HumanMessage(
                    content="Make a trading decision based on the provided data.",
                )
            ],
            "data": {
                "ticker": ticker,
                "portfolio": portfolio,
                "start_date": start_date,
                "end_date": end_date,
                "analyst_signals": {},
            }
        },
    )

    common_decision = json.loads(final_state["messages"][-1].content)
    analyst_signals = final_state["data"]["analyst_signals"]

    # Prepare analyst signals report
    analyst_signals_table_data = []
    for agent, signal in analyst_signals.items():
        if agent not in ['risk_management_agent']:
            agent_name = agent.replace("_agent", "").replace("_", " ").title()
            signal_type = signal.get("signal", "").upper()
            analyst_signals_table_data.append({
                "analyst": agent_name,
                "signal": signal_type,
                "confidence": signal.get('confidence', "")
            })

    decision_data = {"Action": common_decision.get("action", "").upper(), "Quantity": common_decision.get('quantity'),
                     "Confidence": common_decision.get('confidence')
                     }

    date_range = pd.date_range(datetime.datetime.strptime(start_date, "%Y-%m-%d"),
                               datetime.datetime.strptime(end_date, "%Y-%m-%d"), freq="D")[0: 11]
    date_rows = []
    for date in date_range:
        date = date.strftime("%Y-%m-%d")
        # Get current price for the ticker
        df = get_price_data(ticker, date, date)
        if not df.empty:
            current_price = df.iloc[-1]["close"]

            output = app.invoke(
                {
                    "messages": [
                        HumanMessage(
                            content="Make a trading decision based on the provided data.",
                        )
                    ],
                    "data": {
                        "ticker": ticker,
                        "portfolio": portfolio,
                        "start_date": date,
                        "end_date": date,
                        "analyst_signals": {}
                    },
                },
            )
            ai_message = list(filter(lambda x: type(x) == AIMessage, output["messages"]))[0]
            decision = json.loads(ai_message.content)
            analyst_signals = output["data"]["analyst_signals"]

            action, quantity = decision.get("action", "hold"), decision.get("quantity", 0)
            total_value = portfolio["cash"]
            # Execute the trade with validation
            executed_quantity, new_portfolio = execute_trade(ticker, action, quantity, current_price, portfolio)

            # Calculate position value for this ticker
            shares_owned = new_portfolio["shares"]
            position_value = shares_owned * current_price
            total_value += position_value
            # Count signals for this ticker
            ticker_signals = {}
            # for agent, signals in analyst_signals.items():
            #     if ticker in signals:
            #         ticker_signals[agent] = signals[ticker]

            bullish_count = len([s for s in analyst_signals.values() if s.get("signal", "").lower() == "bullish"])
            bearish_count = len([s for s in analyst_signals.values() if s.get("signal", "").lower() == "bearish"])
            neutral_count = len([s for s in analyst_signals.values() if s.get("signal", "").lower() == "neutral"])

            # Get decision for this ticker
            action = decision.get("action", None)
            quantity = executed_quantity

            date_rows.append({
                "date": date,
                "ticker": ticker,
                "action": action,
                "quantity": quantity,
                "price": current_price,
                "shares_owned": shares_owned,
                "position_value": position_value,
                "bullish_count": bullish_count,
                "bearish_count": bearish_count,
                "neutral_count": neutral_count,
            })

    data = {
        "decision": decision_data,
        "analyst_signals": analyst_signals_table_data,
        "reasoning": common_decision.get("reasoning"),
        "date_range_decision": date_rows
    }

    return HTTPException(status_code=200, detail=data)


def execute_trade(ticker: str, action: str, quantity: float, current_price: float, portfolio: dict):
    """Validate and execute trades based on portfolio constraints"""
    if action == "buy" and quantity > 0:
        cost = quantity * current_price
        if cost <= portfolio["shares"]:
            # Calculate new cost basis using weighted average
            old_shares = portfolio["shares"]
            # old_cost_basis = self.portfolio["cost_basis"]
            new_shares = quantity
            new_cost = cost

            total_shares = old_shares + new_shares
            # if total_shares > 0:
            #     # Weighted average of old and new cost basis
            #     portfolio["cost_basis"][ticker] = (((old_cost_basis * old_shares) + (new_cost * new_shares)) /
            #                                        total_shares)

            # Update position and cash
            portfolio["shares"] += quantity
            portfolio["cash"] -= cost

            return quantity, portfolio
        else:
            # Calculate maximum affordable quantity
            max_quantity = portfolio["cash"] // current_price
            if max_quantity > 0:
                # Get old shares and cost basis
                old_shares = portfolio["shares"]
                old_cost_basis = portfolio["shares"]

                # Get new shares and cost
                new_shares = max_quantity
                new_cost = max_quantity * current_price

                # Calculate cost basis
                total_shares = old_shares + new_shares
                # if total_shares > 0:
                #     # Weighted average of old and new cost basis
                #     self.portfolio["cost_basis"][ticker] = (((old_cost_basis * old_shares) + (new_cost * new_shares)) /
                #                                             total_shares)

                # Update position and cash
                portfolio["shares"] += max_quantity
                portfolio["cash"] -= new_cost

                return max_quantity, portfolio
            return 0, portfolio
    elif action == "sell" and quantity > 0:
        # Calculate realized gain/loss using average cost per share
        # avg_cost_per_share = self.portfolio["cost_basis"][ticker] / self.portfolio["positions"][ticker] if self.portfolio["positions"][ticker] > 0 else 0
        # realized_gain = (current_price - avg_cost_per_share) * quantity
        # self.portfolio["realized_gains"][ticker] += realized_gain

        # Update position and cash
        portfolio["shares"] -= quantity
        portfolio["cash"] += quantity * current_price

        # Update cost basis - reduce proportionally to shares sold
        # if self.portfolio["positions"][ticker] > 0:
        #     # Cost basis per share stays the same, just reduce total cost basis proportionally
        #     remaining_ratio = (self.portfolio["positions"][ticker] - quantity) / self.portfolio["positions"][ticker]
        #     self.portfolio["cost_basis"][ticker] *= remaining_ratio
        # else:
        #     self.portfolio["cost_basis"][ticker] = 0

        return quantity, portfolio
    return 0, portfolio


app.include_router(router=app_router)

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="127.0.0.1", port=8002)
