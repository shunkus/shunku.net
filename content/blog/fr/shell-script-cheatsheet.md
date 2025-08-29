---
title: "Aide-mémoire Shell Script"
date: "2018-07-10"
updatedDate: "2025-01-20"
excerpt: "Un guide complet du scripting shell avec Bash, Zsh et shell POSIX, couvrant les variables, le flux de contrôle, les fonctions, les opérations de fichiers et les meilleures pratiques pour l'automatisation."
tags: ["Shell", "Bash", "Zsh", "Scripting", "Linux", "Automatisation", "Aide-mémoire"]
author: "Shun Kushigami"
---

# Aide-mémoire Shell Script

Un guide complet du scripting shell avec Bash, Zsh et shell POSIX, couvrant les variables, le flux de contrôle, les fonctions, les opérations de fichiers et les meilleures pratiques pour l'automatisation.

## Shebang et Bases du Script

```bash
#!/bin/bash              # Script Bash
#!/bin/sh               # Script shell POSIX
#!/usr/bin/env bash     # Bash portable
#!/bin/zsh              # Script Zsh

# Rendre le script exécutable
chmod +x script.sh

# Exécuter le script
./script.sh
bash script.sh
sh script.sh
```

## Variables et Types de Données

```bash
# Affectation de variable (pas d'espaces autour de =)
name="John"
age=25
readonly CONSTANT="immutable"

# Expansion de variable
echo $name
echo ${name}
echo "${name}_suffix"

# Valeurs par défaut
echo ${var:-default}     # Utiliser default si var n'est pas définie
echo ${var:=default}     # Définir et utiliser default si non définie
echo ${var:+alternate}   # Utiliser alternate si var est définie
echo ${var:?error msg}   # Afficher erreur si non définie

# Manipulation de chaînes
string="Hello World"
echo ${#string}          # Longueur: 11
echo ${string:6}         # Sous-chaîne: World
echo ${string:0:5}       # Sous-chaîne: Hello
echo ${string^^}         # Majuscules: HELLO WORLD
echo ${string,,}         # Minuscules: hello world
echo ${string/World/Universe}  # Remplacer: Hello Universe

# Tableaux (Bash/Zsh)
arr=(apple banana cherry)
echo ${arr[0]}           # Premier élément
echo ${arr[@]}           # Tous les éléments
echo ${#arr[@]}          # Longueur du tableau
arr+=(date)              # Ajouter élément
unset arr[1]             # Supprimer élément

# Tableaux associatifs (Bash 4+)
declare -A dict
dict[name]="John"
dict[age]=25
echo ${dict[name]}
echo ${!dict[@]}         # Toutes les clés
echo ${dict[@]}          # Toutes les valeurs
```

## Entrée et Sortie

```bash
# Lire l'entrée utilisateur
read -p "Entrez le nom: " name
read -s -p "Mot de passe: " pass  # Entrée silencieuse
read -t 5 -p "Timeout: " var      # Timeout de 5 secondes
read -n 1 -p "Appuyez sur une touche"  # Un seul caractère

# Arguments de ligne de commande
echo $0                  # Nom du script
echo $1 $2 $3           # Paramètres positionnels
echo $#                  # Nombre d'arguments
echo $@                  # Tous les arguments séparément
echo "$*"                # Tous les arguments comme chaîne unique
echo $?                  # Status de sortie de la dernière commande
echo $$                  # ID du processus actuel
echo $!                  # PID du dernier processus en arrière-plan

# Décaler les arguments
shift                    # Décaler les paramètres vers la gauche
shift 2                  # Décaler de 2 positions

# Redirection de sortie
echo "text" > file.txt   # Écraser le fichier
echo "text" >> file.txt  # Ajouter au fichier
echo "text" 2> error.log # Rediriger stderr
echo "text" &> all.log   # Rediriger stdout et stderr
echo "text" 2>&1         # Rediriger stderr vers stdout
echo "text" | tee file   # Sortie vers écran et fichier

# Documents here
cat << EOF
Contenu de texte
multi-lignes
EOF

# Chaînes here
cat <<< "Entrée sur une ligne"
```

## Flux de Contrôle

```bash
# Instructions if
if [ condition ]; then
    echo "Vrai"
elif [ other_condition ]; then
    echo "Sinon si"
else
    echo "Faux"
fi

# Conditions de test
if [ -z "$var" ]; then           # Chaîne vide
if [ -n "$var" ]; then           # Chaîne non vide
if [ "$a" = "$b" ]; then         # Égalité de chaînes
if [ "$a" != "$b" ]; then        # Inégalité de chaînes
if [ $a -eq $b ]; then           # Égalité numérique
if [ $a -ne $b ]; then           # Inégalité numérique
if [ $a -lt $b ]; then           # Plus petit que
if [ $a -le $b ]; then           # Plus petit ou égal
if [ $a -gt $b ]; then           # Plus grand que
if [ $a -ge $b ]; then           # Plus grand ou égal

# Tests de fichiers
if [ -e file ]; then             # Le fichier existe
if [ -f file ]; then             # Fichier régulier
if [ -d dir ]; then              # Répertoire
if [ -L link ]; then             # Lien symbolique
if [ -r file ]; then             # Lisible
if [ -w file ]; then             # Modifiable
if [ -x file ]; then             # Exécutable
if [ -s file ]; then             # Fichier non vide
if [ file1 -nt file2 ]; then     # file1 plus récent que file2
if [ file1 -ot file2 ]; then     # file1 plus ancien que file2

# Opérateurs logiques
if [ condition1 ] && [ condition2 ]; then
if [ condition1 ] || [ condition2 ]; then
if ! [ condition ]; then

# Instruction case
case $var in
    pattern1)
        echo "Motif 1"
        ;;
    pattern2|pattern3)
        echo "Motif 2 ou 3"
        ;;
    *)
        echo "Par défaut"
        ;;
esac
```

## Boucles

```bash
# Boucle for
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

# Boucle while
counter=0
while [ $counter -lt 5 ]; do
    echo $counter
    ((counter++))
done

# Boucle until
counter=0
until [ $counter -ge 5 ]; do
    echo $counter
    ((counter++))
done

# Lire un fichier ligne par ligne
while IFS= read -r line; do
    echo "$line"
done < file.txt

# Break et continue
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        continue  # Ignorer l'itération
    fi
    if [ $i -eq 8 ]; then
        break     # Sortir de la boucle
    fi
    echo $i
done
```

## Fonctions

```bash
# Fonction de base
function greet() {
    echo "Bonjour, $1!"
}

# Syntaxe alternative
greet2() {
    echo "Salut, $1!"
    return 0  # Status de retour (0-255)
}

# Appeler la fonction
greet "Monde"
greet2 "Utilisateur"

# Fonction avec variables locales
calculate() {
    local num1=$1
    local num2=$2
    local result=$((num1 + num2))
    echo $result
}

result=$(calculate 5 3)
echo "Résultat: $result"

# Fonction avec plusieurs retours
get_info() {
    echo "name:John"
    echo "age:25"
    return 0
}

# Capturer la sortie de fonction
info=$(get_info)

# Variables globales vs locales
global_var="global"
test_scope() {
    local local_var="local"
    global_var="modifié"
}
```

## Opérations sur les Chaînes

```bash
# Comparaison de chaînes
if [[ "$str1" == "$str2" ]]; then
if [[ "$str1" != "$str2" ]]; then
if [[ "$str1" < "$str2" ]]; then   # Alphabétiquement avant
if [[ "$str1" > "$str2" ]]; then   # Alphabétiquement après
if [[ -z "$str" ]]; then           # Chaîne vide
if [[ -n "$str" ]]; then           # Chaîne non vide

# Correspondance de motifs
if [[ "$string" == *"pattern"* ]]; then
if [[ "$string" =~ ^[0-9]+$ ]]; then  # Correspondance regex

# Opérations sur chaînes
str="Hello World"
echo ${str#Hello}        # Supprimer préfixe: " World"
echo ${str%World}        # Supprimer suffixe: "Hello "
echo ${str//o/O}         # Remplacer tout: "HellO WOrld"
echo ${str/World/Universe}  # Remplacer le premier
```

## Opérations Arithmétiques

```bash
# Expansion arithmétique
result=$((5 + 3))
result=$((a * b))
result=$((10 / 3))      # Division entière
result=$((10 % 3))      # Modulo

# Commande let
let "result = 5 + 3"
let "counter++"
let "value *= 2"

# Évaluation arithmétique
((counter++))
((value = 5 * 3))
if ((a > b)); then

# Virgule flottante (utilisant bc)
result=$(echo "scale=2; 10/3" | bc)
result=$(bc <<< "scale=2; 10/3")

# Nombres aléatoires
random=$RANDOM           # 0-32767
random=$((RANDOM % 100))  # 0-99
```

## Opérations sur les Fichiers

```bash
# Vérifier fichier/répertoire
if [ -e "$file" ]; then         # Existe
if [ -f "$file" ]; then         # Fichier régulier
if [ -d "$dir" ]; then          # Répertoire
if [ -L "$link" ]; then         # Lien symbolique
if [ -s "$file" ]; then         # Non vide
if [ -r "$file" ]; then         # Lisible
if [ -w "$file" ]; then         # Modifiable
if [ -x "$file" ]; then         # Exécutable

# Créer/Supprimer
touch file.txt                   # Créer fichier vide
mkdir -p dir/subdir             # Créer répertoire
rm -f file.txt                  # Supprimer fichier
rm -rf directory                # Supprimer répertoire
cp source dest                  # Copier fichier
cp -r source_dir dest_dir       # Copier répertoire
mv old new                      # Déplacer/renommer
ln -s target link               # Lien symbolique

# Trouver des fichiers
find . -name "*.txt"            # Par nom
find . -type f -size +1M        # Fichiers plus grands que 1MB
find . -mtime -7                # Modifiés dans les 7 derniers jours
find . -exec command {} \;      # Exécuter commande

# Contenu de fichier
cat file.txt                    # Afficher fichier
head -n 10 file.txt            # 10 premières lignes
tail -n 10 file.txt            # 10 dernières lignes
tail -f log.txt                # Suivre fichier de log
grep "pattern" file.txt        # Chercher dans fichier
sed 's/old/new/g' file.txt     # Remplacer texte
awk '{print $1}' file.txt      # Traiter colonnes
```

## Gestion des Processus

```bash
# Processus en arrière-plan
command &                       # Exécuter en arrière-plan
jobs                           # Lister tâches en arrière-plan
fg %1                          # Amener tâche au premier plan
bg %1                          # Reprendre en arrière-plan
kill %1                        # Tuer tâche
wait                           # Attendre toutes les tâches
wait $PID                      # Attendre processus spécifique

# Informations de processus
ps aux                         # Tous les processus
ps -ef                         # Format complet
pgrep process_name            # Trouver ID de processus
pkill process_name            # Tuer par nom
killall process_name          # Tuer tous par nom

# Signaux
kill -9 PID                    # Tuer forcément
kill -TERM PID                # Terminer
kill -HUP PID                 # Raccrocher
kill -INT PID                 # Interrompre

# Piéger les signaux
trap 'echo "Interrompu"' INT
trap 'cleanup' EXIT
trap '' TERM                  # Ignorer signal
```

## Gestion des Erreurs

```bash
# Sortir sur erreur
set -e                         # Sortir sur toute erreur
set -u                         # Sortir sur variable non définie
set -o pipefail               # Sortir sur échec de pipeline
set -euo pipefail             # Combiner tout

# Gestion d'erreurs
command || echo "Commande a échoué"
command && echo "Commande réussie"

if ! command; then
    echo "Une erreur s'est produite"
    exit 1
fi

# Équivalent try-catch
{
    command1
    command2
} || {
    echo "Erreur dans le bloc"
    exit 1
}

# Nettoyage à la sortie
cleanup() {
    echo "Nettoyage..."
    rm -f /tmp/tempfile
}
trap cleanup EXIT

# Mode débogage
set -x                         # Imprimer commandes
set +x                         # Désactiver débogage
bash -x script.sh             # Exécuter avec débogage
```

## Fonctionnalités Avancées

```bash
# Substitution de commande
result=$(command)
result=`command`               # Ancien style

# Substitution de processus
diff <(command1) <(command2)
while read line; do
    echo "$line"
done < <(command)

# Heredoc avec variables
cat << EOF
Utilisateur: $USER
Home: $HOME
EOF

# Heredoc sans expansion de variables
cat << 'EOF'
$USER ne sera pas étendu
EOF

# Exécution parallèle
command1 & command2 & wait

# Commande timeout
timeout 5 command

# Fichiers de verrouillage
lockfile="/var/lock/script.lock"
if ! mkdir "$lockfile" 2>/dev/null; then
    echo "Déjà en cours d'exécution"
    exit 1
fi
trap 'rmdir "$lockfile"' EXIT

# Sourcer d'autres scripts
source script.sh
. script.sh                    # Compatible POSIX

# Getopts pour les options
while getopts "hf:v" opt; do
    case $opt in
        h) show_help; exit 0 ;;
        f) file="$OPTARG" ;;
        v) verbose=true ;;
        *) echo "Option invalide"; exit 1 ;;
    esac
done
shift $((OPTIND-1))
```

## Fonctionnalités Spécifiques à Zsh

```bash
# Globbing étendu
setopt extended_glob
*.txt~temp.txt                # Tous les .txt sauf temp.txt
**/*.txt                      # Recherche récursive
*(.om[1])                     # Fichier le plus récent
*(.)                          # Fichiers réguliers seulement
*(/)                          # Répertoires seulement

# Meilleurs tableaux
array=(one two three)
print ${array[1]}             # Premier élément (indexé à 1)
print ${array[-1]}            # Dernier élément
print ${(j:,:)array}          # Joindre avec virgule

# Tableaux associatifs
typeset -A hash
hash[key]=value
print ${hash[key]}

# Personnalisation du prompt
PS1='%n@%m:%~$ '             # Utilisateur@hôte:chemin$

# Zmv pour renommage en lot
autoload -U zmv
zmv '(*).txt' '$1.bak'       # Renommer tous les .txt en .bak
```

## Meilleures Pratiques

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Utiliser des noms de variables significatifs
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"

# Documentation de fonction
# Description: Traite un fichier
# Arguments:
#   $1 - Chemin du fichier d'entrée
# Retourne:
#   0 - Succès
#   1 - Fichier non trouvé
process_file() {
    local input_file="${1:?Erreur: Argument de fichier manquant}"
    
    if [[ ! -f "$input_file" ]]; then
        echo "Erreur: Fichier non trouvé: $input_file" >&2
        return 1
    fi
    
    # Traiter fichier...
    return 0
}

# Fonction principale
main() {
    # Logique du script ici
    process_file "$@"
}

# Exécuter main seulement si script est exécuté (pas sourcé)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

Cet aide-mémoire couvre les fonctionnalités essentielles du scripting shell pour Bash, Zsh et les shells POSIX. N'oubliez pas de tester les scripts minutieusement et de suivre les meilleures pratiques pour un code maintenable et portable.