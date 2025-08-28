---
title: "Guía de React"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "Una guía completa de los fundamentos de React, componentes, hooks y patrones modernos para construir interfaces de usuario dinámicas."
tags: ["React", "JavaScript", "Frontend", "Desarrollo web", "Componentes", "Hooks", "Guía"]
author: "Shun Kushigami"
---

# Guía de React

Una guía completa de los fundamentos de React, componentes, hooks y patrones modernos para construir interfaces de usuario dinámicas.

## Componentes y JSX

```jsx
// Componente de función
function Greeting({ name }) {
  return <h1>¡Hola, {name}!</h1>;
}

// Componente de función flecha
const Greeting = ({ name }) => {
  return <h1>¡Hola, {name}!</h1>;
};

// Componente con múltiples elementos
function UserCard({ user }) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// Usar Fragment para evitar divs innecesarios
function App() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}

// Renderizado condicional
function LoginButton({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <button>Cerrar sesión</button>
      ) : (
        <button>Iniciar sesión</button>
      )}
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Ejemplo JSX:</strong>
<p>JSX permite sintaxis tipo HTML en JavaScript</p>
<p>Los componentes deben devolver un elemento padre único o Fragment</p>
<p>Usar className en lugar de class, onClick en lugar de onclick</p>
</div>

## Gestión de Estado con Hook useState

```jsx
import { useState } from 'react';

// Estado básico
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Contador: {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
      <button onClick={() => setCount(count - 1)}>Decrementar</button>
      <button onClick={() => setCount(0)}>Reiniciar</button>
    </div>
  );
}

// Estado de objeto
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
        placeholder="Nombre"
      />
      <input
        name="email"
        value={user.email}
        onChange={handleInputChange}
        placeholder="Correo electrónico"
      />
    </form>
  );
}

// Estado de array
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
        placeholder="Agregar tarea"
      />
      <button onClick={addTodo}>Agregar</button>
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
<p><strong>Ejemplo useState:</strong></p>
<p>useState(0) → [0, setCount]</p>
<p>Para estados que dependen del estado anterior, siempre usa actualizaciones funcionales</p>
<p>Usa el operador spread (...) para actualizar objetos y arrays de forma inmutable</p>
</div>

## Manejo de Efectos Secundarios con Hook useEffect

```jsx
import { useState, useEffect } from 'react';

// Efecto básico (se ejecuta después de cada renderizado)
function DocumentTitle() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Contador: ${count}`;
  });

  return (
    <button onClick={() => setCount(count + 1)}>
      Haz clic ({count})
    </button>
  );
}

// Efecto con array de dependencias
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
        console.error('Error al obtener usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]); // Solo se re-ejecuta cuando cambia userId

  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>Usuario no encontrado</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Efecto con limpieza
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Función de limpieza
    return () => clearInterval(interval);
  }, []); // Array de dependencias vacío = ejecutar solo una vez al montar

  return <div>Temporizador: {seconds} segundos</div>;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplo useEffect:</strong></p>
<p>Sin array de dependencias: se ejecuta después de cada renderizado</p>
<p>Array vacío []: se ejecuta solo una vez después del renderizado inicial</p>
<p>[value]: se ejecuta cuando value cambia</p>
<p>Devuelve una función de limpieza para evitar memory leaks</p>
</div>

## Props y Manejo de Eventos

```jsx
// Props con desestructuración
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

// Patrones de manejo de eventos
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
    console.log('Formulario enviado:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nombre"
        required
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Correo electrónico"
        required
      />
      <button type="submit">Enviar</button>
    </form>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Props y eventos:</strong></p>
<p>Usa desestructuración para un acceso más limpio a las props</p>
<p>Siempre usa preventDefault en envíos de formulario</p>
<p>Usa funciones callback para pasar datos al componente padre</p>
</div>

## Hooks Personalizados

```jsx
// Hook useLocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error al leer localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error al configurar localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

// Hook useFetch
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
          throw new Error(`Error HTTP! estado: ${response.status}`);
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

// Usando hooks personalizados
function App() {
  const [name, setName] = useLocalStorage('username', '');
  const { data: users, loading, error } = useFetch('/api/users');

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
      />
      
      {loading && <p>Cargando usuarios...</p>}
      {error && <p>Error: {error}</p>}
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
<p><strong>Hooks personalizados:</strong></p>
<p>Extraer lógica de componentes en funciones reutilizables</p>
<p>Debe comenzar con "use" y puede llamar otros hooks</p>
<p>Excelente para compartir lógica con estado entre componentes</p>
</div>

## Context API

```jsx
import { createContext, useContext, useReducer } from 'react';

// Context de tema
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
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
}

// Usando Context
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
        Cambiar a modo {theme === 'light' ? 'oscuro' : 'claro'}
      </button>
    </header>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Context API:</strong></p>
<p>Evita prop drilling, comparte estado a través del árbol de componentes</p>
<p>Para estado simple, usa createContext() + useContext()</p>
<p>Para gestión de estado compleja, combina con useReducer</p>
<p>Crea hooks personalizados para mejor experiencia de desarrollo</p>
</div>

Esta guía de React cubre los conceptos y patrones más importantes del desarrollo moderno con React. ¡Practica estos patrones y combínalos para construir interfaces de usuario potentes e interactivas!