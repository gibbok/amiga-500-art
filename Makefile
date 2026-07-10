.PHONY: install build serve deploy-help

install:
	npm ci

build:
	npm run build:site

serve:
	npm run serve:site
