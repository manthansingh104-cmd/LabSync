# LabSync — DSA Lab Code Management System

LabSync is a web-based application designed to help students organize, manage, and access their Data Structures and Algorithms (DSA) lab programs from one place.

Students often work on different computers during laboratory sessions, making it difficult to keep their code files organized and accessible. LabSync provides a centralized platform where students can save, manage, and retrieve their programming solutions without depending entirely on individual lab computers.

## 🚀 Features

* **User Authentication:** Register and log in to access the application.
* **Program Management:** Create, view, edit, and delete DSA programs.
* **Organized Code Storage:** Keep programming solutions organized in one place.
* **Program Details:** Access saved program information through the application.
* **Program Version Support:** Backend models support storing program versions.
* **Responsive Interface:** A modern frontend built with React and CSS.
* **Backend API:** REST API built using Node.js and Express.
* **Database Integration:** MongoDB with Mongoose for data storage.

## 🛠️ Technology Stack

### Frontend

* React
* JavaScript
* HTML5
* CSS3
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* bcryptjs
* CORS

### Development Tools

* Visual Studio Code
* Git and GitHub
* npm

## 📁 Project Structure

```text
LabSync/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Program.js
│   │   ├── ProgramVersion.js
│   │   └── User.js
│   ├── routes/
│   │   ├── programRoutes.js
│   │   └── userRoutes.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── api.js
│   │   ├── CreateProgram.jsx
│   │   ├── EditProgram.jsx
│   │   ├── ProgramDetails.jsx
│   │   ├── Programs.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

Follow these steps to run LabSync locally.

### Prerequisites

Make sure you have installed:

* [Node.js](https://nodejs.org/)
* npm (included with Node.js)
* A MongoDB database, either locally or through [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)

### 1. Clone the Repository

```bash
git clone https://github.com/manthansingh104-cmd/LabSync.git
cd LabSync
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder.

Add the following environment variables, using your own database connection string and a strong secret:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
```

Replace the example values with your actual configuration.

**Important:** Never commit your `.env` file or publish your database credentials or JWT secret.

Start the backend using the script defined in `backend/package.json`. If it provides a `start` script, run:

```bash
npm start
```

If no `start` script is configured, run:

```bash
node server.js
```

The backend will typically run at:

```text
http://localhost:5000
```

### 3. Set Up the Frontend

Open a second terminal from the project root and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Vite will display the local frontend address in your terminal. Open that address in your browser, usually:

```text
http://localhost:5173
```

Make sure the frontend API configuration points to the running backend.

## 🔐 Environment Variables

The backend uses environment variables to configure its database connection and authentication.

| Variable      | Purpose                                   |
| ------------- | ----------------------------------------- |
| `PORT`        | Port used by the backend server           |
| `MONGODB_URI` | MongoDB database connection string        |
| `JWT_SECRET`  | Secret used to sign authentication tokens |

Keep these values private and configure them separately in your deployment environment.

## 💡 How LabSync Works

1. A student registers for an account or logs in.
2. The student accesses the LabSync dashboard.
3. The student creates and saves DSA programs.
4. Saved programs can be viewed and edited when needed.
5. The student can manage existing programs through the application.
6. The backend communicates with MongoDB to store and retrieve application data.

## 🎯 Project Objective

The primary objective of LabSync is to make programming laboratory work easier to organize and access.

By providing a centralized system for managing DSA programs, LabSync aims to reduce the inconvenience of working across different laboratory computers and help students maintain their programming work more effectively.

## 🔮 Future Enhancements

Potential future improvements include:

* AI-assisted code explanations and debugging.
* Search and filtering by algorithm, topic, or programming language.
* Support for additional programming languages.
* Code execution and testing in a secure environment.
* Improved program version history and restoration.
* Collaboration and program sharing between students.
* Exporting programs for offline access.
* Deployment with a public URL for convenient access.

## 👨‍💻 Developer

**Manthan Singh**

B.Tech Computer Science and Engineering Student

GitHub: [@manthansingh104-cmd](https://github.com/manthansingh104-cmd)

## 📄 License

This project is currently a student project. A formal open-source license can be added if the project is released for public reuse.
