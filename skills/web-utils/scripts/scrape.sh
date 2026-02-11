#!/bin/bash

# Configuration
MODE="${1:-auto}"
URL="${2}"
ANYCRAWL_URL="${ANYCRAWL_API_URL:-http://anycrawldocker:13939}"
SCRIPT_DIR="$(dirname "$0")"

# Fallback Usage
if [ -z "$URL" ] && [[ "$MODE" == http* ]]; then
    # Handle if user swapped args: scrape.sh <url>
    URL="$MODE"
    MODE="auto"
fi

if [ -z "$URL" ]; then
    echo "Usage: $0 [--mode auto|curl|hyper|browser-use|botasaurus|anycrawl] <url>"
    exit 1
fi

echo "🕷️ Scraping Target: $URL (Mode: $MODE)" >&2

run_curl() {
    echo "Trying Curl..." >&2
    curl -sL \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) width=1920 height=1080" \
        --max-time 10 \
        "$URL"
}

run_hyper() {
    echo "Trying HyperAgent (Bun)..." >&2
    if [ -n "$OPENAI_API_KEY" ]; then
        bun "$SCRIPT_DIR/scrape_hyperagent.ts" "$URL"
    else
        echo "Skipping HyperAgent (OPENAI_API_KEY missing)" >&2
        return 1
    fi
}

run_browser_use() {
    echo "Trying Browser-Use (Python)..." >&2
    if [ -n "$OPENAI_API_KEY" ]; then
        # Ensure playwright is usable
        export PLAYWRIGHT_BROWSERS_PATH=/home/node/.cache/ms-playwright
        python3 "$SCRIPT_DIR/scrape_browser_use.py" "$URL"
    else
        echo "Skipping Browser-Use (OPENAI_API_KEY missing)" >&2
        return 1
    fi
}

run_botasaurus() {
    echo "Trying Botasaurus..." >&2
    python3 "$SCRIPT_DIR/scrape_botasaurus.py" "$URL"
}

run_anycrawl() {
    echo "Trying AnyCrawl Service..." >&2
    ENCODED_URL=$(echo "$URL" | jq -sRr @uri)
    curl -s "${ANYCRAWL_URL}/?url=${ENCODED_URL}"
}

# Execution Logic
if [ "$MODE" == "auto" ]; then
    # Cascade: Curl -> Hyper -> BrowserUse -> Botasaurus
    OUT=$(run_curl)
    if [ -n "$OUT" ] && [ "${#OUT}" -gt 500 ]; then echo "$OUT"; exit 0; fi
    
    # If Curl fails/blocks (short content), try Hyper
    run_hyper || run_browser_use || run_botasaurus
    
else
    # Explicit Mode
    case $MODE in
        --mode) 
            # Recursion for safety if args were weird
            "$0" "$3" "$4" 
            ;;
        curl) run_curl ;;
        hyper|hyperagent) run_hyper ;;
        browser-use|browser_use) run_browser_use ;;
        botasaurus) run_botasaurus ;;
        anycrawl) run_anycrawl ;;
        *) echo "Unknown mode: $MODE"; exit 1 ;;
    esac
fi
