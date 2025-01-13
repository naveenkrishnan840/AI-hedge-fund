from langchain_core.messages import BaseMessage
from langgraph.graph.message import AnyMessage, add_messages
from typing import TypedDict, Annotated, List, Any, Dict, Sequence


def merge_dicts(a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, Any]:
    return {**a, **b}


class AgentState(TypedDict):
    messages: Annotated[Sequence[AnyMessage], add_messages]
    data: Annotated[Dict[str, Any], merge_dicts]
    metadata: Annotated[Dict[str, Any], merge_dicts]