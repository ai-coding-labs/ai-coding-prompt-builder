#!/bin/bash

# AI Coding Prompt Builder 前端停止脚本
# 功能：停止前端服务

set -e

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

# 停止服务
stop_service() {
    if check_process; then
        local pid=$(cat "$PID_FILE")
        print_message $YELLOW "正在停止前端服务 (PID: $pid)..."
        
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
        print_message $GREEN "✅ 前端服务已停止"
    else
        print_message $YELLOW "⚠️  未发现运行中的前端服务"
    fi
}

# 清理端口占用
cleanup_port() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_message $YELLOW "清理端口 $PORT 占用..."
        
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
        
        print_message $GREEN "端口 $PORT 已释放"
    fi
}

# 主函数
main() {
    print_message $BLUE "=== AI Coding Prompt Builder 前端停止脚本 ==="
    
    stop_service
    cleanup_port
    
    print_message $GREEN "=== 停止完成 ==="
}

# 执行主函数
main "$@"
