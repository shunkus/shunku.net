---
title: "Guide Python"
date: "2018-03-22"
updatedDate: "2025-01-15"
excerpt: "Un guide complet des fondamentaux de Python, structures de données, fonctions, classes et patterns modernes pour construire des applications robustes."
tags: ["Python", "Programmation", "Science des Données", "Développement Web", "Scripts", "Guide"]
author: "Shun Kushigami"
---

# Guide Python

Un guide complet des fondamentaux de Python, structures de données, fonctions, classes et patterns modernes pour construire des applications robustes.

## Syntaxe de Base et Variables

```python
# Variables et types de base
name = "Hello World"
age = 25
height = 5.9
is_student = True

# Affectation multiple
x, y, z = 1, 2, 3
a = b = c = 0

# Formatage de chaînes
greeting = f"Bonjour, {name} ! Vous avez {age} ans."
formatted = "Nom : {}, Âge : {}".format(name, age)
old_style = "Nom : %s, Âge : %d" % (name, age)

# Constantes (par convention)
PI = 3.14159
MAX_SIZE = 100

# Commentaires
# Commentaire sur une ligne
"""
Commentaire sur plusieurs lignes
ou docstring
"""

# Opérateurs de base
addition = 5 + 3        # 8
subtraction = 5 - 3     # 2
multiplication = 5 * 3  # 15
division = 5 / 3        # 1.6666...
floor_division = 5 // 3 # 1
modulus = 5 % 3         # 2
exponent = 5 ** 3       # 125

# Opérateurs de comparaison
print(5 == 5)   # True
print(5 != 3)   # True
print(5 > 3)    # True
print(5 < 3)    # False
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Exemple de syntaxe de base :</strong>
<p>Python utilise l'indentation pour définir les blocs de code</p>
<p>Les variables n'ont pas besoin de déclarations de type</p>
<p>Utilisez les f-strings pour le formatage moderne de chaînes</p>
</div>

## Structures de Données

```python
# Listes - collection ordonnée et mutable
fruits = ["pomme", "banane", "cerise"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "bonjour", 3.14, True]

# Opérations sur les listes
fruits.append("orange")          # Ajouter à la fin
fruits.insert(0, "raisin")       # Insérer à l'index
fruits.remove("banane")          # Supprimer première occurrence
popped = fruits.pop()           # Supprimer et retourner le dernier élément
fruits.sort()                   # Trier sur place
length = len(fruits)            # Obtenir la longueur

# Compréhensions de listes
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# Tuples - collection ordonnée et immutable
coordinates = (10, 20)
person = ("Pierre", 25, "Ingénieur")

# Déballage de tuple
x, y = coordinates
name, age, job = person

# Sets - collection non ordonnée d'éléments uniques
unique_numbers = {1, 2, 3, 4, 5}
fruits_set = {"pomme", "banane", "cerise"}

# Opérations sur les sets
fruits_set.add("orange")
fruits_set.remove("banane")
union_set = {1, 2, 3} | {3, 4, 5}        # {1, 2, 3, 4, 5}
intersection = {1, 2, 3} & {2, 3, 4}     # {2, 3}

# Dictionnaires - paires clé-valeur
person = {
    "name": "Pierre",
    "age": 30,
    "city": "Paris"
}

# Opérations sur les dictionnaires
person["email"] = "pierre@example.com"   # Ajouter/mettre à jour
age = person.get("age", 0)               # Obtenir avec valeur par défaut
keys = person.keys()                     # Obtenir toutes les clés
values = person.values()                 # Obtenir toutes les valeurs
items = person.items()                   # Obtenir les paires clé-valeur

# Compréhension de dictionnaires
squares_dict = {x: x**2 for x in range(5)}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemple de structures de données :</strong></p>
<p>Listes : mutables, ordonnées, permettent les doublons</p>
<p>Tuples : immutables, ordonnées, permettent les doublons</p>
<p>Sets : mutables, non ordonnées, éléments uniques seulement</p>
<p>Dictionnaires : mutables, ordonnés (Python 3.7+), paires clé-valeur</p>
</div>

## Contrôle de Flux

```python
# Déclarations conditionnelles
age = 18

if age >= 18:
    print("Adulte")
elif age >= 13:
    print("Adolescent")
else:
    print("Enfant")

# Opérateur ternaire
status = "Adulte" if age >= 18 else "Mineur"

# Boucles for
for i in range(5):
    print(f"Numéro : {i}")

for fruit in ["pomme", "banane", "cerise"]:
    print(f"Fruit : {fruit}")

for i, fruit in enumerate(["pomme", "banane", "cerise"]):
    print(f"{i}: {fruit}")

# Itération de dictionnaires
person = {"name": "Pierre", "age": 30}
for key, value in person.items():
    print(f"{key}: {value}")

# Boucles while
count = 0
while count < 5:
    print(f"Compteur : {count}")
    count += 1

# Contrôle de boucles
for i in range(10):
    if i == 3:
        continue  # Passer cette itération
    if i == 7:
        break     # Sortir de la boucle
    print(i)

# Gestion des exceptions
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Impossible de diviser par zéro !")
except Exception as e:
    print(f"Une erreur s'est produite : {e}")
else:
    print("Aucune exception n'est survenue")
finally:
    print("Ceci s'exécute toujours")

# Exceptions multiples
try:
    value = int(input("Entrez un nombre : "))
    result = 10 / value
except (ValueError, ZeroDivisionError) as e:
    print(f"Erreur : {e}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemple de contrôle de flux :</strong></p>
<p>Python utilise l'indentation au lieu des accolades</p>
<p>enumerate() fournit l'index et la valeur dans les boucles</p>
<p>Gestion des exceptions avec try/except/else/finally</p>
<p>Utilisez continue pour passer, break pour sortir des boucles</p>
</div>

## Fonctions

```python
# Fonction de base
def greet(name):
    return f"Bonjour, {name} !"

# Fonction avec paramètres par défaut
def greet_with_title(name, title="M."):
    return f"Bonjour, {title} {name} !"

# Fonction avec plusieurs paramètres
def calculate_area(length, width):
    return length * width

# Fonction avec *args (arguments positionnels variables)
def sum_all(*numbers):
    return sum(numbers)

# Fonction avec **kwargs (arguments de mots-clés variables)
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

# Fonction avec paramètres mixtes
def complex_function(required, default="par défaut", *args, **kwargs):
    print(f"Requis : {required}")
    print(f"Par défaut : {default}")
    print(f"Args : {args}")
    print(f"Kwargs : {kwargs}")

# Fonctions lambda (anonymes)
square = lambda x: x ** 2
add = lambda x, y: x + y

# Fonctions d'ordre supérieur
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

# Décorateurs
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} a pris {end - start:.4f} secondes")
        return result
    return wrapper

@timing_decorator
def slow_function():
    import time
    time.sleep(1)
    return "Terminé !"

# Fonctions génératrices
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Utilisation
fib_numbers = list(fibonacci(10))
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemple de fonctions :</strong></p>
<p>*args collecte les arguments positionnels supplémentaires dans un tuple</p>
<p>**kwargs collecte les arguments de mots-clés supplémentaires dans un dictionnaire</p>
<p>Les décorateurs modifient ou étendent le comportement des fonctions</p>
<p>Les générateurs utilisent yield pour produire des valeurs paresseusement</p>
</div>

## Programmation Orientée Objet

```python
# Classe de base
class Person:
    # Variable de classe (partagée par toutes les instances)
    species = "Homo sapiens"
    
    # Constructeur
    def __init__(self, name, age):
        # Variables d'instance
        self.name = name
        self.age = age
    
    # Méthode d'instance
    def introduce(self):
        return f"Salut, je suis {self.name} et j'ai {self.age} ans."
    
    # Représentation en chaîne
    def __str__(self):
        return f"Person(name='{self.name}', age={self.age})"
    
    def __repr__(self):
        return f"Person('{self.name}', {self.age})"

# Héritage
class Student(Person):
    def __init__(self, name, age, student_id):
        super().__init__(name, age)  # Appeler le constructeur parent
        self.student_id = student_id
    
    def study(self, subject):
        return f"{self.name} étudie {subject}"
    
    # Redéfinition de méthode
    def introduce(self):
        return f"Salut, je suis {self.name}, j'ai {self.age} ans et mon ID étudiant est {self.student_id}."

# Décorateur de propriétés
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Le rayon ne peut pas être négatif")
        self._radius = value
    
    @property
    def area(self):
        return 3.14159 * self._radius ** 2

# Méthodes de classe et méthodes statiques
class MathUtils:
    @classmethod
    def create_from_string(cls, data_string):
        # Constructeur alternatif
        return cls(*data_string.split(","))
    
    @staticmethod
    def add_numbers(a, b):
        # Fonction utilitaire liée à la classe
        return a + b

# Classe de base abstraite
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def make_sound(self):
        pass
    
    def sleep(self):
        return "En train de dormir..."

class Dog(Animal):
    def make_sound(self):
        return "Ouaf !"

# Exemples d'utilisation
person = Person("Alice", 25)
student = Student("Bob", 20, "S12345")
circle = Circle(5)

print(person.introduce())
print(student.study("Python"))
print(f"Aire du cercle : {circle.area}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemple de POO :</strong></p>
<p>__init__ est la méthode constructeur</p>
<p>super() appelle les méthodes de la classe parent</p>
<p>@property crée des méthodes getter/setter</p>
<p>@classmethod et @staticmethod fournissent différents types de méthodes</p>
</div>

## E/S de Fichiers et Gestion d'Erreurs

```python
# Lecture de fichiers
# Méthode 1 : Lecture de base de fichier
file = open("example.txt", "r", encoding="utf-8")
content = file.read()
file.close()

# Méthode 2 : Utiliser l'instruction with (recommandé)
with open("example.txt", "r", encoding="utf-8") as file:
    content = file.read()
    # Le fichier est automatiquement fermé après le bloc with

# Lecture ligne par ligne
with open("example.txt", "r", encoding="utf-8") as file:
    for line in file:
        print(line.strip())  # strip() supprime les caractères de nouvelle ligne

# Écriture de fichiers
with open("output.txt", "w", encoding="utf-8") as file:
    file.write("Bonjour, Monde !")
    file.write("\nDeuxième ligne")

# Ajout à des fichiers
with open("output.txt", "a", encoding="utf-8") as file:
    file.write("\nLigne ajoutée")

# Travail avec des fichiers CSV
import csv

# Écriture CSV
data = [
    ["Nom", "Âge", "Ville"],
    ["Alice", 25, "Paris"],
    ["Bob", 30, "Lyon"]
]

with open("people.csv", "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerows(data)

# Lecture CSV
with open("people.csv", "r", encoding="utf-8") as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)

# Travail avec JSON
import json

# Écriture JSON
data = {
    "name": "Alice",
    "age": 25,
    "hobbies": ["lecture", "programmation", "randonnée"]
}

with open("data.json", "w", encoding="utf-8") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

# Lecture JSON
with open("data.json", "r", encoding="utf-8") as file:
    loaded_data = json.load(file)
    print(loaded_data["name"])

# Exceptions personnalisées
class CustomError(Exception):
    def __init__(self, message, error_code):
        super().__init__(message)
        self.error_code = error_code

# Lever des exceptions personnalisées
def validate_age(age):
    if age < 0:
        raise CustomError("L'âge ne peut pas être négatif", "INVALID_AGE")
    if age > 150:
        raise CustomError("L'âge semble irréaliste", "UNREALISTIC_AGE")
    return True

try:
    validate_age(-5)
except CustomError as e:
    print(f"Erreur personnalisée : {e} (Code : {e.error_code})")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemple d'E/S de fichiers :</strong></p>
<p>Utilisez toujours l'instruction 'with' pour les opérations de fichier</p>
<p>Les modules CSV et JSON gèrent les données structurées</p>
<p>Créez des exceptions personnalisées pour la gestion spécifique d'erreurs</p>
<p>Modes de fichier : 'r' (lire), 'w' (écrire), 'a' (ajouter)</p>
</div>

## Bibliothèques et Modules Communs

```python
# Opérations de date et heure
from datetime import datetime, timedelta, date

now = datetime.now()
today = date.today()
tomorrow = today + timedelta(days=1)

formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
parsed_date = datetime.strptime("2023-12-25", "%Y-%m-%d")

# Expressions régulières
import re

text = "Contactez-moi à pierre@example.com ou appelez le 01-23-45-67-89"

# Trouver les adresses email
email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
emails = re.findall(email_pattern, text)

# Remplacer les numéros de téléphone
phone_pattern = r'\d{2}-\d{2}-\d{2}-\d{2}-\d{2}'
censored = re.sub(phone_pattern, "XX-XX-XX-XX-XX", text)

# Opérations mathématiques
import math

print(math.sqrt(16))      # 4.0
print(math.ceil(4.3))     # 5
print(math.floor(4.7))    # 4
print(math.pi)            # 3.141592653589793

# Nombres aléatoires
import random

print(random.random())              # Float aléatoire entre 0 et 1
print(random.randint(1, 10))        # Entier aléatoire entre 1 et 10
print(random.choice(['a', 'b', 'c']))  # Choix aléatoire dans une liste

# Mélanger une liste
items = [1, 2, 3, 4, 5]
random.shuffle(items)

# Opérations du système d'exploitation
import os

# Obtenir le répertoire courant
current_dir = os.getcwd()

# Lister les fichiers dans le répertoire
files = os.listdir(".")

# Créer un répertoire
os.makedirs("new_folder", exist_ok=True)

# Variables d'environnement
home_dir = os.environ.get("HOME", "/default/path")

# Opérations de chemin
from pathlib import Path

path = Path("folder/subfolder/file.txt")
print(path.parent)      # folder/subfolder
print(path.name)        # file.txt
print(path.suffix)      # .txt
print(path.exists())    # True/False

# Module collections
from collections import Counter, defaultdict, namedtuple

# Counter - compter les occurrences
text = "hello world"
letter_count = Counter(text)
print(letter_count.most_common(3))  # [('l', 3), ('o', 2), ('h', 1)]

# defaultdict - dictionnaire avec valeurs par défaut
dd = defaultdict(list)
dd["key1"].append("value1")  # Pas de KeyError même si la clé n'existe pas

# namedtuple - type d'objet léger
Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
print(f"x: {p.x}, y: {p.y}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemple de bibliothèques :</strong></p>
<p>datetime pour les opérations de date/heure</p>
<p>re pour les expressions régulières</p>
<p>os et pathlib pour les opérations du système de fichiers</p>
<p>collections fournit des structures de données spécialisées</p>
</div>

Ce guide Python couvre les concepts et patterns les plus essentiels du développement Python moderne. Pratiquez ces patterns et combinez-les pour construire des applications puissantes et maintenables !