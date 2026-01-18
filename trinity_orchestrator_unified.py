"""
Production-Grade Trinity Orchestrator
Multi-provider AI orchestration with intelligent routing, fallback, and cost optimization
"""

import asyncio
import hashlib
import logging
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ProviderConfig:
    """Configuration for each AI provider"""

    PROVIDERS = {
        "openai": {
            "name": "OpenAI",
            "models": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
            "default_model": "gpt-4-turbo",
            "capabilities": ["text", "code", "vision", "function_calling"],
            "cost_per_1k_input": 0.01,
            "cost_per_1k_output": 0.03,
            "max_tokens": 4096,
            "priority": 1,
        },
        "anthropic": {
            "name": "Anthropic Claude",
            "models": [
                "claude-3-5-sonnet-latest",
                "claude-3-opus-latest",
                "claude-3-haiku-latest",
            ],
            "default_model": "claude-3-5-sonnet-latest",
            "capabilities": ["text", "code", "analysis", "vision"],
            "cost_per_1k_input": 0.003,
            "cost_per_1k_output": 0.015,
            "max_tokens": 4096,
            "priority": 2,
        },
        "google": {
            "name": "Google Gemini",
            "models": ["gemini-pro", "gemini-pro-vision"],
            "default_model": "gemini-pro",
            "capabilities": ["text", "vision", "analysis"],
            "cost_per_1k_input": 0.00025,
            "cost_per_1k_output": 0.0005,
            "max_tokens": 2048,
            "priority": 3,
        },
        "grok": {
            "name": "xAI Grok",
            "models": ["grok-2-latest", "grok-beta"],
            "default_model": "grok-2-latest",
            "capabilities": ["text", "code", "real_time"],
            "cost_per_1k_input": 0.002,
            "cost_per_1k_output": 0.01,
            "max_tokens": 4096,
            "priority": 4,
        },
    }

    @classmethod
    def get_provider(cls, provider_name: str) -> Optional[Dict]:
        return cls.PROVIDERS.get(provider_name.lower())

    @classmethod
    def get_available_providers(cls) -> List[str]:
        """Get list of providers with configured API keys"""
        available = []
        if settings.OPENAI_API_KEY:
            available.append("openai")
        if settings.ANTHROPIC_API_KEY:
            available.append("anthropic")
        if settings.GOOGLE_API_KEY or settings.GOOGLE_GEMINI_API_KEY:
            available.append("google")
        if settings.XAI_API_KEY:
            available.append("grok")
        return available


class TrinityOrchestratorUnified:
    """
    Production-grade AI orchestrator with:
    - Intelligent provider selection
    - Automatic fallback on failure
    - Cost tracking and optimization
    - Response caching
    - Load balancing
    """

    def __init__(self):
        self.provider_health: Dict[str, bool] = {}
        self.provider_response_times: Dict[str, List[float]] = {}
        self.cache: Dict[str, Any] = {}
        self._initialize_providers()

    def _initialize_providers(self):
        """Initialize provider health tracking"""
        for provider in ProviderConfig.get_available_providers():
            self.provider_health[provider] = True
            self.provider_response_times[provider] = []

        logger.info(
            f"Initialized orchestrator with providers: {list(self.provider_health.keys())}"
        )

    def _generate_cache_key(
        self, provider: str, prompt: str, model: Optional[str] = None
    ) -> str:
        """Generate cache key for request"""
        data = f"{provider}:{model}:{prompt}"
        return hashlib.sha256(data.encode()).hexdigest()

    def _check_cache(self, cache_key: str) -> Optional[Dict]:
        """Check if response is cached"""
        if cache_key in self.cache:
            cached = self.cache[cache_key]
            # Check if cache is still valid (1 hour TTL)
            if time.time() - cached["timestamp"] < 3600:
                logger.info(f"Cache hit for key: {cache_key[:16]}...")
                return cached["response"]
            else:
                # Expired, remove
                del self.cache[cache_key]
        return None

    def _cache_response(self, cache_key: str, response: Dict):
        """Cache a response"""
        self.cache[cache_key] = {"response": response, "timestamp": time.time()}

    def _select_optimal_provider(
        self, requested_provider: Optional[str] = None, task_type: str = "text"
    ) -> str:
        """
        Select the best provider based on:
        - User request
        - Provider health
        - Response time
        - Cost efficiency
        """
        available = ProviderConfig.get_available_providers()

        if not available:
            raise Exception("No AI providers configured. Please add API keys to .env")

        # If specific provider requested and available
        if requested_provider:
            provider_name = requested_provider.lower()
            if provider_name in available and self.provider_health.get(
                provider_name, False
            ):
                return provider_name
            logger.warning(
                f"Requested provider {requested_provider} unavailable, selecting alternative"
            )

        # Select based on health and performance
        healthy_providers = [p for p in available if self.provider_health.get(p, True)]

        if not healthy_providers:
            # All unhealthy, reset and try default
            logger.warning("All providers unhealthy, resetting health status")
            for p in available:
                self.provider_health[p] = True
            healthy_providers = available

        # For now, use priority order from config
        for provider in ["openai", "anthropic", "google", "grok"]:
            if provider in healthy_providers:
                return provider

        return healthy_providers[0]

    async def _execute_provider(
        self, provider: str, prompt: str, model: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        """Execute request on specific provider"""
        start_time = time.time()

        try:
            provider_config = ProviderConfig.get_provider(provider)
            if not provider_config:
                raise ValueError(f"Unknown provider: {provider}")

            if not model:
                model = provider_config["default_model"]

            # Route to appropriate provider
            if provider == "openai":
                result = await self._call_openai(prompt, model, **kwargs)
            elif provider == "anthropic":
                result = await self._call_anthropic(prompt, model, **kwargs)
            elif provider == "google":
                result = await self._call_google(prompt, model, **kwargs)
            elif provider == "grok":
                result = await self._call_grok(prompt, model, **kwargs)
            else:
                raise ValueError(f"Provider {provider} not implemented")

            # Track performance
            response_time = (time.time() - start_time) * 1000  # ms
            self.provider_response_times[provider].append(response_time)
            if len(self.provider_response_times[provider]) > 100:
                self.provider_response_times[provider].pop(0)

            # Mark provider as healthy
            self.provider_health[provider] = True

            # Calculate cost
            input_tokens = len(prompt.split()) * 1.3  # Rough estimate
            output_tokens = len(str(result).split()) * 1.3
            cost = self._calculate_cost(provider, input_tokens, output_tokens)

            return {
                "success": True,
                "provider": provider,
                "model": model,
                "response": result,
                "metadata": {
                    "response_time_ms": round(response_time, 2),
                    "input_tokens": int(input_tokens),
                    "output_tokens": int(output_tokens),
                    "cost_usd": round(cost, 6),
                    "timestamp": datetime.utcnow().isoformat(),
                },
            }

        except Exception as e:
            # Mark provider as unhealthy
            self.provider_health[provider] = False
            logger.error(f"Provider {provider} failed: {str(e)}")

            return {
                "success": False,
                "provider": provider,
                "error": str(e),
                "error_type": type(e).__name__,
            }

    def _calculate_cost(
        self, provider: str, input_tokens: float, output_tokens: float
    ) -> float:
        """Calculate cost in USD"""
        config = ProviderConfig.get_provider(provider)
        if not config:
            return 0.0

        input_cost = (input_tokens / 1000) * config["cost_per_1k_input"]
        output_cost = (output_tokens / 1000) * config["cost_per_1k_output"]
        return input_cost + output_cost

    async def _call_openai(self, prompt: str, model: str, **kwargs) -> str:
        """Call OpenAI API"""
        from openai import OpenAI

        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        response = await asyncio.to_thread(
            client.chat.completions.create,
            model=model,
            messages=[{"role": "user", "content": prompt}],
            **kwargs,
        )
        return response.choices[0].message.content

    async def _call_anthropic(self, prompt: str, model: str, **kwargs) -> str:
        """Call Anthropic API"""
        import anthropic

        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

        max_tokens = kwargs.pop("max_tokens", 4096)
        response = await asyncio.to_thread(
            client.messages.create,
            model=model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
            **kwargs,
        )
        return response.content[0].text

    async def _call_google(self, prompt: str, model: str, **kwargs) -> str:
        """Call Google Gemini API"""
        import google.generativeai as genai

        genai.configure(
            api_key=settings.GOOGLE_API_KEY or settings.GOOGLE_GEMINI_API_KEY
        )

        model_instance = genai.GenerativeModel(model)
        response = await asyncio.to_thread(model_instance.generate_content, prompt)
        return response.text

    async def _call_grok(self, prompt: str, model: str, **kwargs) -> str:
        """Call xAI Grok API"""
        import httpx

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.x.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.XAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    **kwargs,
                },
                timeout=settings.REQUEST_TIMEOUT,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def run(
        self,
        provider: Optional[str] = None,
        prompt: str = "",
        model: Optional[str] = None,
        use_cache: bool = True,
        enable_fallback: bool = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Main orchestration method

        Args:
            provider: Specific provider to use (optional)
            prompt: The prompt/input text
            model: Specific model to use (optional)
            use_cache: Whether to use cached responses
            enable_fallback: Whether to fall back to other providers on failure
            **kwargs: Additional provider-specific parameters

        Returns:
            Dict with response and metadata
        """
        if enable_fallback is None:
            enable_fallback = settings.ENABLE_FALLBACK

        # Check cache
        if use_cache:
            cache_key = self._generate_cache_key(provider or "auto", prompt, model)
            cached = self._check_cache(cache_key)
            if cached:
                return {**cached, "from_cache": True}

        # Select provider
        selected_provider = self._select_optimal_provider(provider)
        logger.info(f"Selected provider: {selected_provider}")

        # Execute with retry and fallback
        max_retries = settings.MAX_RETRIES if enable_fallback else 1
        available_providers = ProviderConfig.get_available_providers()

        for attempt in range(max_retries):
            result = await self._execute_provider(
                selected_provider, prompt, model, **kwargs
            )

            if result["success"]:
                # Cache successful response
                if use_cache:
                    self._cache_response(cache_key, result)

                return result

            # If failed and fallback enabled, try next provider
            if enable_fallback and attempt < max_retries - 1:
                # Find next available provider
                try:
                    current_idx = available_providers.index(selected_provider)
                    next_idx = (current_idx + 1) % len(available_providers)
                    selected_provider = available_providers[next_idx]
                    logger.warning(f"Falling back to provider: {selected_provider}")
                except (ValueError, IndexError):
                    break

        # All attempts failed
        return {
            "success": False,
            "error": "All providers failed",
            "attempts": max_retries,
        }

    async def execute(self, provider: str, prompt: str, **kwargs):
        """Alias for run() for backwards compatibility"""
        return await self.run(provider=provider, prompt=prompt, **kwargs)

    def get_health_status(self) -> Dict[str, Any]:
        """Get orchestrator health status"""
        return {
            "providers": {
                name: {
                    "healthy": self.provider_health.get(name, False),
                    "avg_response_time_ms": round(
                        sum(self.provider_response_times.get(name, [0]))
                        / max(len(self.provider_response_times.get(name, [1])), 1),
                        2,
                    ),
                }
                for name in ProviderConfig.get_available_providers()
            },
            "cache_size": len(self.cache),
            "available_providers": ProviderConfig.get_available_providers(),
        }
