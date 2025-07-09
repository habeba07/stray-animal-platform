#!/usr/bin/env python3
import os
import sys
import glob

print("Python version:", sys.version)
print("GDAL_LIBRARY_PATH env:", os.environ.get('GDAL_LIBRARY_PATH'))

# Check GDAL library paths
paths = glob.glob('/usr/lib/*/libgdal.so*')
print("Found GDAL libraries:", paths)

try:
    from osgeo import gdal
    print("GDAL Python version:", gdal.__version__)
except Exception as e:
    print("Error importing GDAL Python:", str(e))

try:
    import django
    print("Django version:", django.__version__)
except Exception as e:
    print("Error importing Django:", str(e))

dos2unix debug_gdal.py
