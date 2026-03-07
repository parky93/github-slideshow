# CLAUDE.md — AI Assistant Guide for github-slideshow

## Project Overview

**github-slideshow** is a Jekyll-based slide presentation framework used as a GitHub Learning Lab course repository. It combines Jekyll static site generation with [reveal.js](https://github.com/hakimel/reveal.js/) (v3.9.2) to render Markdown-authored slides as an interactive browser presentation.

The project is designed to be hosted on GitHub Pages. Learners fork this repository and add slide content via Pull Requests as part of learning Git and GitHub workflows.

---

## Repository Structure

```
github-slideshow/
├── _config.yml          # Jekyll + reveal.js configuration
├── _posts/              # Slide content (one Markdown file per slide)
│   └── 0000-01-01-intro.md
├── _layouts/
│   ├── presentation.html  # Main layout: wraps all slides in reveal.js
│   ├── slide.html         # Single-slide layout (for standalone viewing)
│   └── print.html         # Print-friendly layout
├── _includes/
│   ├── head.html          # HTML <head> with CSS/font includes
│   ├── script.html        # reveal.js initialization script
│   └── slide.html         # Partial: renders a single <section> slide
├── index.html             # Entry point: iterates posts and renders slides
├── Gemfile                # Ruby gem dependencies
├── Gemfile.lock           # Locked gem versions
├── package-lock.json      # Locked npm dependency (reveal.js 3.9.2)
├── node_modules/reveal.js # reveal.js presentation framework
├── script/
│   ├── setup              # Bootstrap script: installs gems + submodules
│   ├── server             # Dev server: runs Jekyll locally
│   ├── cibuild            # CI script: builds site + runs htmlproofer
│   └── stage              # Internal staging deploy script (ghe.io)
├── .editorconfig          # Code style rules
└── .gitignore             # Ignores _site/, .sass-cache/, .jekyll-metadata, .bundle
```

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Static site generator | Jekyll (via `github-pages` gem >= 207) |
| Presentation framework | reveal.js 3.9.2 (npm) |
| Markdown renderer | kramdown |
| Syntax highlighting | rouge |
| HTML validation | html-proofer >= 3.13.0 |
| Emoji support | jemoji Jekyll plugin |
| Theme | Solarized (dark by default) |

---

## How Slides Work

1. **Each slide is a Jekyll post** in `_posts/` with the `slide` layout.
2. `index.html` loops over all posts in reverse chronological order (so `0000-01-01` appears first) and renders each through `_includes/slide.html`.
3. `_includes/slide.html` wraps each post's content in a `<section class="step slide">` element that reveal.js picks up.
4. The presentation layout (`_layouts/presentation.html`) applies the reveal.js theme, controls, and transition settings from `_config.yml`.

### Adding a New Slide

Create a new file in `_posts/` with this naming pattern and front matter:

```
_posts/YYYY-MM-DD-my-slide-title.md
```

```yaml
---
layout: slide
title: "My Slide Title"
---

Slide content goes here. Standard Markdown is supported.
```

**Date ordering:** Jekyll sorts posts by date descending; `index.html` uses `reversed` to show oldest first. Use dates like `0000-01-02`, `0000-01-03`, etc. to control order.

**Optional front matter fields:**

| Field | Purpose |
|-------|---------|
| `slide-id` | Sets an HTML `id` on the `<section>` for deep linking |
| `classes` | Array of extra CSS classes on the slide `<section>` |
| `data` | Key-value pairs rendered as `data-*` attributes (reveal.js options) |

---

## Development Workflow

### Initial Setup

```sh
script/setup
```

This installs Ruby gems and initializes git submodules. On macOS it also runs `brew bundle` if a `Brewfile` is present.

### Running Locally

```sh
script/server
# Equivalent to: bundle exec jekyll serve
```

Visit `http://localhost:4000` (default Jekyll port).

### CI Build & Validation

```sh
script/cibuild
```

This:
1. Builds the Jekyll site with `--baseurl "."`
2. Runs `htmlproofer` on `_site/index.html` (ignoring empty alt attributes)

Always run this before pushing changes to verify the site builds cleanly.

---

## Configuration Reference (`_config.yml`)

Key settings to be aware of:

| Setting | Value | Notes |
|---------|-------|-------|
| `timezone` | `Europe/Berlin` | Affects post date handling |
| `future` | `false` | Posts with future dates are excluded |
| `markdown` | `kramdown` | Markdown processor |
| `highlighter` | `rouge` | Syntax highlighting |
| `permalink` | `/:title` | URL structure for posts |
| `solarized.theme` | `dark` | Slide theme; can be `light` or `dark` |
| `reveal.transition` | `linear` | Slide transition animation |
| `reveal.width` / `height` | `1000` / `920` | Presentation canvas size |
| `slideNumber.format` | `"c/t"` | Shows "current/total" slide numbers |

The `reveal:` block in `_config.yml` maps directly to reveal.js initialization options. See reveal.js docs for all available options.

---

## Code Style Conventions (`.editorconfig`)

| File type | Indent | Notes |
|-----------|--------|-------|
| Default (including Ruby) | Tabs, size 4 | |
| JSON, JS, CSS, SCSS, YAML, HTML | Spaces, size 2 | |
| Markdown | Spaces, size 4 | Trailing whitespace preserved; final newline required |

All files use LF line endings and UTF-8 encoding.

---

## Key Conventions for AI Assistants

- **Do not modify `Gemfile.lock` or `package-lock.json` directly.** These are managed by `bundle install` and `npm install` respectively.
- **Slide content goes only in `_posts/`.** Do not add HTML slides directly to `index.html`.
- **Respect date-based ordering in `_posts/`.** Use `0000-01-XX` dates to place slides in a deliberate sequence without worrying about real dates.
- **The `baseurl` in `_config.yml` is intentionally commented out.** This is for GitHub Pages compatibility. Do not uncomment it unless deploying to a sub-path.
- **`node_modules/` is committed** (reveal.js is vendored). Do not add it to `.gitignore` or remove it.
- **The `script/stage` script** is an internal tool for deploying to a private GitHub Enterprise staging environment (`ghe.io`). It is not part of the normal development workflow and should not be run in other contexts.
- **`html-proofer`** runs only on `_site/index.html` (not recursively). Keep external links and image alt text valid in slides.
- **The `jemoji` plugin** allows GitHub-style emoji shortcodes (e.g., `:sparkles:`) in slide content.

---

## Branch Strategy

Development branches follow the pattern:

```
claude/<description>-<session-id>
```

Push changes using:

```sh
git push -u origin <branch-name>
```
