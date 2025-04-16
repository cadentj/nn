from typing import List, Literal

from pydantic import BaseModel

class LensRequest(BaseModel):
    tokens: List[str]
    indices: List[int]

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class Conversation(BaseModel):
    id: str
    type: Literal["chat", "base"]
    title: str
    systemMessage: str
    messages: List[Message]
    prompt: str
    isExpanded: bool
    isNew: bool