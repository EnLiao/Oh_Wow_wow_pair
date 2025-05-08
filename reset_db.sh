#!/bin/bash

# 切到 manage.py 所在目錄
cd "$(dirname "$0")"

# 刪除 SQLite 資料庫
rm -f server/db.sqlite3

# 刪除所有 app 的遷移檔（保留 __init__.py）
find server -type d -name migrations | while read dir; do
    find "$dir" -name "*.py" ! -name "__init__.py" -delete
    find "$dir" -name "*.pyc" -delete
done

echo "已清除所有 app 的遷移檔與資料庫"