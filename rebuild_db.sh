#!/bin/bash

# 切換到專案根目錄
cd "$(dirname "$0")"

# 執行遷移
cd server
python manage.py makemigrations core
python manage.py migrate

echo "已重新建立資料表"