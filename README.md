# HRMS-Lite

A lightweight Human Resource Management System (HRMS) focused on essential HR operations.

---

## Project Overview

HRMS-Lite is a full-stack application for managing employees, departments, and daily attendance. It provides a simple UI for HR tasks with validation on both frontend and backend.

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
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, shadcn/ui, React Router 7, Axios, Lucide React, date-fns |
| **Backend**  | FastAPI, Python 3.12, Uvicorn |
| **Database** | MongoDB (async via Motor) |
| **Validation & Config** | Pydantic, pydantic-settings, python-dotenv, email-validator |
| **Deployment** | Render (backend), Vercel (frontend) |

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
   Use **MongoDB Atlas** and have your Atlas connection URI ready (e.g. `mongodb+srv://...`).

2. **Backend (Docker)**  
   From the project root:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `backend/.env` and set at least:

   - `MONGODB_URI` — your MongoDB connection string  
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

- **Frontend** (`frontend/`) — React SPA with Vite; deployed on **Vercel**.
- **Backend** (`backend/`) — FastAPI app; connects to **MongoDB Atlas** and exposes REST API under `/api/*`; deployed on **Render**.
- **Database** — MongoDB Atlas; indexes for unique `employee_id`, unique `email`, and unique `(employee_id, date)` for attendance are created by `backend/init_db.py`.
- **Auth** — No authentication is enforced (single-admin assumption).

---

## UI notes

- Tailwind CSS is used for layout and styling.
- **shadcn/ui** is used for reusable UI components.
- **Lucide React** provides icons.
- **React Router** is used with a shared layout and sidebar for navigation.
