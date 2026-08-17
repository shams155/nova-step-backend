NOVA STEP — STEP 6: REAL LOCAL BACKEND
=======================================
This version adds a Node.js backend and a persistent local orders file.

Files:
- server.js        -> backend/API + local web server
- package.json     -> project setup
- data/orders.json -> orders database file
- START-SERVER.bat -> easy Windows server starter
- checkout.js      -> sends orders to backend
- admin.js         -> reads/updates orders from backend

HOW TO RUN:
1. Install Node.js (LTS) on your computer if it is not installed.
2. Open this folder in VS Code.
3. Open Terminal in VS Code.
4. Run:
   npm start
5. You should see:
   NOVA STEP server running at http://localhost:3000
6. Open this in your browser:
   http://localhost:3000

TEST:
- Customer store: http://localhost:3000/
- Admin panel: http://localhost:3000/admin.html
- Place an order.
- Open admin.html and the order should be there.
- Change status. It is saved in data/orders.json.

IMPORTANT:
This is a REAL local backend, but it is not yet an online/public production backend.
The next step can move the database to an online service and add admin login/security.
