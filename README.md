# Fake News Detector — AI-Powered Misinformation Analysis

An advanced web application that uses AI to detect misinformation and classify news articles as real or fake.

## Features
- **AI-Powered Analysis**: Leverages Google Gemini AI to analyze news content.
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion for a smooth, responsive experience.
- **Instant Results**: Get a credibility score and detailed reasoning for each analysis.
- **Clean Backend**: Fast and efficient Python/Flask backend.

## Tech Stack
### Frontend
- React.js
- Vite
- Tailwind CSS
- Framer Motion (Animations)
- Axios

### Backend
- Python
- Flask
- Google Gemini API

## Setup Instructions

### Backend
1. Navigate to the `backend` folder.
2. Create a virtual environment: `python -m venv .venv`.
3. Activate the environment.
4. Install dependencies: `pip install -r requirements.txt`.
5. Create a `.env` file with your `GEMINI_API_KEY`.
6. Run the app: `python app.py`.

### Frontend
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

## Project Structure
- `backend/`: Python Flask server and AI logic.
- `frontend/`: React application.
- `model/`: AI model integration logic.
