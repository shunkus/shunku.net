---
title: "LangChain and Amazon Bedrock Integration"
date: "2025-01-18"
excerpt: "Integrate Amazon Bedrock with LangChain for building AI applications. Learn chains, memory, agents, and RAG patterns with Bedrock models."
tags: ["AWS", "Amazon Bedrock", "Generative AI", "LangChain", "Python"]
author: "Shunku"
---

LangChain is a framework for building applications with large language models. Combined with Amazon Bedrock, it provides a powerful toolkit for creating sophisticated AI applications.

## Setup

```bash
pip install langchain langchain-aws boto3
```

```python
from langchain_aws import ChatBedrock, BedrockEmbeddings
import boto3
```

## Chat Models

### Basic Usage

```python
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, SystemMessage

llm = ChatBedrock(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    model_kwargs={"temperature": 0.7, "max_tokens": 1024}
)

messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="What is cloud computing?")
]

response = llm.invoke(messages)
print(response.content)
```

### Streaming

```python
for chunk in llm.stream(messages):
    print(chunk.content, end="", flush=True)
```

## Prompt Templates

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a {role}. Respond in {language}."),
    ("human", "{question}")
])

chain = prompt | llm
response = chain.invoke({
    "role": "technical expert",
    "language": "Japanese",
    "question": "Explain REST APIs"
})
```

## Chains

### Simple Chain

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | llm | StrOutputParser()
result = chain.invoke({"role": "teacher", "language": "English", "question": "What is Python?"})
```

### Sequential Chain

```python
from langchain_core.prompts import PromptTemplate

# Step 1: Generate outline
outline_prompt = PromptTemplate.from_template(
    "Create an outline for an article about: {topic}"
)

# Step 2: Write article from outline
article_prompt = PromptTemplate.from_template(
    "Write a short article based on this outline:\n{outline}"
)

outline_chain = outline_prompt | llm | StrOutputParser()
article_chain = article_prompt | llm | StrOutputParser()

# Combined chain
full_chain = outline_chain | (lambda x: {"outline": x}) | article_chain

result = full_chain.invoke({"topic": "Machine Learning"})
```

## Memory

### Conversation Buffer

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

memory = ConversationBufferMemory()
conversation = ConversationChain(llm=llm, memory=memory)

print(conversation.predict(input="Hi, I'm Alice"))
print(conversation.predict(input="What's my name?"))  # Remembers "Alice"
```

### Summary Memory

```python
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(llm=llm)
conversation = ConversationChain(llm=llm, memory=memory)
```

## Embeddings and Vector Stores

```python
from langchain_aws import BedrockEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Create embeddings
embeddings = BedrockEmbeddings(
    model_id="amazon.titan-embed-text-v1"
)

# Split documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

documents = text_splitter.create_documents([
    "Document content here...",
    "More document content..."
])

# Create vector store
vectorstore = FAISS.from_documents(documents, embeddings)

# Search
results = vectorstore.similarity_search("query", k=3)
```

## RAG with LangChain

```python
from langchain.chains import RetrievalQA

# Create retriever
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# RAG chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

result = qa_chain.invoke({"query": "What is in the documents?"})
print(result["result"])
print(result["source_documents"])
```

## Agents

```python
from langchain.agents import create_react_agent, AgentExecutor
from langchain.tools import Tool
from langchain import hub

# Define tools
def search_database(query: str) -> str:
    return f"Results for: {query}"

tools = [
    Tool(
        name="DatabaseSearch",
        func=search_database,
        description="Search the database for information"
    )
]

# Create agent
prompt = hub.pull("hwchase17/react")
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = agent_executor.invoke({"input": "Search for user data"})
```

## Complete Application

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

# Usage
docs = ["Company policy document...", "Product information..."]
chatbot = RAGChatbot(docs)
print(chatbot.chat("What are the company policies?"))
print(chatbot.chat("Tell me more about that"))
```

## Best Practices

| Practice | Recommendation |
|----------|----------------|
| Model selection | Use ChatBedrock for conversations |
| Chunking | 500-1000 tokens with overlap |
| Memory | Choose based on context needs |
| Error handling | Wrap calls in try-except |

## Key Takeaways

1. **LangChain simplifies** - Abstracts Bedrock integration
2. **Chains compose** - Build complex workflows
3. **Memory enables context** - Multi-turn conversations
4. **RAG is straightforward** - Vector store + retriever
5. **Agents extend capability** - Add custom tools

## References

- [LangChain AWS](https://python.langchain.com/docs/integrations/platforms/aws/)
- [LangChain Documentation](https://python.langchain.com/docs/)
