---
title: "useReducer vs useState: どちらをいつ使うべきか"
date: "2025-12-29"
excerpt: "Reactでの状態管理においてuseStateよりuseReducerを選ぶべき時を、実践的な例と判断ガイドラインとともに学びましょう。"
tags: ["React", "Hooks", "State Management"]
author: "Shunku"
---

Reactは状態管理のために2つの主要なフックを提供しています：`useState`と`useReducer`。`useState`の方が一般的ですが、`useReducer`は複雑な状態ロジックに対して利点があります。それぞれをいつ使うべきか探っていきましょう。

## 簡単な比較

```jsx
// useState: シンプルで直接的な状態更新
const [count, setCount] = useState(0);
setCount(count + 1);

// useReducer: アクションベースの状態更新
const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: 'INCREMENT' });
```

```mermaid
flowchart LR
    subgraph useState
        A[コンポーネント] -->|setCount| B[新しい状態]
    end

    subgraph useReducer
        C[コンポーネント] -->|アクションをdispatch| D[Reducer]
        D -->|返す| E[新しい状態]
    end

    style D fill:#10b981,color:#fff
```

## useStateを使うべき時

`useState`は以下に最適です：

### 1. シンプルで独立した値

```jsx
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

  return (
    <form>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} />
    </form>
  );
}
```

### 2. ブールトグル

```jsx
function Modal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>開く</button>
      {isOpen && <Dialog onClose={() => setIsOpen(false)} />}
    </>
  );
}
```

### 3. シンプルなカウンター

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}回クリック
    </button>
  );
}
```

## useReducerを使うべき時

`useReducer`が輝くのは：

### 1. 複数の関連する状態値

状態値が互いに依存する場合：

```jsx
// useStateの場合：同期が取れなくなりやすい
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);
const [selectedId, setSelectedId] = useState(null);

// 問題：関連するすべての状態を更新することを覚えておく必要がある
const addItem = (item) => {
  setItems([...items, item]);
  setTotal(total + item.price); // 忘れやすい！
};

// useReducerの場合：状態変更が調整される
const initialState = { items: [], total: 0, selectedId: null };

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.item],
        total: state.total + action.item.price,
      };
    case 'SELECT_ITEM':
      return { ...state, selectedId: action.id };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, initialState);
```

### 2. 複雑な状態遷移

次の状態が前の状態に複雑な方法で依存する場合：

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'RESET':
      return initialState;
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function DataFetcher({ url }) {
  const [state, dispatch] = useReducer(reducer, {
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    dispatch({ type: 'FETCH_START' });
    fetch(url)
      .then(res => res.json())
      .then(data => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch(error => dispatch({ type: 'FETCH_ERROR', error }));
  }, [url]);

  // ...
}
```

### 3. 状態マシン / 有限状態

状態遷移が厳格なルールに従う場合：

```jsx
const initialState = { status: 'idle' }; // idle | loading | success | error

function reducer(state, action) {
  switch (state.status) {
    case 'idle':
      if (action.type === 'FETCH') {
        return { status: 'loading' };
      }
      return state;

    case 'loading':
      if (action.type === 'SUCCESS') {
        return { status: 'success', data: action.data };
      }
      if (action.type === 'ERROR') {
        return { status: 'error', error: action.error };
      }
      return state;

    case 'success':
    case 'error':
      if (action.type === 'RESET') {
        return { status: 'idle' };
      }
      return state;

    default:
      return state;
  }
}
```

### 4. 簡単なテスト

Reducerは純粋関数なので、テストが簡単です：

```jsx
// reducer.test.js
test('ADD_ITEMはアイテムを追加し合計を更新する', () => {
  const state = { items: [], total: 0 };
  const action = { type: 'ADD_ITEM', item: { id: 1, price: 10 } };

  const newState = reducer(state, action);

  expect(newState.items).toHaveLength(1);
  expect(newState.total).toBe(10);
});

test('未知のアクションは現在の状態を返す', () => {
  const state = { items: [], total: 0 };
  const newState = reducer(state, { type: 'UNKNOWN' });

  expect(newState).toBe(state);
});
```

### 5. 子にdispatchを渡す

`dispatch`はsetter関数とは異なり、安定したアイデンティティを持ちます：

```jsx
function Parent() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatchは変わらないので、Childは不必要に再レンダリングされない
  return <Child dispatch={dispatch} />;
}

// vs useStateではuseCallbackが必要
function Parent() {
  const [state, setState] = useState(initialState);

  // 子の再レンダリングを防ぐためにメモ化が必要
  const handleAction = useCallback((action) => {
    setState(prev => /* 複雑なロジック */);
  }, []);

  return <Child onAction={handleAction} />;
}
```

## 判断ガイド

```mermaid
flowchart TD
    A{状態の質問} --> B{単一の値?}
    B -->|はい| C{シンプルな更新?}
    C -->|はい| D[useState]
    C -->|いいえ| E[useReducerを検討]

    B -->|いいえ| F{値が関連している?}
    F -->|はい| G[useReducer]
    F -->|いいえ| H[複数のuseState]

    style D fill:#3b82f6,color:#fff
    style G fill:#10b981,color:#fff
    style H fill:#3b82f6,color:#fff
```

### `useState`を使う場合：
- 単一のプリミティブ値を管理
- 状態更新がシンプル（新しい値に設定）
- 状態値が互いに独立
- 最小限のボイラープレートが欲しい

### `useReducer`を使う場合：
- 一緒に更新される複数の状態値
- 次の状態が前の状態に複雑に依存
- 予測可能な状態遷移が欲しい
- 更新ロジックを子に渡す必要がある
- テストを簡単にしたい

## 実践例：ショッピングカート

### useStateの場合（乱雑になる）

```jsx
function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  const addItem = (item) => {
    setItems([...items, item]);
    setTotal(total + item.price);
    // 合計に基づいて配送料を更新するのを忘れた！
  };

  const removeItem = (id) => {
    const item = items.find(i => i.id === id);
    setItems(items.filter(i => i.id !== id));
    setTotal(total - item.price);
    // 割引も再計算する必要がある...
  };

  const applyDiscount = (code) => {
    // 合計とアイテムを含む複雑なロジック...
  };
}
```

### useReducerの場合（クリーンで予測可能）

```jsx
const initialState = {
  items: [],
  total: 0,
  discount: 0,
  shipping: 0,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItems = [...state.items, action.item];
      const newTotal = state.total + action.item.price;
      return {
        ...state,
        items: newItems,
        total: newTotal,
        shipping: calculateShipping(newTotal),
      };
    }

    case 'REMOVE_ITEM': {
      const item = state.items.find(i => i.id === action.id);
      const newItems = state.items.filter(i => i.id !== action.id);
      const newTotal = state.total - item.price;
      return {
        ...state,
        items: newItems,
        total: newTotal,
        discount: recalculateDiscount(newItems, state.discount),
        shipping: calculateShipping(newTotal),
      };
    }

    case 'APPLY_DISCOUNT':
      return {
        ...state,
        discount: calculateDiscount(action.code, state.items, state.total),
      };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <div>
      {state.items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
        />
      ))}
      <CartSummary
        total={state.total}
        discount={state.discount}
        shipping={state.shipping}
      />
    </div>
  );
}
```

## TypeScriptでの使用

TypeScriptは型安全性でreducerをさらに良くします：

```typescript
type State = {
  count: number;
  step: number;
};

type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + state.step };
    case 'DECREMENT':
      return { ...state, count: state.count - state.step };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'RESET':
      return { count: 0, step: 1 };
  }
}
```

## まとめ

| 基準 | useState | useReducer |
|----------|----------|------------|
| シンプルな値 | ✓ | |
| 関連する状態値 | | ✓ |
| 複雑な遷移 | | ✓ |
| テスト | 難しい | 簡単 |
| ボイラープレート | 少ない | 多い |
| 安定性 | useCallbackが必要 | dispatchは安定 |

両方のフックにはそれぞれの場所があります。シンプルさのために`useState`から始め、状態ロジックが複雑になったりエラーが発生しやすくなったりしたら`useReducer`にリファクタリングしましょう。目標は理解しやすく保守しやすいコードです。

## 参考文献

- [React Documentation: useReducer](https://react.dev/reference/react/useReducer)
- [React Documentation: Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- Kumar, Tejas. *Fluent React*. O'Reilly Media, 2024.
