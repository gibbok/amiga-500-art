.PHONY: install build serve report

install:
	npm ci

build:
	npm run build:site

serve:
	npm run serve:site

report:
	npm run report:duplicates
