# ARISE — Your AI Study Space 🚀

A responsive React + TypeScript + Vite frontend starter for ARISE, an AI-powered study workspace.

## Run locally
1. Install Node.js (LTS).
2. In this folder, run `npm install`
3. Run `npm run dev`
4. Open the local URL printed by Vite.

## Deploy on Netlify with GitHub
1. Create a new GitHub repository and upload these files.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Connect the repository.
4. Build command: `npm run build`
5. Publish directory: `dist`

`netlify.toml` already includes these settings and a single-page-app redirect.

## What's included
- Responsive dashboard with animated cards and navigation
- Study Studio upload UI and output-type selection
- Results workspace with demo notes, flashcards, MCQs and podcast transcript
- Study planner, syllabus, pending work, exam paper builder, progress and settings screens
- Local demo interactions for adding tasks, toggling completion, selecting outputs and previewing generated sample content
- Persistent demo tasks and theme-independent preferences stored locally in the browser

## Important: demo vs real features
This is a **frontend demo**, not a production AI service. Upload selection and progress animations are UI demonstrations; they do not upload files to a server or analyze their contents. Sample notes, quizzes, and results are clearly marked as demo content. Sign-in, email OTP, secure file storage, real AI generation, text-to-speech, OCR/handwriting marking, multi-device sync and server-side persistence still require a secure backend and provider integrations.

Do not add private API keys to frontend code. For a zero-budget first iteration, test the UI with sample content and a few students, then connect authentication, database, private storage and AI through server-side functions with explicit usage limits.
