import os
import tomllib
from typing import Dict

from nnsight import LanguageModel
import modal

from .schema import ModelsConfig

class AppState:
    def __init__(self):
        self._login()
        
        config, model_id_map = self._load_config()

        self.config = config
        self.model_id_map = model_id_map
        self.models: Dict[str, LanguageModel] = {}

    def _login(self):
        """Set NDIF API key."""
        from nnsight import CONFIG
        ndif_key = "018cf72e1e3b427f8067e4bf4d9c0aac"
        # ndif_key = modal.Secret.from_name("ndif")
        
        CONFIG.set_default_api_key(ndif_key)

    def get_model(self, model_name: str):
        """Check if a model is available. Load to disk if not."""
        model_id = self.model_id_map.get(model_name, False)

        # Check if model is available
        if not model_id:
            raise ValueError(f"{model_name} not available.")
        
        config = self.config.models[model_id]
        
        # Check if model is served on NDIF
        if not config.serve:
            raise ValueError(f"{model_name} not being served.")
        
        # Load model if not already loaded
        if not self.models.get(model_name, False):
            model = LanguageModel(model_name, rename=config.rename)
            self.models[model_name] = model

        return self.models[model_name]
    
    def get_config(self):
        return self.config

    def _load_config(self):
        with open("/root/config.toml", "rb") as f:
            config = ModelsConfig(**tomllib.load(f))
        
        # Make model name map
        model_id_map = {}
        for model_id, cfg in config.models.items():
            model_id_map[cfg.name] = model_id

        return config, model_id_map