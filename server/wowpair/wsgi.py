"""
WSGI config for Oh_Wow_wow_pair project.

注意：本專案主要使用 ASGI (asgi.py) 來支援 WebSocket 即時通訊功能
    此 WSGI 檔案僅用於：
    - 不需要 WebSocket 的純 HTTP API 部署
    - 某些只支援 WSGI 的傳統部署環境
    - 向後相容性保留

建議使用: uvicorn wowpair.asgi:application
而非: gunicorn wowpair.wsgi:application

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wowpair.settings')

application = get_wsgi_application()
