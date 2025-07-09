#!/bin/bash
set -e

echo "Found GDAL library at: $GDAL_LIBRARY_PATH"

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL is up!"

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Execute whatever command was passed
exec "$@"

dos2unix docker-entrypoint.sh