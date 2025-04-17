# %%
import requests

body = {
    "model": "EleutherAI/gpt-j-6b",
    "text": "Hello, world!"
}
response = requests.post("https://cadentj--nnsight-backend-fastapi-app.modal.run/api/tokenize", json=body)
print(response.json())
# %%
