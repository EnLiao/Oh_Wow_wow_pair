#!/bin/bash

# 切換到專案根目錄（假設 manage.py 在這裡）
cd "$(dirname "$0")"

# 刪除資料庫
rm -f server/db.sqlite3

# 刪除遷移檔案
find server/core/migrations -name "*.py" ! -name "__init__.py" -delete
find server/core/migrations -name "*.pyc" -delete

echo "已清除 db.sqlite3 與 core/migrations 中的遷移檔"