#!/bin/bash
set -e
echo "window.APP_CONFIG = { API_BASE: \"\" };" > /var/www/html/config.js
nginx -g 'daemon on;'
exec python -m uvicorn main:app --host 127.0.0.1 --port 8000
