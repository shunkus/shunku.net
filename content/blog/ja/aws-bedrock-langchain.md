---
title: "LangChainとAmazon Bedrockの統合"
date: "2025-01-18"
excerpt: "Amazon BedrockとLangChainを統合してAIアプリケーションを構築。Chain、Memory、Agent、RAGパターンをBedrockモデルで解説します。"
tags: ["AWS", "Amazon Bedrock", "Generative AI", "LangChain", "Python"]
author: "Shunku"
---

LangChainは大規模言語モデルでアプリケーションを構築するためのフレームワークです。Amazon Bedrockと組み合わせることで、高度なAIアプリケーションを作成する強力なツールキットを提供します。

## セットアップ

```bash
pip install langchain langchain-aws boto3
```

```python
from langchain_aws import ChatBedrock, BedrockEmbeddings
import boto3
```

## チャットモデル

### 基本的な使い方

```python
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, SystemMessage

llm = ChatBedrock(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    model_kwargs={"temperature": 0.7, "max_tokens": 1024}
)

messages = [
    SystemMessage(content="あなたは親切なアシスタントです。"),
    HumanMessage(content="クラウドコンピューティングとは何ですか？")
]

response = llm.invoke(messages)
print(response.content)
```

### ストリーミング

```python
for chunk in llm.stream(messages):
    print(chunk.content, end="", flush=True)
```

## プロンプトテンプレート

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "あなたは{role}です。{language}で回答してください。"),
    ("human", "{question}")
])

chain = prompt | llm
response = chain.invoke({
    "role": "技術エキスパート",
    "language": "日本語",
    "question": "REST APIを説明してください"
})
```

## チェーン

### シンプルなチェーン

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | llm | StrOutputParser()
result = chain.invoke({"role": "教師", "language": "日本語", "question": "Pythonとは？"})
```

### シーケンシャルチェーン

```python
from langchain_core.prompts import PromptTemplate

# ステップ1: アウトラインを生成
outline_prompt = PromptTemplate.from_template(
    "{topic}についての記事のアウトラインを作成してください"
)

# ステップ2: アウトラインから記事を書く
article_prompt = PromptTemplate.from_template(
    "このアウトラインに基づいて短い記事を書いてください:\n{outline}"
)

outline_chain = outline_prompt | llm | StrOutputParser()
article_chain = article_prompt | llm | StrOutputParser()

# 結合チェーン
full_chain = outline_chain | (lambda x: {"outline": x}) | article_chain

result = full_chain.invoke({"topic": "機械学習"})
```

## メモリ

### 会話バッファ

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

memory = ConversationBufferMemory()
conversation = ConversationChain(llm=llm, memory=memory)

print(conversation.predict(input="こんにちは、私は田中です"))
print(conversation.predict(input="私の名前は？"))  # 「田中」を覚えている
```

### サマリーメモリ

```python
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(llm=llm)
conversation = ConversationChain(llm=llm, memory=memory)
```

## 埋め込みとベクトルストア

```python
from langchain_aws import BedrockEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 埋め込みを作成
embeddings = BedrockEmbeddings(
    model_id="amazon.titan-embed-text-v1"
)

# ドキュメントを分割
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

documents = text_splitter.create_documents([
    "ドキュメントの内容...",
    "さらにドキュメントの内容..."
])

# ベクトルストアを作成
vectorstore = FAISS.from_documents(documents, embeddings)

# 検索
results = vectorstore.similarity_search("クエリ", k=3)
```

## LangChainでRAG

```python
from langchain.chains import RetrievalQA

# リトリーバーを作成
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# RAGチェーン
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

result = qa_chain.invoke({"query": "ドキュメントには何が書いてありますか？"})
print(result["result"])
print(result["source_documents"])
```

## エージェント

```python
from langchain.agents import create_react_agent, AgentExecutor
from langchain.tools import Tool
from langchain import hub

# ツールを定義
def search_database(query: str) -> str:
    return f"検索結果: {query}"

tools = [
    Tool(
        name="DatabaseSearch",
        func=search_database,
        description="データベースから情報を検索"
    )
]

# エージェントを作成
prompt = hub.pull("hwchase17/react")
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = agent_executor.invoke({"input": "ユーザーデータを検索して"})
```

## 完全なアプリケーション

```python
from langchain_aws import ChatBedrock, BedrockEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

class RAGChatbot:
    def __init__(self, documents: list):
        self.llm = ChatBedrock(
            model_id="anthropic.claude-3-sonnet-20240229-v1:0"
        )
        self.embeddings = BedrockEmbeddings(
            model_id="amazon.titan-embed-text-v1"
        )
        self.vectorstore = FAISS.from_texts(documents, self.embeddings)
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        self.chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=self.vectorstore.as_retriever(),
            memory=self.memory
        )

    def chat(self, question: str) -> str:
        result = self.chain.invoke({"question": question})
        return result["answer"]

# 使用例
docs = ["会社ポリシードキュメント...", "製品情報..."]
chatbot = RAGChatbot(docs)
print(chatbot.chat("会社のポリシーは何ですか？"))
print(chatbot.chat("それについてもっと教えて"))
```

## ベストプラクティス

| プラクティス | 推奨事項 |
|-------------|---------|
| モデル選択 | 会話にはChatBedrockを使用 |
| チャンキング | オーバーラップ付き500-1000トークン |
| メモリ | コンテキストニーズに応じて選択 |
| エラーハンドリング | try-exceptで呼び出しをラップ |

## 重要なポイント

1. **LangChainは簡素化** - Bedrock統合を抽象化
2. **チェーンで構成** - 複雑なワークフローを構築
3. **メモリでコンテキスト** - マルチターン会話
4. **RAGは簡単** - ベクトルストア + リトリーバー
5. **エージェントで拡張** - カスタムツールを追加

## 参考文献

- [LangChain AWS](https://python.langchain.com/docs/integrations/platforms/aws/)
- [LangChainドキュメント](https://python.langchain.com/docs/)
