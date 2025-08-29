---
title: "Hoja de Trucos de Shell Script"
date: "2018-07-10"
updatedDate: "2025-01-20"
excerpt: "Una guía completa de scripting en shell con Bash, Zsh y shell POSIX, cubriendo variables, flujo de control, funciones, operaciones de archivos y mejores prácticas para automatización."
tags: ["Shell", "Bash", "Zsh", "Scripting", "Linux", "Automatización", "Hoja de Trucos"]
author: "Shun Kushigami"
---

# Hoja de Trucos de Shell Script

Una guía completa de scripting en shell con Bash, Zsh y shell POSIX, cubriendo variables, flujo de control, funciones, operaciones de archivos y mejores prácticas para automatización.

## Shebang y Conceptos Básicos del Script

```bash
#!/bin/bash              # Script Bash
#!/bin/sh               # Script shell POSIX
#!/usr/bin/env bash     # Bash portable
#!/bin/zsh              # Script Zsh

# Hacer el script ejecutable
chmod +x script.sh

# Ejecutar script
./script.sh
bash script.sh
sh script.sh
```

## Variables y Tipos de Datos

```bash
# Asignación de variables (sin espacios alrededor de =)
name="John"
age=25
readonly CONSTANT="inmutable"

# Expansión de variables
echo $name
echo ${name}
echo "${name}_suffix"

# Valores predeterminados
echo ${var:-default}     # Usar default si var no está definida
echo ${var:=default}     # Establecer y usar default si no está definida
echo ${var:+alternate}   # Usar alternate si var está definida
echo ${var:?error msg}   # Mostrar error si no está definida

# Manipulación de cadenas
string="Hello World"
echo ${#string}          # Longitud: 11
echo ${string:6}         # Subcadena: World
echo ${string:0:5}       # Subcadena: Hello
echo ${string^^}         # Mayúsculas: HELLO WORLD
echo ${string,,}         # Minúsculas: hello world
echo ${string/World/Universe}  # Reemplazar: Hello Universe

# Arrays (Bash/Zsh)
arr=(apple banana cherry)
echo ${arr[0]}           # Primer elemento
echo ${arr[@]}           # Todos los elementos
echo ${#arr[@]}          # Longitud del array
arr+=(date)              # Agregar elemento
unset arr[1]             # Eliminar elemento

# Arrays asociativos (Bash 4+)
declare -A dict
dict[name]="John"
dict[age]=25
echo ${dict[name]}
echo ${!dict[@]}         # Todas las claves
echo ${dict[@]}          # Todos los valores
```

## Entrada y Salida

```bash
# Leer entrada del usuario
read -p "Ingrese nombre: " name
read -s -p "Contraseña: " pass  # Entrada silenciosa
read -t 5 -p "Timeout: " var    # Timeout de 5 segundos
read -n 1 -p "Presione cualquier tecla"  # Un solo carácter

# Argumentos de línea de comandos
echo $0                  # Nombre del script
echo $1 $2 $3           # Parámetros posicionales
echo $#                  # Número de argumentos
echo $@                  # Todos los argumentos por separado
echo "$*"                # Todos los argumentos como cadena única
echo $?                  # Estado de salida del último comando
echo $$                  # ID del proceso actual
echo $!                  # PID del último proceso en segundo plano

# Desplazar argumentos
shift                    # Desplazar parámetros a la izquierda
shift 2                  # Desplazar por 2 posiciones

# Redirección de salida
echo "text" > file.txt   # Sobrescribir archivo
echo "text" >> file.txt  # Agregar al archivo
echo "text" 2> error.log # Redirigir stderr
echo "text" &> all.log   # Redirigir stdout y stderr
echo "text" 2>&1         # Redirigir stderr a stdout
echo "text" | tee file   # Salida a pantalla y archivo

# Here documents
cat << EOF
Contenido de texto
de múltiples líneas
EOF

# Here strings
cat <<< "Entrada de una sola línea"
```

## Flujo de Control

```bash
# Declaraciones if
if [ condition ]; then
    echo "Verdadero"
elif [ other_condition ]; then
    echo "Si no"
else
    echo "Falso"
fi

# Condiciones de prueba
if [ -z "$var" ]; then           # Cadena vacía
if [ -n "$var" ]; then           # Cadena no vacía
if [ "$a" = "$b" ]; then         # Igualdad de cadenas
if [ "$a" != "$b" ]; then        # Desigualdad de cadenas
if [ $a -eq $b ]; then           # Igualdad numérica
if [ $a -ne $b ]; then           # Desigualdad numérica
if [ $a -lt $b ]; then           # Menor que
if [ $a -le $b ]; then           # Menor o igual que
if [ $a -gt $b ]; then           # Mayor que
if [ $a -ge $b ]; then           # Mayor o igual que

# Pruebas de archivos
if [ -e file ]; then             # El archivo existe
if [ -f file ]; then             # Archivo regular
if [ -d dir ]; then              # Directorio
if [ -L link ]; then             # Enlace simbólico
if [ -r file ]; then             # Legible
if [ -w file ]; then             # Escribible
if [ -x file ]; then             # Ejecutable
if [ -s file ]; then             # Archivo no vacío
if [ file1 -nt file2 ]; then     # file1 más nuevo que file2
if [ file1 -ot file2 ]; then     # file1 más antiguo que file2

# Operadores lógicos
if [ condition1 ] && [ condition2 ]; then
if [ condition1 ] || [ condition2 ]; then
if ! [ condition ]; then

# Declaración case
case $var in
    pattern1)
        echo "Patrón 1"
        ;;
    pattern2|pattern3)
        echo "Patrón 2 o 3"
        ;;
    *)
        echo "Por defecto"
        ;;
esac
```

## Bucles

```bash
# Bucle for
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

# Bucle while
counter=0
while [ $counter -lt 5 ]; do
    echo $counter
    ((counter++))
done

# Bucle until
counter=0
until [ $counter -ge 5 ]; do
    echo $counter
    ((counter++))
done

# Leer archivo línea por línea
while IFS= read -r line; do
    echo "$line"
done < file.txt

# Break y continue
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        continue  # Saltar iteración
    fi
    if [ $i -eq 8 ]; then
        break     # Salir del bucle
    fi
    echo $i
done
```

## Funciones

```bash
# Función básica
function greet() {
    echo "Hola, $1!"
}

# Sintaxis alternativa
greet2() {
    echo "Hola, $1!"
    return 0  # Estado de retorno (0-255)
}

# Llamar función
greet "Mundo"
greet2 "Usuario"

# Función con variables locales
calculate() {
    local num1=$1
    local num2=$2
    local result=$((num1 + num2))
    echo $result
}

result=$(calculate 5 3)
echo "Resultado: $result"

# Función con múltiples retornos
get_info() {
    echo "name:John"
    echo "age:25"
    return 0
}

# Capturar salida de función
info=$(get_info)

# Variables globales vs locales
global_var="global"
test_scope() {
    local local_var="local"
    global_var="modificado"
}
```

## Operaciones de Cadenas

```bash
# Comparación de cadenas
if [[ "$str1" == "$str2" ]]; then
if [[ "$str1" != "$str2" ]]; then
if [[ "$str1" < "$str2" ]]; then   # Alfabéticamente antes
if [[ "$str1" > "$str2" ]]; then   # Alfabéticamente después
if [[ -z "$str" ]]; then           # Cadena vacía
if [[ -n "$str" ]]; then           # Cadena no vacía

# Coincidencia de patrones
if [[ "$string" == *"pattern"* ]]; then
if [[ "$string" =~ ^[0-9]+$ ]]; then  # Coincidencia regex

# Operaciones de cadenas
str="Hello World"
echo ${str#Hello}        # Eliminar prefijo: " World"
echo ${str%World}        # Eliminar sufijo: "Hello "
echo ${str//o/O}         # Reemplazar todo: "HellO WOrld"
echo ${str/World/Universe}  # Reemplazar primero
```

## Operaciones Aritméticas

```bash
# Expansión aritmética
result=$((5 + 3))
result=$((a * b))
result=$((10 / 3))      # División entera
result=$((10 % 3))      # Módulo

# Comando let
let "result = 5 + 3"
let "counter++"
let "value *= 2"

# Evaluación aritmética
((counter++))
((value = 5 * 3))
if ((a > b)); then

# Punto flotante (usando bc)
result=$(echo "scale=2; 10/3" | bc)
result=$(bc <<< "scale=2; 10/3")

# Números aleatorios
random=$RANDOM           # 0-32767
random=$((RANDOM % 100))  # 0-99
```

## Operaciones de Archivos

```bash
# Verificar archivo/directorio
if [ -e "$file" ]; then         # Existe
if [ -f "$file" ]; then         # Archivo regular
if [ -d "$dir" ]; then          # Directorio
if [ -L "$link" ]; then         # Enlace simbólico
if [ -s "$file" ]; then         # No vacío
if [ -r "$file" ]; then         # Legible
if [ -w "$file" ]; then         # Escribible
if [ -x "$file" ]; then         # Ejecutable

# Crear/Eliminar
touch file.txt                   # Crear archivo vacío
mkdir -p dir/subdir             # Crear directorio
rm -f file.txt                  # Eliminar archivo
rm -rf directory                # Eliminar directorio
cp source dest                  # Copiar archivo
cp -r source_dir dest_dir       # Copiar directorio
mv old new                      # Mover/renombrar
ln -s target link               # Enlace simbólico

# Buscar archivos
find . -name "*.txt"            # Por nombre
find . -type f -size +1M        # Archivos mayores a 1MB
find . -mtime -7                # Modificados en últimos 7 días
find . -exec command {} \;      # Ejecutar comando

# Contenido de archivo
cat file.txt                    # Mostrar archivo
head -n 10 file.txt            # Primeras 10 líneas
tail -n 10 file.txt            # Últimas 10 líneas
tail -f log.txt                # Seguir archivo de log
grep "pattern" file.txt        # Buscar en archivo
sed 's/old/new/g' file.txt     # Reemplazar texto
awk '{print $1}' file.txt      # Procesar columnas
```

## Gestión de Procesos

```bash
# Procesos en segundo plano
command &                       # Ejecutar en segundo plano
jobs                           # Listar trabajos en segundo plano
fg %1                          # Traer trabajo al primer plano
bg %1                          # Reanudar en segundo plano
kill %1                        # Matar trabajo
wait                           # Esperar todos los trabajos en segundo plano
wait $PID                      # Esperar proceso específico

# Información de procesos
ps aux                         # Todos los procesos
ps -ef                         # Formato completo
pgrep process_name            # Encontrar ID de proceso
pkill process_name            # Matar por nombre
killall process_name          # Matar todos por nombre

# Señales
kill -9 PID                    # Matar forzosamente
kill -TERM PID                # Terminar
kill -HUP PID                 # Colgar
kill -INT PID                 # Interrumpir

# Capturar señales
trap 'echo "Interrumpido"' INT
trap 'cleanup' EXIT
trap '' TERM                  # Ignorar señal
```

## Manejo de Errores

```bash
# Salir en error
set -e                         # Salir en cualquier error
set -u                         # Salir en variable indefinida
set -o pipefail               # Salir en falla de tubería
set -euo pipefail             # Combinar todos

# Manejo de errores
command || echo "Comando falló"
command && echo "Comando exitoso"

if ! command; then
    echo "Ocurrió un error"
    exit 1
fi

# Equivalente try-catch
{
    command1
    command2
} || {
    echo "Error en bloque"
    exit 1
}

# Limpieza al salir
cleanup() {
    echo "Limpiando..."
    rm -f /tmp/tempfile
}
trap cleanup EXIT

# Modo depuración
set -x                         # Imprimir comandos
set +x                         # Desactivar depuración
bash -x script.sh             # Ejecutar con depuración
```

## Características Avanzadas

```bash
# Sustitución de comandos
result=$(command)
result=`command`               # Estilo antiguo

# Sustitución de procesos
diff <(command1) <(command2)
while read line; do
    echo "$line"
done < <(command)

# Heredoc con variables
cat << EOF
Usuario: $USER
Home: $HOME
EOF

# Heredoc sin expansión de variables
cat << 'EOF'
$USER no será expandido
EOF

# Ejecución paralela
command1 & command2 & wait

# Comando timeout
timeout 5 command

# Archivos de bloqueo
lockfile="/var/lock/script.lock"
if ! mkdir "$lockfile" 2>/dev/null; then
    echo "Ya está ejecutándose"
    exit 1
fi
trap 'rmdir "$lockfile"' EXIT

# Origen de otros scripts
source script.sh
. script.sh                    # Compatible con POSIX

# Getopts para opciones
while getopts "hf:v" opt; do
    case $opt in
        h) show_help; exit 0 ;;
        f) file="$OPTARG" ;;
        v) verbose=true ;;
        *) echo "Opción inválida"; exit 1 ;;
    esac
done
shift $((OPTIND-1))
```

## Características Específicas de Zsh

```bash
# Globbing extendido
setopt extended_glob
*.txt~temp.txt                # Todos los .txt excepto temp.txt
**/*.txt                      # Búsqueda recursiva
*(.om[1])                     # Archivo más nuevo
*(.)                          # Solo archivos regulares
*(/)                          # Solo directorios

# Mejores arrays
array=(one two three)
print ${array[1]}             # Primer elemento (indexado en 1)
print ${array[-1]}            # Último elemento
print ${(j:,:)array}          # Unir con coma

# Arrays asociativos
typeset -A hash
hash[key]=value
print ${hash[key]}

# Personalización del prompt
PS1='%n@%m:%~$ '             # Usuario@host:ruta$

# Zmv para renombrado por lotes
autoload -U zmv
zmv '(*).txt' '$1.bak'       # Renombrar todos los .txt a .bak
```

## Mejores Prácticas

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Usar nombres de variables significativos
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"

# Documentación de funciones
# Descripción: Procesa un archivo
# Argumentos:
#   $1 - Ruta del archivo de entrada
# Retorna:
#   0 - Éxito
#   1 - Archivo no encontrado
process_file() {
    local input_file="${1:?Error: Falta argumento de archivo}"
    
    if [[ ! -f "$input_file" ]]; then
        echo "Error: Archivo no encontrado: $input_file" >&2
        return 1
    fi
    
    # Procesar archivo...
    return 0
}

# Función principal
main() {
    # Lógica del script aquí
    process_file "$@"
}

# Solo ejecutar main si el script es ejecutado (no sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

Esta hoja de trucos cubre las características esenciales de scripting en shell para Bash, Zsh y shells POSIX. Recuerde probar los scripts exhaustivamente y seguir las mejores prácticas para código mantenible y portable.