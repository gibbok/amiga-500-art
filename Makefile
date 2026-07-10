.PHONY: install build serve deploy-help

install:
	npm ci

build:
	npm run build:site

serve:
	npm run serve:site

deploy-help:
	@echo "GitHub Pages deploys from .github/workflows/deploy-pages.yml"
	@echo "To publish:"
	@echo "  1. Push to the main branch, or"
	@echo "  2. Open GitHub Actions > Deploy Pages > Run workflow"
