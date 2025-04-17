import tomllib

from nnsight import LanguageModel


class AppState:
    def __init__(self):
        # Not using config atm
        _, model_config = self._load_config()

        self.model_config = model_config
        self.models = {}

    def get_model(self, model_name: str):
        # Check if model is available
        if not self.model_config.get(model_name, False):
            raise ValueError(f"Model {model_name} not found in config")

        # Load model if not already loaded
        if not self.models.get(model_name, False):
            rename = self.model_config[model_name]
            model = LanguageModel(model_name, rename=rename)
            self.models[model_name] = model

        return self.models[model_name]

    def _load_config(self):
        with open("/root/config.toml", "rb") as f:
            config = tomllib.load(f)
        
        # Make model config dictionary
        model_config = {}
        for _, cfg in config["models"].items():
            name = cfg["name"]
            rename = cfg["rename"]
            model_config[name] = rename

        return config, model_config