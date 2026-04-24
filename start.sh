#!/bin/bash
set -e

PORT="${PORT:-8080}"

echo "window.APP_CONFIG = { API_BASE: \"\" };" > /var/www/html/config.js

sed -i "s/listen 80;/listen ${PORT};/" /etc/nginx/sites-available/default

nginx -g 'daemon on;'
echo "Nginx started on port ${PORT}"

exec python -m uvicorn main:app --host 127.0.0.1 --port 8000
