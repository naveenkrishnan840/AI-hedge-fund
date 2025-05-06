# AI Hedge Fund
<div align="center">
  <!-- Backend -->
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Google-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white" />
  <img src="https://img.shields.io/badge/LangGraph-FF6B6B?style=for-the-badge&logo=graph&logoColor=white" />
  <img src="https://img.shields.io/badge/financialdatasets.ai-000000?style=for-the-badge&logo=ai&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_EC2-g4dn.xlarge-orange?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS EC2 g4dn.xlarge" />
  <img src="https://img.shields.io/badge/NVIDIA-T4_16GB-76B900?style=for-the-badge&logo=nvidia&logoColor=white" alt="NVIDIA T4 16GB" />
  <img src="https://img.shields.io/badge/4_vCPUs_&_16_GiB_RAM-blue?style=for-the-badge" alt="4 vCPUs and 16 GiB RAM" />
  
  <!-- Frontend -->
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />

  <h3>Your AI Co-pilot for AI hedge fund 🚀</h3>

  <p align="center">
    <b>This is a project for an AI-powered hedge fund.  The goal of this project is to explore the use of AI to make trading decisions.  This project is real trading or investment. </b>
  </p>
</div>

This system employs several agents working together:

1. Bill Ackman Agent - Uses Bill Ackman's principles to generate trading signals
2. Warren Buffett Agent - Uses Warren Buffett's principles to generate trading signals
3. Valuation Agent - Calculates the intrinsic value of a stock and generates trading signals
4. Sentiment Agent - Analyzes market sentiment and generates trading signals
5. Fundamentals Agent - Analyzes fundamental data and generates trading signals
6. Technicals Agent - Analyzes technical indicators and generates trading signals
7. Risk Manager - Calculates risk metrics and sets position limits
8. Portfolio Manager - Makes final trading decisions and generates orders

<img width="1117" alt="Screenshot 2025-02-09 at 11 26 14 AM" src="https://github.com/user-attachments/assets/16509cc2-4b64-4c67-8de6-00d224893d58" />

## Setup

Clone the repository:
```bash
git clone https://github.com/naveenkrishnan840/AI-hedge-fund.git
cd AI-hedge-fund
```

1. Install Poetry (if not already installed):
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

2. Install dependencies:
```bash
poetry install
```

3. Set up your environment variables:
```bash
# Create .env file for your API keys
cp .env.example .env
```

4. Set your API keys:
```bash
# For running LLMs hosted by groq (deepseek, llama3, etc.)
# Get your Groq API key from https://console.cloud.google.com/
GOOGLE_API_KEY=your-google-api-key

# For getting financial data to power the hedge fund
# Get your Financial Datasets API key from https://financialdatasets.ai/
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key
```

**Important**: You must set `OPENAI_API_KEY`, `GOOGLE_API_KEY`, for the hedge fund to work.  If you want to use LLMs from all providers, you will need to set all API keys.

Financial data for AAPL, GOOGL, MSFT, NVDA, and TSLA is free and does not require an API key.

For any other ticker, you will need to set the `FINANCIAL_DATASETS_API_KEY` in the .env file.

**Example Output:**
<img width="992" alt="Screenshot 2025-01-06 at 5 50 17 PM" src="https://github.com/user-attachments/assets/e8ca04bf-9989-4a7d-a8b4-34e04666663b" />
<img width="941" alt="Screenshot 2025-01-06 at 5 47 52 PM" src="https://github.com/user-attachments/assets/00e794ea-8628-44e6-9a84-8f8a31ad3b47" />

## Project Structure 
```
ai-hedge-fund/
├── src/
│   ├── agents/                   # Agent definitions and workflow
│   │   ├── bill_ackman.py        # Bill Ackman agent
│   │   ├── fundamentals.py       # Fundamental analysis agent
│   │   ├── portfolio_manager.py  # Portfolio management agent
│   │   ├── risk_manager.py       # Risk management agent
│   │   ├── sentiment.py          # Sentiment analysis agent
│   │   ├── technicals.py         # Technical analysis agent
│   │   ├── valuation.py          # Valuation analysis agent
│   │   ├── warren_buffett.py     # Warren Buffett agent
│   ├── tools/                    # Agent tools
│   │   ├── api.py                # API tools
│   ├── backtester.py             # Backtesting tools
│   ├── main.py # Main entry point
├── pyproject.toml
├── ...
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
