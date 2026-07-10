import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

type Artwork = {
  fileName: string;
  fileStem: string;
  slug: string;
  title: string;
  width: number;
  height: number;
  imagePath: string;
  detailPath: string;
};

const repoRoot = process.cwd();
const artDir = path.join(repoRoot, "art");
const websiteDir = path.join(repoRoot, "website");
const assetsDir = path.join(websiteDir, "assets");
const publishedArtDir = path.join(assetsDir, "art");

const styles = `
:root {
  --bg: #08111f;
  --bg-deep: #050914;
  --panel: rgba(10, 22, 43, 0.92);
  --panel-strong: rgba(15, 31, 56, 0.98);
  --line: #65f4ff;
  --line-soft: rgba(101, 244, 255, 0.32);
  --accent: #ff4db8;
  --accent-2: #ffe45c;
  --text: #eff7ff;
  --muted: #9dc2d9;
  --shadow: rgba(0, 0, 0, 0.38);
  --hero-glow: rgba(255, 77, 184, 0.18);
  --max-width: 1160px;
  --radius: 18px;
  --radius-small: 10px;
  --border-thick: 4px;
  --border-thin: 2px;
  --space-1: 0.4rem;
  --space-2: 0.75rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
  --space-6: 3rem;
  --space-7: 4rem;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  background:
    radial-gradient(circle at top, rgba(71, 140, 255, 0.24), transparent 28%),
    radial-gradient(circle at 80% 20%, rgba(255, 77, 184, 0.16), transparent 24%),
    linear-gradient(180deg, #12316f 0%, var(--bg) 38%, var(--bg-deep) 100%);
  font-family: "VT323", "Courier New", monospace;
  letter-spacing: 0.03em;
  position: relative;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.05) 0,
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px,
      transparent 4px
    ),
    linear-gradient(90deg, rgba(101, 244, 255, 0.04) 1px, transparent 1px);
  background-size: 100% 4px, 24px 24px;
  opacity: 0.26;
  z-index: -1;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

.shell {
  width: min(calc(100% - 2rem), var(--max-width));
  margin: 0 auto;
  padding: var(--space-5) 0 var(--space-7);
}

.masthead,
.panel,
.gallery-card,
.detail-stage,
.about-copy,
.stat-chip {
  border: var(--border-thin) solid var(--line);
  border-radius: var(--radius);
  background: var(--panel);
  box-shadow:
    0 0 0 3px rgba(6, 14, 31, 0.8),
    0 16px 40px var(--shadow),
    0 0 28px var(--hero-glow);
  position: relative;
}

.masthead::after,
.panel::after,
.gallery-card::after,
.detail-stage::after,
.about-copy::after,
.stat-chip::after {
  content: "";
  position: absolute;
  inset: 8px;
  border: 1px solid var(--line-soft);
  border-radius: calc(var(--radius) - 8px);
  pointer-events: none;
}

.masthead {
  padding: var(--space-5);
  overflow: hidden;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: "Press Start 2P", monospace;
  font-size: clamp(0.72rem, 1.7vw, 1rem);
  line-height: 1.6;
  text-transform: uppercase;
  color: var(--accent-2);
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.45);
}

.brand-mark {
  width: 1.05rem;
  height: 1.05rem;
  background:
    linear-gradient(90deg, var(--line) 0 50%, var(--accent) 50% 100%);
  box-shadow: 0 0 0 2px #02111f;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.nav a,
.button-link {
  padding: 0.65rem 1rem;
  border: var(--border-thin) solid var(--line);
  border-radius: 999px;
  font-family: "Press Start 2P", monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  background: rgba(12, 25, 45, 0.92);
  box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.32);
  transition: transform 120ms ease, background 120ms ease, color 120ms ease;
}

.nav a:hover,
.button-link:hover,
.nav a:focus-visible,
.button-link:focus-visible {
  transform: translateY(-2px);
  background: var(--accent);
  color: #fff9fd;
  outline: none;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.8fr);
  gap: var(--space-5);
  align-items: center;
}

.eyebrow {
  display: inline-block;
  margin-bottom: var(--space-3);
  padding: 0.45rem 0.8rem;
  border: 2px solid rgba(255, 228, 92, 0.5);
  color: var(--accent-2);
  background: rgba(255, 228, 92, 0.08);
  font-family: "Press Start 2P", monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
}

.hero h1,
.page-title {
  margin: 0;
  font-family: "Press Start 2P", monospace;
  text-transform: uppercase;
  line-height: 1.18;
  font-size: clamp(1.6rem, 4vw, 3.4rem);
  text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.42);
}

.hero p,
.lede,
.about-copy p,
.detail-copy p {
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 1.55rem);
  color: var(--muted);
  line-height: 1.35;
}

.hero-copy {
  display: grid;
  gap: var(--space-4);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.button-link.alt {
  border-color: var(--accent-2);
  color: var(--accent-2);
}

.status-panel {
  padding: var(--space-4);
  background:
    linear-gradient(180deg, rgba(15, 31, 56, 0.98), rgba(7, 17, 34, 0.98));
}

.status-grid {
  display: grid;
  gap: var(--space-3);
}

.stat-chip {
  padding: var(--space-3);
  border-radius: var(--radius-small);
  background: rgba(9, 19, 39, 0.92);
}

.stat-label {
  font-family: "Press Start 2P", monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  color: var(--accent-2);
  margin-bottom: 0.65rem;
  display: block;
}

.stat-value {
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  color: var(--line);
}

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-3);
  margin: var(--space-6) 0 var(--space-4);
}

.section-head h2 {
  margin: 0;
  font-family: "Press Start 2P", monospace;
  font-size: clamp(1rem, 2vw, 1.5rem);
  text-transform: uppercase;
}

.section-head p {
  margin: 0;
  font-size: 1.25rem;
  color: var(--muted);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}

.gallery-card {
  overflow: hidden;
  display: grid;
  gap: 0;
}

.gallery-card figure {
  margin: 0;
  position: relative;
  background:
    linear-gradient(135deg, rgba(255, 77, 184, 0.2), rgba(101, 244, 255, 0.18));
}

.gallery-card img {
  aspect-ratio: 5 / 4;
  width: 100%;
  object-fit: cover;
}

.gallery-card figcaption {
  padding: var(--space-4);
  display: grid;
  gap: var(--space-2);
}

.card-title,
.detail-title {
  margin: 0;
  font-family: "Press Start 2P", monospace;
  font-size: 0.86rem;
  line-height: 1.6;
  text-transform: uppercase;
}

.card-meta,
.detail-meta {
  color: var(--muted);
  font-size: 1.2rem;
}

.card-link {
  justify-self: start;
  margin-top: var(--space-2);
}

.panel {
  padding: var(--space-5);
}

.detail-layout {
  display: grid;
  gap: var(--space-5);
}

.detail-stage {
  overflow: hidden;
  padding: var(--space-3);
  background:
    linear-gradient(180deg, rgba(17, 36, 67, 0.95), rgba(8, 17, 31, 0.95));
  display: flex;
  justify-content: center;
}

.detail-media {
  width: min(100%, var(--art-width, 720px));
}

.detail-stage img {
  width: 100%;
  border-radius: calc(var(--radius) - 8px);
  border: 2px solid rgba(255, 255, 255, 0.08);
}

.detail-copy,
.about-copy {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5);
}

.detail-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.footer {
  margin-top: var(--space-6);
  padding: var(--space-4) 0 0;
  color: var(--muted);
  font-size: 1.1rem;
}

@media (max-width: 860px) {
  .shell {
    width: min(calc(100% - 1rem), var(--max-width));
    padding-top: var(--space-4);
  }

  .masthead,
  .panel,
  .detail-copy,
  .about-copy {
    padding: var(--space-4);
  }

  .hero {
    grid-template-columns: 1fr;
  }

  .topbar,
  .section-head {
    align-items: start;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .nav,
  .hero-actions,
  .detail-nav {
    width: 100%;
  }

  .nav a,
  .button-link {
    width: 100%;
    text-align: center;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .hero h1,
  .page-title {
    font-size: 1.5rem;
  }
}
`.trimStart();

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleize(fileStem: string): string {
  const match = fileStem.match(/(\d+)/);
  if (match) {
    return `Artwork ${match[1]}`;
  }

  return fileStem
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function ensureDir(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}

function readPngSize(filePath: string): { width: number; height: number } {
  const buffer = readFileSync(filePath);
  const pngSignature = "89504e470d0a1a0a";

  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    throw new Error(`Unsupported image format for ${filePath}. Expected PNG.`);
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function writePage(targetPath: string, html: string): void {
  ensureDir(path.dirname(targetPath));
  writeFileSync(targetPath, html);
}

function relativePath(fromDir: string, toPath: string): string {
  return path.relative(fromDir, toPath).split(path.sep).join("/");
}

function renderLayout(options: {
  pageTitle: string;
  description: string;
  bodyClass?: string;
  currentPath: string;
  content: string;
}): string {
  const currentDir = path.dirname(options.currentPath);
  const stylesheetHref = relativePath(currentDir, path.join(assetsDir, "site.css"));
  const indexHref = relativePath(currentDir, path.join(websiteDir, "index.html"));
  const aboutHref = relativePath(currentDir, path.join(websiteDir, "about", "index.html"));

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(options.pageTitle)}</title>
    <meta name="description" content="${escapeHtml(options.description)}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${stylesheetHref}">
  </head>
  <body${options.bodyClass ? ` class="${escapeHtml(options.bodyClass)}"` : ""}>
    <div class="shell">
      <header class="masthead">
        <div class="topbar">
          <a class="brand" href="${indexHref}">
            <span class="brand-mark" aria-hidden="true"></span>
            <span>Amiga 500 Art</span>
          </a>
          <nav class="nav" aria-label="Primary">
            <a href="${indexHref}">Gallery</a>
            <a href="${aboutHref}">About</a>
          </nav>
        </div>
        ${options.content}
      </header>
      <footer class="footer">
        Commodore Amiga 500 artwork portfolio. Generated from the repository art archive.
      </footer>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildArtworks(): Artwork[] {
  if (!existsSync(artDir) || !statSync(artDir).isDirectory()) {
    throw new Error("Expected an art directory with PNG files.");
  }

  const imageFiles = readdirSync(artDir)
    .filter((entry) => entry.toLowerCase().endsWith(".png"))
    .sort((left, right) => left.localeCompare(right));

  return imageFiles.map((fileName) => {
    const fileStem = fileName.replace(/\.png$/i, "");
    const slug = slugify(fileStem);
    const filePath = path.join(artDir, fileName);
    const { width, height } = readPngSize(filePath);

    return {
      fileName,
      fileStem,
      slug,
      title: titleize(fileStem),
      width,
      height,
      imagePath: `assets/art/${fileName}`,
      detailPath: `art/${slug}/index.html`
    };
  });
}

function renderIndexPage(artworks: Artwork[]): string {
  const cards = artworks
    .map((artwork) => {
      return `<article class="gallery-card">
  <figure>
    <img src="${artwork.imagePath}" alt="${escapeHtml(artwork.title)}">
    <figcaption>
      <h3 class="card-title">${escapeHtml(artwork.title)}</h3>
      <a class="button-link card-link" href="${artwork.detailPath}">Open Artwork</a>
    </figcaption>
  </figure>
</article>`;
    })
    .join("\n");

  return renderLayout({
    pageTitle: "Amiga 500 Art Gallery",
    description: "Retro gallery portfolio for Commodore Amiga 500 artwork.",
    currentPath: path.join(websiteDir, "index.html"),
    content: `
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Pixel Gallery</span>
          <h1>Commodore Amiga 500 Artwork Archive</h1>
          <p>A hobby portfolio built as a retro display cabinet for original Amiga 500 visuals, screenshots, and color-heavy experiments.</p>
          <div class="hero-actions">
            <a class="button-link" href="#gallery">Browse Gallery</a>
            <a class="button-link alt" href="about/">About This Project</a>
          </div>
        </div>
        <aside class="panel status-panel" aria-label="Portfolio stats">
          <div class="status-grid">
            <div class="stat-chip">
              <span class="stat-label">Works Online</span>
              <strong class="stat-value">${artworks.length}</strong>
            </div>
            <div class="stat-chip">
              <span class="stat-label">Platform</span>
              <strong class="stat-value">Amiga 500</strong>
            </div>
            <div class="stat-chip">
              <span class="stat-label">Format</span>
              <strong class="stat-value">PNG Archive</strong>
            </div>
          </div>
        </aside>
      </section>

      <section id="gallery" aria-labelledby="gallery-title">
        <div class="section-head">
          <div>
            <h2 id="gallery-title">Gallery Grid</h2>
            <p>Filename-ordered snapshots from the repository art collection.</p>
          </div>
        </div>
        <div class="gallery-grid">
          ${cards}
        </div>
      </section>
    `
  });
}

function renderAboutPage(): string {
  return renderLayout({
    pageTitle: "About | Amiga 500 Art",
    description: "About page for the Amiga 500 artwork portfolio.",
    currentPath: path.join(websiteDir, "about", "index.html"),
    content: `
      <section class="detail-layout">
        <div class="panel">
          <span class="eyebrow">About</span>
          <h1 class="page-title">Portfolio Notes</h1>
          <p class="lede">This page is intentionally ready for later copy updates without needing layout changes.</p>
        </div>
        <section class="about-copy" aria-label="About content">
          <p>Add your biography, process notes, hardware setup, and project context here.</p>
          <p>The page already shares the same retro shell as the gallery, so future content can stay simple: headings, paragraphs, links, and any extra sections you want to introduce later.</p>
          <p>Suggested topics: how you created the artwork, what tools you used on the Amiga 500, and what this collection means in your broader creative portfolio.</p>
          <div>
            <a class="button-link" href="../index.html">Back To Gallery</a>
          </div>
        </section>
      </section>
    `
  });
}

function renderDetailPage(artworks: Artwork[], currentIndex: number): string {
  const artwork = artworks[currentIndex];
  const previous = currentIndex > 0 ? artworks[currentIndex - 1] : null;
  const next = currentIndex < artworks.length - 1 ? artworks[currentIndex + 1] : null;
  const pagePath = path.join(websiteDir, artwork.detailPath);
  const pageDir = path.dirname(pagePath);
  const imageHref = relativePath(pageDir, path.join(websiteDir, artwork.imagePath));
  const indexHref = relativePath(pageDir, path.join(websiteDir, "index.html"));
  const previousHref = previous ? relativePath(pageDir, path.join(websiteDir, previous.detailPath)) : indexHref;
  const nextHref = next ? relativePath(pageDir, path.join(websiteDir, next.detailPath)) : indexHref;

  return renderLayout({
    pageTitle: `${artwork.title} | Amiga 500 Art`,
    description: `${artwork.title} from the Commodore Amiga 500 artwork portfolio.`,
    currentPath: pagePath,
    content: `
      <section class="detail-layout">
        <div class="panel">
          <span class="eyebrow">Artwork Detail</span>
          <h1 class="page-title">${escapeHtml(artwork.title)}</h1>
          <p class="lede">Original resolution ${artwork.width} x ${artwork.height}</p>
        </div>
        <section class="detail-stage">
          <div class="detail-media" style="--art-width: ${artwork.width}px;">
            <img src="${imageHref}" alt="${escapeHtml(artwork.title)}" width="${artwork.width}" height="${artwork.height}">
          </div>
        </section>
        <section class="detail-copy">
          <h2 class="detail-title">Archive Entry</h2>
          <p>This dedicated page keeps the artwork at its original maximum display size, without enlarging it past the source file resolution.</p>
          <div class="detail-nav">
            <a class="button-link" href="${indexHref}">Back To Gallery</a>
            <a class="button-link alt" href="${previousHref}">${previous ? "Previous Artwork" : "Gallery Start"}</a>
            <a class="button-link alt" href="${nextHref}">${next ? "Next Artwork" : "Gallery Start"}</a>
          </div>
        </section>
      </section>
    `
  });
}

function buildSite(): void {
  const artworks = buildArtworks();

  rmSync(websiteDir, { recursive: true, force: true });
  ensureDir(publishedArtDir);
  ensureDir(path.join(websiteDir, "about"));
  ensureDir(path.join(websiteDir, "art"));

  cpSync(artDir, publishedArtDir, { recursive: true });
  writeFileSync(path.join(websiteDir, ".nojekyll"), "");
  writeFileSync(path.join(assetsDir, "site.css"), styles);
  writePage(path.join(websiteDir, "index.html"), renderIndexPage(artworks));
  writePage(path.join(websiteDir, "about", "index.html"), renderAboutPage());

  artworks.forEach((_, index) => {
    const artwork = artworks[index];
    writePage(path.join(websiteDir, artwork.detailPath), renderDetailPage(artworks, index));
  });
}

buildSite();
