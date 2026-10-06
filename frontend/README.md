# Backend
cd backend && pip install -r requirements.txt && python seed.py && uvicorn app.main:app --reload
# Frontend (after `npx create-next-app@latest` + `npm i zustand jose @tanstack/react-query lucide-react`)
Copy frontend/src/* into the app; set .env.local from .env.local.example.
Seed logins (password Passw0rd!): admin@ / wholesaler@ / retailer@ / customer@shop.test
