from typing import List, Literal

from pydantic import BaseModel

# REQUEST SCHEMAS

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class Conversation(BaseModel):
    type: Literal["chat", "base"]
    model: str
    name: str
    messages: List[Message]
    prompt: str
    isExpanded: bool
    selectedTokenIndices: List[int]

class LensRequest(BaseModel):
    conversations: List[Conversation]

class TokenizeRequest(BaseModel):
    text: str | List[Message]
    model: str

# RESPONSE SCHEMAS 

class LayerResults(BaseModel):
    layer_idx: int
    pred_probs: List[float]
    preds: List[str]

class ModelResults(BaseModel):
    model_name: str
    layer_results: List[LayerResults]

class LensResponse(BaseModel):
    model_results: List[ModelResults]
