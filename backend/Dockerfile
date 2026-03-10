# Use official Python image for the base
FROM python:3.12-slim

# Install uv globally
RUN pip install uv

# Set working directory
WORKDIR /app

# Copy the dependency requirements first
COPY requirements.txt .

# Install dependencies using uv into the system environment to keep Docker simple
RUN uv pip install --system -r requirements.txt

# Copy application code and initialization scripts
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application (reads $PORT from Railway, default 8000 for local)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
