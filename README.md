# QueryAI - Natural Language to SQL Analytics Platform

QueryAI is an AI powrered conversational analytics platform that bridges the gap between human language and relational databases. It allows users to connect secure PostgreSQL targets, query complex relational models using plain English, and instantly execute safe read-only SQL operations complete with AI-generated query logic explanations and robust error self-correction.

---

## Key Features

* **Natural Language to SQL:** Translates plain English user prompts directly into optimized, production-ready PostgreSQL syntax via advanced LLM mapping.
* **AI Query Explanations:** Provides transparent, 1-2 sentence plain-English breakdowns of the execution logic behind every generated query.
* **Self-Healing Error Correction Loop:** Automatically catches database execution errors, feeds syntax faults and error logs back to the LLM, and self-corrects invalid queries on the fly.
* **Secure Sandbox Enforcement:** Validates and restricts queries strictly to read-only `SELECT` statements, safeguarding underlying databases from unauthorized modifications.
* **Database Connection Manager:** Securely extracts, caches, and manages multi-tenant PostgreSQL connection pools and schema metadata.
* **Execution History & Auditing:** Comprehensive logging of all prompt executions, success/error statuses, and generated query histories.
* **Data Export Utilities:** Built-in dataset downloading and CSV export capabilities directly from result tables.

---

## Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
* **Backend:** FastAPI, Python, Uvicorn, SQLAlchemy
* **Database & Drivers:** PostgreSQL, Psycopg2 / Psycopg
* **AI Integration:** OpenAI API / LLM Chat Completions

---

## Project Structure

```text
QueryAI/
│
├── backend/
│   ├── main.py            # FastAPI application entry point, routing, and execution engine
│   ├── models.py          # SQLAlchemy database schemas and models
│   ├── database.py        # Database connection and session management
│   └── requirements.txt   # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── App.jsx        # Root component and router configuration
    │   ├── api.js         # Axios HTTP client configuration
    │   └── components/
    │       └── DashboardPage.jsx # Main workspace interface, query playground, and history viewer
    ├── package.json       # Node dependencies and scripts
    └── vite.config.js     # Vite bundler configuration
