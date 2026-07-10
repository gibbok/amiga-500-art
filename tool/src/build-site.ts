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
const heroSourcePath = path.join(repoRoot, "tool", "hero-reference.png");
const heroPublishedName = "hero-desk.png";
const heroPublishedPath = path.join(assetsDir, heroPublishedName);
const chromeDevtoolsConfigPath = path.join(websiteDir, ".well-known", "appspecific", "com.chrome.devtools.json");

const styles = `
:root {
  --bg-top: #0b0a1f;
  --bg-mid: #12061d;
  --bg-bottom: #05040d;
  --panel: rgba(8, 10, 23, 0.78);
  --panel-strong: rgba(8, 10, 23, 0.92);
  --line: rgba(92, 232, 255, 0.7);
  --line-soft: rgba(92, 232, 255, 0.18);
  --pink: #ff5faa;
  --cyan: #5ce8ff;
  --gold: #ffc65c;
  --text: #f6f3ff;
  --muted: #c8c0e8;
  --shadow: 0 24px 70px rgba(0, 0, 0, 0.42);
  --max-width: 1320px;
  --space-1: 0.45rem;
  --space-2: 0.8rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
  --space-6: 3rem;
  --space-7: 4rem;
  --portfolio-media-height: clamp(190px, 18vw, 250px);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  background: var(--bg-bottom);
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  font-family: "VT323", "Courier New", monospace;
  letter-spacing: 0.03em;
  background:
    radial-gradient(circle at 15% 12%, rgba(255, 95, 170, 0.22), transparent 24%),
    radial-gradient(circle at 82% 20%, rgba(92, 232, 255, 0.18), transparent 22%),
    linear-gradient(180deg, var(--bg-top) 0%, var(--bg-mid) 42%, var(--bg-bottom) 100%);
  background-attachment: scroll;
  background-color: var(--bg-bottom);
  position: relative;
  overflow-x: hidden;
}

body::before {
  content: "";
  position: absolute;
  min-height: 100%;
  height: max(100%, 100vh);
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px 100%),
    linear-gradient(90deg, rgba(92, 232, 255, 0.04) 0 1px, transparent 1px 100%);
  background-size: 100% 4px, 26px 26px;
  opacity: 0.12;
  z-index: 0;
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
  padding: 1.25rem 0 var(--space-7);
  position: relative;
  z-index: 1;
}

.shell::before {
  content: "";
  position: absolute;
  right: 6%;
  top: 4rem;
  width: min(32vw, 380px);
  height: min(32vw, 380px);
  border: 4px solid rgba(255, 95, 170, 0.36);
  transform: rotate(45deg);
  filter: drop-shadow(0 0 22px rgba(255, 95, 170, 0.2));
  opacity: 0.5;
  z-index: 0;
}

.shell::after {
  content: "";
  position: absolute;
  right: 8%;
  top: 17rem;
  width: min(42vw, 560px);
  height: min(22vw, 260px);
  background:
    linear-gradient(180deg, rgba(255, 95, 170, 0.75), rgba(255, 95, 170, 0.06) 3px, transparent 3px),
    linear-gradient(90deg, rgba(92, 232, 255, 0.28) 1px, transparent 1px);
  background-size: 100% 100%, 28px 22px;
  clip-path: polygon(0 100%, 100% 100%, 90% 55%, 70% 66%, 58% 48%, 40% 68%, 25% 52%, 10% 70%);
  opacity: 0.42;
  z-index: 0;
}

.topbar,
.hero-shell,
.portfolio-shell,
.detail-shell,
.about-shell,
.footer {
  position: relative;
  z-index: 1;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: right;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav a {
  padding: 0.7rem 0;
  font-family: "Press Start 2P", monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  color: var(--cyan);
  border-bottom: 3px solid transparent;
}

.nav a:hover,
.nav a:focus-visible,
.nav a[aria-current="page"] {
  color: var(--pink);
  border-color: var(--pink);
  outline: none;
}

.hero-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr);
  gap: var(--space-5);
  align-items: stretch;
}

.hero-visual {
  position: relative;
  min-height: 620px;
  background: linear-gradient(180deg, rgba(8, 8, 20, 0.74), rgba(8, 8, 20, 0.36));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.hero-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-visual::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(5, 6, 14, 0.16) 0%, rgba(5, 6, 14, 0.04) 38%, rgba(5, 6, 14, 0.56) 100%),
    linear-gradient(180deg, rgba(255, 95, 170, 0.08), transparent 28%, rgba(2, 4, 12, 0.22) 100%);
}

.hero-copy {
  display: grid;
  align-content: start;
  gap: var(--space-4);
  padding-top: 1.2rem;
}

.eyebrow {
  display: inline-block;
  padding: 0.45rem 0.8rem;
  color: var(--cyan);
  font-family: "Press Start 2P", monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  border: 2px solid rgba(92, 232, 255, 0.36);
  background: rgba(10, 13, 28, 0.64);
}

.hero-frame,
.detail-hero,
.about-hero,
.detail-copy,
.about-copy,
.identity-panel,
.detail-stage {
  background: linear-gradient(180deg, rgba(10, 12, 28, 0.84), rgba(7, 8, 19, 0.58));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--shadow);
}

.hero-frame {
  padding: 1.7rem;
  position: relative;
}

.hero-frame::before {
  content: "";
  position: absolute;
  left: 1rem;
  right: 1rem;
  top: 0;
  height: 6px;
  background: linear-gradient(90deg, transparent 0 3%, var(--pink) 3% 96%, transparent 96%);
}

.hero-title,
.page-title {
  margin: 0;
  font-family: "Press Start 2P", monospace;
  font-size: clamp(1.85rem, 3vw, 3.45rem);
  line-height: 1.2;
  text-transform: uppercase;
  text-shadow: 0 0 20px rgba(255, 95, 170, 0.22);
}

.hero-copy p,
.about-copy p,
.detail-copy p {
  margin: 0;
  color: var(--muted);
  font-size: clamp(1.2rem, 1.8vw, 1.58rem);
  line-height: 1.34;
}

.hero-actions,
.detail-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-actions {
  margin-top: var(--space-3);
}

.detail-nav {
  margin-top: var(--space-4);
}

.about-hero .eyebrow {
  margin-bottom: var(--space-4);
}

.detail-hero .eyebrow {
  margin-bottom: var(--space-4);
}

.about-copy .button-link {
  margin-top: var(--space-4);
}

.button-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.85rem 1.2rem;
  font-family: "Press Start 2P", monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #fff8fe;
  background: rgba(255, 95, 170, 0.14);
  border: 2px solid rgba(255, 95, 170, 0.72);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.button-link.alt {
  color: var(--cyan);
  background: rgba(92, 232, 255, 0.08);
  border-color: rgba(92, 232, 255, 0.62);
}

.button-link:hover,
.button-link:focus-visible {
  transform: translateY(-2px);
  outline: none;
}

.identity-panel {
  padding: 1.2rem;
  display: grid;
  gap: 1rem;
}

.identity-panel strong {
  font-family: "Press Start 2P", monospace;
  font-size: 0.66rem;
  color: var(--gold);
  text-transform: uppercase;
}

.identity-panel ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.75rem;
}

.identity-panel li {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--muted);
  font-size: 1.2rem;
}

.portfolio-shell,
.detail-shell,
.about-shell {
  margin-top: var(--space-7);
}

.portfolio-head {
  margin-bottom: var(--space-5);
}

.portfolio-head h2,
.detail-title {
  margin: 0;
  font-family: "Press Start 2P", monospace;
  font-size: clamp(1.02rem, 2vw, 1.42rem);
  line-height: 1.5;
  text-transform: uppercase;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.3rem;
  align-items: stretch;
}

.portfolio-card {
  background: linear-gradient(180deg, rgba(10, 12, 30, 0.9), rgba(7, 7, 18, 0.66));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--shadow);
  overflow: hidden;
  height: 100%;
}

.portfolio-card figure {
  height: 100%;
  margin: 0;
  display: grid;
  grid-template-rows: var(--portfolio-media-height) 1fr;
}

.portfolio-media {
  position: relative;
  height: var(--portfolio-media-height);
  background: #070714;
  overflow: hidden;
}

.portfolio-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.portfolio-card figcaption {
  padding: 1rem 1rem 1.2rem;
  display: grid;
  grid-template-rows: minmax(2.8rem, auto) 1fr;
  gap: 0.7rem;
  min-height: 8rem;
  align-content: start;
}

.card-title {
  margin: 0;
  font-family: "Press Start 2P", monospace;
  font-size: 0.88rem;
  line-height: 1.55;
  text-transform: uppercase;
  min-height: 2.8rem;
}

.portfolio-card .button-link {
  align-self: end;
  justify-self: start;
}

.detail-shell,
.about-shell {
  display: grid;
  gap: var(--space-5);
}

.detail-hero,
.about-hero,
.detail-copy,
.about-copy {
  padding: var(--space-5);
}

.detail-stage {
  padding: 1.35rem;
  display: flex;
  justify-content: center;
}

.detail-media {
  width: min(100%, var(--art-width, 720px));
}

.detail-stage img {
  width: 100%;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 14px 34px rgba(0, 0, 0, 0.4);
}

.detail-meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: var(--space-3);
  color: var(--cyan);
  font-family: "Press Start 2P", monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
}

.footer {
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  color: var(--muted);
  font-size: 1.18rem;
}

@media (max-width: 1120px) {
  .hero-shell {
    grid-template-columns: 1fr;
  }

  .hero-visual {
    min-height: 520px;
  }
}

@media (max-width: 860px) {
  .shell {
    width: min(calc(100% - 1rem), var(--max-width));
  }

  .shell::before,
  .shell::after {
    display: none;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
    justify-content: right;
  }

  .identity-panel,
  .hero-frame,
  .detail-hero,
  .about-hero,
  .detail-copy,
  .about-copy {
    padding: var(--space-4);
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
    justify-content: center;
  }

  .hero-visual {
    min-height: 360px;
  }

  .hero-title,
  .page-title {
    font-size: 1.55rem;
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
  keywords?: string;
  bodyClass?: string;
  currentPath: string;
  content: string;
}): string {
  const currentDir = path.dirname(options.currentPath);
  const stylesheetHref = relativePath(currentDir, path.join(assetsDir, "site.css"));
  const socialImageHref = relativePath(currentDir, heroPublishedPath);
  const indexHref = relativePath(currentDir, path.join(websiteDir, "index.html"));
  const aboutHref = relativePath(currentDir, path.join(websiteDir, "about", "index.html"));
  const isAbout = options.currentPath.endsWith(path.join("about", "index.html"));
  const isIndex = options.currentPath.endsWith(path.join("website", "index.html"));
  const keywords = options.keywords ?? "Amiga 500 artwork, Commodore Amiga art, Amiga 500 portfolio, Deluxe Paint artwork, retro computer art";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(options.pageTitle)}</title>
    <meta name="description" content="${escapeHtml(options.description)}">
    <meta name="keywords" content="${escapeHtml(keywords)}">
    <meta name="author" content="GibboK">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${escapeHtml(options.pageTitle)}">
    <meta property="og:description" content="${escapeHtml(options.description)}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="${socialImageHref}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(options.pageTitle)}">
    <meta name="twitter:description" content="${escapeHtml(options.description)}">
    <meta name="twitter:image" content="${socialImageHref}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${stylesheetHref}">
  </head>
  <body${options.bodyClass ? ` class="${escapeHtml(options.bodyClass)}"` : ""}>
    <div class="shell">
      <header class="topbar">
        <nav class="nav" aria-label="Primary">
          <a href="${indexHref}"${isIndex ? ` aria-current="page"` : ""}>Portfolio</a>
          <a href="${aboutHref}"${isAbout ? ` aria-current="page"` : ""}>About</a>
        </nav>
      </header>
      ${options.content}
      <footer class="footer">
        Personal Commodore Amiga 500 Art Portfolio by GibboK
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
      return `<article class="portfolio-card">
  <figure>
    <div class="portfolio-media">
      <img src="${artwork.imagePath}" alt="${escapeHtml(`${artwork.title} - Amiga 500 artwork`)}">
    </div>
    <figcaption>
      <h3 class="card-title">${escapeHtml(artwork.title)}</h3>
      <a class="button-link" href="${artwork.detailPath}">View Piece</a>
    </figcaption>
  </figure>
</article>`;
    })
    .join("\n");

  return renderLayout({
    pageTitle: "Commodore Amiga 500 Artwork Portfolio | Deluxe Paint Gallery",
    description: "Personal Commodore Amiga 500 artwork portfolio featuring 1991 Deluxe Paint, Brilliance, and Amiga BASIC artwork recovered from original Amiga images.",
    keywords: "Amiga 500 artwork, Commodore Amiga 500 artwork, Deluxe Paint gallery, Brilliance Amiga art, Amiga BASIC art, retro computer art portfolio",
    currentPath: path.join(websiteDir, "index.html"),
    content: `
      <section class="hero-shell">
        <div class="hero-visual">
          <img src="assets/${heroPublishedName}" alt="Retro Commodore Amiga 500 artwork desk with Deluxe Paint and Amiga BASIC floppies">
        </div>
        <div class="hero-copy">
          <span class="eyebrow">Personal Portfolio</span>
          <div class="hero-frame">
            <h1 class="hero-title">Commodore Amiga 500 Artwork</h1>
            <p>This site is a personal portfolio for my Amiga 500 creative work.</p>
            <div class="hero-actions">
              <a class="button-link" href="#portfolio">Browse Work</a>
              <a class="button-link alt" href="about/">About Me</a>
            </div>
          </div>
          <aside class="identity-panel" aria-label="Portfolio identity">
            <strong>About These Artworks</strong>
            <ul>
              <li>Created in 1991 on an Amiga 500 Plus with Deluxe Paint.</li>
              <li>Enhanced with Brilliance.</li>
              <li>Post-processed with Amiga BASIC.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section id="portfolio" class="portfolio-shell" aria-labelledby="portfolio-title">
        <div class="portfolio-head">
          <h2 id="portfolio-title">Portfolio Archive</h2>
        </div>
        <div class="portfolio-grid">
          ${cards}
        </div>
      </section>
    `
  });
}

function renderAboutPage(): string {
  return renderLayout({
    pageTitle: "About The Amiga 500 Artwork | Commodore Portfolio",
    description: "About this personal Amiga 500 artwork archive created in 1991 with Deluxe Paint, Brilliance, and Amiga BASIC on a Commodore Amiga 500 Plus.",
    keywords: "about Amiga 500 artwork, Commodore Amiga 500 Plus, Deluxe Paint artwork, Brilliance artwork, Amiga BASIC post processing",
    currentPath: path.join(websiteDir, "about", "index.html"),
    content: `
      <section class="about-shell">
        <div class="about-hero">
          <span class="eyebrow">About</span>
          <h1 class="page-title">Portfolio Notes</h1>
        </div>
        <section class="about-copy" aria-label="About content">
          <p>These are some of the artworks I created in 1991 on my Amiga 500 Plus. I mainly used Deluxe Paint and Brilliance, with additional post-processing in Amiga BASIC.</p>
          <p>At the time, my Amiga had two floppy drives and 2 MB of RAM.</p>
          <p>The images in this portfolio were recovered from VHS backups recorded from my Amiga. This is why some of them appear slightly blurred.</p>
          <div>
            <a class="button-link" href="../index.html">Back To Portfolio</a>
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
    pageTitle: `${artwork.title} | Commodore Amiga 500 Artwork`,
    description: `${artwork.title} from a personal Commodore Amiga 500 artwork portfolio created with Deluxe Paint, Brilliance, and Amiga BASIC.`,
    keywords: `${artwork.title}, Amiga 500 artwork, Commodore Amiga artwork, Deluxe Paint image, Brilliance Amiga art, retro computer art`,
    currentPath: pagePath,
    content: `
      <section class="detail-shell">
        <div class="detail-hero">
          <span class="eyebrow">Artwork Detail</span>
          <h1 class="page-title">${escapeHtml(artwork.title)}</h1>
        </div>
        <section class="detail-stage">
          <div class="detail-media" style="--art-width: ${artwork.width}px;">
            <img src="${imageHref}" alt="${escapeHtml(`${artwork.title} - Commodore Amiga 500 artwork`)}" width="${artwork.width}" height="${artwork.height}">
          </div>
        </section>
        <section class="detail-copy">
          <h2 class="detail-title">Archive Entry</h2>
          <div class="detail-meta-line">
            <span>Sequence ${String(currentIndex + 1).padStart(3, "0")}</span>
          </div>
          <div class="detail-nav">
            <a class="button-link" href="${indexHref}">Back To Portfolio</a>
            <a class="button-link alt" href="${previousHref}">${previous ? "Previous Piece" : "Portfolio Start"}</a>
            <a class="button-link alt" href="${nextHref}">${next ? "Next Piece" : "Portfolio Start"}</a>
          </div>
        </section>
      </section>
    `
  });
}

function buildSite(): void {
  const artworks = buildArtworks();

  if (!existsSync(heroSourcePath)) {
    throw new Error("Expected tool/hero-reference.png for the homepage hero image.");
  }

  rmSync(websiteDir, { recursive: true, force: true });
  ensureDir(publishedArtDir);
  ensureDir(path.join(websiteDir, "about"));
  ensureDir(path.join(websiteDir, "art"));
  ensureDir(path.dirname(chromeDevtoolsConfigPath));

  cpSync(artDir, publishedArtDir, { recursive: true });
  cpSync(heroSourcePath, heroPublishedPath);
  writeFileSync(path.join(websiteDir, ".nojekyll"), "");
  writeFileSync(chromeDevtoolsConfigPath, "{}\n");
  writeFileSync(path.join(assetsDir, "site.css"), styles);
  writePage(path.join(websiteDir, "index.html"), renderIndexPage(artworks));
  writePage(path.join(websiteDir, "about", "index.html"), renderAboutPage());

  artworks.forEach((artwork, index) => {
    writePage(path.join(websiteDir, artwork.detailPath), renderDetailPage(artworks, index));
  });
}

buildSite();
