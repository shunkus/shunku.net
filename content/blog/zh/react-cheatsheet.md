---
title: "React 备忘单"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "用于构建动态用户界面的React基础、组件、Hook和现代模式的综合指南。"
tags: ["React", "JavaScript", "前端", "Web开发", "组件", "Hook", "备忘单"]
author: "串上俊"
---

# React 备忘单

用于构建动态用户界面的React基础、组件、Hook和现代模式的综合指南。

## 组件和JSX

```jsx
// 函数组件
function Greeting({ name }) {
  return <h1>你好，{name}！</h1>;
}

// 箭头函数组件
const Greeting = ({ name }) => {
  return <h1>你好，{name}！</h1>;
};

// 有多个元素的组件
function UserCard({ user }) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 使用Fragment避免包装div
function App() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}

// 条件渲染
function LoginButton({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <button>退出登录</button>
      ) : (
        <button>登录</button>
      )}
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>JSX示例:</strong>
<p>JSX允许在JavaScript中使用类似HTML的语法</p>
<p>组件必须返回单个父元素或Fragment</p>
<p>使用className而不是class，onClick而不是onclick</p>
</div>

## 使用useState Hook管理状态

```jsx
import { useState } from 'react';

// 基本状态
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}

// 对象状态
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
        placeholder="姓名"
      />
      <input
        name="email"
        value={user.email}
        onChange={handleInputChange}
        placeholder="邮箱"
      />
    </form>
  );
}

// 数组状态
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
        placeholder="添加待办事项"
      />
      <button onClick={addTodo}>添加</button>
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
<p><strong>useState示例:</strong></p>
<p>useState(0) → [0, setCount]</p>
<p>对于依赖前一个状态的状态更新，总是使用函数式更新</p>
<p>使用展开运算符(...)来不可变地更新对象和数组</p>
</div>

## 使用useEffect Hook处理副作用

```jsx
import { useState, useEffect } from 'react';

// 基本副作用（每次渲染后都运行）
function DocumentTitle() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `计数: ${count}`;
  });

  return (
    <button onClick={() => setCount(count + 1)}>
      点击我 ({count})
    </button>
  );
}

// 带依赖数组的副作用
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
        console.error('获取用户失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]); // 只在userId改变时重新运行

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>未找到用户</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// 带清理的副作用
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // 清理函数
    return () => clearInterval(interval);
  }, []); // 空依赖数组 = 挂载时只运行一次

  return <div>计时器: {seconds}秒</div>;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>useEffect示例:</strong></p>
<p>无依赖数组: 每次渲染后运行</p>
<p>空数组[]: 初始渲染后只运行一次</p>
<p>[值]: 当值改变时运行</p>
<p>返回清理函数以防止内存泄漏</p>
</div>

## Props和事件处理

```jsx
// 使用解构的Props
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

// 事件处理模式
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
    console.log('表单提交:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="姓名"
        required
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="邮箱"
        required
      />
      <button type="submit">提交</button>
    </form>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Props和事件:</strong></p>
<p>使用解构来更清洁地访问props</p>
<p>表单提交时总是使用preventDefault</p>
<p>使用回调函数将数据传递给父组件</p>
</div>

## 自定义Hook

```jsx
// useLocalStorage Hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('localStorage读取错误:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('localStorage设置错误:', error);
    }
  };

  return [storedValue, setValue];
}

// useFetch Hook
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
          throw new Error(`HTTP错误! 状态: ${response.status}`);
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

// 使用自定义Hook
function App() {
  const [name, setName] = useLocalStorage('username', '');
  const { data: users, loading, error } = useFetch('/api/users');

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="您的姓名"
      />
      
      {loading && <p>加载用户中...</p>}
      {error && <p>错误: {error}</p>}
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
<p><strong>自定义Hook:</strong></p>
<p>将组件逻辑提取到可重用的函数中</p>
<p>必须以"use"开头并且可以调用其他Hook</p>
<p>适合在组件间共享有状态的逻辑</p>
</div>

## Context API

```jsx
import { createContext, useContext, useReducer } from 'react';

// 主题Context
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内使用');
  }
  return context;
}

// 使用Context
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
    </ThemeProvider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={theme}>
      <button onClick={toggleTheme}>
        切换到{theme === 'light' ? '深色' : '浅色'}模式
      </button>
    </header>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Context API:</strong></p>
<p>避免prop drilling，在组件树中共享状态</p>
<p>简单状态使用createContext() + useContext()</p>
<p>复杂状态管理与useReducer结合使用</p>
<p>创建自定义Hook以获得更好的开发体验</p>
</div>

这个React备忘单涵盖了现代React开发中最重要的概念和模式。练习这些模式并将它们结合起来，构建强大的交互式用户界面！