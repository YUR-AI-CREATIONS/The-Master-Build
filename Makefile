.PHONY: help install dev build test clean docker-build docker-up docker-down validate

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install Python and Node dependencies
	pip install -r requirements.txt
	npm install

dev-backend: ## Run backend in development mode
	python -m uvicorn app:app --reload --port 8090

dev-frontend: ## Run frontend in development mode
	npm run dev

build-frontend: ## Build frontend for production
	npm run build

test: ## Run tests
	pytest -v

test-cov: ## Run tests with coverage
	pytest --cov=. --cov-report=html --cov-report=term

lint: ## Lint code
	flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics || true
	npm run lint || true

validate: ## Validate system setup
	python setup_validation.py

docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start Docker services
	docker-compose up -d

docker-down: ## Stop Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

deploy: ## Deploy with Docker
	@echo "Deploying Trinity AI Platform..."
	@if [ -f .env ]; then \
		docker-compose up -d --build; \
		echo "✅ Deployment complete!"; \
		echo "Access the application at:"; \
		echo "  - Frontend: http://localhost:80"; \
		echo "  - Backend:  http://localhost:8090"; \
		echo "  - API Docs: http://localhost:8090/api/docs"; \
	else \
		echo "❌ .env file not found. Run: cp .env.example .env"; \
		exit 1; \
	fi

clean: ## Clean build artifacts
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	rm -rf dist/ build/ .pytest_cache/ htmlcov/ .coverage
	@echo "✅ Cleaned build artifacts"

health: ## Check health of deployed services
	@echo "Checking backend health..."
	@curl -s http://localhost:8090/health/ai | python -m json.tool || echo "Backend not running"
	@echo ""
	@echo "Checking services..."
	@docker-compose ps || echo "Docker services not running"
