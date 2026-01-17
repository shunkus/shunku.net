---
title: "React Custom Hooks: Patterns and Best Practices"
date: "2026-01-02"
excerpt: "Learn how to create reusable custom hooks in React to share logic between components while following best practices."
tags: ["React", "Hooks", "JavaScript"]
author: "Shunku"
---

Custom hooks are one of React's most powerful features for code reuse. They let you extract component logic into reusable functions, making your code cleaner and more maintainable.

## What is a Custom Hook?

A custom hook is simply a JavaScript function that:
1. Starts with the word `use`
2. Can call other hooks

```jsx
// This is a custom hook
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

// Usage in components
function Component() {
  const width = useWindowWidth();
  return <div>Window width: {width}</div>;
}
```

```mermaid
flowchart LR
    A[Custom Hook] --> B[Component A]
    A --> C[Component B]
    A --> D[Component C]

    style A fill:#3b82f6,color:#fff
```

Each component gets its own independent copy of the hook's state.

## Why Create Custom Hooks?

### 1. Share Logic, Not State

Custom hooks share **logic**, but each component using the hook gets its own **state**:

```jsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}

function ComponentA() {
  const { count, increment } = useCounter(0);
  // count is independent from ComponentB
  return <button onClick={increment}>{count}</button>;
}

function ComponentB() {
  const { count, increment } = useCounter(100);
  // count is independent from ComponentA
  return <button onClick={increment}>{count}</button>;
}
```

### 2. Separate Concerns

Extract complex logic from components:

```jsx
// Before: Logic mixed with UI
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <Error error={error} />;
  return <Profile user={user} />;
}

// After: Logic extracted to custom hook
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}

function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);

  if (loading) return <Spinner />;
  if (error) return <Error error={error} />;
  return <Profile user={user} />;
}
```

## Common Custom Hook Patterns

### 1. useLocalStorage

Persist state to localStorage:

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  );
}
```

### 2. useFetch

Generic data fetching hook:

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    setLoading(true);
    setError(null);

    fetch(url, { signal: abortController.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      })
      .finally(() => setLoading(false));

    return () => abortController.abort();
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### 3. useDebounce

Debounce a value:

```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      // Only fires 300ms after user stops typing
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### 4. useToggle

Simple boolean state management:

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// Usage
function Modal() {
  const { value: isOpen, toggle, setFalse: close } = useToggle();

  return (
    <>
      <button onClick={toggle}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <button onClick={close}>Close</button>
        </div>
      )}
    </>
  );
}
```

### 5. usePrevious

Track the previous value:

```jsx
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}, Previous: {prevCount}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

### 6. useMediaQuery

Respond to CSS media queries:

```jsx
function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Usage
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

## Best Practices

### 1. Always Start with "use"

The `use` prefix is required for React to recognize it as a hook and apply the Rules of Hooks:

```jsx
// Good
function useAuth() { }
function useFormValidation() { }

// Bad - React won't enforce hook rules
function getAuth() { }
function formValidation() { }
```

### 2. Return What's Needed

Return only what consumers need:

```jsx
// Good - Return only necessary values
function useCounter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(c => c + 1);
  return { count, increment };
}

// Avoid - Exposing too much internal state
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, setCount }; // setCount is too low-level
}
```

### 3. Use Consistent Return Formats

Choose a format and stick with it:

```jsx
// Array format - Good for positional destructuring
function useToggle(initial) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(v => !v);
  return [value, toggle]; // Like useState
}
const [isOpen, toggleOpen] = useToggle(false);

// Object format - Good for named values
function useUser(id) {
  // ...
  return { user, loading, error }; // Named properties
}
const { user, loading } = useUser(123);
```

### 4. Handle Cleanup

Always clean up subscriptions and timers:

```jsx
function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (e) => savedHandler.current(e);
    element.addEventListener(eventName, eventListener);
    return () => element.removeEventListener(eventName, eventListener);
  }, [eventName, element]);
}
```

### 5. Document Your Hooks

```jsx
/**
 * Debounces a value by the specified delay.
 * @param {T} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {T} - The debounced value
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 */
function useDebounce(value, delay) {
  // ...
}
```

## Testing Custom Hooks

Use `@testing-library/react-hooks` or `renderHook` from `@testing-library/react`:

```jsx
import { renderHook, act } from '@testing-library/react';

test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

## Summary

- Custom hooks extract reusable logic from components
- Each component gets its own state from the hook
- Name hooks starting with `use`
- Return only what consumers need
- Always clean up side effects
- Common patterns: useLocalStorage, useFetch, useDebounce, useToggle
- Test hooks using `renderHook`

Custom hooks are the key to writing clean, reusable React code. They let you share logic without sharing state, making your components simpler and more focused on rendering UI.

## References

- [React Documentation: Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- Barklund, Morten. *React in Depth*. Manning Publications, 2024.
- [usehooks.com](https://usehooks.com/) - Collection of React hooks
