Directory structure
===================
backend: Contains Python FastAPI backend code
db: contains the dump of the database. you need to import this into your MySQL db by using MySQL workbench tool
dialogflow_assets: this has training phrases etc. for our intents
frontend: website code

Quick Docker deployment (recommended)
=====================================
1. From project root, run: cp .env.example .env
2. Start everything: docker compose up --build -d
3. Check backend is running: http://localhost:8000/docs
4. Open frontend website: http://localhost:8080/home.html
5. Use Chatbot Ordering Console on the page for add/remove/complete/track flows
6. Stop when done: docker compose down

Deploy online (resume-ready)
============================
You can deploy frontend and backend separately and get public URLs.

Recommended setup:
1. Backend + MySQL on Railway/Render (using Docker for backend and managed MySQL).
2. Frontend on Netlify/Vercel as static site.

Steps:
1. Deploy backend service from `backend/` folder.
2. Create managed MySQL and set backend env vars:
   - DB_HOST
   - DB_PORT
   - DB_USER
   - DB_PASSWORD
   - DB_NAME
3. Import `db/pandeyji_eatery.sql` into managed MySQL.
4. Deploy frontend from `frontend/`.
5. In `frontend/config.js`, set:
   - API_BASE = "https://<your-backend-public-url>"
6. Redeploy frontend.

After deployment:
- Frontend URL should open `home.html`
- Backend URL should open `/docs`
- Demo button and all chatbot flows should work online

Resume line (sample):
- Built and deployed an end-to-end AI food-ordering chatbot (FastAPI, MySQL, Docker, HTML/CSS/JS) with live order add/remove/complete/track workflows and production hosting.

Install these modules
======================

pip install mysql-connector
pip install "fastapi[all]"

OR just run pip install -r backend/requirements.txt to install both in one shot

To start fastapi backend server
================================
1. Go to backend directory in your command prompt
2. Run this command: uvicorn main:app --reload

ngrok for https tunneling
================================
1. To install ngrok, go to https://ngrok.com/download and install ngrok version that is suitable for your OS
2. Extract the zip file and place ngrok.exe in a folder.
3. Open windows command prompt, go to that folder and run this command: ngrok http 80000

NOTE: ngrok can timeout. you need to restart the session if you see session expired message.
