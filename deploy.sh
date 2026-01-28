#!/bin/bash

# 构建并部署 qiankun 主应用和子应用

set -e

echo "========== 1. 构建子应用 =========="
cd vue-qiankun-element
npm install
npm run build
cd ..

echo "========== 2. 构建主应用 =========="
cd qiankun-main
npm install
npm run build
cd ..

echo "========== 3. 启动 Docker =========="
docker compose down 2>/dev/null || true
docker compose up -d

echo "========== 部署完成 =========="
echo "访问地址: http://localhost"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
