---
title: "Python 치트시트"
date: "2018-03-22"
updatedDate: "2025-01-15"
excerpt: "견고한 애플리케이션 구축을 위한 Python의 기초, 데이터 구조, 함수, 클래스, 모던 패턴에 대한 포괄적인 가이드입니다."
tags: ["Python", "프로그래밍", "데이터 사이언스", "웹 개발", "스크립팅", "치트시트"]
author: "구시가미 순"
---

# Python 치트시트

견고한 애플리케이션 구축을 위한 Python의 기초, 데이터 구조, 함수, 클래스, 모던 패턴에 대한 포괄적인 가이드입니다.

## 기본 문법과 변수

```python
# 변수와 기본 타입
name = "Hello World"
age = 25
height = 5.9
is_student = True

# 다중 할당
x, y, z = 1, 2, 3
a = b = c = 0

# 문자열 포맷팅
greeting = f"안녕하세요, {name}님! 당신은 {age}세입니다."
formatted = "이름: {}, 나이: {}".format(name, age)
old_style = "이름: %s, 나이: %d" % (name, age)

# 상수 (관례)
PI = 3.14159
MAX_SIZE = 100

# 주석
# 단일 행 주석
"""
다중 행 주석
또는 docstring
"""

# 기본 연산자
addition = 5 + 3        # 8
subtraction = 5 - 3     # 2
multiplication = 5 * 3  # 15
division = 5 / 3        # 1.6666...
floor_division = 5 // 3 # 1
modulus = 5 % 3         # 2
exponent = 5 ** 3       # 125

# 비교 연산자
print(5 == 5)   # True
print(5 != 3)   # True
print(5 > 3)    # True
print(5 < 3)    # False
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>기본 문법 예제:</strong>
<p>Python은 들여쓰기를 사용해 코드 블록을 정의</p>
<p>변수는 타입 선언이 필요 없음</p>
<p>현대적인 문자열 포맷팅에는 f-string 사용</p>
</div>

## 데이터 구조

```python
# 리스트 - 순서가 있고 변경 가능한 컬렉션
fruits = ["사과", "바나나", "체리"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "안녕하세요", 3.14, True]

# 리스트 연산
fruits.append("오렌지")          # 끝에 추가
fruits.insert(0, "포도")         # 인덱스 위치에 삽입
fruits.remove("바나나")          # 첫 번째 일치하는 항목 제거
popped = fruits.pop()           # 마지막 항목 제거하고 반환
fruits.sort()                   # 제자리에서 정렬
length = len(fruits)            # 길이 가져오기

# 리스트 컴프리헨션
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# 튜플 - 순서가 있고 변경 불가능한 컬렉션
coordinates = (10, 20)
person = ("홍길동", 25, "엔지니어")

# 튜플 언패킹
x, y = coordinates
name, age, job = person

# 세트 - 중복 없는 요소들의 순서 없는 컬렉션
unique_numbers = {1, 2, 3, 4, 5}
fruits_set = {"사과", "바나나", "체리"}

# 세트 연산
fruits_set.add("오렌지")
fruits_set.remove("바나나")
union_set = {1, 2, 3} | {3, 4, 5}        # {1, 2, 3, 4, 5}
intersection = {1, 2, 3} & {2, 3, 4}     # {2, 3}

# 딕셔너리 - 키-값 쌍
person = {
    "name": "홍길동",
    "age": 30,
    "city": "서울"
}

# 딕셔너리 연산
person["email"] = "hong@example.com"     # 추가/업데이트
age = person.get("age", 0)               # 기본값으로 가져오기
keys = person.keys()                     # 모든 키 가져오기
values = person.values()                 # 모든 값 가져오기
items = person.items()                   # 키-값 쌍 가져오기

# 딕셔너리 컴프리헨션
squares_dict = {x: x**2 for x in range(5)}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>데이터 구조 예제:</strong></p>
<p>리스트: 변경 가능, 순서 있음, 중복 허용</p>
<p>튜플: 변경 불가능, 순서 있음, 중복 허용</p>
<p>세트: 변경 가능, 순서 없음, 고유한 요소만</p>
<p>딕셔너리: 변경 가능, 순서 있음 (Python 3.7+), 키-값 쌍</p>
</div>

## 제어 흐름

```python
# 조건문
age = 18

if age >= 18:
    print("성인")
elif age >= 13:
    print("십대")
else:
    print("어린이")

# 삼항 연산자
status = "성인" if age >= 18 else "미성년자"

# for 루프
for i in range(5):
    print(f"숫자: {i}")

for fruit in ["사과", "바나나", "체리"]:
    print(f"과일: {fruit}")

for i, fruit in enumerate(["사과", "바나나", "체리"]):
    print(f"{i}: {fruit}")

# 딕셔너리 반복
person = {"name": "홍길동", "age": 30}
for key, value in person.items():
    print(f"{key}: {value}")

# while 루프
count = 0
while count < 5:
    print(f"카운트: {count}")
    count += 1

# 루프 제어
for i in range(10):
    if i == 3:
        continue  # 이 반복 건너뛰기
    if i == 7:
        break     # 루프 종료
    print(i)

# 예외 처리
try:
    result = 10 / 0
except ZeroDivisionError:
    print("0으로 나눌 수 없습니다!")
except Exception as e:
    print(f"오류가 발생했습니다: {e}")
else:
    print("예외가 발생하지 않았습니다")
finally:
    print("이것은 항상 실행됩니다")

# 여러 예외
try:
    value = int(input("숫자를 입력하세요: "))
    result = 10 / value
except (ValueError, ZeroDivisionError) as e:
    print(f"오류: {e}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>제어 흐름 예제:</strong></p>
<p>Python은 중괄호 대신 들여쓰기를 사용</p>
<p>enumerate()는 루프에서 인덱스와 값을 제공</p>
<p>try/except/else/finally로 예외 처리</p>
<p>continue로 건너뛰기, break로 루프 종료</p>
</div>

## 함수

```python
# 기본 함수
def greet(name):
    return f"안녕하세요, {name}님!"

# 기본 매개변수가 있는 함수
def greet_with_title(name, title="님"):
    return f"안녕하세요, {title} {name}!"

# 여러 매개변수가 있는 함수
def calculate_area(length, width):
    return length * width

# *args (가변 위치 인수)
def sum_all(*numbers):
    return sum(numbers)

# **kwargs (가변 키워드 인수)
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

# 혼합 매개변수 함수
def complex_function(required, default="기본값", *args, **kwargs):
    print(f"필수: {required}")
    print(f"기본값: {default}")
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

# 람다 함수 (익명 함수)
square = lambda x: x ** 2
add = lambda x, y: x + y

# 고차 함수
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

# 데코레이터
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 실행 시간: {end - start:.4f}초")
        return result
    return wrapper

@timing_decorator
def slow_function():
    import time
    time.sleep(1)
    return "완료!"

# 제너레이터 함수
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 사용법
fib_numbers = list(fibonacci(10))
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>함수 예제:</strong></p>
<p>*args는 추가 위치 인수를 튜플로 수집</p>
<p>**kwargs는 추가 키워드 인수를 딕셔너리로 수집</p>
<p>데코레이터는 함수 동작을 수정하거나 확장</p>
<p>제너레이터는 yield를 사용해 값을 지연 생성</p>
</div>

## 객체 지향 프로그래밍

```python
# 기본 클래스
class Person:
    # 클래스 변수 (모든 인스턴스에서 공유)
    species = "호모 사피엔스"
    
    # 생성자
    def __init__(self, name, age):
        # 인스턴스 변수
        self.name = name
        self.age = age
    
    # 인스턴스 메서드
    def introduce(self):
        return f"안녕하세요, 저는 {self.name}이고 {self.age}세입니다."
    
    # 문자열 표현
    def __str__(self):
        return f"Person(name='{self.name}', age={self.age})"
    
    def __repr__(self):
        return f"Person('{self.name}', {self.age})"

# 상속
class Student(Person):
    def __init__(self, name, age, student_id):
        super().__init__(name, age)  # 부모 생성자 호출
        self.student_id = student_id
    
    def study(self, subject):
        return f"{self.name}님이 {subject}를 공부하고 있습니다"
    
    # 메서드 오버라이딩
    def introduce(self):
        return f"안녕하세요, 저는 {self.name}이고 {self.age}세이며 학번은 {self.student_id}입니다."

# 프로퍼티 데코레이터
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("반지름은 음수일 수 없습니다")
        self._radius = value
    
    @property
    def area(self):
        return 3.14159 * self._radius ** 2

# 클래스 메서드와 정적 메서드
class MathUtils:
    @classmethod
    def create_from_string(cls, data_string):
        # 대체 생성자
        return cls(*data_string.split(","))
    
    @staticmethod
    def add_numbers(a, b):
        # 클래스와 관련된 유틸리티 함수
        return a + b

# 추상 기본 클래스
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def make_sound(self):
        pass
    
    def sleep(self):
        return "잠자는 중..."

class Dog(Animal):
    def make_sound(self):
        return "멍!"

# 사용 예제
person = Person("앨리스", 25)
student = Student("밥", 20, "S12345")
circle = Circle(5)

print(person.introduce())
print(student.study("Python"))
print(f"원의 면적: {circle.area}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>OOP 예제:</strong></p>
<p>__init__는 생성자 메서드</p>
<p>super()는 부모 클래스 메서드 호출</p>
<p>@property는 getter/setter 메서드 생성</p>
<p>@classmethod와 @staticmethod는 다른 메서드 타입 제공</p>
</div>

## 파일 I/O와 오류 처리

```python
# 파일 읽기
# 방법 1: 기본 파일 읽기
file = open("example.txt", "r", encoding="utf-8")
content = file.read()
file.close()

# 방법 2: with 문 사용 (권장)
with open("example.txt", "r", encoding="utf-8") as file:
    content = file.read()
    # with 블록 후 파일이 자동으로 닫힘

# 줄별로 읽기
with open("example.txt", "r", encoding="utf-8") as file:
    for line in file:
        print(line.strip())  # strip()으로 개행 문자 제거

# 파일 쓰기
with open("output.txt", "w", encoding="utf-8") as file:
    file.write("안녕하세요, 세계!")
    file.write("\n두 번째 줄")

# 파일에 추가
with open("output.txt", "a", encoding="utf-8") as file:
    file.write("\n추가된 줄")

# CSV 파일 작업
import csv

# CSV 쓰기
data = [
    ["이름", "나이", "도시"],
    ["홍길동", 25, "서울"],
    ["김철수", 30, "부산"]
]

with open("people.csv", "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerows(data)

# CSV 읽기
with open("people.csv", "r", encoding="utf-8") as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)

# JSON 작업
import json

# JSON 쓰기
data = {
    "name": "홍길동",
    "age": 25,
    "hobbies": ["독서", "코딩", "하이킹"]
}

with open("data.json", "w", encoding="utf-8") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

# JSON 읽기
with open("data.json", "r", encoding="utf-8") as file:
    loaded_data = json.load(file)
    print(loaded_data["name"])

# 커스텀 예외
class CustomError(Exception):
    def __init__(self, message, error_code):
        super().__init__(message)
        self.error_code = error_code

# 커스텀 예외 발생
def validate_age(age):
    if age < 0:
        raise CustomError("나이는 음수일 수 없습니다", "INVALID_AGE")
    if age > 150:
        raise CustomError("나이가 비현실적입니다", "UNREALISTIC_AGE")
    return True

try:
    validate_age(-5)
except CustomError as e:
    print(f"커스텀 오류: {e} (코드: {e.error_code})")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>파일 I/O 예제:</strong></p>
<p>파일 작업에는 항상 with 문 사용</p>
<p>CSV와 JSON 모듈로 구조화된 데이터 처리</p>
<p>특정 오류 처리를 위해 커스텀 예외 생성</p>
<p>파일 모드: 'r'(읽기), 'w'(쓰기), 'a'(추가)</p>
</div>

## 일반적인 라이브러리와 모듈

```python
# 날짜/시간 작업
from datetime import datetime, timedelta, date

now = datetime.now()
today = date.today()
tomorrow = today + timedelta(days=1)

formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
parsed_date = datetime.strptime("2023-12-25", "%Y-%m-%d")

# 정규 표현식
import re

text = "연락처: john@example.com 또는 02-1234-5678로 연락하세요"

# 이메일 주소 찾기
email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
emails = re.findall(email_pattern, text)

# 전화번호 교체
phone_pattern = r'\d{2,3}-\d{3,4}-\d{4}'
censored = re.sub(phone_pattern, "XXX-XXXX-XXXX", text)

# 수학 연산
import math

print(math.sqrt(16))      # 4.0
print(math.ceil(4.3))     # 5
print(math.floor(4.7))    # 4
print(math.pi)            # 3.141592653589793

# 난수
import random

print(random.random())              # 0과 1 사이의 랜덤 float
print(random.randint(1, 10))        # 1과 10 사이의 랜덤 정수
print(random.choice(['a', 'b', 'c']))  # 리스트에서 랜덤 선택

# 리스트 섞기
items = [1, 2, 3, 4, 5]
random.shuffle(items)

# OS 작업
import os

# 현재 디렉터리 가져오기
current_dir = os.getcwd()

# 디렉터리의 파일 목록
files = os.listdir(".")

# 디렉터리 생성
os.makedirs("new_folder", exist_ok=True)

# 환경 변수
home_dir = os.environ.get("HOME", "/default/path")

# 경로 작업
from pathlib import Path

path = Path("folder/subfolder/file.txt")
print(path.parent)      # folder/subfolder
print(path.name)        # file.txt
print(path.suffix)      # .txt
print(path.exists())    # True/False

# collections 모듈
from collections import Counter, defaultdict, namedtuple

# Counter - 발생 횟수 계산
text = "hello world"
letter_count = Counter(text)
print(letter_count.most_common(3))  # [('l', 3), ('o', 2), ('h', 1)]

# defaultdict - 기본값이 있는 딕셔너리
dd = defaultdict(list)
dd["key1"].append("value1")  # 키가 없어도 KeyError 없음

# namedtuple - 경량 객체 타입
Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
print(f"x: {p.x}, y: {p.y}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>라이브러리 예제:</strong></p>
<p>datetime으로 날짜/시간 작업</p>
<p>re로 정규 표현식</p>
<p>os와 pathlib으로 파일 시스템 작업</p>
<p>collections는 특수한 데이터 구조 제공</p>
</div>

이 Python 치트시트는 모던 Python 개발의 가장 필수적인 개념과 패턴을 다룹니다. 이러한 패턴을 연습하고 결합하여 강력하고 유지보수 가능한 애플리케이션을 구축하세요!