# LabSync — DSA Lab Code Management System

LabSync is a full-stack web application designed to help students **store, organize, manage, and access their DSA lab programs from anywhere**. Instead of losing code when switching between college laboratory computers, students can save their programs online and access them whenever they need them.

The application provides a centralized workspace for managing programming assignments, organizing code by topic and language, and maintaining a personal collection of lab programs.

## 🌐 Live Demo

* **Frontend:** https://labsync-ruddy.vercel.app
* **Backend API:** https://labsync-1-s1qy.onrender.com
* **GitHub Repository:** https://github.com/manthansingh104-cmd/LabSync

> Note: The backend is hosted on Render's free tier, so the first request after a period of inactivity may take longer while the service starts.

## ✨ Features

### 🔐 User Authentication

* User registration and login.
* Secure password hashing.
* Token-based authentication using JWT.
* User-specific program management.

### 💻 Program Management

* Create and save DSA lab programs.
* Edit existing programs.
* Delete programs when they are no longer needed.
* Organize programs by topic and programming language.
* View saved programs in a centralized dashboard.

### 🔎 Search and Filtering

* Search programs by relevant information.
* Filter programs by topic.
* Quickly find previously saved code.

### 📊 Dashboard

* View program statistics.
* Access your saved programs from one place.
* Keep your DSA lab work organized.

### 📥 Code Export

* Download individual programs.
* Export multiple programs into a ZIP archive.
* Organize exported code into topic-based folders.
* Include a README file in the exported collection.

### 📝 Code Editor

* Write and edit programs using the integrated Monaco Editor.
* Work with code in a dedicated editing interface.

### ☁️ Cloud Deployment

* Access the application through a web browser.
* Use the application from different computers.
* Store application data in MongoDB Atlas.
* Host the frontend on Vercel and the backend on Render.

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* JavaScript
* HTML5
* CSS3
* Axios
* Monaco Editor
* JSZip

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* bcryptjs
* CORS
* dotenv

### Database

* MongoDB Atlas

### Deployment

* Vercel — Frontend hosting
* Render — Backend hosting
* GitHub — Source code management

## 📂 Project Structure

```text
LabSync/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   ├── api.js
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── ...
│
└── README.md
```

*Note: The structure above is illustrative. Your actual folders and filenames may differ.*

## ⚙️ Getting Started

Follow these steps to run LabSync locally.

### Prerequisites

Install the following before getting started:

* [Node.js](https://nodejs.org/)
* [Git](https://git-scm.com/)
* A [MongoDB Atlas](https://www.mongodb.com/atlas) account or another MongoDB instance.

### 1. Clone the Repository

```bash
git clone https://github.com/manthansingh104-cmd/LabSync.git
```

Navigate into the project directory:

```bash
cd LabSync
```

### 2. Set Up the Backend

Open a terminal and run:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Replace the example values with your actual MongoDB connection string and a strong JWT secret.

**Important:** Never upload your real `.env` file or database credentials to GitHub.

Start the backend server:

```bash
npm start
```

The backend should start on:

```text
http://localhost:5000
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env.development` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Vite will display the local frontend address in your terminal, typically:

```text
http://localhost:5173
```

Open that address in your browser.

> Make sure the backend is running and your MongoDB connection is configured correctly before testing authentication and program management.

## 🔑 Environment Variables

### Backend Variables

| Variable      | Description                               |
| ------------- | ----------------------------------------- |
| `PORT`        | Port used by the backend server           |
| `MONGODB_URI` | MongoDB connection string                 |
| `JWT_SECRET`  | Secret used to sign authentication tokens |

### Frontend Variables

| Variable       | Description                 |
| -------------- | --------------------------- |
| `VITE_API_URL` | Base URL of the backend API |

For production, configure `VITE_API_URL` in the Vercel project settings with your deployed backend URL:

```env
VITE_API_URL=https://labsync-1-s1qy.onrender.com/api
```

After changing a Vercel environment variable, redeploy the frontend so the updated value takes effect.

## 🚀 Deployment

LabSync uses the following deployment setup:

1. **GitHub:** Stores the source code.
2. **Render:** Hosts the Node.js and Express backend.
3. **MongoDB Atlas:** Stores application data.
4. **Vercel:** Hosts the React frontend.

For a production deployment, configure the required backend environment variables in Render, allow the frontend origin in the backend's CORS settings, and set `VITE_API_URL` in Vercel.

Never expose your database credentials or JWT secret in frontend environment variables.

## 🔒 Security

* Passwords should be stored as hashes rather than plain text.
* Protected API routes should validate authentication tokens.
* Database credentials and JWT secrets must be kept private.
* CORS should be configured to allow only trusted frontend origins in production.
* MongoDB Atlas network access should be restricted appropriately.

## 🎯 Project Objective

The main objective of LabSync is to make DSA lab work easier to manage by giving students a reliable, centralized place to store and retrieve their programming work.

By making programs accessible online, LabSync helps students continue their work across different computers without depending on locally saved files.

## 🔮 Future Improvements

Potential improvements include:

* PDF export for individual programs and complete collections.
* Integrated code execution.
* Additional programming language support.
* Improved code version comparison and restoration.
* More dashboard analytics.
* Collaboration and program sharing.
* Improved mobile responsiveness.

## 👨‍💻 Author

**Manthan Singh**

* GitHub: [@manthansingh104-cmd](https://github.com/manthansingh104-cmd)

## 📄 License

This project is available for educational and learning purposes. A specific open-source license has not been declared yet.

If you want others to reuse, modify, and distribute the project under defined terms, consider adding a `LICENSE` file.

---

**LabSync — Write your code. Save your progress. Access it anywhere.**
