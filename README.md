# Amiga 500 Art Portfolio

Static portfolio website for Commodore Amiga 500 artwork.

## Local Development

Install dependencies:

```sh
make install
```

Build the site into `website/`:

```sh
make build
```

Build and serve locally:

```sh
make serve
```

## Publish On GitHub Pages

This repository includes a free GitHub Pages deployment workflow at `.github/workflows/deploy-pages.yml`.

### One-time GitHub setup

1. Open the repository on GitHub.
2. Go to `Settings` > `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.

### Deploy automatically

Push changes to the `main` branch. The `Deploy Pages` workflow will build the site with:

```sh
npm run build:site
```

Then it uploads the `website/` folder to GitHub Pages.

### Deploy manually

You can also deploy with a click:

1. Open the repository on GitHub.
2. Go to `Actions`.
3. Select `Deploy Pages`.
4. Click `Run workflow`.
5. Choose the `main` branch and run it.

The published URL appears in the completed workflow summary and in `Settings` > `Pages`.

For a reminder in the terminal:

```sh
make deploy-help
```
