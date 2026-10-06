# DevPulse – A Minimalist Full-Stack Micro-Social Platform

A clean, practical, and well-architected Full Stack Web Development (FSWD) course project built using the **MERN** stack (MongoDB, Express.js, React.js, Node.js).

---

## 📌 Project Overview

**DevPulse** is a lightweight micro-social networking application designed specifically for a college course project. It provides an unbloated community feed where authenticated users can share short text updates, engage through likes, inspect user profiles, and manage their own posts.

The project strictly focuses on core full-stack web development principles:
- **Stateless JWT-based Authentication** with salted password hashing (`bcryptjs`)
- **End-to-End CRUD Operations** across React, Express, and MongoDB
- **NoSQL Relational Data Modeling** using Mongoose references (`ref`) and population (`populate`)
- **Backend Authorization Guardrails** enforcing post ownership checks on mutations (HTTP 403 Forbidden)
- **Optimistic UI Updates** in React for instant interaction feedback
- **Responsive Design & Modern UI** styled with Tailwind CSS and Lucide React icons

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18+ (Vite), React Router v6, Tailwind CSS, Lucide React, Axios |
| **Backend** | Node.js, Express.js, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS, `dotenv` |
| **Database** | MongoDB with Mongoose ODM (supports Local MongoDB, MongoDB Atlas, and zero-config In-Memory fallback) |

---

## 🏛️ System Architecture

```text
React Frontend (Vite SPA @ http://localhost:5173)
       │
       │ HTTP / JSON REST API requests
       │ Authorization: Bearer <JWT>
       ▼
Express.js / Node.js Backend (@ http://localhost:5000)
       ├── Custom Middleware (CORS, JSON Parser, JWT Verification, Centralized Error Handling)
       ├── Controllers (authController, postController, userController)
       └── Mongoose ODM (User and Post schemas & validation)
       ▼
MongoDB Database (Local / Atlas / In-Memory)
       ├── 'users' collection (name, email, password hash, timestamps)
       └── 'posts' collection (content, author ObjectId, likes [ObjectId], timestamps)
```

---

## 📁 Project Structure

```text
fswd-CBP/
├── package.json               # Root workspace scripts (run server/client)
├── .gitignore                 # Root gitignore (node_modules, .env, dist)
├── README.md                  # Comprehensive project documentation
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection & zero-config fallback setup
│   ├── controllers/
│   │   ├── authController.js  # Registration, login, and session handlers
│   │   ├── postController.js  # Feed retrieval, post creation, delete & likes
│   │   └── userController.js  # Profile statistics & user-specific posts
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT Bearer verification & user population
│   │   └── errorMiddleware.js # Centralized Mongoose & server error handling
│   ├── models/
│   │   ├── User.js            # User schema with bcrypt pre-save hook
│   │   └── Post.js            # Post schema with author ref & likes array
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth routes
│   │   ├── postRoutes.js      # /api/posts routes
│   │   └── userRoutes.js      # /api/users routes
│   ├── .env                   # Local environment configuration
│   ├── .env.example           # Template for environment configuration
│   ├── test-auth.js           # Automated test suite for authentication
│   ├── test-all-api.js        # Automated test suite for full API & authorization
│   ├── package.json           # Server dependencies and scripts
│   └── server.js              # Express app entry point
└── client/
    ├── index.html             # Client HTML entry point
    ├── vite.config.js         # Vite configuration with /api reverse proxy
    ├── tailwind.config.js     # Tailwind CSS theme configuration
    ├── postcss.config.js      # PostCSS configuration
    ├── package.json           # Frontend dependencies
    └── src/
        ├── api/
        │   └── axiosInstance.js   # Axios instance with JWT interceptor
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx         # Header with branding, links, and logout
        │   │   ├── ProtectedRoute.jsx # Route guard for authenticated pages
        │   │   ├── LoadingSpinner.jsx # Reusable animated loading state
        │   │   └── ModalConfirm.jsx   # Deletion confirmation modal
        │   └── posts/
        │       ├── CreatePost.jsx     # Post box with 280-character counter
        │       ├── PostCard.jsx       # Single post with author, date, and actions
        │       └── LikeButton.jsx     # Heart toggle with optimistic counter
        ├── context/
        │   └── AuthContext.jsx        # Global user authentication state
        ├── hooks/
        │   └── useAuth.js             # Custom hook for consuming AuthContext
        ├── pages/
        │   ├── HomePage.jsx           # Global community feed
        │   ├── LoginPage.jsx          # User login page
        │   ├── RegisterPage.jsx       # User registration page
        │   ├── ProfilePage.jsx        # User stats and personal activity timeline
        │   └── NotFoundPage.jsx       # 404 Not Found page
        ├── utils/
        │   └── dateUtils.js           # Relative timestamp formatter ("5m ago")
        ├── App.jsx                    # Root routes container
        ├── main.jsx                   # React DOM render entry point
        └── index.css                  # Tailwind directives and styles
```

---

## ⚙️ Environment Variables (`server/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/devpulse` |
| `JWT_SECRET` | Secret key for signing and verifying JWT tokens | `devpulse_college_project_jwt_secret_key_12345` |
| `JWT_EXPIRE` | Expiration window for issued JWT tokens | `7d` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |

---

## 🚀 Running the Application Locally

### 1. Quick Start (From Root)

Install all dependencies:
```bash
npm run install:all
```

Start the backend:
```bash
npm run server
```

In a second terminal, start the frontend:
```bash
npm run client
```

Open your browser at: **`http://localhost:5173`**

---

### 2. Manual Startup

#### Running the Backend
```bash
cd server
npm install
npm run dev     # Starts Express on http://localhost:5000
```

#### Running the Frontend
```bash
cd client
npm install
npm run dev     # Starts Vite dev server on http://localhost:5173
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | Public | Server health check |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/api/auth/me` | Protected | Get active logged-in user profile |
| `GET` | `/api/posts` | Protected | Fetch chronological feed (newest first) |
| `POST` | `/api/posts` | Protected | Create new text post (1–280 characters) |
| `DELETE`| `/api/posts/:id` | Protected | Delete post (**author only**, 403 on mismatch) |
| `PUT` | `/api/posts/:id/like` | Protected | Toggle like/unlike with atomic `$addToSet` / `$pull` |
| `GET` | `/api/users/:id` | Protected | Fetch user statistics (postCount, totalLikesReceived) |
| `GET` | `/api/users/:id/posts`| Protected | Fetch posts authored by specific user |

---

## 🧪 Automated Testing

Both automated test suites can be executed against the backend server:

```bash
# 1. Test Authentication & JWT System
node server/test-auth.js

# 2. Test All Endpoints, CRUD, Likes, and Security Authorization
node server/test-all-api.js
```

**Test Coverage Summary:**
- Valid user registration & duplicate email prevention (400)
- Input validations & password length checks
- Valid login & credential verification
- Invalid login (wrong password or unknown email)
- Token-less request rejection (401)
- Tampered token rejection (401)
- Post creation & 280-character boundary limits
- Reverse-chronological feed sorting
- Atomic like/unlike toggling (double-like prevention)
- **Security Check:** HTTP 403 Forbidden when a user attempts to delete another user's post
- Author post deletion (200 OK)
- 404 handling on deleted or non-existent resources

---

## 🎓 Viva Defense & Architecture Highlights

1. **Why JWT instead of server sessions?**
   - Stateless authentication removes the requirement for a server-side session store (e.g. Redis), improving horizontal scalability and strictly adhering to REST principles.
2. **How is the delete post operation secured?**
   - We do not rely solely on hiding the trash icon in React. The backend controller `deletePost` extracts `req.user._id` from the verified token and explicitly checks `if (post.author.toString() !== req.user._id.toString()) return res.status(403)`.
3. **How do we prevent duplicate likes?**
   - Likes are stored as an array of User ObjectIds (`likes: [ObjectId]`). We use MongoDB's atomic operator `$addToSet: { likes: req.user._id }`, preventing race conditions and double-likes at the database engine level.
4. **How are relations managed in MongoDB?**
   - Posts reference the User collection via `author: { type: ObjectId, ref: 'User' }`. Mongoose dynamically joins the documents on query via `.populate('author', 'name email')`.
