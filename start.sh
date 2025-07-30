#!/bin/bash

# AI Coding Prompt Builder 前端启动脚本
# 功能：一键启动前端项目，使用62158端口，保证单实例启动

set -e  # 遇到错误立即退出

# 配置变量
PORT=62158
PROJECT_NAME="ai-coding-prompt-builder"
PID_FILE="/tmp/${PROJECT_NAME}_${PORT}.pid"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# 检查端口是否被占用
check_port() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # 端口被占用
    else
        return 1  # 端口空闲
    fi
}

# 检查进程是否存在
check_process() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            return 0  # 进程存在
        else
            # PID文件存在但进程不存在，清理PID文件
            rm -f "$PID_FILE"
            return 1  # 进程不存在
        fi
    else
        return 1  # PID文件不存在
    fi
}

# 停止现有进程
stop_existing() {
    if check_process; then
        local pid=$(cat "$PID_FILE")
        print_message $YELLOW "发现现有进程 (PID: $pid)，正在停止..."
        
        # 尝试优雅停止
        kill $pid 2>/dev/null || true
        
        # 等待进程结束
        local count=0
        while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # 如果进程仍然存在，强制杀死
        if ps -p $pid > /dev/null 2>&1; then
            print_message $YELLOW "强制停止进程..."
            kill -9 $pid 2>/dev/null || true
        fi
        
        rm -f "$PID_FILE"
        print_message $GREEN "现有进程已停止"
    fi
}

# 清理端口占用
cleanup_port() {
    if check_port; then
        print_message $YELLOW "端口 $PORT 被占用，正在清理..."
        
        # 查找占用端口的进程
        local pids=$(lsof -ti:$PORT)
        if [ -n "$pids" ]; then
            for pid in $pids; do
                print_message $YELLOW "停止占用端口的进程 (PID: $pid)..."
                kill $pid 2>/dev/null || true
                sleep 1
                
                # 如果进程仍然存在，强制杀死
                if ps -p $pid > /dev/null 2>&1; then
                    kill -9 $pid 2>/dev/null || true
                fi
            done
        fi
        
        # 等待端口释放
        local count=0
        while check_port && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        if check_port; then
            print_message $RED "无法释放端口 $PORT，请手动检查"
            exit 1
        else
            print_message $GREEN "端口 $PORT 已释放"
        fi
    fi
}

# 检查依赖
check_dependencies() {
    print_message $BLUE "检查项目依赖..."
    
    if [ ! -f "package.json" ]; then
        print_message $RED "错误：未找到 package.json 文件"
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_message $YELLOW "未找到 node_modules，正在安装依赖..."
        npm install
    fi
}

# 启动前端服务
start_frontend() {
    print_message $BLUE "启动前端服务..."
    
    # 设置环境变量指定端口
    export VITE_PORT=$PORT
    
    # 启动开发服务器
    nohup npm run dev -- --port $PORT --host 0.0.0.0 > /tmp/${PROJECT_NAME}_${PORT}.log 2>&1 &
    local pid=$!
    
    # 保存PID
    echo $pid > "$PID_FILE"
    
    print_message $GREEN "前端服务已启动 (PID: $pid)"
    print_message $GREEN "访问地址: http://localhost:$PORT"
    print_message $BLUE "日志文件: /tmp/${PROJECT_NAME}_${PORT}.log"
    
    # 等待服务启动
    print_message $BLUE "等待服务启动..."
    local count=0
    while ! check_port && [ $count -lt 30 ]; do
        sleep 1
        count=$((count + 1))
        if [ $((count % 5)) -eq 0 ]; then
            print_message $BLUE "等待中... ($count/30)"
        fi
    done
    
    if check_port; then
        print_message $GREEN "✅ 前端服务启动成功！"
        print_message $GREEN "🌐 访问地址: http://localhost:$PORT"
    else
        print_message $RED "❌ 前端服务启动失败，请检查日志"
        print_message $BLUE "查看日志: tail -f /tmp/${PROJECT_NAME}_${PORT}.log"
        exit 1
    fi
}

# 主函数
main() {
    print_message $BLUE "=== AI Coding Prompt Builder 前端启动脚本 ==="
    print_message $BLUE "项目: $PROJECT_NAME"
    print_message $BLUE "端口: $PORT"
    
    # 检查是否已有实例运行
    if check_process; then
        print_message $YELLOW "检测到已有实例运行，正在重启..."
        stop_existing
    elif check_port; then
        print_message $YELLOW "端口被其他进程占用，正在清理..."
        cleanup_port
    fi
    
    # 检查依赖
    check_dependencies
    
    # 启动服务
    start_frontend
    
    print_message $GREEN "=== 启动完成 ==="
}

# 信号处理
cleanup() {
    print_message $YELLOW "收到停止信号，正在清理..."
    stop_existing
    exit 0
}

trap cleanup SIGINT SIGTERM

# 执行主函数
main "$@"
