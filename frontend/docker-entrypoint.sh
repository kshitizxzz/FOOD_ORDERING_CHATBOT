#!/bin/sh
# Inject the backend URL into config.js at container startup
API_BASE="${API_BASE:-http://localhost:8000}"
echo "window.APP_CONFIG = { API_BASE: \"${API_BASE}\" };" > /usr/share/nginx/html/config.js
exec nginx -g 'daemon off;'
