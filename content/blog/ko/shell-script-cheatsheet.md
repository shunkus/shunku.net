---
title: "셸 스크립트 치트시트"
date: "2018-07-10"
updatedDate: "2025-01-20"
excerpt: "Bash, Zsh, POSIX 셸을 사용한 셸 스크립팅의 포괄적인 가이드. 변수, 제어 흐름, 함수, 파일 작업, 자동화 모범 사례를 다룹니다."
tags: ["Shell", "Bash", "Zsh", "스크립팅", "Linux", "자동화", "치트시트"]
author: "Shun Kushigami"
---

# 셸 스크립트 치트시트

Bash, Zsh, POSIX 셸을 사용한 셸 스크립팅의 포괄적인 가이드. 변수, 제어 흐름, 함수, 파일 작업, 자동화 모범 사례를 다룹니다.

## 셰뱅과 스크립트 기본

```bash
#!/bin/bash              # Bash 스크립트
#!/bin/sh               # POSIX 셸 스크립트
#!/usr/bin/env bash     # 포터블 bash
#!/bin/zsh              # Zsh 스크립트

# 스크립트를 실행 가능하게 만들기
chmod +x script.sh

# 스크립트 실행
./script.sh
bash script.sh
sh script.sh
```

## 변수와 데이터 타입

```bash
# 변수 할당 (= 주위에 공백 없음)
name="John"
age=25
readonly CONSTANT="불변"

# 변수 확장
echo $name
echo ${name}
echo "${name}_suffix"

# 기본값
echo ${var:-default}     # var가 설정되지 않으면 default 사용
echo ${var:=default}     # 설정되지 않으면 default로 설정하고 사용
echo ${var:+alternate}   # var가 설정되면 alternate 사용
echo ${var:?error msg}   # 설정되지 않으면 오류 표시

# 문자열 조작
string="Hello World"
echo ${#string}          # 길이: 11
echo ${string:6}         # 부분 문자열: World
echo ${string:0:5}       # 부분 문자열: Hello
echo ${string^^}         # 대문자: HELLO WORLD
echo ${string,,}         # 소문자: hello world
echo ${string/World/Universe}  # 치환: Hello Universe

# 배열 (Bash/Zsh)
arr=(apple banana cherry)
echo ${arr[0]}           # 첫 번째 요소
echo ${arr[@]}           # 모든 요소
echo ${#arr[@]}          # 배열 길이
arr+=(date)              # 요소 추가
unset arr[1]             # 요소 제거

# 연관 배열 (Bash 4+)
declare -A dict
dict[name]="John"
dict[age]=25
echo ${dict[name]}
echo ${!dict[@]}         # 모든 키
echo ${dict[@]}          # 모든 값
```

## 입력과 출력

```bash
# 사용자 입력 읽기
read -p "이름 입력: " name
read -s -p "비밀번호: " pass  # 조용한 입력
read -t 5 -p "타임아웃: " var  # 5초 타임아웃
read -n 1 -p "아무 키나 누르세요"  # 단일 문자

# 명령줄 인수
echo $0                  # 스크립트 이름
echo $1 $2 $3           # 위치 매개변수
echo $#                  # 인수 개수
echo $@                  # 모든 인수를 별도로
echo "$*"                # 모든 인수를 단일 문자열로
echo $?                  # 마지막 명령의 종료 상태
echo $$                  # 현재 프로세스 ID
echo $!                  # 마지막 백그라운드 프로세스의 PID

# 인수 이동
shift                    # 매개변수를 왼쪽으로 이동
shift 2                  # 2 위치만큼 이동

# 출력 리디렉션
echo "text" > file.txt   # 파일 덮어쓰기
echo "text" >> file.txt  # 파일에 추가
echo "text" 2> error.log # stderr 리디렉트
echo "text" &> all.log   # stdout과 stderr 리디렉트
echo "text" 2>&1         # stderr을 stdout으로 리디렉트
echo "text" | tee file   # 화면과 파일에 출력

# Here 문서
cat << EOF
여러 줄
텍스트 내용
EOF

# Here 문자열
cat <<< "한 줄 입력"
```

## 제어 흐름

```bash
# if 문
if [ condition ]; then
    echo "참"
elif [ other_condition ]; then
    echo "그렇지 않으면"
else
    echo "거짓"
fi

# 테스트 조건
if [ -z "$var" ]; then           # 빈 문자열
if [ -n "$var" ]; then           # 비어있지 않은 문자열
if [ "$a" = "$b" ]; then         # 문자열 동등성
if [ "$a" != "$b" ]; then        # 문자열 부등성
if [ $a -eq $b ]; then           # 숫자 동등성
if [ $a -ne $b ]; then           # 숫자 부등성
if [ $a -lt $b ]; then           # 미만
if [ $a -le $b ]; then           # 이하
if [ $a -gt $b ]; then           # 초과
if [ $a -ge $b ]; then           # 이상

# 파일 테스트
if [ -e file ]; then             # 파일 존재
if [ -f file ]; then             # 일반 파일
if [ -d dir ]; then              # 디렉토리
if [ -L link ]; then             # 심볼릭 링크
if [ -r file ]; then             # 읽기 가능
if [ -w file ]; then             # 쓰기 가능
if [ -x file ]; then             # 실행 가능
if [ -s file ]; then             # 파일이 비어있지 않음
if [ file1 -nt file2 ]; then     # file1이 file2보다 새로움
if [ file1 -ot file2 ]; then     # file1이 file2보다 오래됨

# 논리 연산자
if [ condition1 ] && [ condition2 ]; then
if [ condition1 ] || [ condition2 ]; then
if ! [ condition ]; then

# case 문
case $var in
    pattern1)
        echo "패턴 1"
        ;;
    pattern2|pattern3)
        echo "패턴 2 또는 3"
        ;;
    *)
        echo "기본값"
        ;;
esac
```

## 반복문

```bash
# for 루프
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

# while 루프
counter=0
while [ $counter -lt 5 ]; do
    echo $counter
    ((counter++))
done

# until 루프
counter=0
until [ $counter -ge 5 ]; do
    echo $counter
    ((counter++))
done

# 파일을 한 줄씩 읽기
while IFS= read -r line; do
    echo "$line"
done < file.txt

# break와 continue
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        continue  # 반복 건너뛰기
    fi
    if [ $i -eq 8 ]; then
        break     # 루프 종료
    fi
    echo $i
done
```

## 함수

```bash
# 기본 함수
function greet() {
    echo "안녕하세요, $1!"
}

# 대체 구문
greet2() {
    echo "안녕, $1!"
    return 0  # 반환 상태 (0-255)
}

# 함수 호출
greet "세계"
greet2 "사용자"

# 지역 변수가 있는 함수
calculate() {
    local num1=$1
    local num2=$2
    local result=$((num1 + num2))
    echo $result
}

result=$(calculate 5 3)
echo "결과: $result"

# 여러 반환값이 있는 함수
get_info() {
    echo "name:John"
    echo "age:25"
    return 0
}

# 함수 출력 캡처
info=$(get_info)

# 전역 vs 지역 변수
global_var="전역"
test_scope() {
    local local_var="지역"
    global_var="수정됨"
}
```

## 문자열 작업

```bash
# 문자열 비교
if [[ "$str1" == "$str2" ]]; then
if [[ "$str1" != "$str2" ]]; then
if [[ "$str1" < "$str2" ]]; then   # 알파벳순으로 앞
if [[ "$str1" > "$str2" ]]; then   # 알파벳순으로 뒤
if [[ -z "$str" ]]; then           # 빈 문자열
if [[ -n "$str" ]]; then           # 비어있지 않은 문자열

# 패턴 매칭
if [[ "$string" == *"pattern"* ]]; then
if [[ "$string" =~ ^[0-9]+$ ]]; then  # 정규식 매치

# 문자열 연산
str="Hello World"
echo ${str#Hello}        # 접두사 제거: " World"
echo ${str%World}        # 접미사 제거: "Hello "
echo ${str//o/O}         # 모두 치환: "HellO WOrld"
echo ${str/World/Universe}  # 첫 번째 치환
```

## 산술 연산

```bash
# 산술 확장
result=$((5 + 3))
result=$((a * b))
result=$((10 / 3))      # 정수 나눗셈
result=$((10 % 3))      # 나머지

# let 명령
let "result = 5 + 3"
let "counter++"
let "value *= 2"

# 산술 평가
((counter++))
((value = 5 * 3))
if ((a > b)); then

# 부동소수점 (bc 사용)
result=$(echo "scale=2; 10/3" | bc)
result=$(bc <<< "scale=2; 10/3")

# 랜덤 수
random=$RANDOM           # 0-32767
random=$((RANDOM % 100))  # 0-99
```

## 파일 작업

```bash
# 파일/디렉토리 확인
if [ -e "$file" ]; then         # 존재함
if [ -f "$file" ]; then         # 일반 파일
if [ -d "$dir" ]; then          # 디렉토리
if [ -L "$link" ]; then         # 심볼릭 링크
if [ -s "$file" ]; then         # 비어있지 않음
if [ -r "$file" ]; then         # 읽기 가능
if [ -w "$file" ]; then         # 쓰기 가능
if [ -x "$file" ]; then         # 실행 가능

# 생성/삭제
touch file.txt                   # 빈 파일 생성
mkdir -p dir/subdir             # 디렉토리 생성
rm -f file.txt                  # 파일 제거
rm -rf directory                # 디렉토리 제거
cp source dest                  # 파일 복사
cp -r source_dir dest_dir       # 디렉토리 복사
mv old new                      # 이동/이름 변경
ln -s target link               # 심볼릭 링크

# 파일 찾기
find . -name "*.txt"            # 이름으로
find . -type f -size +1M        # 1MB보다 큰 파일
find . -mtime -7                # 최근 7일 동안 수정됨
find . -exec command {} \;      # 명령 실행

# 파일 내용
cat file.txt                    # 파일 표시
head -n 10 file.txt            # 처음 10줄
tail -n 10 file.txt            # 마지막 10줄
tail -f log.txt                # 로그 파일 추적
grep "pattern" file.txt        # 파일에서 검색
sed 's/old/new/g' file.txt     # 텍스트 치환
awk '{print $1}' file.txt      # 열 처리
```

## 프로세스 관리

```bash
# 백그라운드 프로세스
command &                       # 백그라운드에서 실행
jobs                           # 백그라운드 작업 목록
fg %1                          # 작업을 포그라운드로
bg %1                          # 백그라운드에서 재개
kill %1                        # 작업 종료
wait                           # 모든 백그라운드 작업 대기
wait $PID                      # 특정 프로세스 대기

# 프로세스 정보
ps aux                         # 모든 프로세스
ps -ef                         # 전체 형식
pgrep process_name            # 프로세스 ID 찾기
pkill process_name            # 이름으로 종료
killall process_name          # 이름으로 모두 종료

# 시그널
kill -9 PID                    # 강제 종료
kill -TERM PID                # 종료
kill -HUP PID                 # 행업
kill -INT PID                 # 인터럽트

# 시그널 트랩
trap 'echo "중단됨"' INT
trap 'cleanup' EXIT
trap '' TERM                  # 시그널 무시
```

## 오류 처리

```bash
# 오류 시 종료
set -e                         # 모든 오류에서 종료
set -u                         # 정의되지 않은 변수에서 종료
set -o pipefail               # 파이프 실패에서 종료
set -euo pipefail             # 모두 결합

# 오류 처리
command || echo "명령 실패"
command && echo "명령 성공"

if ! command; then
    echo "오류 발생"
    exit 1
fi

# try-catch 동등물
{
    command1
    command2
} || {
    echo "블록에서 오류"
    exit 1
}

# 종료 시 정리
cleanup() {
    echo "정리 중..."
    rm -f /tmp/tempfile
}
trap cleanup EXIT

# 디버그 모드
set -x                         # 명령 출력
set +x                         # 디버그 비활성화
bash -x script.sh             # 디버그로 실행
```

## 고급 기능

```bash
# 명령 대체
result=$(command)
result=`command`               # 이전 스타일

# 프로세스 대체
diff <(command1) <(command2)
while read line; do
    echo "$line"
done < <(command)

# 변수가 있는 Heredoc
cat << EOF
사용자: $USER
홈: $HOME
EOF

# 변수 확장 없는 Heredoc
cat << 'EOF'
$USER는 확장되지 않습니다
EOF

# 병렬 실행
command1 & command2 & wait

# 타임아웃 명령
timeout 5 command

# 잠금 파일
lockfile="/var/lock/script.lock"
if ! mkdir "$lockfile" 2>/dev/null; then
    echo "이미 실행 중"
    exit 1
fi
trap 'rmdir "$lockfile"' EXIT

# 다른 스크립트 소스
source script.sh
. script.sh                    # POSIX 호환

# 옵션용 getopts
while getopts "hf:v" opt; do
    case $opt in
        h) show_help; exit 0 ;;
        f) file="$OPTARG" ;;
        v) verbose=true ;;
        *) echo "유효하지 않은 옵션"; exit 1 ;;
    esac
done
shift $((OPTIND-1))
```

## Zsh 전용 기능

```bash
# 확장된 글로빙
setopt extended_glob
*.txt~temp.txt                # temp.txt를 제외한 모든 .txt
**/*.txt                      # 재귀 검색
*(.om[1])                     # 가장 새로운 파일
*(.)                          # 일반 파일만
*(/)                          # 디렉토리만

# 더 나은 배열
array=(one two three)
print ${array[1]}             # 첫 번째 요소 (1-인덱스)
print ${array[-1]}            # 마지막 요소
print ${(j:,:)array}          # 쉼표로 결합

# 연관 배열
typeset -A hash
hash[key]=value
print ${hash[key]}

# 프롬프트 사용자 정의
PS1='%n@%m:%~$ '             # 사용자@호스트:경로$

# 일괄 이름 변경을 위한 zmv
autoload -U zmv
zmv '(*).txt' '$1.bak'       # 모든 .txt를 .bak으로 이름 변경
```

## 모범 사례

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# 의미 있는 변수 이름 사용
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"

# 함수 문서화
# 설명: 파일을 처리합니다
# 인수:
#   $1 - 입력 파일 경로
# 반환:
#   0 - 성공
#   1 - 파일을 찾을 수 없음
process_file() {
    local input_file="${1:?오류: 파일 인수 누락}"
    
    if [[ ! -f "$input_file" ]]; then
        echo "오류: 파일을 찾을 수 없습니다: $input_file" >&2
        return 1
    fi
    
    # 파일 처리...
    return 0
}

# 메인 함수
main() {
    # 스크립트 로직을 여기에
    process_file "$@"
}

# 스크립트가 실행되는 경우에만 main 실행 (소스되지 않음)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

이 치트시트는 Bash, Zsh, POSIX 셸의 필수 셸 스크립팅 기능을 다룹니다. 스크립트를 철저히 테스트하고 유지 관리 가능하고 이식 가능한 코드의 모범 사례를 따르는 것을 잊지 마세요.