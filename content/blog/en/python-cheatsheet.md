---
title: "Python Cheatsheet"
date: "2018-03-22"
updatedDate: "2025-01-15"
excerpt: "A comprehensive guide to Python fundamentals, data structures, functions, classes and modern patterns for building robust applications."
tags: ["Python", "Programming", "Data Science", "Web Development", "Scripting", "Cheatsheet"]
author: "Shun Kushigami"
---

# Python Cheatsheet

A comprehensive guide to Python fundamentals, data structures, functions, classes and modern patterns for building robust applications.

## Basic Syntax and Variables

```python
# Variables and basic types
name = "Hello World"
age = 25
height = 5.9
is_student = True

# Multiple assignment
x, y, z = 1, 2, 3
a = b = c = 0

# String formatting
greeting = f"Hello, {name}! You are {age} years old."
formatted = "Name: {}, Age: {}".format(name, age)
old_style = "Name: %s, Age: %d" % (name, age)

# Constants (by convention)
PI = 3.14159
MAX_SIZE = 100

# Comments
# Single line comment
"""
Multi-line comment
or docstring
"""

# Basic operators
addition = 5 + 3        # 8
subtraction = 5 - 3     # 2
multiplication = 5 * 3  # 15
division = 5 / 3        # 1.6666...
floor_division = 5 // 3 # 1
modulus = 5 % 3         # 2
exponent = 5 ** 3       # 125

# Comparison operators
print(5 == 5)   # True
print(5 != 3)   # True
print(5 > 3)    # True
print(5 < 3)    # False
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Basic Syntax Example:</strong>
<p>Python uses indentation to define code blocks</p>
<p>Variables don't need type declarations</p>
<p>Use f-strings for modern string formatting</p>
</div>

## Data Structures

```python
# Lists - ordered, mutable collection
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]

# List operations
fruits.append("orange")          # Add to end
fruits.insert(0, "grape")       # Insert at index
fruits.remove("banana")         # Remove first occurrence
popped = fruits.pop()           # Remove and return last item
fruits.sort()                   # Sort in place
length = len(fruits)            # Get length

# List comprehensions
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# Tuples - ordered, immutable collection
coordinates = (10, 20)
person = ("John", 25, "Engineer")

# Tuple unpacking
x, y = coordinates
name, age, job = person

# Sets - unordered collection of unique items
unique_numbers = {1, 2, 3, 4, 5}
fruits_set = {"apple", "banana", "cherry"}

# Set operations
fruits_set.add("orange")
fruits_set.remove("banana")
union_set = {1, 2, 3} | {3, 4, 5}        # {1, 2, 3, 4, 5}
intersection = {1, 2, 3} & {2, 3, 4}     # {2, 3}

# Dictionaries - key-value pairs
person = {
    "name": "John",
    "age": 30,
    "city": "New York"
}

# Dictionary operations
person["email"] = "john@example.com"     # Add/update
age = person.get("age", 0)               # Get with default
keys = person.keys()                     # Get all keys
values = person.values()                 # Get all values
items = person.items()                   # Get key-value pairs

# Dictionary comprehension
squares_dict = {x: x**2 for x in range(5)}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Data Structures Example:</strong></p>
<p>Lists: mutable, ordered, allow duplicates</p>
<p>Tuples: immutable, ordered, allow duplicates</p>
<p>Sets: mutable, unordered, unique elements only</p>
<p>Dictionaries: mutable, ordered (Python 3.7+), key-value pairs</p>
</div>

## Control Flow

```python
# Conditional statements
age = 18

if age >= 18:
    print("Adult")
elif age >= 13:
    print("Teenager")
else:
    print("Child")

# Ternary operator
status = "Adult" if age >= 18 else "Minor"

# For loops
for i in range(5):
    print(f"Number: {i}")

for fruit in ["apple", "banana", "cherry"]:
    print(f"Fruit: {fruit}")

for i, fruit in enumerate(["apple", "banana", "cherry"]):
    print(f"{i}: {fruit}")

# Dictionary iteration
person = {"name": "John", "age": 30}
for key, value in person.items():
    print(f"{key}: {value}")

# While loops
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1

# Loop control
for i in range(10):
    if i == 3:
        continue  # Skip this iteration
    if i == 7:
        break     # Exit loop
    print(i)

# Exception handling
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero!")
except Exception as e:
    print(f"An error occurred: {e}")
else:
    print("No exceptions occurred")
finally:
    print("This always executes")

# Multiple exceptions
try:
    value = int(input("Enter a number: "))
    result = 10 / value
except (ValueError, ZeroDivisionError) as e:
    print(f"Error: {e}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Control Flow Example:</strong></p>
<p>Python uses indentation instead of braces</p>
<p>enumerate() provides index and value in loops</p>
<p>Exception handling with try/except/else/finally</p>
<p>Use continue to skip, break to exit loops</p>
</div>

## Functions

```python
# Basic function
def greet(name):
    return f"Hello, {name}!"

# Function with default parameters
def greet_with_title(name, title="Mr."):
    return f"Hello, {title} {name}!"

# Function with multiple parameters
def calculate_area(length, width):
    return length * width

# Function with *args (variable positional arguments)
def sum_all(*numbers):
    return sum(numbers)

# Function with **kwargs (variable keyword arguments)
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

# Function with mixed parameters
def complex_function(required, default="default", *args, **kwargs):
    print(f"Required: {required}")
    print(f"Default: {default}")
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

# Lambda functions (anonymous functions)
square = lambda x: x ** 2
add = lambda x, y: x + y

# Higher-order functions
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

# Decorators
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

@timing_decorator
def slow_function():
    import time
    time.sleep(1)
    return "Done!"

# Generator functions
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Usage
fib_numbers = list(fibonacci(10))
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Functions Example:</strong></p>
<p>*args collects extra positional arguments into a tuple</p>
<p>**kwargs collects extra keyword arguments into a dictionary</p>
<p>Decorators modify or extend function behavior</p>
<p>Generators use yield to produce values lazily</p>
</div>

## Object-Oriented Programming

```python
# Basic class
class Person:
    # Class variable (shared by all instances)
    species = "Homo sapiens"
    
    # Constructor
    def __init__(self, name, age):
        # Instance variables
        self.name = name
        self.age = age
    
    # Instance method
    def introduce(self):
        return f"Hi, I'm {self.name} and I'm {self.age} years old."
    
    # String representation
    def __str__(self):
        return f"Person(name='{self.name}', age={self.age})"
    
    def __repr__(self):
        return f"Person('{self.name}', {self.age})"

# Inheritance
class Student(Person):
    def __init__(self, name, age, student_id):
        super().__init__(name, age)  # Call parent constructor
        self.student_id = student_id
    
    def study(self, subject):
        return f"{self.name} is studying {subject}"
    
    # Method overriding
    def introduce(self):
        return f"Hi, I'm {self.name}, I'm {self.age} years old and my student ID is {self.student_id}."

# Property decorator
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value
    
    @property
    def area(self):
        return 3.14159 * self._radius ** 2

# Class methods and static methods
class MathUtils:
    @classmethod
    def create_from_string(cls, data_string):
        # Alternative constructor
        return cls(*data_string.split(","))
    
    @staticmethod
    def add_numbers(a, b):
        # Utility function related to the class
        return a + b

# Abstract base class
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def make_sound(self):
        pass
    
    def sleep(self):
        return "Sleeping..."

class Dog(Animal):
    def make_sound(self):
        return "Woof!"

# Usage examples
person = Person("Alice", 25)
student = Student("Bob", 20, "S12345")
circle = Circle(5)

print(person.introduce())
print(student.study("Python"))
print(f"Circle area: {circle.area}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>OOP Example:</strong></p>
<p>__init__ is the constructor method</p>
<p>super() calls the parent class methods</p>
<p>@property creates getter/setter methods</p>
<p>@classmethod and @staticmethod provide different method types</p>
</div>

## File I/O and Error Handling

```python
# Reading files
# Method 1: Basic file reading
file = open("example.txt", "r")
content = file.read()
file.close()

# Method 2: Using with statement (recommended)
with open("example.txt", "r") as file:
    content = file.read()
    # File is automatically closed after the with block

# Reading line by line
with open("example.txt", "r") as file:
    for line in file:
        print(line.strip())  # strip() removes newline characters

# Writing files
with open("output.txt", "w") as file:
    file.write("Hello, World!")
    file.write("\nSecond line")

# Appending to files
with open("output.txt", "a") as file:
    file.write("\nAppended line")

# Working with CSV files
import csv

# Writing CSV
data = [
    ["Name", "Age", "City"],
    ["Alice", 25, "New York"],
    ["Bob", 30, "London"]
]

with open("people.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerows(data)

# Reading CSV
with open("people.csv", "r") as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)

# Working with JSON
import json

# Writing JSON
data = {
    "name": "Alice",
    "age": 25,
    "hobbies": ["reading", "coding", "hiking"]
}

with open("data.json", "w") as file:
    json.dump(data, file, indent=2)

# Reading JSON
with open("data.json", "r") as file:
    loaded_data = json.load(file)
    print(loaded_data["name"])

# Custom exceptions
class CustomError(Exception):
    def __init__(self, message, error_code):
        super().__init__(message)
        self.error_code = error_code

# Raising custom exceptions
def validate_age(age):
    if age < 0:
        raise CustomError("Age cannot be negative", "INVALID_AGE")
    if age > 150:
        raise CustomError("Age seems unrealistic", "UNREALISTIC_AGE")
    return True

try:
    validate_age(-5)
except CustomError as e:
    print(f"Custom error: {e} (Code: {e.error_code})")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>File I/O Example:</strong></p>
<p>Always use 'with' statement for file operations</p>
<p>CSV and JSON modules handle structured data</p>
<p>Create custom exceptions for specific error handling</p>
<p>File modes: 'r' (read), 'w' (write), 'a' (append)</p>
</div>

## Common Libraries and Modules

```python
# DateTime operations
from datetime import datetime, timedelta, date

now = datetime.now()
today = date.today()
tomorrow = today + timedelta(days=1)

formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
parsed_date = datetime.strptime("2023-12-25", "%Y-%m-%d")

# Regular expressions
import re

text = "Contact me at john@example.com or call 123-456-7890"

# Find email addresses
email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
emails = re.findall(email_pattern, text)

# Replace phone numbers
phone_pattern = r'\d{3}-\d{3}-\d{4}'
censored = re.sub(phone_pattern, "XXX-XXX-XXXX", text)

# Math operations
import math

print(math.sqrt(16))      # 4.0
print(math.ceil(4.3))     # 5
print(math.floor(4.7))    # 4
print(math.pi)            # 3.141592653589793

# Random numbers
import random

print(random.random())              # Random float between 0 and 1
print(random.randint(1, 10))        # Random integer between 1 and 10
print(random.choice(['a', 'b', 'c']))  # Random choice from list

# Shuffle a list
items = [1, 2, 3, 4, 5]
random.shuffle(items)

# OS operations
import os

# Get current directory
current_dir = os.getcwd()

# List files in directory
files = os.listdir(".")

# Create directory
os.makedirs("new_folder", exist_ok=True)

# Environment variables
home_dir = os.environ.get("HOME", "/default/path")

# Path operations
from pathlib import Path

path = Path("folder/subfolder/file.txt")
print(path.parent)      # folder/subfolder
print(path.name)        # file.txt
print(path.suffix)      # .txt
print(path.exists())    # True/False

# Collections module
from collections import Counter, defaultdict, namedtuple

# Counter - count occurrences
text = "hello world"
letter_count = Counter(text)
print(letter_count.most_common(3))  # [('l', 3), ('o', 2), ('h', 1)]

# defaultdict - dictionary with default values
dd = defaultdict(list)
dd["key1"].append("value1")  # No KeyError even if key doesn't exist

# namedtuple - lightweight object type
Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
print(f"x: {p.x}, y: {p.y}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Libraries Example:</strong></p>
<p>datetime for date/time operations</p>
<p>re for regular expressions</p>
<p>os and pathlib for file system operations</p>
<p>collections provides specialized data structures</p>
</div>

This Python cheatsheet covers the most essential concepts and patterns for modern Python development. Practice these patterns and combine them to build powerful and maintainable applications!