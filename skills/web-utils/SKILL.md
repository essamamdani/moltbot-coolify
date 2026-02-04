---
name: web-utils
description: Advanced web tools for searching, summarizing, and scraping content using SearXNG private search, AI summarization, and headless browser automation.
metadata:
  openclaw:
    emoji: 🌐
    requires:
      bins: ["curl", "bun", "python3"]
      services: ["searxng"]
      config: ["SEARXNG_API_URL"]
    install:
      - id: "summarize"
        kind: "bun"
        pkg: "@steipete/summarize"
        bins: ["summarize"]
        label: "Install Summarize CLI (bun)"
      - id: "botasaurus"
        kind: "pip"
        pkg: "botasaurus"
        label: "Install Botasaurus (pip)"
---

# Web Utilities

Advanced web interaction capabilities for searching, scraping, and summarizing content.

## Features

- **Private Search**: Query SearXNG instance for web results (no tracking)
- **AI Summarization**: Summarize articles and videos using AI
- **Advanced Scraping**: Extract content with JavaScript support
- **Multiple Modes**: curl (fast), browser (JS support), botasaurus (advanced)

## Actions

### 🔍 Web Search (SearXNG)

Search the web using a private SearXNG instance. Returns JSON results with titles, URLs, snippets, and metadata.

**Usage:**
```bash
{baseDir}/scripts/search.sh "query string"
```

**Example:**
```bash
{baseDir}/scripts/search.sh "OpenClaw AI assistant"
```

**Returns:**
- Search results with titles, URLs, descriptions
- Published dates when available
- Engine sources (startpage, duckduckgo, etc.)
- Infoboxes and suggestions

**Requirements:**
- SearXNG service running at `$SEARXNG_API_URL`
- Network access to SearXNG (internal network)

---

### 📝 Summarize Content

Summarize the content of a URL (articles, documentation, videos) using AI.

**Usage:**
```bash
{baseDir}/scripts/summarize.sh "https://example.com/article"
```

**Supports:**
- Web articles and blog posts
- YouTube videos (via transcript)
- Documentation pages
- Long-form content

**Returns:**
- Concise summary of main points
- Key takeaways
- Structured output

---

### 🕷️ Advanced Scraping

Fetch and extract web content with multiple modes for different use cases.

**Mode 1: Fast (curl)**
```bash
{baseDir}/scripts/scrape.sh --mode curl "https://example.com"
```
- Fastest option
- No JavaScript execution
- Good for static content

**Mode 2: Browser (Headless Chrome)**
```bash
{baseDir}/scripts/scrape.sh --mode browser "https://example.com"
```
- JavaScript execution
- Waits for dynamic content
- Handles SPAs and modern sites

**Mode 3: Botasaurus (Advanced)**
```bash
{baseDir}/scripts/scrape.sh --mode botasaurus "https://example.com"
```
- Anti-bot detection bypass
- Stealth mode
- Complex interactions

**Returns:**
- Cleaned HTML content
- Extracted text
- Structured data when available

## Configuration

The skill requires these environment variables:

```bash
SEARXNG_API_URL=http://searxng:8080  # SearXNG instance URL
BRAVE_API_KEY=<optional>              # Fallback search API
```

These are automatically set in the Docker environment.

## Use Cases

**Research & Information Gathering:**
- Search for current information
- Summarize research papers
- Extract data from multiple sources

**Content Analysis:**
- Summarize long articles
- Extract key points from documentation
- Analyze competitor websites

**Data Collection:**
- Scrape product information
- Monitor website changes
- Extract structured data

## Notes

- Search uses private SearXNG (no tracking, no rate limits)
- Summarization requires AI model access
- Browser mode requires Chromium (installed in container)
- All scripts are sandboxed for security

## Troubleshooting

**Search returns no results:**
- Check SearXNG service is running: `curl $SEARXNG_API_URL`
- Verify network connectivity to SearXNG
- Check sandbox network configuration

**Scraping fails:**
- Try different mode (curl → browser → botasaurus)
- Check if site blocks automated access
- Verify URL is accessible

**Summarization errors:**
- Ensure AI model is configured
- Check content is accessible
- Verify URL returns valid content
