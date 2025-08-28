---
title: "React チートシート"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "動的なユーザーインターフェースを構築するためのReactの基礎、コンポーネント、フック、モダンパターンの包括的なガイドです。"
tags: ["React", "JavaScript", "フロントエンド", "Web開発", "コンポーネント", "フック", "チートシート"]
author: "串上 俊"
---

# React チートシート

動的なユーザーインターフェースを構築するためのReactの基礎、コンポーネント、フック、モダンパターンの包括的なガイドです。

## コンポーネントとJSX

```jsx
// ファンクションコンポーネント
function Greeting({ name }) {
  return <h1>こんにちは、{name}さん！</h1>;
}

// アロー関数コンポーネント
const Greeting = ({ name }) => {
  return <h1>こんにちは、{name}さん！</h1>;
};

// 複数の要素を持つコンポーネント
function UserCard({ user }) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// Fragmentでラッパーdivを回避
function App() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}

// 条件付きレンダリング
function LoginButton({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <button>ログアウト</button>
      ) : (
        <button>ログイン</button>
      )}
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>JSXの例:</strong>
<p>JSXはJavaScript内でHTMLのような構文を使用可能</p>
<p>コンポーネントは単一の親要素またはFragmentを返す必要あり</p>
<p>classの代わりにclassName、onclickの代わりにonClickを使用</p>
</div>

## useStateフックでの状態管理

```jsx
import { useState } from 'react';

// 基本的な状態
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>増加</button>
      <button onClick={() => setCount(count - 1)}>減少</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  );
}

// オブジェクト状態
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
        placeholder="名前"
      />
      <input
        name="email"
        value={user.email}
        onChange={handleInputChange}
        placeholder="メールアドレス"
      />
    </form>
  );
}

// 配列状態
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
        placeholder="TODO追加"
      />
      <button onClick={addTodo}>追加</button>
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
<p><strong>useStateの例:</strong></p>
<p>useState(0) → [0, setCount]</p>
<p>前の状態に依存する状態には常に関数型更新を使用</p>
<p>オブジェクトや配列を不変的に更新するにはスプレッド演算子(...)を使用</p>
</div>

## useEffectフックでの副作用

```jsx
import { useState, useEffect } from 'react';

// 基本的な副作用（毎回レンダリング後に実行）
function DocumentTitle() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `カウント: ${count}`;
  });

  return (
    <button onClick={() => setCount(count + 1)}>
      クリック ({count})
    </button>
  );
}

// 依存配列付きの副作用
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
        console.error('ユーザー取得に失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]); // userIdが変更されたときのみ再実行

  if (loading) return <div>読み込み中...</div>;
  if (!user) return <div>ユーザーが見つかりません</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// クリーンアップ付きの副作用
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // クリーンアップ関数
    return () => clearInterval(interval);
  }, []); // 空の依存配列 = マウント時に一度だけ実行

  return <div>タイマー: {seconds}秒</div>;
}

// 複数の副作用
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('接続中');

  // チャットルーム接続用の副作用
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:3001/${roomId}`);
    
    socket.onopen = () => setConnectionStatus('接続済み');
    socket.onclose = () => setConnectionStatus('切断');
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    return () => socket.close();
  }, [roomId]);

  // ドキュメントタイトル更新用の副作用
  useEffect(() => {
    document.title = `チャットルーム ${roomId} - ${connectionStatus}`;
  }, [roomId, connectionStatus]);

  return (
    <div>
      <p>ステータス: {connectionStatus}</p>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg.user}: {msg.text}</p>
        ))}
      </div>
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>useEffectの例:</strong></p>
<p>依存配列なし: 毎回のレンダリング後に実行</p>
<p>空配列[]: 初回レンダリング後に一度だけ実行</p>
<p>[値]: 値が変更されたときに実行</p>
<p>メモリリークを防ぐためにクリーンアップ関数を返す</p>
</div>

## Propsとイベントハンドリング

```jsx
// 分割代入を使ったProps
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

// PropTypesによるProps検証
import PropTypes from 'prop-types';

function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => onEdit(user.id)}>編集</button>
      <button onClick={() => onDelete(user.id)}>削除</button>
    </div>
  );
}

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

// イベントハンドリングのパターン
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
    console.log('フォーム送信:', formData);
    // フォーム送信処理
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="名前"
        required
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="メールアドレス"
        required
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="メッセージ"
        rows={4}
      />
      <button type="submit">送信</button>
      <button type="button" onClick={handleReset}>リセット</button>
    </form>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Propsとイベント:</strong></p>
<p>Propsアクセスには分割代入を使用してよりクリーンに</p>
<p>フォーム送信では常にpreventDefaultを使用</p>
<p>親コンポーネントにデータを渡すにはコールバック関数を使用</p>
</div>

## リストとキー

```jsx
// 基本的なリストレンダリング
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  );
}

// ネストしたコンポーネントを含む複雑なリスト
function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={(productId) => console.log('追加:', productId)}
        />
      ))}
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>¥{product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>
        カートに追加
      </button>
    </div>
  );
}

// リストのフィルタリングとソート
function BookLibrary() {
  const [books] = useState([
    { id: 1, title: 'Reactガイド', author: '田中太郎', year: 2021, genre: '技術書' },
    { id: 2, title: 'JavaScript基礎', author: '山田花子', year: 2020, genre: '技術書' },
    { id: 3, title: 'デザインパターン', author: '佐藤次郎', year: 2019, genre: '技術書' }
  ]);
  
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const filteredBooks = books
    .filter(book => 
      book.title.includes(filter) ||
      book.author.includes(filter)
    )
    .sort((a, b) => {
      if (sortBy === 'year') return b.year - a.year;
      return a[sortBy].localeCompare(b[sortBy], 'ja');
    });

  return (
    <div>
      <input
        type="text"
        placeholder="本を検索..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="title">タイトル順</option>
        <option value="author">著者順</option>
        <option value="year">年度順</option>
      </select>
      
      <div className="book-list">
        {filteredBooks.map(book => (
          <div key={book.id} className="book-item">
            <h3>{book.title}</h3>
            <p>{book.author}著 ({book.year}年)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>リストとキー:</strong></p>
<p>必ず一意で安定したキーを使用（インデックスよりIDを優先）</p>
<p>キーによりReactは変更されたアイテムを識別可能</p>
<p>パフォーマンス向上のため、レンダリング前にデータをフィルタ・ソート</p>
</div>

## カスタムフック

```jsx
// useLocalStorageフック
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('localStorage読み込みエラー:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('localStorage設定エラー:', error);
    }
  };

  return [storedValue, setValue];
}

// useFetchフック
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
          throw new Error(`HTTPエラー! ステータス: ${response.status}`);
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

// useToggleフック
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return [value, { toggle, setTrue, setFalse }];
}

// カスタムフックの使用
function App() {
  const [name, setName] = useLocalStorage('username', '');
  const { data: users, loading, error } = useFetch('/api/users');
  const [isVisible, { toggle, setFalse }] = useToggle(false);

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="お名前"
      />
      
      <button onClick={toggle}>
        {isVisible ? '非表示' : '表示'} ユーザー一覧
      </button>
      
      {isVisible && (
        <div>
          {loading && <p>ユーザー読み込み中...</p>}
          {error && <p>エラー: {error}</p>}
          {users && (
            <ul>
              {users.map(user => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>カスタムフック:</strong></p>
<p>コンポーネントロジックを再利用可能な関数に抽出</p>
<p>"use"で始まり、他のフックを呼び出し可能</p>
<p>コンポーネント間でステートフルロジックを共有するのに最適</p>
</div>

## Context API

```jsx
import { createContext, useContext, useReducer } from 'react';

// テーマコンテキスト
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
    throw new Error('useThemeはThemeProvider内で使用する必要があります');
  }
  return context;
}

// useReducerを使った認証コンテキスト
const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false
  });

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const user = await response.json();
      dispatch({ type: 'LOGIN', payload: user });
    } catch (error) {
      console.error('ログインに失敗:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthはAuthProvider内で使用する必要があります');
  }
  return context;
}

// コンテキストの使用
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Header />
        <Main />
      </AuthProvider>
    </ThemeProvider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className={theme}>
      <button onClick={toggleTheme}>
        {theme === 'light' ? 'ダーク' : 'ライト'}モードに切り替え
      </button>
      
      {isAuthenticated ? (
        <div>
          <span>ようこそ、{user.name}さん！</span>
          <button onClick={logout}>ログアウト</button>
        </div>
      ) : (
        <LoginForm />
      )}
    </header>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Context API:</strong></p>
<p>プロップスドリリングを避け、コンポーネントツリー全体で状態を共有</p>
<p>シンプルな状態にはcreateContext() + useContext()を使用</p>
<p>複雑な状態管理にはuseReducerと組み合わせ</p>
<p>より良い開発体験のためにカスタムフックを作成</p>
</div>

## パフォーマンス最適化

```jsx
import { memo, useMemo, useCallback } from 'react';

// 不要な再レンダリングを防ぐReact.memo
const ExpensiveComponent = memo(function ExpensiveComponent({ data, onUpdate }) {
  console.log('ExpensiveComponentがレンダリングされました');
  
  return (
    <div>
      <h3>コストの高いコンポーネント</h3>
      <p>{data.title}</p>
      <button onClick={() => onUpdate(data.id)}>更新</button>
    </div>
  );
});

// 高コストな計算にuseMemo
function ProductList({ products, filter }) {
  const filteredProducts = useMemo(() => {
    console.log('商品をフィルタリング中...');
    return products.filter(product => 
      product.name.includes(filter)
    );
  }, [products, filter]);

  const totalPrice = useMemo(() => {
    console.log('合計金額を計算中...');
    return filteredProducts.reduce((sum, product) => sum + product.price, 0);
  }, [filteredProducts]);

  return (
    <div>
      <p>合計: ¥{totalPrice}</p>
      {filteredProducts.map(product => (
        <div key={product.id}>{product.name} - ¥{product.price}</div>
      ))}
    </div>
  );
}

// 安定した関数参照にuseCallback
function TodoApp() {
  const [todos, setTodos] = useState([]);

  // useCallbackなしでは、この関数は毎回レンダリング時に再作成され
  // 子コンポーネントが不要に再レンダリングされる
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  return (
    <div>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }) {
  console.log(`TodoItem ${todo.id}がレンダリングされました`);
  
  return (
    <div>
      <span 
        onClick={() => onToggle(todo.id)}
        style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
      >
        {todo.text}
      </span>
      <button onClick={() => onDelete(todo.id)}>削除</button>
    </div>
  );
});
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>パフォーマンスのコツ:</strong></p>
<p>頻繁に再レンダリングされるコンポーネントにはReact.memo()を使用</p>
<p>高コストな計算にはuseMemo()を使用</p>
<p>Propsで渡す関数の参照を安定させるにはuseCallback()を使用</p>
<p>ボトルネックを特定するためにReact DevToolsでプロファイリング</p>
</div>

このReactチートシートは、モダンなReact開発における最も重要な概念とパターンを網羅しています。これらのパターンを練習し、組み合わせて強力でインタラクティブなユーザーインターフェースを構築しましょう！