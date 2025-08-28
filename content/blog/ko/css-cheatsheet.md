---
title: "CSS 치트시트"
date: "2013-01-20"
excerpt: "웹 개발에 필수적인 CSS 속성과 기법들의 포괄적인 가이드입니다."
---

# CSS 치트시트

웹 개발에 필수적인 CSS 속성과 기법들의 포괄적인 가이드입니다.

## 기본 문법

```css
선택자 {
    속성: 값;
    다른속성: 다른값;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>미리보기:</strong> CSS는 선택자-속성-값 패턴을 따릅니다
</div>

## 선택자

```css
/* 요소 선택자 */
p {
    color: blue;
}

/* 클래스 선택자 */
.my-class {
    font-size: 16px;
}

/* ID 선택자 */
#my-id {
    background-color: yellow;
}

/* 속성 선택자 */
input[type="text"] {
    border: 1px solid gray;
}

/* 가상 클래스 */
a:hover {
    color: red;
}

/* 후손 선택자 */
div p {
    margin: 10px;
}

/* 자식 선택자 */
ul > li {
    list-style: none;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p style="color: blue;">요소 선택자 예제</p>
<p class="my-class" style="font-size: 16px;">클래스 선택자 예제</p>
<p id="my-id" style="background-color: yellow;">ID 선택자 예제</p>
</div>

## 텍스트와 폰트 속성

```css
.text-styles {
    font-family: "Noto Sans KR", Arial, sans-serif;
    font-size: 18px;
    font-weight: bold;
    font-style: italic;
    text-align: center;
    text-decoration: underline;
    text-transform: uppercase;
    line-height: 1.5;
    letter-spacing: 2px;
    color: #333;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; font-style: italic; text-align: center; text-decoration: underline; text-transform: uppercase; line-height: 1.5; letter-spacing: 2px; color: #333;">
    스타일 적용된 텍스트 예제
</div>
</div>

## 박스 모델

```css
.box-model {
    width: 200px;
    height: 100px;
    padding: 20px;
    border: 2px solid black;
    margin: 10px;
    background-color: lightblue;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="width: 200px; height: 100px; padding: 20px; border: 2px solid black; margin: 10px; background-color: lightblue;">
    박스 모델 예제
</div>
</div>

## 색상과 배경

```css
.color-examples {
    /* 색상 형식 */
    color: red;
    color: #ff0000;
    color: rgb(255, 0, 0);
    color: rgba(255, 0, 0, 0.5);
    color: hsl(0, 100%, 50%);
    
    /* 배경 속성 */
    background-color: lightgreen;
    background-image: url('image.jpg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="padding: 10px; background-color: lightgreen; color: red; margin: 5px;">연두색 배경에 빨간 텍스트</div>
<div style="padding: 10px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; margin: 5px;">그라데이션 배경</div>
</div>

## 레이아웃 - Flexbox

```css
.flex-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
}

.flex-item {
    flex: 1;
    flex-grow: 1;
    flex-shrink: 0;
    flex-basis: auto;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="display: flex; justify-content: center; align-items: center; gap: 10px; background-color: #e0e0e0; padding: 10px;">
    <div style="background-color: #ff6b6b; padding: 10px; color: white;">아이템 1</div>
    <div style="background-color: #4ecdc4; padding: 10px; color: white;">아이템 2</div>
    <div style="background-color: #45b7d1; padding: 10px; color: white;">아이템 3</div>
</div>
</div>

## 레이아웃 - Grid

```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 100px 200px;
    grid-gap: 10px;
    grid-template-areas: 
        "header header header"
        "sidebar main main";
}

.grid-item {
    background-color: lightcoral;
    padding: 20px;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 10px; background-color: #e0e0e0; padding: 10px;">
    <div style="background-color: lightcoral; padding: 10px;">그리드 아이템 1</div>
    <div style="background-color: lightcoral; padding: 10px;">그리드 아이템 2</div>
    <div style="background-color: lightcoral; padding: 10px;">그리드 아이템 3</div>
</div>
</div>

## 위치 지정

```css
.positioning {
    position: static;    /* 기본값 */
    position: relative;  /* 일반 위치에서 상대적 */
    position: absolute;  /* 위치 지정된 부모에서 절대적 */
    position: fixed;     /* 뷰포트에서 고정 */
    position: sticky;    /* 스티키 위치 지정 */
    
    top: 10px;
    right: 20px;
    bottom: 30px;
    left: 40px;
    z-index: 100;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9; position: relative; height: 120px;">
<div style="position: absolute; top: 10px; left: 10px; background-color: yellow; padding: 5px;">절대 위치</div>
<div style="position: relative; top: 50px; background-color: lightblue; padding: 5px; width: fit-content;">상대 위치</div>
</div>

## 테두리와 그림자

```css
.borders-shadows {
    border: 2px solid black;
    border-radius: 10px;
    border-top: 3px dashed red;
    border-right: 3px dotted blue;
    
    box-shadow: 5px 5px 10px rgba(0,0,0,0.3);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="border: 2px solid black; border-radius: 10px; box-shadow: 5px 5px 10px rgba(0,0,0,0.3); padding: 15px; background-color: white; margin: 10px;">
    <span style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">테두리, 그림자, 텍스트 그림자가 있는 박스</span>
</div>
</div>

## 변형과 애니메이션

```css
.transform {
    transform: rotate(45deg);
    transform: scale(1.2);
    transform: translate(50px, 100px);
    transform: skew(20deg, 10deg);
}

.animation {
    animation: slideIn 2s ease-in-out;
    transition: all 0.3s ease;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(-100px); }
    to { opacity: 1; transform: translateX(0); }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="background-color: #ff6b6b; padding: 10px; color: white; margin: 5px; transform: rotate(5deg); transition: transform 0.3s ease;" onmouseover="this.style.transform='rotate(0deg) scale(1.1)'" onmouseout="this.style.transform='rotate(5deg) scale(1)'">
    마우스 호버로 변형 효과
</div>
</div>

## 미디어 쿼리 (반응형 디자인)

```css
/* 모바일 우선 접근법 */
.responsive {
    width: 100%;
    padding: 10px;
}

/* 태블릿 스타일 */
@media screen and (min-width: 768px) {
    .responsive {
        width: 50%;
        padding: 20px;
    }
}

/* 데스크톱 스타일 */
@media screen and (min-width: 1024px) {
    .responsive {
        width: 33.33%;
        padding: 30px;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="background-color: #4ecdc4; padding: 15px; color: white; border-radius: 5px;">
    반응형 요소 (실제 구현에서 창 크기 조정으로 효과 확인)
</div>
</div>

## 자주 사용하는 CSS 유틸리티

```css
/* 표시 유틸리티 */
.show { display: block; }
.hide { display: none; }
.invisible { visibility: hidden; }

/* 텍스트 유틸리티 */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* 마진과 패딩 유틸리티 */
.m-0 { margin: 0; }
.p-2 { padding: 0.5rem; }
.mt-4 { margin-top: 1rem; }

/* 플로트 유틸리티 */
.float-left { float: left; }
.float-right { float: right; }
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="text-align: center; padding: 10px; background-color: #e0e0e0; margin-bottom: 5px;">중앙 정렬 텍스트</div>
<div style="text-align: left; padding: 10px; background-color: #f0f0f0; margin-bottom: 5px;">왼쪽 정렬</div>
<div style="text-align: right; padding: 10px; background-color: #e0e0e0;">오른쪽 정렬</div>
</div>

이 CSS 치트시트는 웹 스타일링에서 가장 필수적인 속성과 기법들을 다룹니다. 이러한 속성들을 연습해보며 CSS를 마스터하세요!