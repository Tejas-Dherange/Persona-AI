# 🤖 Persona-AI

[![Next.js](https://img.shields.io/badge/Next.js-13.5.1-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An interactive AI chatbot application that lets you chat with personalized AI versions of popular tech educators **Hitesh Choudhary** and **Piyush Garg**. Experience their unique teaching styles, get personalized coding advice, and access their resources through intelligent conversations.

## 🌟 Features

### 🎭 Dual AI Personas
- **Hitesh Choudhary Persona**: Authentic "Chai aur Code" creator with Hinglish communication style
- **Piyush Garg Persona**: Tech educator focused on system design and practical programming
- **Instant Mentor Switching**: Switch between personas mid-conversation

### 🚀 Advanced Capabilities
- **Real-time Streaming Responses**: Experience natural, flowing conversations
- **Web Search Integration**: Get current information and latest tech updates
- **Function Calling**: Access specific resources, repositories, and learning paths
- **Context-Aware Conversations**: Maintains conversation history for better context
- **Smart Response Formatting**: Automatic link detection, code blocks, and markdown rendering

### 💡 Intelligent Features
- **Clickable Links**: GitHub repositories, YouTube channels, and social media links
- **Code Block Rendering**: Syntax highlighting with copy functionality
- **Smart Greetings**: Contextual responses based on message complexity
- **Learning Path Recommendations**: Personalized suggestions based on your skill level

### 🎨 User Experience
- **Beautiful UI**: Modern gradient design with glassmorphism effects
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Typing Indicators**: Visual feedback during AI response generation
- **Message Sounds**: Optional audio feedback for new messages
- **Auto-scroll**: Automatic scrolling to latest messages

## 🛠️ Tech Stack

### Frontend
- **Next.js 13.5.1** - React framework with App Router
- **React 18.2.0** - UI library
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend & AI
- **Google Gemini 2.0 Flash** - Advanced AI model for conversations
- **LangChain** - AI application framework
- **DuckDuckGo Search API** - Web search integration
- **Server-Sent Events** - Real-time streaming responses

### Components & UI
- **Custom Chat Components** - Tailored for educational conversations
- **MessageFormatter** - Advanced text processing and link detection
- **Function Calling System** - Dynamic resource fetching
- **Responsive Layout** - Mobile-first design approach

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Google Gemini API Key** (get it from [Google AI Studio](https://ai.google.dev/))

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Tejas-Dherange/Persona-AI.git
cd Persona-AI
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Google Gemini AI API Key (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Additional configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Get Your Gemini API Key
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

### 5. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
Persona-AI/
├── 📂 app/                    # Next.js App Router
│   ├── 📂 api/               # API Routes
│   │   ├── 📂 gemini/        # Main AI chat endpoint
│   │   ├── 📂 search/        # Web search integration
│   │   └── 📂 gemini-langchain/ # Alternative LangChain endpoint
│   ├── globals.css           # Global styles
│   ├── layout.jsx           # Root layout
│   └── page.jsx             # Landing page
├── 📂 pages/                 # Additional pages
│   ├── _app.jsx             # App wrapper
│   └── dashboard.jsx        # Main chat interface
├── 📂 components/            # React components
│   ├── ChatBubble.js        # Individual chat messages
│   ├── MessageFormatter.js  # Advanced message formatting
│   └── 📂 ui/               # Radix UI components
├── 📂 lib/                   # Utilities and configuration
│   ├── geminiPrompt.js      # AI persona prompts
│   ├── piyush-resources.json # Piyush Garg resources
│   ├── hitesh-resources.json # Hitesh Choudhary resources
│   └── utils.ts             # Utility functions
├── 📂 hooks/                 # Custom React hooks
│   ├── useChatEffects.js    # Chat-specific effects
│   └── use-toast.ts         # Toast notifications
└── 📂 public/               # Static assets
    ├── hitesh.png           # Hitesh Choudhary avatar
    └── piyush.png           # Piyush Garg avatar
```

## 🎯 Key Features Explained

### 🤖 AI Persona System
Each mentor has a unique personality profile:
- **Response Style**: Casual vs Professional
- **Language**: Hinglish vs English
- **Teaching Approach**: Practical examples vs Theoretical concepts
- **Resource Database**: Curated links and learning materials

### 🔍 Function Calling
The system can intelligently fetch specific information:
- Repository details and code examples
- YouTube series and playlists
- Learning paths for different technologies
- Social media and official links
- Course and cohort information

### 🌐 Web Search Integration
Automatically detects when current information is needed:
- Latest technology updates
- Current market trends
- Recent news and developments
- Real-time pricing and availability

### 💬 Smart Conversation Management
- **Context Preservation**: Maintains conversation history
- **Response Length Matching**: Adjusts response length to question complexity
- **Streaming Responses**: Real-time message generation
- **Error Handling**: Graceful fallbacks for API issues

## 🎨 Customization

### Adding New Mentors
1. Create a new resource JSON file in `/lib/`
2. Add persona configuration in `geminiPrompt.js`
3. Update mentor configurations in components
4. Add avatar image to `/public/`

### Modifying AI Behavior
Edit the prompt files in `/lib/geminiPrompt.js`:
- Adjust response styles
- Add new specialties
- Modify personality traits
- Update resource databases

### Styling Changes
The project uses Tailwind CSS for styling:
- Modify color schemes in component files
- Update gradients and animations
- Customize responsive breakpoints
- Add new UI components

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The application can be deployed on:
- **Netlify**: Static site hosting with serverless functions
- **Railway**: Full-stack application hosting
- **DigitalOcean**: App platform deployment
- **AWS**: EC2 or Lambda deployment

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL for production | ❌ Optional |

## 📱 Browser Support

- **Chrome**: ✅ Full support
- **Firefox**: ✅ Full support
- **Safari**: ✅ Full support
- **Edge**: ✅ Full support
- **Mobile Browsers**: ✅ Responsive design

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex functionality
- Test your changes thoroughly
- Update documentation if needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hitesh Choudhary** - For inspiring authentic teaching content
- **Piyush Garg** - For practical programming education
- **Google Gemini** - For powerful AI capabilities
- **Vercel** - For excellent deployment platform
- **Open Source Community** - For amazing tools and libraries

## 📞 Support

If you encounter any issues or have questions:

1. **Check the Issues**: Look for existing solutions
2. **Create an Issue**: Describe your problem clearly
3. **Join Discussions**: Connect with the community
4. **Documentation**: Refer to this README and code comments

## 🔮 Future Enhancements

- [ ] Voice chat capabilities
- [ ] Multi-language support
- [ ] Advanced code execution
- [ ] Integration with more AI models
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Custom persona creation
- [ ] Learning progress tracking

---

<div align="center">

**Built with ❤️ by [Tejas Dherange](https://github.com/Tejas-Dherange)**

[⭐ Star this repository](https://github.com/Tejas-Dherange/Persona-AI) if you found it helpful!

</div>
