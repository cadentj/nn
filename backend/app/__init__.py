from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import modal

from .api import lens, tokenize
from .state import AppState

app = modal.App(name="nnsight-backend")
image = (modal.Image.debian_slim()
    .pip_install("fastapi>=0.115.6")
    .pip_install("nnsight")
    .add_local_file("app/config.toml", remote_path="/root/config.toml")
)

@app.function(image=image)
@modal.concurrent(max_inputs=1000)
@modal.asgi_app()
def fastapi_app():
    web_app = FastAPI()

    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://nnterface-git-modal-cadentjs-projects.vercel.app"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )

    web_app.include_router(lens, prefix="/api")
    web_app.include_router(tokenize, prefix="/api")

    web_app.state.m = AppState()

    @web_app.get("/")
    async def root():
        return {"message": "Hello World"}

    return web_app

