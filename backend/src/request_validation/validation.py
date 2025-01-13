from typing import Dict, List, Any
from pydantic import BaseModel


class ChatRequest(BaseModel):
    start_date: str
    end_date: str
    ticker: str
    portfolio: Dict[str, Any]
    selected_analyst: List[str]
