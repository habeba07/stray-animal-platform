FROM python:3.9

ENV PYTHONUNBUFFERED=1

# Install system dependencies for GeoDjango
RUN apt-get update && apt-get install -y \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    python3-gdal

# Set environment variables for GDAL
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

WORKDIR /code

# Install Python dependencies
COPY requirements.txt /code/
RUN pip install numpy
RUN pip install -r requirements.txt

# Copy the project code
COPY . /code/

# Copy and make the wait script executable
COPY wait-for-db.sh /code/
RUN chmod +x /code/wait-for-db.sh

# Default command (will be overridden by docker-compose)
CMD python manage.py migrate --settings=animal_management.settings_production && python manage.py runserver 0.0.0.0:$PORT --settings=animal_management.settings_production