import os
import time
from dataclasses import dataclass
from typing import List, Optional, Type

from langchain_core.messages import AIMessage
from langchain_core.tools import BaseTool
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from openai import APIConnectionError
from pydantic import BaseModel

from dexter.prompts import DEFAULT_SYSTEM_PROMPT

# Initialize the OpenAI client
# Make sure your OPENAI_API_KEY is set in your .env
@dataclass(frozen=True)
class LLMConfig:
    """Resolved configuration for the runtime LLM provider."""

    provider: str
    model: str
    credential: Optional[str]
    base_url: Optional[str]


def _get_env(key: str) -> Optional[str]:
    value = os.getenv(key)
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _resolve_llm_config(requested_model: Optional[str]) -> LLMConfig:
    """
    Resolve the active LLM configuration.

    Priority order for model name:
    1. Function argument
    2. `LLM_MODEL`
    3. Provider-specific override (e.g., `LOCALAI_MODEL`, `OPENAI_MODEL`)
    4. Library default
    """
    provider = (_get_env("LLM_PROVIDER") or "openai").lower()
    global_model_override = _get_env("LLM_MODEL")
    chosen_model = requested_model or global_model_override

    if provider == "localai":
        model_name = chosen_model or _get_env("LOCALAI_MODEL") or "gpt-4.1-mini"
        base_url = _get_env("LOCALAI_BASE_URL") or "http://localhost:8080/v1"
        credential = _get_env("LOCALAI_API_KEY")
        if not credential:
            raise ValueError(
                "LOCALAI_API_KEY is not set. Provide LOCALAI_API_KEY (it can be a dummy value) when LLM_PROVIDER=localai."
            )
        return LLMConfig(provider=provider, model=model_name, credential=credential, base_url=base_url)

    # Default to OpenAI when provider is not explicitly supported.
    provider = "openai"
    model_name = chosen_model or _get_env("OPENAI_MODEL") or "gpt-4.1"
    base_url = _get_env("OPENAI_BASE_URL")
    credential = _get_env("OPENAI_API_KEY")

    if not credential:
        raise ValueError(
            "OPENAI_API_KEY is not set. Provide OPENAI_API_KEY or configure LocalAI by setting LLM_PROVIDER=localai."
        )

    return LLMConfig(provider=provider, model=model_name, credential=credential, base_url=base_url)


def call_llm(
    prompt: str,
    model: Optional[str] = None,
    system_prompt: Optional[str] = None,
    output_schema: Optional[Type[BaseModel]] = None,
    tools: Optional[List[BaseTool]] = None,
) -> AIMessage:
    """
    Invoke the configured LLM provider with optional structured output or tool bindings.

    The `model` argument has the highest precedence, followed by environment overrides.
    """
    final_system_prompt = system_prompt if system_prompt else DEFAULT_SYSTEM_PROMPT

    prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system", final_system_prompt),
            ("user", "{prompt}"),
        ]
    )

    llm_config = _resolve_llm_config(model)

    # Initialize the LLM with provider-specific configuration.
    llm = ChatOpenAI(
        model=llm_config.model,
        temperature=0,
        api_key=llm_config.credential,
        base_url=llm_config.base_url,
    )

    # Add structured output or tools to the LLM.
    runnable = llm
    if output_schema:
        runnable = llm.with_structured_output(output_schema, method="function_calling")
    elif tools:
        runnable = llm.bind_tools(tools)

    chain = prompt_template | runnable

    # Retry logic for transient connection errors
    for attempt in range(3):
        try:
            return chain.invoke({"prompt": prompt})
        except APIConnectionError:
            if attempt == 2:  # Last attempt
                raise
            time.sleep(0.5 * (2**attempt))  # 0.5s, 1s backoff
