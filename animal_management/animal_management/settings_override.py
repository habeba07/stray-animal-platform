"""
Override Django settings for Docker environment
Import this at the very end of your settings.py file:

try:
    from .settings_override import *
except ImportError:
    pass
"""
import os
import glob
import sys

# Override GDAL settings
def find_gdal_library():
    """Find the GDAL library path"""
    # Docker Linux paths
    if glob.glob('/usr/lib/*/libgdal.so*'):
        return glob.glob('/usr/lib/*/libgdal.so*')[0]
    
    # More specific search
    for path in [
        # Debian/Ubuntu with version number
        '/usr/lib/x86_64-linux-gnu/libgdal.so.28',
        '/usr/lib/x86_64-linux-gnu/libgdal.so.27',
        '/usr/lib/x86_64-linux-gnu/libgdal.so.26',
        # General paths
        '/usr/lib/libgdal.so',
        # macOS paths
        '/opt/homebrew/lib/libgdal.dylib',
        '/usr/local/lib/libgdal.dylib'
    ]:
        if os.path.exists(path):
            return path
    
    return None

GDAL_LIBRARY_PATH = find_gdal_library()
print(f"Using GDAL library path: {GDAL_LIBRARY_PATH}")
