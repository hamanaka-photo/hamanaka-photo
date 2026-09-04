from pathlib import Path
import re, shutil, sys

ROOT = Path.cwd()
REQUIRED = ["index.html", "gallery.html", "guide.html", "guide-article.html", "project.html", "about.html", ".pages.yml"]
missing = [p for p in REQUIRED if not (ROOT / p).exists()]
if missing:
    print("実行場所がリポジトリ直下ではないか、必要ファイルが見つかりません:")
    for p in missing:
        print(" -", p)
    sys.exit(1)

PACKAGE = Path(__file__).resolve().parent
NEW = PACKAGE / "new_files"

for rel in ["introduction.html", "assets/css/introduction.css", "assets/js/introduction.js", "data/introduction.json"]:
    src = NEW / rel
    dst = ROOT / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)

nav_templates = {
    "index.html": '''<nav class="site-nav" id="site-nav" aria-label="メインナビゲーション">
      <a href="index.html" aria-current="page">HOME</a>
      <a href="introduction.html">INTRODUCTION</a>
      <a href="gallery.html">GALLERY</a>
      <a href="guide.html">PHOTO GUIDE</a>
      <a href="project.html">PROJECT</a>
      <a href="about.html">ABOUT</a>
    </nav>''',
    "gallery.html": '''<nav class="site-nav" id="site-nav" aria-label="メインナビゲーション">
      <a href="index.html">HOME</a>
      <a href="introduction.html">INTRODUCTION</a>
      <a href="gallery.html" aria-current="page">GALLERY</a>
      <a href="guide.html">PHOTO GUIDE</a>
      <a href="project.html">PROJECT</a>
      <a href="about.html">ABOUT</a>
    </nav>''',
    "guide.html": '''<nav class="site-nav" id="site-nav" aria-label="メインナビゲーション">
      <a href="index.html">HOME</a>
      <a href="introduction.html">INTRODUCTION</a>
      <a href="gallery.html">GALLERY</a>
      <a href="guide.html" aria-current="page">PHOTO GUIDE</a>
      <a href="project.html">PROJECT</a>
      <a href="about.html">ABOUT</a>
    </nav>''',
    "guide-article.html": '''<nav class="site-nav" id="site-nav" aria-label="メインナビゲーション">
      <a href="index.html">HOME</a>
      <a href="introduction.html">INTRODUCTION</a>
      <a href="gallery.html">GALLERY</a>
      <a href="guide.html" aria-current="page">PHOTO GUIDE</a>
      <a href="project.html">PROJECT</a>
      <a href="about.html">ABOUT</a>
    </nav>''',
    "project.html": '''<nav class="site-nav" id="site-nav" aria-label="メインナビゲーション">
      <a href="index.html">HOME</a>
      <a href="introduction.html">INTRODUCTION</a>
      <a href="gallery.html">GALLERY</a>
      <a href="guide.html">PHOTO GUIDE</a>
      <a href="project.html" aria-current="page">PROJECT</a>
      <a href="about.html">ABOUT</a>
    </nav>''',
    "about.html": '''<nav class="site-nav" id="site-nav" aria-label="メインナビゲーション">
      <a href="index.html">HOME</a>
      <a href="introduction.html">INTRODUCTION</a>
      <a href="gallery.html">GALLERY</a>
      <a href="guide.html">PHOTO GUIDE</a>
      <a href="project.html">PROJECT</a>
      <a href="about.html" aria-current="page">ABOUT</a>
    </nav>'''
}

for filename, replacement in nav_templates.items():
    path = ROOT / filename
    text = path.read_text(encoding="utf-8")
    new_text, count = re.subn(
        r'<nav class="site-nav" id="site-nav" aria-label="メインナビゲーション">.*?</nav>',
        replacement, text, count=1, flags=re.S
    )
    if count != 1:
        raise RuntimeError(f"{filename}: ナビゲーションを特定できませんでした")
    path.write_text(new_text, encoding="utf-8")

index_path = ROOT / "index.html"
text = index_path.read_text(encoding="utf-8")
hero_copy = '''<p class="hero-copy">
        浜中町には、野生のラッコをはじめ、海、湿原、野鳥、酪農風景など、ここでしか出会えない景色があります。<br>
        HAMANAKA PHOTOは、写真を通して浜中町の魅力を発見し、訪れ、撮り、つながるためのフォトポータルサイトです。
      </p>'''
text, count = re.subn(r'<p class="hero-copy">.*?</p>', hero_copy, text, count=1, flags=re.S)
if count != 1:
    raise RuntimeError("index.html: hero-copyを特定できませんでした")

hero_actions = '''<div class="hero-actions">
        <a class="btn btn-light" href="introduction.html">
          浜中町を知る →
        </a>
      </div>'''
text, count = re.subn(r'<div class="hero-actions">.*?</div>', hero_actions, text, count=1, flags=re.S)
if count != 1:
    raise RuntimeError("index.html: hero-actionsを特定できませんでした")
index_path.write_text(text, encoding="utf-8")

pages_path = ROOT / ".pages.yml"
pages = pages_path.read_text(encoding="utf-8")
if "name: introduction_settings" not in pages:
    marker = "  - name: project_settings\n"
    if marker not in pages:
        raise RuntimeError(".pages.yml: project_settingsの位置を特定できませんでした")
    snippet = (PACKAGE / "cms-introduction-snippet.yml").read_text(encoding="utf-8")
    pages = pages.replace(marker, snippet.rstrip() + "\n\n" + marker, 1)
    pages_path.write_text(pages, encoding="utf-8")

print("更新完了:")
for p in [
    "index.html", "introduction.html", "gallery.html", "guide.html",
    "guide-article.html", "project.html", "about.html",
    "assets/css/introduction.css", "assets/js/introduction.js",
    "data/introduction.json", ".pages.yml"
]:
    print(" -", p)
