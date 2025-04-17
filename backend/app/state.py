import os
import tomllib

from nnsight import LanguageModel

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))


class AppState:
    def __init__(self):
        config = self._load_config()
        self.models = self._load_models(config)

    def get_model(self, model_name: str):
        return self.models[model_name]

    def _load_config(self):
        path = os.path.join(CURRENT_DIR, "config.toml")
        with open(path, "rb") as f:
            config = tomllib.load(f)
        return config

    def _load_models(self, config: dict):
        models = {}
        for _, model_config in config["models"].items():
            name = model_config["name"]
            rename = model_config["rename"]
            model = LanguageModel(name, rename=rename)
            models[name] = model

            print("Loaded ", name)

        return models


state = AppState()
