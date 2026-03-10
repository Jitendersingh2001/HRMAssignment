# HRMS-Lite

A lightweight Human Resource Management System (HRMS) focused on essential HR operations.

---

## Project Overview

HRMS-Lite is a full-stack application for managing employees, departments, and daily attendance. It provides a simple UI for HR tasks with validation on both frontend and backend, and supports deployment via Docker.

**Key capabilities:**

- **Employee Management** — Add, view, and delete employees with departments and contact details.
- **Attendance Management** — Mark and view daily attendance (Present/Absent) per employee.
- **Department Management** — Manage departments used for employee assignment.
- **Dashboard** — Overview of employees and attendance data.
- **Error Handling** — Validation on frontend and backend (e.g., duplicate IDs, invalid emails).

The frontend and backend are in separate folders (`frontend/` and `backend/`) and can be run locally or with Docker.

---

## Tech Stack

| Layer      | Technologies |
|-----------|---------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, React Router 7, Axios, Lucide React, date-fns |
| **Backend**  | FastAPI, Python 3.12, Uvicorn |
| **Database** | MongoDB (async via Motor) |
| **Validation & Config** | Pydantic, pydantic-settings, python-dotenv, email-validator |
| **Deployment** | Docker, Docker Compose, Nginx (frontend production build) |

---

## Steps to Run the Project Locally

### Prerequisites

- **Node.js** (v18+) and **npm**
- **Docker** and **Docker Compose**
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string)

---

### Run with Docker (Backend) + local Frontend

The backend runs in Docker; the frontend is run with npm for local development.

1. **MongoDB**  
   Ensure MongoDB is running and you have a connection URI (e.g. `mongodb://localhost:27017` or an Atlas `mongodb+srv://...` URI).

2. **Backend (Docker)**  
   From the project root:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `backend/.env` and set at least:

   - `MONGODB_URI` — your MongoDB connection string  
   - `API_TOKEN` — token used by the frontend (e.g. `admin123-token`)  
   - `ALLOWED_ORIGINS` — e.g. `http://localhost:5173` for Vite dev server  

   Then start the API:

   ```bash
   docker-compose up --build
   ```

   API will be at **http://localhost:8000**. Docs: **http://localhost:8000/docs**.

3. **Frontend (local)**  
   In a new terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open **http://localhost:5173**. The app uses `VITE_API_URL` or defaults to `http://localhost:8000/api`.

---

### Environment variables (backend)

| Variable         | Description                          | Example                    |
|------------------|--------------------------------------|----------------------------|
| `MONGODB_URI`    | MongoDB connection string            | `mongodb://localhost:27017` or Atlas URI |
| `DATABASE_NAME`  | Database name                        | `hrms_lite` (default)      |
| `API_TOKEN`      | Token for API auth (frontend sends this) | `admin123-token`       |
| `ALLOWED_ORIGINS`| CORS origins (comma-separated)       | `http://localhost:5173`    |
| `PORT`           | API port                             | `8000` (default)           |

---

### Quick reference

| Service   | URL (local)                    |
|----------|---------------------------------|
| Frontend | http://localhost:5173          |
| Backend API | http://localhost:8000       |
| API Docs | http://localhost:8000/docs     |

---

## Application architecture

- **Frontend** (`frontend/`) — React SPA with Vite; production build can be served by Nginx (see `frontend/Dockerfile`).
- **Backend** (`backend/`) — FastAPI app; connects to MongoDB on startup and exposes REST API under `/api/*`.
- **Database** — MongoDB; indexes for unique `employee_id`, unique `email`, and unique `(employee_id, date)` for attendance are created by `backend/init_db.py`.
- **Auth** — API uses a shared token (`API_TOKEN`) sent in request headers; no user login UI.

---

## UI notes

- Tailwind CSS is used for layout and styling.
- **Lucide React** provides icons.
- **React Router** is used with a shared layout and sidebar for navigation.
