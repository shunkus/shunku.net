---
title: "Guía de Python"
date: "2018-03-22"
updatedDate: "2025-01-15"
excerpt: "Una guía completa de los fundamentos de Python, estructuras de datos, funciones, clases y patrones modernos para construir aplicaciones robustas."
tags: ["Python", "Programación", "Ciencia de Datos", "Desarrollo Web", "Scripts", "Guía"]
author: "Shun Kushigami"
---

# Guía de Python

Una guía completa de los fundamentos de Python, estructuras de datos, funciones, clases y patrones modernos para construir aplicaciones robustas.

## Sintaxis Básica y Variables

```python
# Variables y tipos básicos
name = "Hello World"
age = 25
height = 5.9
is_student = True

# Asignación múltiple
x, y, z = 1, 2, 3
a = b = c = 0

# Formateo de cadenas
greeting = f"¡Hola, {name}! Tienes {age} años."
formatted = "Nombre: {}, Edad: {}".format(name, age)
old_style = "Nombre: %s, Edad: %d" % (name, age)

# Constantes (por convención)
PI = 3.14159
MAX_SIZE = 100

# Comentarios
# Comentario de una línea
"""
Comentario de múltiples líneas
o docstring
"""

# Operadores básicos
addition = 5 + 3        # 8
subtraction = 5 - 3     # 2
multiplication = 5 * 3  # 15
division = 5 / 3        # 1.6666...
floor_division = 5 // 3 # 1
modulus = 5 % 3         # 2
exponent = 5 ** 3       # 125

# Operadores de comparación
print(5 == 5)   # True
print(5 != 3)   # True
print(5 > 3)    # True
print(5 < 3)    # False
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Ejemplo de sintaxis básica:</strong>
<p>Python usa indentación para definir bloques de código</p>
<p>Las variables no necesitan declaraciones de tipo</p>
<p>Usa f-strings para formateo moderno de cadenas</p>
</div>

## Estructuras de Datos

```python
# Listas - colección ordenada y mutable
fruits = ["manzana", "plátano", "cereza"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hola", 3.14, True]

# Operaciones con listas
fruits.append("naranja")          # Agregar al final
fruits.insert(0, "uva")           # Insertar en índice
fruits.remove("plátano")          # Eliminar primera ocurrencia
popped = fruits.pop()            # Eliminar y devolver último elemento
fruits.sort()                    # Ordenar en el lugar
length = len(fruits)             # Obtener longitud

# Comprensión de listas
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# Tuplas - colección ordenada e inmutable
coordinates = (10, 20)
person = ("Juan", 25, "Ingeniero")

# Desempaquetado de tuplas
x, y = coordinates
name, age, job = person

# Sets - colección desordenada de elementos únicos
unique_numbers = {1, 2, 3, 4, 5}
fruits_set = {"manzana", "plátano", "cereza"}

# Operaciones con sets
fruits_set.add("naranja")
fruits_set.remove("plátano")
union_set = {1, 2, 3} | {3, 4, 5}        # {1, 2, 3, 4, 5}
intersection = {1, 2, 3} & {2, 3, 4}     # {2, 3}

# Diccionarios - pares clave-valor
person = {
    "name": "Juan",
    "age": 30,
    "city": "Madrid"
}

# Operaciones con diccionarios
person["email"] = "juan@example.com"     # Agregar/actualizar
age = person.get("age", 0)               # Obtener con valor por defecto
keys = person.keys()                     # Obtener todas las claves
values = person.values()                 # Obtener todos los valores
items = person.items()                   # Obtener pares clave-valor

# Comprensión de diccionarios
squares_dict = {x: x**2 for x in range(5)}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplo de estructuras de datos:</strong></p>
<p>Listas: mutables, ordenadas, permiten duplicados</p>
<p>Tuplas: inmutables, ordenadas, permiten duplicados</p>
<p>Sets: mutables, desordenados, solo elementos únicos</p>
<p>Diccionarios: mutables, ordenados (Python 3.7+), pares clave-valor</p>
</div>

## Control de Flujo

```python
# Declaraciones condicionales
age = 18

if age >= 18:
    print("Adulto")
elif age >= 13:
    print("Adolescente")
else:
    print("Niño")

# Operador ternario
status = "Adulto" if age >= 18 else "Menor"

# Bucles for
for i in range(5):
    print(f"Número: {i}")

for fruit in ["manzana", "plátano", "cereza"]:
    print(f"Fruta: {fruit}")

for i, fruit in enumerate(["manzana", "plátano", "cereza"]):
    print(f"{i}: {fruit}")

# Iteración de diccionarios
person = {"name": "Juan", "age": 30}
for key, value in person.items():
    print(f"{key}: {value}")

# Bucles while
count = 0
while count < 5:
    print(f"Contador: {count}")
    count += 1

# Control de bucles
for i in range(10):
    if i == 3:
        continue  # Saltar esta iteración
    if i == 7:
        break     # Salir del bucle
    print(i)

# Manejo de excepciones
try:
    result = 10 / 0
except ZeroDivisionError:
    print("¡No se puede dividir por cero!")
except Exception as e:
    print(f"Ocurrió un error: {e}")
else:
    print("No ocurrieron excepciones")
finally:
    print("Esto siempre se ejecuta")

# Múltiples excepciones
try:
    value = int(input("Ingresa un número: "))
    result = 10 / value
except (ValueError, ZeroDivisionError) as e:
    print(f"Error: {e}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplo de control de flujo:</strong></p>
<p>Python usa indentación en lugar de llaves</p>
<p>enumerate() proporciona índice y valor en bucles</p>
<p>Manejo de excepciones con try/except/else/finally</p>
<p>Usa continue para saltar, break para salir de bucles</p>
</div>

## Funciones

```python
# Función básica
def greet(name):
    return f"¡Hola, {name}!"

# Función con parámetros por defecto
def greet_with_title(name, title="Sr."):
    return f"¡Hola, {title} {name}!"

# Función con múltiples parámetros
def calculate_area(length, width):
    return length * width

# Función con *args (argumentos posicionales variables)
def sum_all(*numbers):
    return sum(numbers)

# Función con **kwargs (argumentos de palabra clave variables)
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

# Función con parámetros mixtos
def complex_function(required, default="por defecto", *args, **kwargs):
    print(f"Requerido: {required}")
    print(f"Por defecto: {default}")
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

# Funciones lambda (anónimas)
square = lambda x: x ** 2
add = lambda x, y: x + y

# Funciones de orden superior
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

# Decoradores
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} tardó {end - start:.4f} segundos")
        return result
    return wrapper

@timing_decorator
def slow_function():
    import time
    time.sleep(1)
    return "¡Listo!"

# Funciones generadoras
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Uso
fib_numbers = list(fibonacci(10))
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplo de funciones:</strong></p>
<p>*args recopila argumentos posicionales extra en una tupla</p>
<p>**kwargs recopila argumentos de palabra clave extra en un diccionario</p>
<p>Los decoradores modifican o extienden el comportamiento de funciones</p>
<p>Los generadores usan yield para producir valores de forma perezosa</p>
</div>

## Programación Orientada a Objetos

```python
# Clase básica
class Person:
    # Variable de clase (compartida por todas las instancias)
    species = "Homo sapiens"
    
    # Constructor
    def __init__(self, name, age):
        # Variables de instancia
        self.name = name
        self.age = age
    
    # Método de instancia
    def introduce(self):
        return f"Hola, soy {self.name} y tengo {self.age} años."
    
    # Representación en cadena
    def __str__(self):
        return f"Person(name='{self.name}', age={self.age})"
    
    def __repr__(self):
        return f"Person('{self.name}', {self.age})"

# Herencia
class Student(Person):
    def __init__(self, name, age, student_id):
        super().__init__(name, age)  # Llamar constructor padre
        self.student_id = student_id
    
    def study(self, subject):
        return f"{self.name} está estudiando {subject}"
    
    # Sobrescritura de método
    def introduce(self):
        return f"Hola, soy {self.name}, tengo {self.age} años y mi ID de estudiante es {self.student_id}."

# Decorador de propiedades
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("El radio no puede ser negativo")
        self._radius = value
    
    @property
    def area(self):
        return 3.14159 * self._radius ** 2

# Métodos de clase y métodos estáticos
class MathUtils:
    @classmethod
    def create_from_string(cls, data_string):
        # Constructor alternativo
        return cls(*data_string.split(","))
    
    @staticmethod
    def add_numbers(a, b):
        # Función utilitaria relacionada con la clase
        return a + b

# Clase base abstracta
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def make_sound(self):
        pass
    
    def sleep(self):
        return "Durmiendo..."

class Dog(Animal):
    def make_sound(self):
        return "¡Guau!"

# Ejemplos de uso
person = Person("Ana", 25)
student = Student("Carlos", 20, "S12345")
circle = Circle(5)

print(person.introduce())
print(student.study("Python"))
print(f"Área del círculo: {circle.area}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplo de POO:</strong></p>
<p>__init__ es el método constructor</p>
<p>super() llama a los métodos de la clase padre</p>
<p>@property crea métodos getter/setter</p>
<p>@classmethod y @staticmethod proporcionan diferentes tipos de métodos</p>
</div>

## E/S de Archivos y Manejo de Errores

```python
# Leer archivos
# Método 1: Lectura básica de archivos
file = open("example.txt", "r", encoding="utf-8")
content = file.read()
file.close()

# Método 2: Usar declaración with (recomendado)
with open("example.txt", "r", encoding="utf-8") as file:
    content = file.read()
    # El archivo se cierra automáticamente después del bloque with

# Leer línea por línea
with open("example.txt", "r", encoding="utf-8") as file:
    for line in file:
        print(line.strip())  # strip() elimina caracteres de nueva línea

# Escribir archivos
with open("output.txt", "w", encoding="utf-8") as file:
    file.write("¡Hola, Mundo!")
    file.write("\nSegunda línea")

# Agregar a archivos
with open("output.txt", "a", encoding="utf-8") as file:
    file.write("\nLínea agregada")

# Trabajar con archivos CSV
import csv

# Escribir CSV
data = [
    ["Nombre", "Edad", "Ciudad"],
    ["Ana", 25, "Madrid"],
    ["Carlos", 30, "Barcelona"]
]

with open("people.csv", "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerows(data)

# Leer CSV
with open("people.csv", "r", encoding="utf-8") as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)

# Trabajar con JSON
import json

# Escribir JSON
data = {
    "name": "Ana",
    "age": 25,
    "hobbies": ["lectura", "programación", "senderismo"]
}

with open("data.json", "w", encoding="utf-8") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

# Leer JSON
with open("data.json", "r", encoding="utf-8") as file:
    loaded_data = json.load(file)
    print(loaded_data["name"])

# Excepciones personalizadas
class CustomError(Exception):
    def __init__(self, message, error_code):
        super().__init__(message)
        self.error_code = error_code

# Lanzar excepciones personalizadas
def validate_age(age):
    if age < 0:
        raise CustomError("La edad no puede ser negativa", "INVALID_AGE")
    if age > 150:
        raise CustomError("La edad parece poco realista", "UNREALISTIC_AGE")
    return True

try:
    validate_age(-5)
except CustomError as e:
    print(f"Error personalizado: {e} (Código: {e.error_code})")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplo de E/S de archivos:</strong></p>
<p>Siempre usa la declaración 'with' para operaciones de archivo</p>
<p>Los módulos CSV y JSON manejan datos estructurados</p>
<p>Crea excepciones personalizadas para manejo específico de errores</p>
<p>Modos de archivo: 'r' (leer), 'w' (escribir), 'a' (agregar)</p>
</div>

## Bibliotecas y Módulos Comunes

```python
# Operaciones de fecha y hora
from datetime import datetime, timedelta, date

now = datetime.now()
today = date.today()
tomorrow = today + timedelta(days=1)

formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
parsed_date = datetime.strptime("2023-12-25", "%Y-%m-%d")

# Expresiones regulares
import re

text = "Contáctame en juan@example.com o llama al 91-123-4567"

# Encontrar direcciones de correo
email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
emails = re.findall(email_pattern, text)

# Reemplazar números de teléfono
phone_pattern = r'\d{2}-\d{3}-\d{4}'
censored = re.sub(phone_pattern, "XX-XXX-XXXX", text)

# Operaciones matemáticas
import math

print(math.sqrt(16))      # 4.0
print(math.ceil(4.3))     # 5
print(math.floor(4.7))    # 4
print(math.pi)            # 3.141592653589793

# Números aleatorios
import random

print(random.random())              # Float aleatorio entre 0 y 1
print(random.randint(1, 10))        # Entero aleatorio entre 1 y 10
print(random.choice(['a', 'b', 'c']))  # Elección aleatoria de lista

# Mezclar una lista
items = [1, 2, 3, 4, 5]
random.shuffle(items)

# Operaciones del sistema operativo
import os

# Obtener directorio actual
current_dir = os.getcwd()

# Listar archivos en directorio
files = os.listdir(".")

# Crear directorio
os.makedirs("new_folder", exist_ok=True)

# Variables de entorno
home_dir = os.environ.get("HOME", "/default/path")

# Operaciones de rutas
from pathlib import Path

path = Path("folder/subfolder/file.txt")
print(path.parent)      # folder/subfolder
print(path.name)        # file.txt
print(path.suffix)      # .txt
print(path.exists())    # True/False

# Módulo collections
from collections import Counter, defaultdict, namedtuple

# Counter - contar ocurrencias
text = "hello world"
letter_count = Counter(text)
print(letter_count.most_common(3))  # [('l', 3), ('o', 2), ('h', 1)]

# defaultdict - diccionario con valores por defecto
dd = defaultdict(list)
dd["key1"].append("value1")  # Sin KeyError incluso si la clave no existe

# namedtuple - tipo de objeto ligero
Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
print(f"x: {p.x}, y: {p.y}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplo de bibliotecas:</strong></p>
<p>datetime para operaciones de fecha/hora</p>
<p>re para expresiones regulares</p>
<p>os y pathlib para operaciones del sistema de archivos</p>
<p>collections proporciona estructuras de datos especializadas</p>
</div>

Esta guía de Python cubre los conceptos y patrones más esenciales del desarrollo moderno con Python. ¡Practica estos patrones y combínalos para construir aplicaciones potentes y mantenibles!