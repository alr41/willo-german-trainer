# Willo — German Vocabulary Trainer

Willo is an interactive German vocabulary training application built around the official Goethe Institut word lists for levels A1 through B2. Instead of passively reading vocabulary lists, users actively test themselves, track their accuracy per word over time, and identify exactly where their gaps are.

## Objectives

- Provide an accessible and interactive tool for practising German vocabulary at multiple proficiency levels (A1–B2)
- Implement a smart word selection algorithm that prioritises words the user struggles with most
- Track individual word statistics over time to give users a clear picture of their progress
- Offer two distinct training modes — vocabulary translation and article (der/die/das) recognition — to cover different aspects of German grammar
- Build a full-stack application demonstrating the integration of a REST API backend with a modern frontend framework

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.x** | Core backend language |
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server for running FastAPI |
| **MySQL** | Relational database for storing words, sentences and user statistics |
| **mysql-connector-python** | Python driver for MySQL |
| **Pydantic** | Data validation and serialisation |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI component framework |
| **React Router v6** | Client-side routing between pages |
| **Vite** | Frontend build tool and dev server |
| **CSS (custom)** | Styling and theming per proficiency level |

### Data
The vocabulary dataset is sourced from the **Goethe Institut word lists** for levels A1, A2, B1, and B2. Each word entry includes the German term, its English translation, grammatical article (der/die/das), plural form, and proficiency level. Example sentences in both German and English are also stored for context.

## Features

- **Two training modes** — Vocabulary Trainer (multiple choice translation) and Article Trainer (der/die/das selection)
- **Two game modes** — Infinite Mode (practice without limits) and Survival Mode (3 lives)
- **Session tracking** — already-seen words are filtered out within a session to avoid repetition
- **Progress statistics** — accuracy per level, words seen vs. total words, and top/bottom performing words
- **Responsive UI** — colour-coded themes per proficiency level

## Requirements

- Python 3.x
- Node.js
- MySQL (running locally)

## Setup

### 1. Clone or download the project

Download the ZIP from GitHub and extract it. Navigate into the inner project folder until you can see `backend/`, `frontend/`, and `database_dump.sql` side by side.

### 2. Import the database

Open a terminal and run:

```bash
mysql -u root -p < database_dump.sql
```

This creates the `german_db` database and imports all tables and vocabulary data automatically.

If `mysql` is not recognized, use:

```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database_dump.sql
```

### 3. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Start the backend server

```bash
python -m uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 5. Install and start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.


## Disclaimer

Willo is a vocabulary training tool and is intended to be used as a **complement to broader language learning**, not as a standalone method.

For best results, Willo should be used alongside other resources.
