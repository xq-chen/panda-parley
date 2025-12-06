# PandaParley 🐼

> **Two AI Experts. One Deep Inquiry. Guided by You.**

PandaParley is an AI-driven debate platform that facilitates deep, philosophical, and multi-perspective inquiries. It allows users to pair distinct AI expert personas (e.g., an Ethicist and a Futurist) to discuss complex topics, while a Facilitator guides the conversation towards deeper understanding.

## ✨ Features

- **🎭 Dynamic AI Experts**: Choose from a library of 8+ expert personas, including *The Analyst*, *The Visionary*, *The Skeptic*, *The Historian*, and more.
- **✨ Auto-Casting**: Let the AI act as your Casting Director—it analyzes your topic and automatically selects the two most suitable experts for the debate.
- **🧠 Local & Cloud Models**: Supports **Google Gemini** (via API key), **OpenRouter**, **ModelScope** (Alibaba), and local LLMs (via **LM Studio** / OpenAI compatible endpoints).
- **🗣️ Multi-Language Support**: Conduct debates in **English**, **Chinese**, **Japanese**, or **Spanish**.
- **📜 History & Archives**: Save fascinating discussions, view past sessions, and restore them for review.
- **📥 Export**: Download your sessions as **Markdown** (for notes) or **JSON** (for data).
- **🔒 Privacy First**: Your API keys and history are stored locally in your browser (LocalStorage). Nothing is sent to our servers.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- An API Key (Google Gemini) OR a local LLM running (e.g., LM Studio)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/xq-chen/panda-parley.git
    cd panda-parley
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## ⚙️ Configuration

### AI Provider Setup

Click the **Settings (⚙️)** icon in the top right to configure your AI model:

-   **Google Gemini**: Enter your API Key.
-   **OpenRouter**:
    -   Select "OpenRouter".
    -   API Key: Enter your OpenRouter API Key.
    -   Model Name: Default is `mistralai/mistral-7b-instruct`, or enter any OpenRouter model ID.
    -   *Note*: Includes required headers for OpenRouter rankings.
-   **ModelScope (Alibaba)**:
    -   Select "ModelScope".
    -   API Key: Enter your ModelScope API Key.
    -   Model Name: Default is `qwen-turbo`.
-   **Local LLM (LM Studio)**:
    -   Select "Local / OpenAI".
    -   Base URL: `http://localhost:1234/v1` (default for LM Studio).
    -   API Key: Leave empty or use `lm-studio`.
    -   Model Name: Enter the ID of your loaded model (e.g., `llama-3.2-3b-instruct`).

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Vite
-   **Styling**: Tailwind CSS v4, Framer Motion
-   **State Management**: Zustand (with Persist middleware)
-   **Icons**: Lucide React

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
