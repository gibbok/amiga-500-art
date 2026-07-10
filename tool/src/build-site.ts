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
const sourceFontsDir = path.join(repoRoot, "tool", "fonts");
const publishedFontsDir = path.join(assetsDir, "fonts");
const sourceStaticDir = path.join(repoRoot, "tool", "static");
const sourceCookieBannerDir = path.join(sourceStaticDir, "cookie-banner");
const publishedCookieBannerDir = path.join(websiteDir, "cookie-banner");
const sourceCookiePolicyPath = path.join(sourceStaticDir, "cookie_policy.html");
const heroSourcePath = path.join(repoRoot, "tool", "hero-reference.png");
const heroPublishedName = "hero-desk.png";
const heroPublishedPath = path.join(assetsDir, heroPublishedName);
const siteBaseUrl = "https://gibbok.github.io/amiga-500-art";
const socialImageUrl = `${siteBaseUrl}/assets/${heroPublishedName}`;
const chromeDevtoolsConfigPath = path.join(websiteDir, ".well-known", "appspecific", "com.chrome.devtools.json");
const googleAnalyticsId = "G-0BW9XRC2KH";

const styles = readFileSync(path.join(repoRoot, "tool", "src", "site.css"), "utf8");

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function artworkSlug(fileStem: string): string {
  return fileStem.match(/\d+/)?.[0] ?? slugify(fileStem);
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

function renderAnalyticsHead(currentDir: string): string {
  const cookieBannerCssHref = relativePath(currentDir, path.join(publishedCookieBannerDir, "silktide-consent-manager.css"));
  const cookieBannerScriptSrc = relativePath(currentDir, path.join(publishedCookieBannerDir, "silktide-consent-manager.js"));
  const cookiePolicyHref = relativePath(currentDir, path.join(websiteDir, "cookie_policy.html"));

  return `    <script async src="https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      gtag('js', new Date());
      gtag('config', '${googleAnalyticsId}');
    </script>
    <link rel="stylesheet" href="${cookieBannerCssHref}">
    <script src="${cookieBannerScriptSrc}"></script>
    <script>
      window.silktideCookieBannerManager.updateCookieBannerConfig({
        cookieIcon: {
          position: 'bottomLeft'
        },
        cookieTypes: [
          {
            id: 'necessary',
            name: 'Necessary',
            description: '<p>These cookies are required for the website to work and cannot be disabled.</p>',
            required: true
          },
          {
            id: 'analytics',
            name: 'Analytics',
            description: '<p>These cookies help us understand how visitors use the website.</p>',
            defaultValue: false,
            onAccept: function() {
              gtag('consent', 'update', {
                analytics_storage: 'granted'
              });
              gtag('config', '${googleAnalyticsId}');
            },
            onReject: function() {
              gtag('consent', 'update', {
                analytics_storage: 'denied'
              });
            }
          }
        ],
        text: {
          banner: {
            description: '<p>We use cookies to measure website traffic and improve the site. Read our <a href="${cookiePolicyHref}">Cookie Policy</a>.</p>'
          }
        }
      });
    </script>`;
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
  const pressStartFontHref = relativePath(currentDir, path.join(publishedFontsDir, "press-start-2p.woff2"));
  const vt323FontHref = relativePath(currentDir, path.join(publishedFontsDir, "vt323.woff2"));
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
    <meta property="og:image" content="${socialImageUrl}">
    <meta property="og:image:secure_url" content="${socialImageUrl}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1448">
    <meta property="og:image:height" content="1086">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(options.pageTitle)}">
    <meta name="twitter:description" content="${escapeHtml(options.description)}">
    <meta name="twitter:image" content="${socialImageUrl}">
    <link rel="preload" href="${pressStartFontHref}" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="${vt323FontHref}" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="${stylesheetHref}">
${renderAnalyticsHead(currentDir)}
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
    const slug = artworkSlug(fileStem);
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
    pageTitle: "Commodore Amiga 500 Artwork Portfolio",
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
    description: "About this personal Amiga 500 artwork archive, drawn by hand in Deluxe Paint and recovered from old VHS tape backups.",
    keywords: "about Amiga 500 artwork, Commodore Amiga 500 Plus, Deluxe Paint artwork, Brilliance artwork, VHS tape backups, pixel art process",
    currentPath: path.join(websiteDir, "about", "index.html"),
    content: `
      <section class="about-shell">
        <div class="about-hero">
          <span class="eyebrow">About</span>
          <h1 class="page-title">About the Artwork</h1>
        </div>
        <section class="about-copy" aria-label="About content">
          <p>These are some of the artworks I created on my Amiga 500 Plus in 1991. They are images I used to draw back then, mostly in Deluxe Paint and Brilliance.</p>
          <p>The artworks were recovered from VHS tape backups made from my Amiga. The slight blur and analog artifacts are part of the original preservation process, so I kept that feeling instead of trying to make everything look too clean.</p>
          <p>Back then there was no Photoshop, no internet, and no GPU acceleration. Every pixel was placed by hand using Deluxe Paint. At the time, my Amiga had two floppy drives and 2 MB of RAM.</p>
          <p>One thing I liked doing was making small patterns of color and dragging the pixels across the screen like a brush. It was a very manual way of drawing, but it gave the images their texture.</p>
          <p>I also post-processed some of the images with small Amiga BASIC programs, mostly to try out simple effects and see how far I could push the images after drawing them.</p>
          <p>Some images were enhanced using custom 3x3 convolution filters available in Deluxe Paint and Brilliance, allowing effects such as sharpening, embossing, and edge detection.</p>
          <p>I also experimented with animation, using an onion-skin-like workflow by keeping multiple frames visible on screen while drawing and coloring each frame.</p>
          <h2 class="video-title">Interesting Videos</h2>
          <div class="video-grid" aria-label="Interesting videos">
            <div class="video-frame">
              <iframe src="https://www.youtube-nocookie.com/embed/ws3DJF7MbMU" title="Interesting Amiga video 1" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
            <div class="video-frame">
              <iframe src="https://www.youtube-nocookie.com/embed/FF-mEuLfgtQ" title="Interesting Amiga video 2" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
            <div class="video-frame">
              <iframe src="https://www.youtube-nocookie.com/embed/PcS_3SoWaeM" title="Interesting Amiga video 3" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
          </div>
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
  if (!existsSync(sourceFontsDir)) {
    throw new Error("Expected tool/fonts with self-hosted font files.");
  }
  if (!existsSync(sourceCookieBannerDir)) {
    throw new Error("Expected tool/static/cookie-banner with Silktide consent manager files.");
  }
  if (!existsSync(sourceCookiePolicyPath)) {
    throw new Error("Expected tool/static/cookie_policy.html.");
  }

  rmSync(websiteDir, { recursive: true, force: true });
  ensureDir(publishedArtDir);
  ensureDir(publishedFontsDir);
  ensureDir(publishedCookieBannerDir);
  ensureDir(path.join(websiteDir, "about"));
  ensureDir(path.join(websiteDir, "art"));
  ensureDir(path.dirname(chromeDevtoolsConfigPath));

  cpSync(artDir, publishedArtDir, { recursive: true });
  cpSync(sourceFontsDir, publishedFontsDir, { recursive: true });
  cpSync(sourceCookieBannerDir, publishedCookieBannerDir, { recursive: true });
  cpSync(sourceCookiePolicyPath, path.join(websiteDir, "cookie_policy.html"));
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
