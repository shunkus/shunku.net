---
title: "Python 备忘单"
date: "2018-03-22"
updatedDate: "2025-01-15"
excerpt: "用于构建稳健应用程序的Python基础、数据结构、函数、类和现代模式的综合指南。"
tags: ["Python", "编程", "数据科学", "Web开发", "脚本", "备忘单"]
author: "串上俊"
---

# Python 备忘单

用于构建稳健应用程序的Python基础、数据结构、函数、类和现代模式的综合指南。

## 基本语法和变量

```python
# 变量和基本类型
name = "Hello World"
age = 25
height = 5.9
is_student = True

# 多重赋值
x, y, z = 1, 2, 3
a = b = c = 0

# 字符串格式化
greeting = f"你好，{name}！你今年{age}岁。"
formatted = "姓名: {}，年龄: {}".format(name, age)
old_style = "姓名: %s，年龄: %d" % (name, age)

# 常量（惯例）
PI = 3.14159
MAX_SIZE = 100

# 注释
# 单行注释
"""
多行注释
或文档字符串
"""

# 基本运算符
addition = 5 + 3        # 8
subtraction = 5 - 3     # 2
multiplication = 5 * 3  # 15
division = 5 / 3        # 1.6666...
floor_division = 5 // 3 # 1
modulus = 5 % 3         # 2
exponent = 5 ** 3       # 125

# 比较运算符
print(5 == 5)   # True
print(5 != 3)   # True
print(5 > 3)    # True
print(5 < 3)    # False
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>基本语法示例：</strong>
<p>Python使用缩进来定义代码块</p>
<p>变量不需要类型声明</p>
<p>现代字符串格式化使用f字符串</p>
</div>

## 数据结构

```python
# 列表 - 有序、可变的集合
fruits = ["苹果", "香蕉", "樱桃"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "你好", 3.14, True]

# 列表操作
fruits.append("橙子")           # 添加到末尾
fruits.insert(0, "葡萄")        # 在索引位置插入
fruits.remove("香蕉")           # 删除第一个匹配项
popped = fruits.pop()          # 删除并返回最后一项
fruits.sort()                  # 原地排序
length = len(fruits)           # 获取长度

# 列表推导式
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# 元组 - 有序、不可变的集合
coordinates = (10, 20)
person = ("张三", 25, "工程师")

# 元组解包
x, y = coordinates
name, age, job = person

# 集合 - 无重复元素的无序集合
unique_numbers = {1, 2, 3, 4, 5}
fruits_set = {"苹果", "香蕉", "樱桃"}

# 集合操作
fruits_set.add("橙子")
fruits_set.remove("香蕉")
union_set = {1, 2, 3} | {3, 4, 5}        # {1, 2, 3, 4, 5}
intersection = {1, 2, 3} & {2, 3, 4}     # {2, 3}

# 字典 - 键值对
person = {
    "name": "张三",
    "age": 30,
    "city": "北京"
}

# 字典操作
person["email"] = "zhang@example.com"    # 添加/更新
age = person.get("age", 0)               # 带默认值获取
keys = person.keys()                     # 获取所有键
values = person.values()                 # 获取所有值
items = person.items()                   # 获取键值对

# 字典推导式
squares_dict = {x: x**2 for x in range(5)}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>数据结构示例：</strong></p>
<p>列表：可变、有序、允许重复</p>
<p>元组：不可变、有序、允许重复</p>
<p>集合：可变、无序、仅唯一元素</p>
<p>字典：可变、有序（Python 3.7+）、键值对</p>
</div>

## 控制流

```python
# 条件语句
age = 18

if age >= 18:
    print("成年人")
elif age >= 13:
    print("青少年")
else:
    print("儿童")

# 三元运算符
status = "成年人" if age >= 18 else "未成年人"

# for循环
for i in range(5):
    print(f"数字: {i}")

for fruit in ["苹果", "香蕉", "樱桃"]:
    print(f"水果: {fruit}")

for i, fruit in enumerate(["苹果", "香蕉", "樱桃"]):
    print(f"{i}: {fruit}")

# 字典迭代
person = {"name": "张三", "age": 30}
for key, value in person.items():
    print(f"{key}: {value}")

# while循环
count = 0
while count < 5:
    print(f"计数: {count}")
    count += 1

# 循环控制
for i in range(10):
    if i == 3:
        continue  # 跳过此次迭代
    if i == 7:
        break     # 退出循环
    print(i)

# 异常处理
try:
    result = 10 / 0
except ZeroDivisionError:
    print("不能除以零！")
except Exception as e:
    print(f"发生错误: {e}")
else:
    print("没有发生异常")
finally:
    print("这总是会执行")

# 多个异常
try:
    value = int(input("输入一个数字: "))
    result = 10 / value
except (ValueError, ZeroDivisionError) as e:
    print(f"错误: {e}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>控制流示例：</strong></p>
<p>Python使用缩进而不是大括号</p>
<p>enumerate()在循环中提供索引和值</p>
<p>try/except/else/finally进行异常处理</p>
<p>使用continue跳过，break退出循环</p>
</div>

## 函数

```python
# 基本函数
def greet(name):
    return f"你好，{name}！"

# 带默认参数的函数
def greet_with_title(name, title="先生"):
    return f"你好，{title}{name}！"

# 多参数函数
def calculate_area(length, width):
    return length * width

# *args（可变位置参数）
def sum_all(*numbers):
    return sum(numbers)

# **kwargs（可变关键字参数）
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

# 混合参数函数
def complex_function(required, default="默认值", *args, **kwargs):
    print(f"必需参数: {required}")
    print(f"默认参数: {default}")
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

# Lambda函数（匿名函数）
square = lambda x: x ** 2
add = lambda x, y: x + y

# 高阶函数
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

# 装饰器
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__}耗时: {end - start:.4f}秒")
        return result
    return wrapper

@timing_decorator
def slow_function():
    import time
    time.sleep(1)
    return "完成！"

# 生成器函数
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 使用方法
fib_numbers = list(fibonacci(10))
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>函数示例：</strong></p>
<p>*args将额外的位置参数收集到元组中</p>
<p>**kwargs将额外的关键字参数收集到字典中</p>
<p>装饰器修改或扩展函数行为</p>
<p>生成器使用yield惰性产生值</p>
</div>

## 面向对象编程

```python
# 基本类
class Person:
    # 类变量（所有实例共享）
    species = "智人"
    
    # 构造函数
    def __init__(self, name, age):
        # 实例变量
        self.name = name
        self.age = age
    
    # 实例方法
    def introduce(self):
        return f"你好，我是{self.name}，今年{self.age}岁。"
    
    # 字符串表示
    def __str__(self):
        return f"Person(name='{self.name}', age={self.age})"
    
    def __repr__(self):
        return f"Person('{self.name}', {self.age})"

# 继承
class Student(Person):
    def __init__(self, name, age, student_id):
        super().__init__(name, age)  # 调用父类构造函数
        self.student_id = student_id
    
    def study(self, subject):
        return f"{self.name}正在学习{subject}"
    
    # 方法重写
    def introduce(self):
        return f"你好，我是{self.name}，今年{self.age}岁，学号是{self.student_id}。"

# 属性装饰器
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("半径不能为负数")
        self._radius = value
    
    @property
    def area(self):
        return 3.14159 * self._radius ** 2

# 类方法和静态方法
class MathUtils:
    @classmethod
    def create_from_string(cls, data_string):
        # 替代构造函数
        return cls(*data_string.split(","))
    
    @staticmethod
    def add_numbers(a, b):
        # 与类相关的实用函数
        return a + b

# 抽象基类
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def make_sound(self):
        pass
    
    def sleep(self):
        return "睡觉中..."

class Dog(Animal):
    def make_sound(self):
        return "汪！"

# 使用示例
person = Person("张三", 25)
student = Student("李四", 20, "S12345")
circle = Circle(5)

print(person.introduce())
print(student.study("Python"))
print(f"圆的面积: {circle.area}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>OOP示例：</strong></p>
<p>__init__是构造函数方法</p>
<p>super()调用父类方法</p>
<p>@property创建getter/setter方法</p>
<p>@classmethod和@staticmethod提供不同的方法类型</p>
</div>

## 文件I/O和错误处理

```python
# 读取文件
# 方法1：基本文件读取
file = open("example.txt", "r", encoding="utf-8")
content = file.read()
file.close()

# 方法2：使用with语句（推荐）
with open("example.txt", "r", encoding="utf-8") as file:
    content = file.read()
    # with块后文件自动关闭

# 逐行读取
with open("example.txt", "r", encoding="utf-8") as file:
    for line in file:
        print(line.strip())  # strip()移除换行符

# 写入文件
with open("output.txt", "w", encoding="utf-8") as file:
    file.write("你好，世界！")
    file.write("\n第二行")

# 追加到文件
with open("output.txt", "a", encoding="utf-8") as file:
    file.write("\n追加的行")

# 处理CSV文件
import csv

# 写入CSV
data = [
    ["姓名", "年龄", "城市"],
    ["张三", 25, "北京"],
    ["李四", 30, "上海"]
]

with open("people.csv", "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerows(data)

# 读取CSV
with open("people.csv", "r", encoding="utf-8") as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)

# 处理JSON
import json

# 写入JSON
data = {
    "name": "张三",
    "age": 25,
    "hobbies": ["阅读", "编程", "徒步"]
}

with open("data.json", "w", encoding="utf-8") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

# 读取JSON
with open("data.json", "r", encoding="utf-8") as file:
    loaded_data = json.load(file)
    print(loaded_data["name"])

# 自定义异常
class CustomError(Exception):
    def __init__(self, message, error_code):
        super().__init__(message)
        self.error_code = error_code

# 抛出自定义异常
def validate_age(age):
    if age < 0:
        raise CustomError("年龄不能为负数", "INVALID_AGE")
    if age > 150:
        raise CustomError("年龄似乎不现实", "UNREALISTIC_AGE")
    return True

try:
    validate_age(-5)
except CustomError as e:
    print(f"自定义错误: {e} (代码: {e.error_code})")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>文件I/O示例：</strong></p>
<p>文件操作总是使用with语句</p>
<p>CSV和JSON模块处理结构化数据</p>
<p>为特定错误处理创建自定义异常</p>
<p>文件模式：'r'（读取）、'w'（写入）、'a'（追加）</p>
</div>

## 常用库和模块

```python
# 日期时间操作
from datetime import datetime, timedelta, date

now = datetime.now()
today = date.today()
tomorrow = today + timedelta(days=1)

formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
parsed_date = datetime.strptime("2023-12-25", "%Y-%m-%d")

# 正则表达式
import re

text = "联系我：john@example.com 或致电 010-1234-5678"

# 查找邮箱地址
email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
emails = re.findall(email_pattern, text)

# 替换电话号码
phone_pattern = r'\d{3,4}-\d{4}-\d{4}'
censored = re.sub(phone_pattern, "XXX-XXXX-XXXX", text)

# 数学运算
import math

print(math.sqrt(16))      # 4.0
print(math.ceil(4.3))     # 5
print(math.floor(4.7))    # 4
print(math.pi)            # 3.141592653589793

# 随机数
import random

print(random.random())              # 0到1之间的随机浮点数
print(random.randint(1, 10))        # 1到10之间的随机整数
print(random.choice(['a', 'b', 'c']))  # 从列表中随机选择

# 打乱列表
items = [1, 2, 3, 4, 5]
random.shuffle(items)

# 操作系统操作
import os

# 获取当前目录
current_dir = os.getcwd()

# 列出目录中的文件
files = os.listdir(".")

# 创建目录
os.makedirs("new_folder", exist_ok=True)

# 环境变量
home_dir = os.environ.get("HOME", "/default/path")

# 路径操作
from pathlib import Path

path = Path("folder/subfolder/file.txt")
print(path.parent)      # folder/subfolder
print(path.name)        # file.txt
print(path.suffix)      # .txt
print(path.exists())    # True/False

# collections模块
from collections import Counter, defaultdict, namedtuple

# Counter - 计数出现次数
text = "hello world"
letter_count = Counter(text)
print(letter_count.most_common(3))  # [('l', 3), ('o', 2), ('h', 1)]

# defaultdict - 带默认值的字典
dd = defaultdict(list)
dd["key1"].append("value1")  # 即使键不存在也不会KeyError

# namedtuple - 轻量级对象类型
Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
print(f"x: {p.x}, y: {p.y}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>库示例：</strong></p>
<p>datetime用于日期/时间操作</p>
<p>re用于正则表达式</p>
<p>os和pathlib用于文件系统操作</p>
<p>collections提供专门的数据结构</p>
</div>

这个Python备忘单涵盖了现代Python开发中最重要的概念和模式。练习这些模式并结合使用它们来构建强大且可维护的应用程序！