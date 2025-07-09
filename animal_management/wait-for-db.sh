#!/bin/bash
set -e

# Give some time for PostgreSQL to start
echo "Waiting for PostgreSQL to start up..."
sleep 30

# Try to run migrations
echo "Running migrations..."
python manage.py migrate

# Start Django with ASGI (WebSocket support)
echo "Starting Django server with ASGI/WebSocket support..."
daphne -b 0.0.0.0 -p 8000 animal_management.asgi:application
