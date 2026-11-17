# Food Paradise — Integrated Food Management REST API

The existing React Food Paradise app is preserved. After logging in, use the **Food Management** navbar button to open the CRUD interface inside the same React app. The interface uses the Express API and contains food records only; it does not add student data.

## Run locally on macOS

### Terminal 1 — Express REST API
```bash
cd fsd/express-app
npm install
npm start
```
API: http://localhost:5001/foods
Standalone lab page (optional): http://localhost:5001/

### Terminal 2 — Existing React website
From the project root:
```bash
cd fsd
npm install
npm start
```
React app: http://localhost:3000
Log in to Food Paradise, then choose **Food Management** in the navbar.

### PHP login requirement
The existing login/signup still calls `http://localhost/dynamic_php/login.php`. Keep your current PHP/Apache setup and ensure that endpoint is available; this integration does not replace or alter the login backend.

## Food API endpoints
- `GET /foods` — list all food records
- `GET /foods/:id` — retrieve one record
- `POST /foods` — create a record
- `PUT /foods/:id` — update a record
- `DELETE /foods/:id` — delete a record
- `GET /foods/diet` — list diet records
- `GET /foods/calories/:max` — filter by maximum calories

Records are stored in `express-app/foods.json`. Keep a backup before manually editing this file.
