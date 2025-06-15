from django.apps import AppConfig

import threading
import time
import sys
from django.core.management import call_command


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # 只在 runserver 時啟動，避免 migrate/shell 也啟動
        if 'runserver' in sys.argv:
            def delete_unverified_users_periodically():
                while True:
                    try:
                        call_command('delete_unverified_users')
                    except Exception as e:
                        pass  # 可加 log
                    time.sleep(60)
            t = threading.Thread(target=delete_unverified_users_periodically, daemon=True)
            t.start()
