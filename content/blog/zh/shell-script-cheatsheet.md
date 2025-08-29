---
title: "Shell 脚本速查表"
date: "2018-07-10"
updatedDate: "2025-01-20"
excerpt: "使用Bash、Zsh和POSIX shell进行shell脚本编程的综合指南，涵盖变量、控制流、函数、文件操作和自动化最佳实践。"
tags: ["Shell", "Bash", "Zsh", "脚本编程", "Linux", "自动化", "速查表"]
author: "Shun Kushigami"
---

# Shell 脚本速查表

使用Bash、Zsh和POSIX shell进行shell脚本编程的综合指南，涵盖变量、控制流、函数、文件操作和自动化最佳实践。

## Shebang和脚本基础

```bash
#!/bin/bash              # Bash脚本
#!/bin/sh               # POSIX shell脚本
#!/usr/bin/env bash     # 可移植的bash
#!/bin/zsh              # Zsh脚本

# 使脚本可执行
chmod +x script.sh

# 运行脚本
./script.sh
bash script.sh
sh script.sh
```

## 变量和数据类型

```bash
# 变量赋值（=周围没有空格）
name="John"
age=25
readonly CONSTANT="不可变"

# 变量扩展
echo $name
echo ${name}
echo "${name}_suffix"

# 默认值
echo ${var:-default}     # 如果var未设置则使用default
echo ${var:=default}     # 如果未设置则设置并使用default
echo ${var:+alternate}   # 如果var已设置则使用alternate
echo ${var:?error msg}   # 如果未设置则显示错误

# 字符串操作
string="Hello World"
echo ${#string}          # 长度: 11
echo ${string:6}         # 子字符串: World
echo ${string:0:5}       # 子字符串: Hello
echo ${string^^}         # 大写: HELLO WORLD
echo ${string,,}         # 小写: hello world
echo ${string/World/Universe}  # 替换: Hello Universe

# 数组（Bash/Zsh）
arr=(apple banana cherry)
echo ${arr[0]}           # 第一个元素
echo ${arr[@]}           # 所有元素
echo ${#arr[@]}          # 数组长度
arr+=(date)              # 添加元素
unset arr[1]             # 删除元素

# 关联数组（Bash 4+）
declare -A dict
dict[name]="John"
dict[age]=25
echo ${dict[name]}
echo ${!dict[@]}         # 所有键
echo ${dict[@]}          # 所有值
```

## 输入和输出

```bash
# 读取用户输入
read -p "输入姓名: " name
read -s -p "密码: " pass  # 静默输入
read -t 5 -p "超时: " var  # 5秒超时
read -n 1 -p "按任意键"    # 单个字符

# 命令行参数
echo $0                  # 脚本名称
echo $1 $2 $3           # 位置参数
echo $#                  # 参数数量
echo $@                  # 所有参数分别
echo "$*"                # 所有参数作为单个字符串
echo $?                  # 最后命令的退出状态
echo $$                  # 当前进程ID
echo $!                  # 最后后台进程的PID

# 移动参数
shift                    # 向左移动参数
shift 2                  # 移动2个位置

# 输出重定向
echo "text" > file.txt   # 覆盖文件
echo "text" >> file.txt  # 追加到文件
echo "text" 2> error.log # 重定向stderr
echo "text" &> all.log   # 重定向stdout和stderr
echo "text" 2>&1         # 将stderr重定向到stdout
echo "text" | tee file   # 输出到屏幕和文件

# Here文档
cat << EOF
多行
文本内容
EOF

# Here字符串
cat <<< "单行输入"
```

## 控制流

```bash
# if语句
if [ condition ]; then
    echo "真"
elif [ other_condition ]; then
    echo "否则如果"
else
    echo "假"
fi

# 测试条件
if [ -z "$var" ]; then           # 空字符串
if [ -n "$var" ]; then           # 非空字符串
if [ "$a" = "$b" ]; then         # 字符串相等
if [ "$a" != "$b" ]; then        # 字符串不等
if [ $a -eq $b ]; then           # 数字相等
if [ $a -ne $b ]; then           # 数字不等
if [ $a -lt $b ]; then           # 小于
if [ $a -le $b ]; then           # 小于等于
if [ $a -gt $b ]; then           # 大于
if [ $a -ge $b ]; then           # 大于等于

# 文件测试
if [ -e file ]; then             # 文件存在
if [ -f file ]; then             # 常规文件
if [ -d dir ]; then              # 目录
if [ -L link ]; then             # 符号链接
if [ -r file ]; then             # 可读
if [ -w file ]; then             # 可写
if [ -x file ]; then             # 可执行
if [ -s file ]; then             # 文件非空
if [ file1 -nt file2 ]; then     # file1比file2新
if [ file1 -ot file2 ]; then     # file1比file2旧

# 逻辑运算符
if [ condition1 ] && [ condition2 ]; then
if [ condition1 ] || [ condition2 ]; then
if ! [ condition ]; then

# case语句
case $var in
    pattern1)
        echo "模式1"
        ;;
    pattern2|pattern3)
        echo "模式2或3"
        ;;
    *)
        echo "默认"
        ;;
esac
```

## 循环

```bash
# for循环
for i in 1 2 3 4 5; do
    echo $i
done

for i in {1..5}; do
    echo $i
done

for i in $(seq 1 5); do
    echo $i
done

for file in *.txt; do
    echo $file
done

for ((i=0; i<5; i++)); do
    echo $i
done

# while循环
counter=0
while [ $counter -lt 5 ]; do
    echo $counter
    ((counter++))
done

# until循环
counter=0
until [ $counter -ge 5 ]; do
    echo $counter
    ((counter++))
done

# 逐行读取文件
while IFS= read -r line; do
    echo "$line"
done < file.txt

# break和continue
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        continue  # 跳过迭代
    fi
    if [ $i -eq 8 ]; then
        break     # 退出循环
    fi
    echo $i
done
```

## 函数

```bash
# 基本函数
function greet() {
    echo "你好，$1！"
}

# 替代语法
greet2() {
    echo "嗨，$1！"
    return 0  # 返回状态（0-255）
}

# 调用函数
greet "世界"
greet2 "用户"

# 带局部变量的函数
calculate() {
    local num1=$1
    local num2=$2
    local result=$((num1 + num2))
    echo $result
}

result=$(calculate 5 3)
echo "结果: $result"

# 多返回值函数
get_info() {
    echo "name:John"
    echo "age:25"
    return 0
}

# 捕获函数输出
info=$(get_info)

# 全局vs局部变量
global_var="全局"
test_scope() {
    local local_var="局部"
    global_var="已修改"
}
```

## 字符串操作

```bash
# 字符串比较
if [[ "$str1" == "$str2" ]]; then
if [[ "$str1" != "$str2" ]]; then
if [[ "$str1" < "$str2" ]]; then   # 按字母顺序在前
if [[ "$str1" > "$str2" ]]; then   # 按字母顺序在后
if [[ -z "$str" ]]; then           # 空字符串
if [[ -n "$str" ]]; then           # 非空字符串

# 模式匹配
if [[ "$string" == *"pattern"* ]]; then
if [[ "$string" =~ ^[0-9]+$ ]]; then  # 正则匹配

# 字符串操作
str="Hello World"
echo ${str#Hello}        # 删除前缀: " World"
echo ${str%World}        # 删除后缀: "Hello "
echo ${str//o/O}         # 替换所有: "HellO WOrld"
echo ${str/World/Universe}  # 替换第一个
```

## 算术运算

```bash
# 算术展开
result=$((5 + 3))
result=$((a * b))
result=$((10 / 3))      # 整数除法
result=$((10 % 3))      # 取模

# let命令
let "result = 5 + 3"
let "counter++"
let "value *= 2"

# 算术评估
((counter++))
((value = 5 * 3))
if ((a > b)); then

# 浮点数（使用bc）
result=$(echo "scale=2; 10/3" | bc)
result=$(bc <<< "scale=2; 10/3")

# 随机数
random=$RANDOM           # 0-32767
random=$((RANDOM % 100))  # 0-99
```

## 文件操作

```bash
# 检查文件/目录
if [ -e "$file" ]; then         # 存在
if [ -f "$file" ]; then         # 常规文件
if [ -d "$dir" ]; then          # 目录
if [ -L "$link" ]; then         # 符号链接
if [ -s "$file" ]; then         # 非空
if [ -r "$file" ]; then         # 可读
if [ -w "$file" ]; then         # 可写
if [ -x "$file" ]; then         # 可执行

# 创建/删除
touch file.txt                   # 创建空文件
mkdir -p dir/subdir             # 创建目录
rm -f file.txt                  # 删除文件
rm -rf directory                # 删除目录
cp source dest                  # 复制文件
cp -r source_dir dest_dir       # 复制目录
mv old new                      # 移动/重命名
ln -s target link               # 符号链接

# 查找文件
find . -name "*.txt"            # 按名称
find . -type f -size +1M        # 大于1MB的文件
find . -mtime -7                # 最近7天修改的
find . -exec command {} \;      # 执行命令

# 文件内容
cat file.txt                    # 显示文件
head -n 10 file.txt            # 前10行
tail -n 10 file.txt            # 后10行
tail -f log.txt                # 跟踪日志文件
grep "pattern" file.txt        # 在文件中搜索
sed 's/old/new/g' file.txt     # 替换文本
awk '{print $1}' file.txt      # 处理列
```

## 进程管理

```bash
# 后台进程
command &                       # 在后台运行
jobs                           # 列出后台作业
fg %1                          # 将作业带到前台
bg %1                          # 在后台恢复
kill %1                        # 杀死作业
wait                           # 等待所有后台作业
wait $PID                      # 等待特定进程

# 进程信息
ps aux                         # 所有进程
ps -ef                         # 完整格式
pgrep process_name            # 查找进程ID
pkill process_name            # 按名称杀死
killall process_name          # 按名称杀死所有

# 信号
kill -9 PID                    # 强制杀死
kill -TERM PID                # 终止
kill -HUP PID                 # 挂起
kill -INT PID                 # 中断

# 捕获信号
trap 'echo "中断"' INT
trap 'cleanup' EXIT
trap '' TERM                  # 忽略信号
```

## 错误处理

```bash
# 出错时退出
set -e                         # 任何错误都退出
set -u                         # 未定义变量时退出
set -o pipefail               # 管道失败时退出
set -euo pipefail             # 组合所有

# 错误处理
command || echo "命令失败"
command && echo "命令成功"

if ! command; then
    echo "发生错误"
    exit 1
fi

# try-catch等价物
{
    command1
    command2
} || {
    echo "块中的错误"
    exit 1
}

# 退出时清理
cleanup() {
    echo "正在清理..."
    rm -f /tmp/tempfile
}
trap cleanup EXIT

# 调试模式
set -x                         # 打印命令
set +x                         # 禁用调试
bash -x script.sh             # 使用调试运行
```

## 高级功能

```bash
# 命令替换
result=$(command)
result=`command`               # 旧样式

# 进程替换
diff <(command1) <(command2)
while read line; do
    echo "$line"
done < <(command)

# 带变量的Heredoc
cat << EOF
用户: $USER
主目录: $HOME
EOF

# 不进行变量扩展的Heredoc
cat << 'EOF'
$USER 不会被扩展
EOF

# 并行执行
command1 & command2 & wait

# 超时命令
timeout 5 command

# 锁文件
lockfile="/var/lock/script.lock"
if ! mkdir "$lockfile" 2>/dev/null; then
    echo "已经在运行"
    exit 1
fi
trap 'rmdir "$lockfile"' EXIT

# 源其他脚本
source script.sh
. script.sh                    # POSIX兼容

# 选项的getopts
while getopts "hf:v" opt; do
    case $opt in
        h) show_help; exit 0 ;;
        f) file="$OPTARG" ;;
        v) verbose=true ;;
        *) echo "无效选项"; exit 1 ;;
    esac
done
shift $((OPTIND-1))
```

## Zsh特定功能

```bash
# 扩展通配符
setopt extended_glob
*.txt~temp.txt                # 除temp.txt外的所有.txt
**/*.txt                      # 递归搜索
*(.om[1])                     # 最新文件
*(.)                          # 仅常规文件
*(/)                          # 仅目录

# 更好的数组
array=(one two three)
print ${array[1]}             # 第一个元素（1索引）
print ${array[-1]}            # 最后一个元素
print ${(j:,:)array}          # 用逗号连接

# 关联数组
typeset -A hash
hash[key]=value
print ${hash[key]}

# 提示符自定义
PS1='%n@%m:%~$ '             # 用户@主机:路径$

# 批量重命名的zmv
autoload -U zmv
zmv '(*).txt' '$1.bak'       # 将所有.txt重命名为.bak
```

## 最佳实践

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# 使用有意义的变量名
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"

# 函数文档
# 描述: 处理文件
# 参数:
#   $1 - 输入文件路径
# 返回:
#   0 - 成功
#   1 - 文件未找到
process_file() {
    local input_file="${1:?错误: 缺少文件参数}"
    
    if [[ ! -f "$input_file" ]]; then
        echo "错误: 文件未找到: $input_file" >&2
        return 1
    fi
    
    # 处理文件...
    return 0
}

# 主函数
main() {
    # 脚本逻辑在这里
    process_file "$@"
}

# 只有在脚本被执行时才运行main（不是被源引用）
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

这个速查表涵盖了Bash、Zsh和POSIX shell的基本shell脚本功能。记住要彻底测试脚本并遵循最佳实践以编写可维护和可移植的代码。