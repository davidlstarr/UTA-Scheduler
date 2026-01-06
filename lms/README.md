# UGT Learning Assistant

An AI-powered learning management system for Air Force Upgrade Training (UGT). This application uses Google's Gemini 2.0 Flash to provide personalized training plans based on an Airman's career field (AFSC) and learning style.

## Features

- 🎖️ **AFSC-Specific Training**: Get training guidance tailored to your career field
- 🧠 **Learning Style Assessment**: Discover how you learn best (visual, auditory, reading/writing, kinesthetic)
- 📚 **CDC Study Strategies**: Tips and techniques for Career Development Courses
- 🎯 **Personalized Learning Plans**: Customized study schedules based on your preferences

## Setup

1. Install dependencies:
```bash
cd lms
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:5174 in your browser

4. Enter your [Google Gemini API key](https://aistudio.google.com/apikey) when prompted

## Usage

1. Start a new training session
2. Tell the assistant your AFSC
3. Answer questions about your learning preferences
4. Receive a personalized training plan

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Google Generative AI (Gemini 2.0 Flash)
- Lucide React Icons

