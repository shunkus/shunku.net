---
title: "React Cheatsheet"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "A comprehensive guide to React fundamentals, components, hooks, and modern patterns for building dynamic user interfaces."
tags: ["React", "JavaScript", "Frontend", "Web Development", "Component", "Hooks", "Cheatsheet"]
author: "Shun Kushigami"
---

# React Cheatsheet

A comprehensive guide to React fundamentals, components, hooks, and modern patterns for building dynamic user interfaces.

## Components and JSX

```jsx
// Function Component
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Arrow Function Component
const Greeting = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};

// Component with multiple elements
function UserCard({ user }) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// Fragment to avoid wrapper div
function App() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}

// Conditional rendering
function LoginButton({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <button>Logout</button>
      ) : (
        <button>Login</button>
      )}
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>JSX Example:</strong>
<p>JSX allows HTML-like syntax in JavaScript</p>
<p>Components must return a single parent element or Fragment</p>
<p>Use className instead of class, onClick instead of onclick</p>
</div>

## State with useState Hook

```jsx
import { useState } from 'react';

// Basic state
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Object state
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
        placeholder="Name"
      />
      <input
        name="email"
        value={user.email}
        onChange={handleInputChange}
        placeholder="Email"
      />
    </form>
  );
}

// Array state
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
        placeholder="Add todo"
      />
      <button onClick={addTodo}>Add</button>
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
<p><strong>useState Examples:</strong></p>
<p>useState(0) → [0, setCount]</p>
<p>Always use functional updates for state that depends on previous state</p>
<p>Spread operator (...) for updating objects and arrays immutably</p>
</div>

## Effects with useEffect Hook

```jsx
import { useState, useEffect } from 'react';

// Basic effect (runs after every render)
function DocumentTitle() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  });

  return (
    <button onClick={() => setCount(count + 1)}>
      Click me ({count})
    </button>
  );
}

// Effect with dependency array
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
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]); // Only re-run when userId changes

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Effect with cleanup
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Cleanup function
    return () => clearInterval(interval);
  }, []); // Empty dependency array = run once on mount

  return <div>Timer: {seconds}s</div>;
}

// Multiple effects
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Effect for connecting to chat room
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:3001/${roomId}`);
    
    socket.onopen = () => setConnectionStatus('connected');
    socket.onclose = () => setConnectionStatus('disconnected');
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    return () => socket.close();
  }, [roomId]);

  // Effect for updating document title
  useEffect(() => {
    document.title = `Chat Room ${roomId} - ${connectionStatus}`;
  }, [roomId, connectionStatus]);

  return (
    <div>
      <p>Status: {connectionStatus}</p>
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
<p><strong>useEffect Examples:</strong></p>
<p>No dependency array: runs after every render</p>
<p>Empty array []: runs once after initial render</p>
<p>[value]: runs when value changes</p>
<p>Return cleanup function to prevent memory leaks</p>
</div>

## Props and Event Handling

```jsx
// Props with destructuring
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

// Props validation with PropTypes
import PropTypes from 'prop-types';

function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => onEdit(user.id)}>Edit</button>
      <button onClick={() => onDelete(user.id)}>Delete</button>
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

// Event handling patterns
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
    console.log('Form submitted:', formData);
    // Handle form submission
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
        placeholder="Name"
        required
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message"
        rows={4}
      />
      <button type="submit">Submit</button>
      <button type="button" onClick={handleReset}>Reset</button>
    </form>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Props and Events:</strong></p>
<p>Use destructuring for cleaner prop access</p>
<p>Always prevent default for form submissions</p>
<p>Use callback functions to pass data up to parent components</p>
</div>

## Lists and Keys

```jsx
// Basic list rendering
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

// Complex list with nested components
function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={(productId) => console.log('Added:', productId)}
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
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>
        Add to Cart
      </button>
    </div>
  );
}

// Filtering and sorting lists
function BookLibrary() {
  const [books] = useState([
    { id: 1, title: 'React Guide', author: 'John Doe', year: 2021, genre: 'Tech' },
    { id: 2, title: 'JavaScript Basics', author: 'Jane Smith', year: 2020, genre: 'Tech' },
    { id: 3, title: 'Design Patterns', author: 'Bob Johnson', year: 2019, genre: 'Tech' }
  ]);
  
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const filteredBooks = books
    .filter(book => 
      book.title.toLowerCase().includes(filter.toLowerCase()) ||
      book.author.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'year') return b.year - a.year;
      return a[sortBy].localeCompare(b[sortBy]);
    });

  return (
    <div>
      <input
        type="text"
        placeholder="Filter books..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="title">Sort by Title</option>
        <option value="author">Sort by Author</option>
        <option value="year">Sort by Year</option>
      </select>
      
      <div className="book-list">
        {filteredBooks.map(book => (
          <div key={book.id} className="book-item">
            <h3>{book.title}</h3>
            <p>by {book.author} ({book.year})</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Lists and Keys:</strong></p>
<p>Always use unique, stable keys (prefer ID over index)</p>
<p>Keys help React identify which items have changed</p>
<p>Filter and sort data before rendering for better performance</p>
</div>

## Custom Hooks

```jsx
// useLocalStorage hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

// useFetch hook
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
          throw new Error(`HTTP error! status: ${response.status}`);
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

// useToggle hook
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return [value, { toggle, setTrue, setFalse }];
}

// Using custom hooks
function App() {
  const [name, setName] = useLocalStorage('username', '');
  const { data: users, loading, error } = useFetch('/api/users');
  const [isVisible, { toggle, setFalse }] = useToggle(false);

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />
      
      <button onClick={toggle}>
        {isVisible ? 'Hide' : 'Show'} Users
      </button>
      
      {isVisible && (
        <div>
          {loading && <p>Loading users...</p>}
          {error && <p>Error: {error}</p>}
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
<p><strong>Custom Hooks:</strong></p>
<p>Extract component logic into reusable functions</p>
<p>Must start with "use" and can call other hooks</p>
<p>Great for sharing stateful logic between components</p>
</div>

## Context API

```jsx
import { createContext, useContext, useReducer } from 'react';

// Theme Context
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
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Auth Context with useReducer
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
      console.error('Login failed:', error);
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Using Context
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
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
      
      {isAuthenticated ? (
        <div>
          <span>Welcome, {user.name}!</span>
          <button onClick={logout}>Logout</button>
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
<p>Avoid prop drilling by sharing state across component tree</p>
<p>Use createContext() + useContext() for simple state</p>
<p>Combine with useReducer for complex state management</p>
<p>Create custom hooks for better developer experience</p>
</div>

## Performance Optimization

```jsx
import { memo, useMemo, useCallback } from 'react';

// React.memo for preventing unnecessary re-renders
const ExpensiveComponent = memo(function ExpensiveComponent({ data, onUpdate }) {
  console.log('ExpensiveComponent rendered');
  
  return (
    <div>
      <h3>Expensive Component</h3>
      <p>{data.title}</p>
      <button onClick={() => onUpdate(data.id)}>Update</button>
    </div>
  );
});

// useMemo for expensive calculations
function ProductList({ products, filter }) {
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...');
    return products.filter(product => 
      product.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [products, filter]);

  const totalPrice = useMemo(() => {
    console.log('Calculating total price...');
    return filteredProducts.reduce((sum, product) => sum + product.price, 0);
  }, [filteredProducts]);

  return (
    <div>
      <p>Total: ${totalPrice}</p>
      {filteredProducts.map(product => (
        <div key={product.id}>{product.name} - ${product.price}</div>
      ))}
    </div>
  );
}

// useCallback for stable function references
function TodoApp() {
  const [todos, setTodos] = useState([]);

  // Without useCallback, this function is recreated on every render
  // causing child components to re-render unnecessarily
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
  console.log(`TodoItem ${todo.id} rendered`);
  
  return (
    <div>
      <span 
        onClick={() => onToggle(todo.id)}
        style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
      >
        {todo.text}
      </span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
});
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Performance Tips:</strong></p>
<p>Use React.memo() for components that re-render frequently</p>
<p>useMemo() for expensive calculations</p>
<p>useCallback() for stable function references in props</p>
<p>Profile your app with React DevTools to identify bottlenecks</p>
</div>

This React cheatsheet covers the most essential concepts and patterns for modern React development. Practice these patterns and combine them to build powerful, interactive user interfaces!