from django.apps import AppConfig
import sys


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # 啟動伺服器後自動定期清理未驗證用戶
        if 'runserver' in sys.argv or 'daphne' in sys.argv:
            import threading
            def delete_unverified_users_periodically():
                import time
                from django.core.management import call_command
                while True:
                    try:
                        call_command('delete_unverified_users')
                    except Exception as e:
                        pass  # 可加 log
                    time.sleep(60)
            t = threading.Thread(target=delete_unverified_users_periodically, daemon=True)
            t.start()
