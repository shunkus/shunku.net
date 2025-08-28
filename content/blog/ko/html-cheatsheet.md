---
title: "HTML 치트시트"
date: "2012-03-15"
excerpt: "웹 개발에 필수적인 HTML 요소들의 포괄적인 가이드입니다."
---

# HTML 치트시트

웹 개발에 필수적인 HTML 요소들의 포괄적인 가이드입니다.

## 기본 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>페이지 제목</title>
</head>
<body>
    <!-- 내용이 여기에 들어갑니다 -->
</body>
</html>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>미리보기:</strong> 기본 HTML 문서 구조
</div>

## 제목 태그

```html
<h1>메인 제목</h1>
<h2>섹션 제목</h2>
<h3>서브섹션 제목</h3>
<h4>4단계 제목</h4>
<h5>5단계 제목</h5>
<h6>6단계 제목</h6>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<h1>메인 제목</h1>
<h2>섹션 제목</h2>
<h3>서브섹션 제목</h3>
<h4>4단계 제목</h4>
<h5>5단계 제목</h5>
<h6>6단계 제목</h6>
</div>

## 문단과 텍스트

```html
<p>이것은 문단입니다.</p>
<br>
<strong>굵은 텍스트</strong>
<em>기울임체 텍스트</em>
<u>밑줄 텍스트</u>
<mark>하이라이트된 텍스트</mark>
<small>작은 텍스트</small>
<del>삭제된 텍스트</del>
<ins>삽입된 텍스트</ins>
<sub>아래첨자</sub>
<sup>위첨자</sup>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p>이것은 문단입니다.</p>
<br>
<strong>굵은 텍스트</strong><br>
<em>기울임체 텍스트</em><br>
<u>밑줄 텍스트</u><br>
<mark>하이라이트된 텍스트</mark><br>
<small>작은 텍스트</small><br>
<del>삭제된 텍스트</del><br>
<ins>삽입된 텍스트</ins><br>
H<sub>2</sub>O<br>
X<sup>2</sup>
</div>

## 링크

```html
<a href="https://example.com">외부 링크</a>
<a href="mailto:someone@example.com">이메일 링크</a>
<a href="tel:+1234567890">전화번호 링크</a>
<a href="#section1">내부 앵커 링크</a>
<a href="https://example.com" target="_blank">새 탭에서 열기</a>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<a href="https://example.com">외부 링크</a><br>
<a href="mailto:someone@example.com">이메일 링크</a><br>
<a href="tel:+1234567890">전화번호 링크</a><br>
<a href="#section1">내부 앵커 링크</a><br>
<a href="https://example.com" target="_blank">새 탭에서 열기</a>
</div>

## 목록

```html
<!-- 순서 없는 목록 -->
<ul>
    <li>첫 번째 항목</li>
    <li>두 번째 항목</li>
    <li>세 번째 항목</li>
</ul>

<!-- 순서 있는 목록 -->
<ol>
    <li>첫 번째</li>
    <li>두 번째</li>
    <li>세 번째</li>
</ol>

<!-- 정의 목록 -->
<dl>
    <dt>HTML</dt>
    <dd>하이퍼텍스트 마크업 언어</dd>
    <dt>CSS</dt>
    <dd>캐스케이딩 스타일 시트</dd>
</dl>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<ul>
    <li>첫 번째 항목</li>
    <li>두 번째 항목</li>
    <li>세 번째 항목</li>
</ul>

<ol>
    <li>첫 번째</li>
    <li>두 번째</li>
    <li>세 번째</li>
</ol>

<dl>
    <dt>HTML</dt>
    <dd>하이퍼텍스트 마크업 언어</dd>
    <dt>CSS</dt>
    <dd>캐스케이딩 스타일 시트</dd>
</dl>
</div>

## 이미지

```html
<img src="image.jpg" alt="이미지 설명" width="300" height="200">
<img src="image.jpg" alt="반응형 이미지" style="max-width: 100%; height: auto;">
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<img src="https://via.placeholder.com/300x200" alt="예시 이미지" style="max-width: 100%; height: auto;">
</div>

## 표

```html
<table border="1">
    <thead>
        <tr>
            <th>이름</th>
            <th>나이</th>
            <th>도시</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>김철수</td>
            <td>25</td>
            <td>서울</td>
        </tr>
        <tr>
            <td>이영희</td>
            <td>30</td>
            <td>부산</td>
        </tr>
    </tbody>
</table>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<table border="1" style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th style="padding: 8px; background-color: #f0f0f0;">이름</th>
            <th style="padding: 8px; background-color: #f0f0f0;">나이</th>
            <th style="padding: 8px; background-color: #f0f0f0;">도시</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 8px;">김철수</td>
            <td style="padding: 8px;">25</td>
            <td style="padding: 8px;">서울</td>
        </tr>
        <tr>
            <td style="padding: 8px;">이영희</td>
            <td style="padding: 8px;">30</td>
            <td style="padding: 8px;">부산</td>
        </tr>
    </tbody>
</table>
</div>

## 폼 요소

```html
<form>
    <label for="name">이름:</label>
    <input type="text" id="name" name="name" placeholder="이름을 입력하세요">
    
    <label for="email">이메일:</label>
    <input type="email" id="email" name="email">
    
    <label for="password">비밀번호:</label>
    <input type="password" id="password" name="password">
    
    <label for="age">나이:</label>
    <input type="number" id="age" name="age" min="1" max="120">
    
    <label for="message">메시지:</label>
    <textarea id="message" name="message" rows="4" cols="50"></textarea>
    
    <label for="country">국가:</label>
    <select id="country" name="country">
        <option value="kr">한국</option>
        <option value="us">미국</option>
        <option value="jp">일본</option>
    </select>
    
    <input type="checkbox" id="subscribe" name="subscribe">
    <label for="subscribe">뉴스레터 구독</label>
    
    <input type="radio" id="male" name="gender" value="male">
    <label for="male">남성</label>
    <input type="radio" id="female" name="gender" value="female">
    <label for="female">여성</label>
    
    <button type="submit">제출</button>
    <button type="reset">재설정</button>
</form>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<form>
    <div style="margin: 5px 0;">
        <label for="name">이름:</label><br>
        <input type="text" id="name" name="name" placeholder="이름을 입력하세요" style="margin-top: 2px;">
    </div>
    
    <div style="margin: 5px 0;">
        <label for="email">이메일:</label><br>
        <input type="email" id="email" name="email" style="margin-top: 2px;">
    </div>
    
    <div style="margin: 5px 0;">
        <label for="message">메시지:</label><br>
        <textarea id="message" name="message" rows="3" cols="30" style="margin-top: 2px;"></textarea>
    </div>
    
    <div style="margin: 5px 0;">
        <label for="country">국가:</label><br>
        <select id="country" name="country" style="margin-top: 2px;">
            <option value="kr">한국</option>
            <option value="us">미국</option>
            <option value="jp">일본</option>
        </select>
    </div>
    
    <div style="margin: 5px 0;">
        <input type="checkbox" id="subscribe" name="subscribe">
        <label for="subscribe">뉴스레터 구독</label>
    </div>
    
    <div style="margin: 5px 0;">
        <input type="radio" id="male" name="gender" value="male">
        <label for="male">남성</label>
        <input type="radio" id="female" name="gender" value="female">
        <label for="female">여성</label>
    </div>
    
    <div style="margin: 10px 0;">
        <button type="button">제출</button>
        <button type="button">재설정</button>
    </div>
</form>
</div>

## 의미론적 요소

```html
<header>웹사이트 헤더</header>
<nav>내비게이션</nav>
<main>메인 콘텐츠</main>
<section>섹션</section>
<article>기사 또는 독립적인 콘텐츠</article>
<aside>사이드바 또는 부가 정보</aside>
<footer>웹사이트 푸터</footer>
<figure>
    <img src="image.jpg" alt="설명">
    <figcaption>이미지 캡션</figcaption>
</figure>
<details>
    <summary>클릭하여 펼치기</summary>
    <p>숨겨진 내용이 여기에 표시됩니다.</p>
</details>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<header style="background-color: #e0e0e0; padding: 10px;">웹사이트 헤더</header>
<nav style="background-color: #d0d0d0; padding: 10px;">내비게이션</nav>
<main style="background-color: #f0f0f0; padding: 10px;">메인 콘텐츠</main>
<section style="background-color: #e5e5e5; padding: 10px;">섹션</section>
<article style="background-color: #f5f5f5; padding: 10px;">기사 또는 독립적인 콘텐츠</article>
<aside style="background-color: #e8e8e8; padding: 10px;">사이드바 또는 부가 정보</aside>
<footer style="background-color: #e0e0e0; padding: 10px;">웹사이트 푸터</footer>
<details style="margin: 10px 0;">
    <summary>클릭하여 펼치기</summary>
    <p>숨겨진 내용이 여기에 표시됩니다.</p>
</details>
</div>

## 멀티미디어

```html
<!-- 비디오 -->
<video controls width="300">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    브라우저에서 비디오를 지원하지 않습니다.
</video>

<!-- 오디오 -->
<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
    브라우저에서 오디오를 지원하지 않습니다.
</audio>

<!-- 임베드 -->
<iframe src="https://www.example.com" width="300" height="200"></iframe>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<video controls width="300" style="background-color: #000;">
    <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
    브라우저에서 비디오를 지원하지 않습니다.
</video>
<br><br>
<audio controls>
    <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg">
    브라우저에서 오디오를 지원하지 않습니다.
</audio>
</div>

이 치트시트는 웹 개발에서 가장 자주 사용되는 HTML 요소들을 다룹니다. 각 요소를 실제로 사용해보며 웹 개발 실력을 향상시켜보세요!