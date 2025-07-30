# 🤖 BinoGPT – Gemini-Powered Local Search Assistant

BinoGPT is a **WhatsApp-style AI chatbot simulator** that mimics how Bino — a WhatsApp-based search bot — responds to real-world local search queries.

Built using:
- 🧠 **Gemini API (Pro)** via **LangChain**
- ⚡️ **Streaming response support**
- 🧱 **Next.js (App Router)**
- 🎨 **Tailwind CSS** for clean, responsive UI



---

## 🔍 What It Does

✅ Simulates Bino's AI assistant for queries like:
- “Find a 24/7 plumber near Kothrud”
- “Book a cab to Pune airport”
- “Good cafes open now in Andheri”
- “What’s the population of Pune?”

💬 Provides instant responses with:
- Realistic, AI-generated local results
- Short, friendly WhatsApp-style tone
- Emoji-rich UX for familiarity

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), Tailwind CSS |
| AI Backend | Gemini Pro API via LangChain |
| API Integration | `app/api/gemini/route.js` |
| Streaming | Enabled using LangChain’s streaming parser |
| Styling | Fully responsive, mobile-first, WhatsApp-style |

---

## 📦 Features

- 🔁 **Real-time streaming responses** from Gemini
- 🧠 **LangChain-powered prompt routing**
- 🖼️ **Chat bubbles** with clean left/right alignment
- 🔐 Environment variables for Gemini API key
- ⚡ Deployed on [Vercel](https://vercel.com/)

---

## 🧠 Prompt Engineering

The assistant behaves like Bino using a carefully designed system prompt:

> “You are Bino, a helpful local search bot on WhatsApp. Reply with realistic, short, friendly answers to local service queries. If no info is available, say: ‘I’m still checking with my sources – hang tight!’.”

---

## 🚀 Getting Started Locally

### 1. Clone this repo
```bash
git clone https://github.com/Tejas-Dherange/bino-gpt.git
cd bino-gpt
