#!/usr/bin/env python3
"""
KPOINT HEDGE // FREE BET & QUALIFYING BET PERFECT HEDGE TERMINAL SERVER
- Serves the Black & Electric Blue 2-Bet Matched Betting & Free Bet Hedge Calculator
  (`index.html`, `styles.css`, `app.js`) on http://localhost:8080
"""

import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8080
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))


class HedgeTerminalHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WORKSPACE_DIR, **kwargs)


def run_server():
    httpd = HTTPServer(("", PORT), HedgeTerminalHandler)
    print("=" * 76)
    print("  KPOINT HEDGE // FREE BET & QUALIFYING BET 70%+ PROFIT CALCULATOR")
    print(f"  Local URL: http://localhost:{PORT}")
    print("=" * 76)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()


if __name__ == "__main__":
    run_server()
