# 🛠️ RepairShop Backend

This is the backend service for the **RepairShop** hybrid mobile application. It provides RESTful APIs for user authentication, logging, rate limiting, and database operations. The backend is built with **Node.js**, **TypeScript**, **Express.js**, and **Drizzle ORM**, and it is containerized using **Docker**.

---

## 📁 Project Structure

```
.
├── config/                # Configuration files (CORS, DB)
│   ├── corsOptions.ts
│   └── db/index.ts
├── dist/                  # Compiled JavaScript output (auto-generated)
├── docker-compose.yaml    # Docker Compose configuration
├── Dockerfile             # Docker build file
├── drizzle.config.ts      # Drizzle ORM configuration
├── logs/                  # Server request and error logs
│   ├── errLog.log
│   └── reqLogs.txt
├── nodemon.json           # Nodemon watcher configuration
├── package.json           # Project dependencies and scripts
├── public/                # Static assets (CSS, images, text)
├── server.ts              # Entry point of the backend app
├── src/                   # Source code
│   ├── controllers/       # Route logic (e.g., Auth)
│   ├── middleware/        # Custom middleware (auth, rate limit, logging)
│   ├── models/            # Database schemas (Drizzle ORM)
│   ├── routes/            # API route definitions
│   └── views/             # HTML views (e.g., 404 page)
└── tsconfig.json          # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/repairshop-backend.git
cd repairshop-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file to configure environment variables (e.g., DB credentials, secret keys). Example:

```
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/repairshop
JWT_SECRET=your_jwt_secret
```

### 4. Run the Server

```bash
npm run dev
```

Or build and run with:

```bash
npm run build
npm start
```

---

## 🐳 Running with Docker

### Docker Compose

```bash
docker-compose up --build
```

Make sure to adjust the database service and volume settings in `docker-compose.yaml` to match your needs.

---

## 🔐 Authentication

- JWT-based auth
- `/auth/login` and `/auth/signup` routes
- Middleware for protected routes (`authMiddleware.ts`)

---

## 🧰 Features

- 🔐 User Sign Up / Log In with hashed passwords
- 📦 PostgreSQL database with Drizzle ORM
- 📝 Logging system (request + error logs)
- 🔒 Rate limiting to prevent brute-force attacks
- 📄 Static file serving and basic views
- 🛠️ Easily scalable with Docker

---

## 📄 API Endpoints

| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| POST   | `/auth/signup` | Register a new user |
| POST   | `/auth/login`  | Authenticate user   |
| GET    | `/`            | Serve index HTML    |

---

## 🧪 Testing

You can use **Postman**, **Thunder Client**, or **cURL** to test the endpoints.

---

## 🧱 Tech Stack

- **Node.js** + **Express**
- **TypeScript**
- **Drizzle ORM**
- **PostgreSQL**
- **JWT Auth**
- **Docker**

---

## 📂 Logs

- All HTTP requests: `logs/reqLogs.txt`
- All errors: `logs/errLog.log`

---

## 🤝 Contributing

Open to pull requests and suggestions! Fork the repo and create your branch. 🙌

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 👨‍💻 Author

**Akib Ahmed** — _Software Engineer & Final Year Project Contributor_
Feel free to connect or collaborate!
