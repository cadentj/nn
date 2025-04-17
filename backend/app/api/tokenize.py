from fastapi import APIRouter

from ..schema import TokenizeRequest
from ..state import state

router = APIRouter()


@router.post("/tokenize")
async def tokenize(request: TokenizeRequest):
    tok = state.get_model(request.model).tokenizer
    if isinstance(request.text, list):
        formatted = tok.apply_chat_template(
            request.text, tokenize=False, add_special_tokens=False
        )
        tokens = tok.batch_decode(tok.encode(formatted))
    else:
        tokens = tok.batch_decode(tok.encode(request.text))
    return {"tokens": tokens}
