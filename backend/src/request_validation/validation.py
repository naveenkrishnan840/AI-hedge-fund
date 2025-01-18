from typing import Dict, List, Any
from pydantic import BaseModel


class ChatRequest(BaseModel):
    startDate: str
    endDate: str
    ticker: str
    portfolio: Dict[str, Any]
    selectedAnalyst: List[str]

