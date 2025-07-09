"""
GDAL library finder script
Place this in your project and import it in settings.py
"""
import os
import glob
import sys

def find_gdal_library():
    """Find the GDAL library on the system and return its path"""
    # Check environment variable first
    if 'GDAL_LIBRARY_PATH' in os.environ and os.path.exists(os.environ['GDAL_LIBRARY_PATH']):
        return os.environ['GDAL_LIBRARY_PATH']
    
    # Common paths where GDAL might be found
    if sys.platform.startswith('linux'):
        paths = glob.glob('/usr/lib/*/libgdal.so*')
        if not paths:
            paths = glob.glob('/usr/lib/libgdal.so*')
        if not paths:
            paths = glob.glob('/lib/*/libgdal.so*')
    elif sys.platform == 'darwin':
        paths = glob.glob('/opt/homebrew/lib/libgdal.dylib')
        if not paths:
            paths = glob.glob('/usr/local/lib/libgdal.dylib')
    elif os.name == 'nt':
        paths = glob.glob('C:/OSGeo4W*/bin/gdal*.dll')
    else:
        paths = []
    
    if paths:
        return paths[0]
    return None

if __name__ == '__main__':
    print(find_gdal_library())
