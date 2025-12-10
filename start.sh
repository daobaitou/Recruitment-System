#!/bin/bash

# RecruitmentSystem 自动启动脚本

# 设置工作目录
cd /home/wang/RecruitmentSystem

# 终止可能正在运行的服务进程
echo "正在终止可能正在运行的服务..."
pkill -f "node app.js"
pkill -f "vite"

# 等待进程完全终止
sleep 3

# 检查端口占用情况并终止占用进程
echo "检查端口占用情况..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "端口3000被占用，正在终止占用进程..."
    kill -9 $(lsof -t -i:3000)
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "端口5173被占用，正在终止占用进程..."
    kill -9 $(lsof -t -i:5173)
fi

# 等待端口释放
sleep 2

# 启动后端服务
echo "正在启动后端服务..."
cd backend
nohup node app.js > app.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端服务启动
sleep 5

# 启动前端服务
echo "正在启动前端服务..."
cd frontend
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 等待前端服务启动
sleep 10

# 检查服务状态
echo "检查服务状态..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ 后端服务启动成功 (端口3000)"
else
    echo "❌ 后端服务启动失败"
    cat backend/app.log
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ 前端服务启动成功 (端口5173)"
else
    echo "❌ 前端服务启动失败"
    cat frontend/frontend.log
fi

echo "启动完成！"
echo "请访问 http://localhost:5173 登录系统"
echo "默认账号: admin 密码: 123456"