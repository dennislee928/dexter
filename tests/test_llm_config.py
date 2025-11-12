import importlib
import os
import sys
import unittest
from pathlib import Path
from typing import Optional

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_PATH = PROJECT_ROOT / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from dexter import model as llm_model


class TestLLMConfig(unittest.TestCase):
    def setUp(self) -> None:
        self._original_env = os.environ.copy()
        self._reset_env()

    def tearDown(self) -> None:
        self._reset_env()
        self._reload_model_module()

    def _reset_env(self) -> None:
        os.environ.clear()
        os.environ.update(self._original_env)

    def _reload_model_module(self) -> None:
        # Ensure environment-driven configuration is recalculated on each test.
        importlib.reload(llm_model)

    def _set_env(self, values: dict[str, Optional[str]]) -> None:
        self._reset_env()
        os.environ.update({k: v for k, v in values.items() if v is not None})

    def test_openai_configuration_requires_api_key(self) -> None:
        with self.assertRaises(ValueError):
            llm_model._resolve_llm_config(requested_model=None)

    def test_openai_configuration_with_defaults(self) -> None:
        self._set_env({"OPENAI_API_KEY": "test-key"})
        cfg = llm_model._resolve_llm_config(requested_model=None)

        self.assertEqual(cfg.provider, "openai")
        self.assertEqual(cfg.model, "gpt-4.1")
        self.assertEqual(cfg.credential, "test-key")
        self.assertIsNone(cfg.base_url)

    def test_openai_configuration_with_overrides(self) -> None:
        self._set_env(
            {
                "OPENAI_API_KEY": "override-key",
                "OPENAI_MODEL": "gpt-4o-mini",
                "LLM_MODEL": "gpt-4.1-mini",
            }
        )
        cfg = llm_model._resolve_llm_config(requested_model=None)

        self.assertEqual(cfg.model, "gpt-4.1-mini")
        self.assertEqual(cfg.credential, "override-key")

    def test_requested_model_takes_precedence(self) -> None:
        self._set_env(
            {
                "OPENAI_API_KEY": "override-key",
                "LLM_MODEL": "gpt-4.1-mini",
            }
        )
        cfg = llm_model._resolve_llm_config(requested_model="gpt-4o-mini")

        self.assertEqual(cfg.model, "gpt-4o-mini")

    def test_localai_configuration_defaults(self) -> None:
        self._set_env({"LLM_PROVIDER": "localai", "LOCALAI_API_KEY": "dummy-key"})
        cfg = llm_model._resolve_llm_config(requested_model=None)

        self.assertEqual(cfg.provider, "localai")
        self.assertEqual(cfg.model, "gpt-4.1-mini")
        self.assertEqual(cfg.credential, "dummy-key")
        self.assertEqual(cfg.base_url, "http://localhost:8080/v1")

    def test_localai_configuration_respects_overrides(self) -> None:
        self._set_env(
            {
                "LLM_PROVIDER": "localai",
                "LOCALAI_API_KEY": "local-test",
                "LOCALAI_MODEL": "phi-3-mini",
                "LOCALAI_BASE_URL": "http://127.0.0.1:9015/v1",
            }
        )
        cfg = llm_model._resolve_llm_config(requested_model=None)

        self.assertEqual(cfg.model, "phi-3-mini")
        self.assertEqual(cfg.credential, "local-test")
        self.assertEqual(cfg.base_url, "http://127.0.0.1:9015/v1")

    def test_localai_configuration_requires_api_key(self) -> None:
        self._set_env({"LLM_PROVIDER": "localai"})
        with self.assertRaises(ValueError):
            llm_model._resolve_llm_config(requested_model=None)


if __name__ == "__main__":
    unittest.main()

