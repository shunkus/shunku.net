---
title: "Guide React"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "Un guide complet des fondamentaux de React, des composants, des hooks et des modèles modernes pour construire des interfaces utilisateur dynamiques."
tags: ["React", "JavaScript", "Frontend", "Développement web", "Composants", "Hooks", "Guide"]
author: "Shun Kushigami"
---

# Guide React

Un guide complet des fondamentaux de React, des composants, des hooks et des modèles modernes pour construire des interfaces utilisateur dynamiques.

## Composants et JSX

```jsx
// Composant fonction
function Greeting({ name }) {
  return <h1>Bonjour, {name} !</h1>;
}

// Composant fonction fléchée
const Greeting = ({ name }) => {
  return <h1>Bonjour, {name} !</h1>;
};

// Composant avec plusieurs éléments
function UserCard({ user }) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// Utiliser Fragment pour éviter les divs inutiles
function App() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}

// Rendu conditionnel
function LoginButton({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <button>Se déconnecter</button>
      ) : (
        <button>Se connecter</button>
      )}
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Exemple JSX :</strong>
<p>JSX permet une syntaxe similaire à HTML dans JavaScript</p>
<p>Les composants doivent retourner un élément parent unique ou un Fragment</p>
<p>Utiliser className au lieu de class, onClick au lieu de onclick</p>
</div>

## Gestion d'État avec le Hook useState

```jsx
import { useState } from 'react';

// État basique
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Compteur : {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrémenter</button>
      <button onClick={() => setCount(count - 1)}>Décrémenter</button>
      <button onClick={() => setCount(0)}>Réinitialiser</button>
    </div>
  );
}

// État d'objet
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
        placeholder="Nom"
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

// État de tableau
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
        placeholder="Ajouter une tâche"
      />
      <button onClick={addTodo}>Ajouter</button>
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
<p><strong>Exemple useState :</strong></p>
<p>useState(0) → [0, setCount]</p>
<p>Pour les états qui dépendent de l'état précédent, utilisez toujours les mises à jour fonctionnelles</p>
<p>Utilisez l'opérateur de propagation (...) pour mettre à jour les objets et tableaux de manière immuable</p>
</div>

## Gestion des Effets Secondaires avec le Hook useEffect

```jsx
import { useState, useEffect } from 'react';

// Effet basique (s'exécute après chaque rendu)
function DocumentTitle() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Compteur : ${count}`;
  });

  return (
    <button onClick={() => setCount(count + 1)}>
      Cliquez ({count})
    </button>
  );
}

// Effet avec tableau de dépendances
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
        console.error('Erreur lors du chargement utilisateur :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]); // Se ré-exécute uniquement quand userId change

  if (loading) return <div>Chargement...</div>;
  if (!user) return <div>Utilisateur non trouvé</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Effet avec nettoyage
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Fonction de nettoyage
    return () => clearInterval(interval);
  }, []); // Tableau de dépendances vide = s'exécute une fois au montage

  return <div>Minuteur : {seconds} secondes</div>;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemple useEffect :</strong></p>
<p>Pas de tableau de dépendances : s'exécute après chaque rendu</p>
<p>Tableau vide [] : s'exécute une fois après le rendu initial</p>
<p>[valeur] : s'exécute quand la valeur change</p>
<p>Retourne une fonction de nettoyage pour éviter les fuites mémoire</p>
</div>

## Props et Gestion d'Événements

```jsx
// Props avec déstructuration
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

// Modèles de gestion d'événements
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
    console.log('Formulaire soumis :', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nom"
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
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Props et événements :</strong></p>
<p>Utilisez la déstructuration pour un accès plus propre aux props</p>
<p>Utilisez toujours preventDefault dans les soumissions de formulaire</p>
<p>Utilisez des fonctions de rappel pour passer des données au composant parent</p>
</div>

## Hooks Personnalisés

```jsx
// Hook useLocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erreur de lecture localStorage :', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Erreur de configuration localStorage :', error);
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
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
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

// Utilisation des hooks personnalisés
function App() {
  const [name, setName] = useLocalStorage('username', '');
  const { data: users, loading, error } = useFetch('/api/users');

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom"
      />
      
      {loading && <p>Chargement des utilisateurs...</p>}
      {error && <p>Erreur : {error}</p>}
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
<p><strong>Hooks personnalisés :</strong></p>
<p>Extraire la logique des composants dans des fonctions réutilisables</p>
<p>Doit commencer par "use" et peut appeler d'autres hooks</p>
<p>Excellent pour partager une logique avec état entre composants</p>
</div>

## Context API

```jsx
import { createContext, useContext, useReducer } from 'react';

// Context de thème
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
    throw new Error('useTheme doit être utilisé dans ThemeProvider');
  }
  return context;
}

// Utilisation du Context
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
        Basculer vers le mode {theme === 'light' ? 'sombre' : 'clair'}
      </button>
    </header>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Context API :</strong></p>
<p>Évite le prop drilling, partage l'état à travers l'arbre de composants</p>
<p>Pour un état simple, utilisez createContext() + useContext()</p>
<p>Pour une gestion d'état complexe, combinez avec useReducer</p>
<p>Créez des hooks personnalisés pour une meilleure expérience développeur</p>
</div>

Ce guide React couvre les concepts et modèles les plus importants du développement React moderne. Pratiquez ces modèles et combinez-les pour construire des interfaces utilisateur puissantes et interactives !