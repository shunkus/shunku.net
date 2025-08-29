---
title: "Shell Script Cheatsheet"
date: "2018-07-10"
updatedDate: "2025-01-20"
excerpt: "A comprehensive guide to shell scripting with Bash, Zsh, and POSIX shell, covering variables, control flow, functions, file operations, and best practices for automation."
tags: ["Shell", "Bash", "Zsh", "Scripting", "Linux", "Automation", "Cheatsheet"]
author: "Shun Kushigami"
---

# Shell Script Cheatsheet

A comprehensive guide to shell scripting with Bash, Zsh, and POSIX shell, covering variables, control flow, functions, file operations, and best practices for automation.

## Shebang and Script Basics

```bash
#!/bin/bash              # Bash script
#!/bin/sh               # POSIX shell script
#!/usr/bin/env bash     # Portable bash
#!/bin/zsh              # Zsh script

# Make script executable
chmod +x script.sh

# Run script
./script.sh
bash script.sh
sh script.sh
```

## Variables and Data Types

```bash
# Variable assignment (no spaces around =)
name="John"
age=25
readonly CONSTANT="immutable"

# Variable expansion
echo $name
echo ${name}
echo "${name}_suffix"

# Default values
echo ${var:-default}     # Use default if var is unset
echo ${var:=default}     # Set and use default if unset
echo ${var:+alternate}   # Use alternate if var is set
echo ${var:?error msg}   # Display error if unset

# String manipulation
string="Hello World"
echo ${#string}          # Length: 11
echo ${string:6}         # Substring: World
echo ${string:0:5}       # Substring: Hello
echo ${string^^}         # Uppercase: HELLO WORLD
echo ${string,,}         # Lowercase: hello world
echo ${string/World/Universe}  # Replace: Hello Universe

# Arrays (Bash/Zsh)
arr=(apple banana cherry)
echo ${arr[0]}           # First element
echo ${arr[@]}           # All elements
echo ${#arr[@]}          # Array length
arr+=(date)              # Append element
unset arr[1]             # Remove element

# Associative arrays (Bash 4+)
declare -A dict
dict[name]="John"
dict[age]=25
echo ${dict[name]}
echo ${!dict[@]}         # All keys
echo ${dict[@]}          # All values
```

## Input and Output

```bash
# Read user input
read -p "Enter name: " name
read -s -p "Password: " pass  # Silent input
read -t 5 -p "Timeout: " var  # 5 second timeout
read -n 1 -p "Press any key"  # Single character

# Command line arguments
echo $0                  # Script name
echo $1 $2 $3           # Positional parameters
echo $#                  # Number of arguments
echo $@                  # All arguments as separate
echo "$*"                # All arguments as single string
echo $?                  # Exit status of last command
echo $$                  # Current process ID
echo $!                  # PID of last background process

# Shift arguments
shift                    # Shift parameters left
shift 2                  # Shift by 2 positions

# Output redirection
echo "text" > file.txt   # Overwrite file
echo "text" >> file.txt  # Append to file
echo "text" 2> error.log # Redirect stderr
echo "text" &> all.log   # Redirect stdout and stderr
echo "text" 2>&1         # Redirect stderr to stdout
echo "text" | tee file   # Output to screen and file

# Here documents
cat << EOF
Multi-line
text content
EOF

# Here strings
cat <<< "Single line input"
```

## Control Flow

```bash
# If statements
if [ condition ]; then
    echo "True"
elif [ other_condition ]; then
    echo "Else if"
else
    echo "False"
fi

# Test conditions
if [ -z "$var" ]; then           # Empty string
if [ -n "$var" ]; then           # Non-empty string
if [ "$a" = "$b" ]; then         # String equality
if [ "$a" != "$b" ]; then        # String inequality
if [ $a -eq $b ]; then           # Numeric equality
if [ $a -ne $b ]; then           # Numeric inequality
if [ $a -lt $b ]; then           # Less than
if [ $a -le $b ]; then           # Less than or equal
if [ $a -gt $b ]; then           # Greater than
if [ $a -ge $b ]; then           # Greater than or equal

# File tests
if [ -e file ]; then             # File exists
if [ -f file ]; then             # Regular file
if [ -d dir ]; then              # Directory
if [ -L link ]; then             # Symbolic link
if [ -r file ]; then             # Readable
if [ -w file ]; then             # Writable
if [ -x file ]; then             # Executable
if [ -s file ]; then             # File not empty
if [ file1 -nt file2 ]; then     # file1 newer than file2
if [ file1 -ot file2 ]; then     # file1 older than file2

# Logical operators
if [ condition1 ] && [ condition2 ]; then
if [ condition1 ] || [ condition2 ]; then
if ! [ condition ]; then

# Case statement
case $var in
    pattern1)
        echo "Pattern 1"
        ;;
    pattern2|pattern3)
        echo "Pattern 2 or 3"
        ;;
    *)
        echo "Default"
        ;;
esac
```

## Loops

```bash
# For loop
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

# While loop
counter=0
while [ $counter -lt 5 ]; do
    echo $counter
    ((counter++))
done

# Until loop
counter=0
until [ $counter -ge 5 ]; do
    echo $counter
    ((counter++))
done

# Read file line by line
while IFS= read -r line; do
    echo "$line"
done < file.txt

# Break and continue
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        continue  # Skip iteration
    fi
    if [ $i -eq 8 ]; then
        break     # Exit loop
    fi
    echo $i
done
```

## Functions

```bash
# Basic function
function greet() {
    echo "Hello, $1!"
}

# Alternative syntax
greet2() {
    echo "Hi, $1!"
    return 0  # Return status (0-255)
}

# Call function
greet "World"
greet2 "User"

# Function with local variables
calculate() {
    local num1=$1
    local num2=$2
    local result=$((num1 + num2))
    echo $result
}

result=$(calculate 5 3)
echo "Result: $result"

# Function with multiple returns
get_info() {
    echo "name:John"
    echo "age:25"
    return 0
}

# Capture function output
info=$(get_info)

# Global vs local variables
global_var="global"
test_scope() {
    local local_var="local"
    global_var="modified"
}
```

## String Operations

```bash
# String comparison
if [[ "$str1" == "$str2" ]]; then
if [[ "$str1" != "$str2" ]]; then
if [[ "$str1" < "$str2" ]]; then   # Alphabetically before
if [[ "$str1" > "$str2" ]]; then   # Alphabetically after
if [[ -z "$str" ]]; then           # Empty string
if [[ -n "$str" ]]; then           # Non-empty string

# Pattern matching
if [[ "$string" == *"pattern"* ]]; then
if [[ "$string" =~ ^[0-9]+$ ]]; then  # Regex match

# String operations
str="Hello World"
echo ${str#Hello}        # Remove prefix: " World"
echo ${str%World}        # Remove suffix: "Hello "
echo ${str//o/O}         # Replace all: "HellO WOrld"
echo ${str/World/Universe}  # Replace first
```

## Arithmetic Operations

```bash
# Arithmetic expansion
result=$((5 + 3))
result=$((a * b))
result=$((10 / 3))      # Integer division
result=$((10 % 3))      # Modulo

# Let command
let "result = 5 + 3"
let "counter++"
let "value *= 2"

# Arithmetic evaluation
((counter++))
((value = 5 * 3))
if ((a > b)); then

# Floating point (using bc)
result=$(echo "scale=2; 10/3" | bc)
result=$(bc <<< "scale=2; 10/3")

# Random numbers
random=$RANDOM           # 0-32767
random=$((RANDOM % 100))  # 0-99
```

## File Operations

```bash
# Check file/directory
if [ -e "$file" ]; then         # Exists
if [ -f "$file" ]; then         # Regular file
if [ -d "$dir" ]; then          # Directory
if [ -L "$link" ]; then         # Symbolic link
if [ -s "$file" ]; then         # Not empty
if [ -r "$file" ]; then         # Readable
if [ -w "$file" ]; then         # Writable
if [ -x "$file" ]; then         # Executable

# Create/Delete
touch file.txt                   # Create empty file
mkdir -p dir/subdir             # Create directory
rm -f file.txt                  # Remove file
rm -rf directory                # Remove directory
cp source dest                  # Copy file
cp -r source_dir dest_dir       # Copy directory
mv old new                      # Move/rename
ln -s target link               # Symbolic link

# Find files
find . -name "*.txt"            # By name
find . -type f -size +1M        # Files larger than 1MB
find . -mtime -7                # Modified in last 7 days
find . -exec command {} \;      # Execute command

# File content
cat file.txt                    # Display file
head -n 10 file.txt            # First 10 lines
tail -n 10 file.txt            # Last 10 lines
tail -f log.txt                # Follow log file
grep "pattern" file.txt        # Search in file
sed 's/old/new/g' file.txt     # Replace text
awk '{print $1}' file.txt      # Process columns
```

## Process Management

```bash
# Background processes
command &                       # Run in background
jobs                           # List background jobs
fg %1                          # Bring job to foreground
bg %1                          # Resume in background
kill %1                        # Kill job
wait                           # Wait for all background jobs
wait $PID                      # Wait for specific process

# Process information
ps aux                         # All processes
ps -ef                         # Full format
pgrep process_name            # Find process ID
pkill process_name            # Kill by name
killall process_name          # Kill all by name

# Signals
kill -9 PID                    # Force kill
kill -TERM PID                # Terminate
kill -HUP PID                 # Hangup
kill -INT PID                 # Interrupt

# Trap signals
trap 'echo "Interrupted"' INT
trap 'cleanup' EXIT
trap '' TERM                  # Ignore signal
```

## Error Handling

```bash
# Exit on error
set -e                         # Exit on any error
set -u                         # Exit on undefined variable
set -o pipefail               # Exit on pipe failure
set -euo pipefail             # Combine all

# Error handling
command || echo "Command failed"
command && echo "Command succeeded"

if ! command; then
    echo "Error occurred"
    exit 1
fi

# Try-catch equivalent
{
    command1
    command2
} || {
    echo "Error in block"
    exit 1
}

# Cleanup on exit
cleanup() {
    echo "Cleaning up..."
    rm -f /tmp/tempfile
}
trap cleanup EXIT

# Debug mode
set -x                         # Print commands
set +x                         # Disable debug
bash -x script.sh             # Run with debug
```

## Advanced Features

```bash
# Command substitution
result=$(command)
result=`command`               # Old style

# Process substitution
diff <(command1) <(command2)
while read line; do
    echo "$line"
done < <(command)

# Heredoc with variables
cat << EOF
User: $USER
Home: $HOME
EOF

# Heredoc without variable expansion
cat << 'EOF'
$USER will not be expanded
EOF

# Parallel execution
command1 & command2 & wait

# Timeout command
timeout 5 command

# Lock files
lockfile="/var/lock/script.lock"
if ! mkdir "$lockfile" 2>/dev/null; then
    echo "Already running"
    exit 1
fi
trap 'rmdir "$lockfile"' EXIT

# Source other scripts
source script.sh
. script.sh                    # POSIX compatible

# Getopts for options
while getopts "hf:v" opt; do
    case $opt in
        h) show_help; exit 0 ;;
        f) file="$OPTARG" ;;
        v) verbose=true ;;
        *) echo "Invalid option"; exit 1 ;;
    esac
done
shift $((OPTIND-1))
```

## Zsh Specific Features

```bash
# Extended globbing
setopt extended_glob
*.txt~temp.txt                # All .txt except temp.txt
**/*.txt                      # Recursive search
*(.om[1])                     # Newest file
*(.)                          # Regular files only
*(/)                          # Directories only

# Better arrays
array=(one two three)
print ${array[1]}             # First element (1-indexed)
print ${array[-1]}            # Last element
print ${(j:,:)array}          # Join with comma

# Associative arrays
typeset -A hash
hash[key]=value
print ${hash[key]}

# Prompt customization
PS1='%n@%m:%~$ '             # User@host:path$

# Zmv for batch rename
autoload -U zmv
zmv '(*).txt' '$1.bak'       # Rename all .txt to .bak
```

## Best Practices

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Use meaningful variable names
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"

# Function documentation
# Description: Processes a file
# Arguments:
#   $1 - Input file path
# Returns:
#   0 - Success
#   1 - File not found
process_file() {
    local input_file="${1:?Error: Missing file argument}"
    
    if [[ ! -f "$input_file" ]]; then
        echo "Error: File not found: $input_file" >&2
        return 1
    fi
    
    # Process file...
    return 0
}

# Main function
main() {
    # Script logic here
    process_file "$@"
}

# Only run main if script is executed (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

This cheatsheet covers the essential shell scripting features for Bash, Zsh, and POSIX shells. Remember to test scripts thoroughly and follow best practices for maintainable and portable code.