---
title: "シェルスクリプト チートシート"
date: "2018-07-10"
updatedDate: "2025-01-20"
excerpt: "Bash、Zsh、POSIXシェルによるシェルスクリプティングの包括的なガイド。変数、制御フロー、関数、ファイル操作、自動化のベストプラクティスをカバーしています。"
tags: ["Shell", "Bash", "Zsh", "スクリプティング", "Linux", "自動化", "チートシート"]
author: "串上俊"
---

# シェルスクリプト チートシート

Bash、Zsh、POSIXシェルによるシェルスクリプティングの包括的なガイド。変数、制御フロー、関数、ファイル操作、自動化のベストプラクティスをカバーしています。

## シバンとスクリプトの基本

```bash
#!/bin/bash              # Bashスクリプト
#!/bin/sh               # POSIXシェルスクリプト
#!/usr/bin/env bash     # ポータブルなbash
#!/bin/zsh              # Zshスクリプト

# スクリプトを実行可能にする
chmod +x script.sh

# スクリプトの実行
./script.sh
bash script.sh
sh script.sh
```

## 変数とデータ型

```bash
# 変数の代入（=の周りにスペースなし）
name="John"
age=25
readonly CONSTANT="不変"

# 変数の展開
echo $name
echo ${name}
echo "${name}_suffix"

# デフォルト値
echo ${var:-default}     # varが未設定ならdefaultを使用
echo ${var:=default}     # 未設定ならdefaultを設定して使用
echo ${var:+alternate}   # varが設定されていればalternateを使用
echo ${var:?error msg}   # 未設定ならエラーを表示

# 文字列操作
string="Hello World"
echo ${#string}          # 長さ: 11
echo ${string:6}         # 部分文字列: World
echo ${string:0:5}       # 部分文字列: Hello
echo ${string^^}         # 大文字: HELLO WORLD
echo ${string,,}         # 小文字: hello world
echo ${string/World/Universe}  # 置換: Hello Universe

# 配列（Bash/Zsh）
arr=(apple banana cherry)
echo ${arr[0]}           # 最初の要素
echo ${arr[@]}           # すべての要素
echo ${#arr[@]}          # 配列の長さ
arr+=(date)              # 要素を追加
unset arr[1]             # 要素を削除

# 連想配列（Bash 4+）
declare -A dict
dict[name]="John"
dict[age]=25
echo ${dict[name]}
echo ${!dict[@]}         # すべてのキー
echo ${dict[@]}          # すべての値
```

## 入力と出力

```bash
# ユーザー入力の読み取り
read -p "名前を入力: " name
read -s -p "パスワード: " pass  # サイレント入力
read -t 5 -p "タイムアウト: " var  # 5秒のタイムアウト
read -n 1 -p "任意のキーを押してください"  # 単一文字

# コマンドライン引数
echo $0                  # スクリプト名
echo $1 $2 $3           # 位置パラメータ
echo $#                  # 引数の数
echo $@                  # すべての引数を個別に
echo "$*"                # すべての引数を単一文字列として
echo $?                  # 最後のコマンドの終了ステータス
echo $$                  # 現在のプロセスID
echo $!                  # 最後のバックグラウンドプロセスのPID

# 引数のシフト
shift                    # パラメータを左にシフト
shift 2                  # 2つ分シフト

# 出力リダイレクト
echo "text" > file.txt   # ファイルを上書き
echo "text" >> file.txt  # ファイルに追加
echo "text" 2> error.log # stderrをリダイレクト
echo "text" &> all.log   # stdoutとstderrをリダイレクト
echo "text" 2>&1         # stderrをstdoutにリダイレクト
echo "text" | tee file   # 画面とファイルに出力

# ヒアドキュメント
cat << EOF
複数行の
テキスト内容
EOF

# ヒア文字列
cat <<< "単一行の入力"
```

## 制御フロー

```bash
# if文
if [ condition ]; then
    echo "真"
elif [ other_condition ]; then
    echo "それ以外の場合"
else
    echo "偽"
fi

# テスト条件
if [ -z "$var" ]; then           # 空文字列
if [ -n "$var" ]; then           # 空でない文字列
if [ "$a" = "$b" ]; then         # 文字列の等価
if [ "$a" != "$b" ]; then        # 文字列の不等価
if [ $a -eq $b ]; then           # 数値の等価
if [ $a -ne $b ]; then           # 数値の不等価
if [ $a -lt $b ]; then           # より小さい
if [ $a -le $b ]; then           # 以下
if [ $a -gt $b ]; then           # より大きい
if [ $a -ge $b ]; then           # 以上

# ファイルテスト
if [ -e file ]; then             # ファイルが存在
if [ -f file ]; then             # 通常ファイル
if [ -d dir ]; then              # ディレクトリ
if [ -L link ]; then             # シンボリックリンク
if [ -r file ]; then             # 読み取り可能
if [ -w file ]; then             # 書き込み可能
if [ -x file ]; then             # 実行可能
if [ -s file ]; then             # ファイルが空でない
if [ file1 -nt file2 ]; then     # file1がfile2より新しい
if [ file1 -ot file2 ]; then     # file1がfile2より古い

# 論理演算子
if [ condition1 ] && [ condition2 ]; then
if [ condition1 ] || [ condition2 ]; then
if ! [ condition ]; then

# case文
case $var in
    pattern1)
        echo "パターン1"
        ;;
    pattern2|pattern3)
        echo "パターン2または3"
        ;;
    *)
        echo "デフォルト"
        ;;
esac
```

## ループ

```bash
# forループ
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

# whileループ
counter=0
while [ $counter -lt 5 ]; do
    echo $counter
    ((counter++))
done

# untilループ
counter=0
until [ $counter -ge 5 ]; do
    echo $counter
    ((counter++))
done

# ファイルを行ごとに読む
while IFS= read -r line; do
    echo "$line"
done < file.txt

# breakとcontinue
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        continue  # 反復をスキップ
    fi
    if [ $i -eq 8 ]; then
        break     # ループを終了
    fi
    echo $i
done
```

## 関数

```bash
# 基本的な関数
function greet() {
    echo "こんにちは、$1！"
}

# 代替構文
greet2() {
    echo "やあ、$1！"
    return 0  # 戻りステータス（0-255）
}

# 関数の呼び出し
greet "世界"
greet2 "ユーザー"

# ローカル変数を持つ関数
calculate() {
    local num1=$1
    local num2=$2
    local result=$((num1 + num2))
    echo $result
}

result=$(calculate 5 3)
echo "結果: $result"

# 複数の戻り値を持つ関数
get_info() {
    echo "name:John"
    echo "age:25"
    return 0
}

# 関数の出力をキャプチャ
info=$(get_info)

# グローバル対ローカル変数
global_var="グローバル"
test_scope() {
    local local_var="ローカル"
    global_var="変更済み"
}
```

## 文字列操作

```bash
# 文字列比較
if [[ "$str1" == "$str2" ]]; then
if [[ "$str1" != "$str2" ]]; then
if [[ "$str1" < "$str2" ]]; then   # アルファベット順で前
if [[ "$str1" > "$str2" ]]; then   # アルファベット順で後
if [[ -z "$str" ]]; then           # 空文字列
if [[ -n "$str" ]]; then           # 空でない文字列

# パターンマッチング
if [[ "$string" == *"pattern"* ]]; then
if [[ "$string" =~ ^[0-9]+$ ]]; then  # 正規表現マッチ

# 文字列操作
str="Hello World"
echo ${str#Hello}        # プレフィックスを削除: " World"
echo ${str%World}        # サフィックスを削除: "Hello "
echo ${str//o/O}         # すべて置換: "HellO WOrld"
echo ${str/World/Universe}  # 最初を置換
```

## 算術演算

```bash
# 算術展開
result=$((5 + 3))
result=$((a * b))
result=$((10 / 3))      # 整数除算
result=$((10 % 3))      # 剰余

# letコマンド
let "result = 5 + 3"
let "counter++"
let "value *= 2"

# 算術評価
((counter++))
((value = 5 * 3))
if ((a > b)); then

# 浮動小数点（bcを使用）
result=$(echo "scale=2; 10/3" | bc)
result=$(bc <<< "scale=2; 10/3")

# 乱数
random=$RANDOM           # 0-32767
random=$((RANDOM % 100))  # 0-99
```

## ファイル操作

```bash
# ファイル/ディレクトリのチェック
if [ -e "$file" ]; then         # 存在
if [ -f "$file" ]; then         # 通常ファイル
if [ -d "$dir" ]; then          # ディレクトリ
if [ -L "$link" ]; then         # シンボリックリンク
if [ -s "$file" ]; then         # 空でない
if [ -r "$file" ]; then         # 読み取り可能
if [ -w "$file" ]; then         # 書き込み可能
if [ -x "$file" ]; then         # 実行可能

# 作成/削除
touch file.txt                   # 空ファイルを作成
mkdir -p dir/subdir             # ディレクトリを作成
rm -f file.txt                  # ファイルを削除
rm -rf directory                # ディレクトリを削除
cp source dest                  # ファイルをコピー
cp -r source_dir dest_dir       # ディレクトリをコピー
mv old new                      # 移動/名前変更
ln -s target link               # シンボリックリンク

# ファイルの検索
find . -name "*.txt"            # 名前で検索
find . -type f -size +1M        # 1MBより大きいファイル
find . -mtime -7                # 過去7日間に変更
find . -exec command {} \;      # コマンドを実行

# ファイル内容
cat file.txt                    # ファイルを表示
head -n 10 file.txt            # 最初の10行
tail -n 10 file.txt            # 最後の10行
tail -f log.txt                # ログファイルを監視
grep "pattern" file.txt        # ファイル内を検索
sed 's/old/new/g' file.txt     # テキストを置換
awk '{print $1}' file.txt      # 列を処理
```

## プロセス管理

```bash
# バックグラウンドプロセス
command &                       # バックグラウンドで実行
jobs                           # バックグラウンドジョブ一覧
fg %1                          # ジョブをフォアグラウンドに
bg %1                          # バックグラウンドで再開
kill %1                        # ジョブを終了
wait                           # すべてのバックグラウンドジョブを待機
wait $PID                      # 特定のプロセスを待機

# プロセス情報
ps aux                         # すべてのプロセス
ps -ef                         # フルフォーマット
pgrep process_name            # プロセスIDを検索
pkill process_name            # 名前で終了
killall process_name          # 名前ですべて終了

# シグナル
kill -9 PID                    # 強制終了
kill -TERM PID                # 終了
kill -HUP PID                 # ハングアップ
kill -INT PID                 # 割り込み

# シグナルをトラップ
trap 'echo "中断されました"' INT
trap 'cleanup' EXIT
trap '' TERM                  # シグナルを無視
```

## エラー処理

```bash
# エラー時に終了
set -e                         # エラー時に終了
set -u                         # 未定義変数で終了
set -o pipefail               # パイプ失敗で終了
set -euo pipefail             # すべて組み合わせ

# エラー処理
command || echo "コマンド失敗"
command && echo "コマンド成功"

if ! command; then
    echo "エラーが発生しました"
    exit 1
fi

# try-catch相当
{
    command1
    command2
} || {
    echo "ブロック内でエラー"
    exit 1
}

# 終了時のクリーンアップ
cleanup() {
    echo "クリーンアップ中..."
    rm -f /tmp/tempfile
}
trap cleanup EXIT

# デバッグモード
set -x                         # コマンドを表示
set +x                         # デバッグを無効化
bash -x script.sh             # デバッグで実行
```

## 高度な機能

```bash
# コマンド置換
result=$(command)
result=`command`               # 古いスタイル

# プロセス置換
diff <(command1) <(command2)
while read line; do
    echo "$line"
done < <(command)

# 変数付きヒアドキュメント
cat << EOF
ユーザー: $USER
ホーム: $HOME
EOF

# 変数展開なしのヒアドキュメント
cat << 'EOF'
$USERは展開されません
EOF

# 並列実行
command1 & command2 & wait

# タイムアウトコマンド
timeout 5 command

# ロックファイル
lockfile="/var/lock/script.lock"
if ! mkdir "$lockfile" 2>/dev/null; then
    echo "すでに実行中"
    exit 1
fi
trap 'rmdir "$lockfile"' EXIT

# 他のスクリプトをソース
source script.sh
. script.sh                    # POSIX互換

# オプション用のgetopts
while getopts "hf:v" opt; do
    case $opt in
        h) show_help; exit 0 ;;
        f) file="$OPTARG" ;;
        v) verbose=true ;;
        *) echo "無効なオプション"; exit 1 ;;
    esac
done
shift $((OPTIND-1))
```

## Zsh固有の機能

```zsh
# 拡張グロビング
setopt extended_glob
*.txt~temp.txt                # temp.txt以外のすべての.txt
**/*.txt                      # 再帰的検索
*(.om[1])                     # 最新のファイル
*(.)                          # 通常ファイルのみ
*(/)                          # ディレクトリのみ

# より良い配列
array=(one two three)
print ${array[1]}             # 最初の要素（1インデックス）
print ${array[-1]}            # 最後の要素
print ${(j:,:)array}          # カンマで結合

# 連想配列
typeset -A hash
hash[key]=value
print ${hash[key]}

# プロンプトのカスタマイズ
PS1='%n@%m:%~$ '             # ユーザー@ホスト:パス$

# バッチ名前変更用のzmv
autoload -U zmv
zmv '(*).txt' '$1.bak'       # すべての.txtを.bakに名前変更
```

## ベストプラクティス

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# 意味のある変数名を使用
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"

# 関数のドキュメント
# 説明: ファイルを処理する
# 引数:
#   $1 - 入力ファイルパス
# 戻り値:
#   0 - 成功
#   1 - ファイルが見つからない
process_file() {
    local input_file="${1:?エラー: ファイル引数がありません}"
    
    if [[ ! -f "$input_file" ]]; then
        echo "エラー: ファイルが見つかりません: $input_file" >&2
        return 1
    fi
    
    # ファイルを処理...
    return 0
}

# メイン関数
main() {
    # スクリプトロジックをここに
    process_file "$@"
}

# スクリプトが実行された場合のみmainを実行（ソースされていない）
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

このチートシートは、Bash、Zsh、POSIXシェルの基本的なシェルスクリプティング機能をカバーしています。スクリプトを徹底的にテストし、保守可能でポータブルなコードのベストプラクティスに従うことを忘れないでください。