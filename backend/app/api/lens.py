from collections import defaultdict

from fastapi import APIRouter
import torch as t

from ..state import state
from ..schema import LensRequest, LensResponse

router = APIRouter()

def _logit_lens(model, model_tasks):
    def decode(x):
        return model.lm_head(model.model.ln_f(x))[:,]

    results = []
    with model.trace(remote=True) as tracer:
        for task in model_tasks:
            # Get user queried indices
            idxs = task["selected_token_indices"]

            with tracer.invoke(task["prompt"]):
                for layer_idx, layer in enumerate(model.model.layers):
                    # Decode hidden state into vocabulary
                    x = layer.output[0]
                    logits = decode(x)

                    # Compute probabilities over the relevant tokens
                    relevant_tokens = logits[0, idxs, :]
                    probs = t.nn.functional.softmax(relevant_tokens, dim=-1)

                    # Get the predicted token at each index
                    preds = t.argmax(probs, dim=-1)

                    # Gather probabilities over the predicted tokens
                    pred_probs = t.gather(probs, 1, preds.unsqueeze(1)).squeeze()

                    # Save results
                    results.append({
                        "layer_idx": layer_idx,
                        "pred_probs": pred_probs.save(),
                        "preds": preds.save(),
                    })

    return results

def _process_results(model, results):
    processed_results = []
    for layer_results in results:
        # Cast to Python primatives and get Proxy values
        preds = layer_results["preds"].value
        pred_probs = layer_results["pred_probs"].tolist()
        
        # Get string for each token id prediction
        str_toks = model.tokenizer.batch_decode(preds)

        processed_results.append({
            "layer_idx": layer_results["layer_idx"],
            "pred_probs": pred_probs,
            "preds": str_toks,
        })

    return processed_results


def logit_lens(request: LensRequest):
    # Batch prompts for the same model
    tasks = defaultdict(list)
    for conversation in request.conversations:
        task = {
            "prompt": conversation.prompt,
            "selected_token_indices": conversation.selectedTokenIndices,
        }
        tasks[conversation.model].append(task)

    # Compute logit lens for each model
    all_results = []
    for model_name, model_tasks in tasks.items():
        model = state.get_model(model_name)
        results = _logit_lens(model, model_tasks)
        all_results.append({
            "model_name": model_name,
            "layer_results": _process_results(model, results),
        })

    return LensResponse(model_results=all_results)



@router.post("/lens")
async def lens(request: LensRequest):
    result = logit_lens(request)
    print(result)

    return {
        "results": "hello!",
    }
