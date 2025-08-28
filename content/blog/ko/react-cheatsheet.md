---
title: "React 치트시트"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "동적인 사용자 인터페이스를 구축하기 위한 React의 기초, 컴포넌트, 훅, 모던 패턴에 대한 포괄적인 가이드입니다."
tags: ["React", "JavaScript", "프론트엔드", "웹 개발", "컴포넌트", "훅", "치트시트"]
author: "구시가미 순"
---

# React 치트시트

동적인 사용자 인터페이스를 구축하기 위한 React의 기초, 컴포넌트, 훅, 모던 패턴에 대한 포괄적인 가이드입니다.

## 컴포넌트와 JSX

```jsx
// 함수 컴포넌트
function Greeting({ name }) {
  return <h1>안녕하세요, {name}님!</h1>;
}

// 화살표 함수 컴포넌트
const Greeting = ({ name }) => {
  return <h1>안녕하세요, {name}님!</h1>;
};

// 여러 요소를 가진 컴포넌트
function UserCard({ user }) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 래퍼 div를 피하기 위한 Fragment
function App() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}

// 조건부 렌더링
function LoginButton({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <button>로그아웃</button>
      ) : (
        <button>로그인</button>
      )}
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>JSX 예제:</strong>
<p>JSX는 JavaScript에서 HTML과 같은 구문을 허용</p>
<p>컴포넌트는 단일 부모 요소나 Fragment를 반환해야 함</p>
<p>class 대신 className, onclick 대신 onClick 사용</p>
</div>

## useState 훅으로 상태 관리

```jsx
import { useState } from 'react';

// 기본 상태
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
      <button onClick={() => setCount(count - 1)}>감소</button>
      <button onClick={() => setCount(0)}>재설정</button>
    </div>
  );
}

// 객체 상태
function UserForm() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form>
      <input
        name="name"
        value={user.name}
        onChange={handleInputChange}
        placeholder="이름"
      />
      <input
        name="email"
        value={user.email}
        onChange={handleInputChange}
        placeholder="이메일"
      />
    </form>
  );
}

// 배열 상태
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos(prev => [...prev, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="할 일 추가"
      />
      <button onClick={addTodo}>추가</button>
      <ul>
        {todos.map(todo => (
          <li 
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>useState 예제:</strong></p>
<p>useState(0) → [0, setCount]</p>
<p>이전 상태에 의존하는 상태에는 항상 함수형 업데이트 사용</p>
<p>객체와 배열을 불변적으로 업데이트하려면 스프레드 연산자(...) 사용</p>
</div>

## useEffect 훅으로 부작용 처리

```jsx
import { useState, useEffect } from 'react';

// 기본 부작용 (매 렌더링 후 실행)
function DocumentTitle() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `카운트: ${count}`;
  });

  return (
    <button onClick={() => setCount(count + 1)}>
      클릭하세요 ({count})
    </button>
  );
}

// 의존성 배열이 있는 부작용
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('사용자 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]); // userId가 변경될 때만 재실행

  if (loading) return <div>로딩 중...</div>;
  if (!user) return <div>사용자를 찾을 수 없습니다</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// 정리 기능이 있는 부작용
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // 정리 함수
    return () => clearInterval(interval);
  }, []); // 빈 의존성 배열 = 마운트 시 한 번만 실행

  return <div>타이머: {seconds}초</div>;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>useEffect 예제:</strong></p>
<p>의존성 배열 없음: 매 렌더링 후 실행</p>
<p>빈 배열 []: 초기 렌더링 후 한 번만 실행</p>
<p>[값]: 값이 변경될 때 실행</p>
<p>메모리 누수 방지를 위해 정리 함수 반환</p>
</div>

## Props와 이벤트 처리

```jsx
// 구조 분해를 사용한 Props
function Button({ text, variant = 'primary', onClick, disabled = false }) {
  const className = `btn btn-${variant} ${disabled ? 'disabled' : ''}`;
  
  return (
    <button 
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

// 이벤트 처리 패턴
function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('폼 제출:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="이름"
        required
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="이메일"
        required
      />
      <button type="submit">제출</button>
    </form>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Props와 이벤트:</strong></p>
<p>더 깔끔한 props 접근을 위해 구조 분해 사용</p>
<p>폼 제출에서는 항상 preventDefault 사용</p>
<p>부모 컴포넌트로 데이터를 전달하려면 콜백 함수 사용</p>
</div>

## 커스텀 훅

```jsx
// useLocalStorage 훅
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('localStorage 읽기 오류:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('localStorage 설정 오류:', error);
    }
  };

  return [storedValue, setValue];
}

// useFetch 훅
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// 커스텀 훅 사용
function App() {
  const [name, setName] = useLocalStorage('username', '');
  const { data: users, loading, error } = useFetch('/api/users');

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름"
      />
      
      {loading && <p>사용자 로딩 중...</p>}
      {error && <p>오류: {error}</p>}
      {users && (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>커스텀 훅:</strong></p>
<p>컴포넌트 로직을 재사용 가능한 함수로 추출</p>
<p>"use"로 시작해야 하며 다른 훅을 호출할 수 있음</p>
<p>컴포넌트 간 상태적 로직 공유에 훌륭함</p>
</div>

이 React 치트시트는 모던 React 개발에서 가장 필수적인 개념과 패턴을 다룹니다. 이러한 패턴을 연습하고 결합하여 강력하고 상호작용적인 사용자 인터페이스를 구축하세요!