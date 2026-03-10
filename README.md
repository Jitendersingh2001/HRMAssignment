# HRMS-Lite

A lightweight Human Resource Management System (HRMS) focused on essential HR operations.

## Features

- **Employee Management:** Add, view, and delete employees with their respective departments.
- **Attendance Management:** Mark and view daily attendance (Present/Absent).
- **Graceful Error Handling:** Full validation on both frontend and backend (e.g., duplicated IDs, invalid emails).

## Tech Stack

- **Frontend:** ReactJS, Vite, Tailwind CSS, React Router, Axios, Lucide React
- **Backend:** FastAPI, Python, Motor (Async MongoDB), pydantic
- **Database:** MongoDB
- **Deployment:** Docker & Docker Compose

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Running the Application (Docker)

1. Clone or navigate to the project root directory (`/Assignment`).
2. Run the following command to start all services:

   ```bash
   docker-compose up --build
   ```

3. Access the applications:
   - **Frontend UI:** [http://localhost](http://localhost)
   - **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Application Architecture

- Both frontend and backend are housed within the same parent folder but strictly isolated into their own respective folders (`frontend/` and `backend/`).
- The Python backend dependencies are managed using `uv` (through system installation for simplicity inside the Docker container).
- The MongoDB data is persisted via a named Docker volume `mongodb_data`.
- Indexes for database consistency (Unique `employee_id` and unique attendance mappings `(employee_id, date)`) are initialized automatically at startup using a custom `init_db.py` script.

## UI Decisions

- Used Tailwind CSS to enforce a clean, spacious, and modern aesthetic.
- Relied on `lucide-react` for crisp SVG icons.
- Utilized a master layout wrapping `react-router-dom` to ensure consistent sidebar navigation transitions throughout the app.
