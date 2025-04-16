from fastapi import APIRouter

from ..schema import TokenizeRequest
from ..state import state

router = APIRouter()


@router.post("/tokenize")
async def tokenize(request: TokenizeRequest):
    tok = state.get_model(request.model).tokenizer
    tokens = tok.batch_decode(tok.encode(request.text))
    return {"tokens": tokens}
