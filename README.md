# 🏫 CampusHive

**CampusHive** is a full-stack academic management web platform that unifies student, faculty, and admin workflows into one digital campus hub. It provides three role-based portals — Admin, Teacher, and Student — with real-time collaboration features powered by Socket.io.

---

## 🚀 Live Demo Credentials

| Role    | Email                        | Password     | Portal URL              |
|---------|------------------------------|--------------|-------------------------|
| Admin   | admin@campushive.com         | admin123     | `/admin/dashboard`      |
| Teacher | teacher@campushive.com       | teacher123   | `/teacher/dashboard`    |
| Student | student@campushive.com       | student123   | `/student/dashboard`    |

---

## ✨ Core Features

1. **User & Role Management** — Admin registers students and teachers, auto-generates roll numbers, and supports bulk CSV import
2. **Course & Enrollment Management** — Create courses, assign teachers, and auto-enroll entire student batches with one click
3. **Course Material Repository** — Teachers upload lecture files; students download and bookmark resources
4. **LabTrack — Lab Report System** — Students submit lab reports; teachers grade with letter grades and written feedback
5. **Real-Time Live Quiz** — Teachers launch Socket.io quizzes; students get instant alerts and take timed quizzes
6. **Campus Community Services** — Study Circles (peer study sessions + RSVP) and Lost & Found portal

---

## 🛠️ Technology Stack

### Frontend
| Technology       | Version  | Purpose                          |
|-----------------|----------|----------------------------------|
| React           | 19       | UI component framework           |
| Vite            | 8        | Build tool & dev server          |
| Tailwind CSS    | 3        | Utility-first styling            |
| React Router    | 7        | Client-side routing              |
| Socket.io Client| 4        | Real-time WebSocket connection   |
| Axios           | 1        | HTTP API requests                |
| Lucide React    | Latest   | Icon library                     |
| PapaParse       | 5        | CSV parsing for bulk import      |
| Oxlint          | Latest   | JavaScript linting               |

### Backend
| Technology    | Version | Purpose                         |
|--------------|---------|---------------------------------|
| Node.js      | LTS     | Server runtime                  |
| Express.js   | 5       | REST API framework              |
| Sequelize    | 6       | ORM for database abstraction    |
| SQLite3      | 6       | Default development database    |
| MySQL2       | 3       | Production database driver      |
| Socket.io    | 4       | WebSocket server (live quizzes) |
| JWT          | 9       | Authentication tokens           |
| Bcrypt       | 6       | Password hashing (10 rounds)    |
| Multer       | 2       | File upload middleware           |
| Nodemon      | 3       | Dev server auto-restart         |
| dotenv       | 17      | Environment variable management |

---

## 📁 Project Structure

```
CampusHive/
├── backend/
│   ├── config/             # Database configuration
│   ├── controllers/        # Business logic handlers
│   ├── middleware/         # JWT auth guard, Multer uploader
│   ├── models/             # 18 Sequelize data models
│   ├── routes/             # 11 API route modules
│   ├── services/           # Shared service utilities
│   ├── sockets/            # Socket.io quiz event handlers
│   ├── utils/              # Helper functions
│   ├── uploads/            # Uploaded files (gitignored)
│   ├── seed.js             # Database seeder with demo data
│   ├── init-db.js          # Database initialiser
│   ├── server.js           # Application entry point
│   ├── .env.example        # Environment variable template
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       │   ├── auth/       # ProtectedRoute guard
│       │   └── student/    # QuizLiveBanner, NotificationBell
│       ├── context/        # AuthContext (JWT state)
│       ├── hooks/          # Custom React hooks
│       ├── pages/
│       │   ├── admin/      # Admin panel pages
│       │   ├── dashboards/ # Role dashboards
│       │   ├── student/    # Student portal pages
│       │   ├── teacher/    # Teacher panel pages
│       │   └── shared/     # Lost & Found (all roles)
│       ├── services/       # Axios API service layer
│       ├── utils/          # Utility helpers
│       ├── App.jsx         # Router & route definitions
│       └── main.jsx        # React entry point
│
├── uploads/                # Shared upload directory
└── Jira Project/           # Agile project screenshots
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v9+
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/failuresoul/CampusHive.git
cd CampusHive
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Copy the environment template and configure it:

```bash
cp .env.example .env
```

**`.env` configuration:**

```env
PORT=5000

# Database — SQLite (default, no extra setup needed)
DB_DIALECT=sqlite

# To use MySQL instead, set these:
# DB_DIALECT=mysql
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=campushive

JWT_SECRET=supersecretjwtkey_replace_me_in_production
```

Seed the database with demo users, courses, and data:

```bash
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

> Backend runs on **http://localhost:5000**

### 3. Set Up the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

> Frontend runs on **http://localhost:5173**

### 4. Open the App

Navigate to **http://localhost:5173** and log in with any demo credential above.

---

## 🗄️ Database Models

| Model              | Description                                      |
|--------------------|--------------------------------------------------|
| `User`             | All roles: admin, teacher, student               |
| `Course`           | Academic course definitions                      |
| `CourseTeacher`    | Teacher ↔ Course many-to-many join               |
| `Enrollment`       | Student ↔ Course many-to-many join               |
| `CourseMaterial`   | Uploaded files linked to courses                 |
| `MaterialBookmark` | Student bookmarks on course materials            |
| `LabReport`        | Student lab submissions with grade and feedback  |
| `Quiz`             | Quiz definitions (draft / launched / closed)     |
| `QuizQuestion`     | Questions belonging to a quiz                    |
| `QuizOption`       | Answer options with `isCorrect` flag             |
| `QuizResponse`     | Student answers with score tracking              |
| `StudySession`     | Peer study group posts                           |
| `StudySessionRsvp` | Student RSVP records for study sessions          |
| `LostFoundItem`    | Campus lost or found item reports                |
| `LostFoundClaim`   | Claim requests on found items                    |
| `Notification`     | Grade and system notifications for students      |
| `RollNumberCounter`| Per-department auto-incrementing roll numbers    |

---

## 🔌 API Routes

| Module             | Base Path                    | Description                       |
|--------------------|------------------------------|-----------------------------------|
| Auth               | `/api/auth`                  | Login, token validation           |
| Dashboard          | `/api/admin/dashboard`       | System analytics stats            |
| Students           | `/api/students`              | Student CRUD, bulk import         |
| Teachers           | `/api/teachers`              | Teacher CRUD                      |
| Courses            | `/api/courses`               | Course CRUD, assign, auto-enroll  |
| Materials          | `/api/courses/:id/materials` | File upload, download, delete     |
| Lab Reports        | `/api/lab-reports`           | Submit, grade, view submissions   |
| Quizzes            | `/api/quizzes`               | Create, launch, close quizzes     |
| Quiz Answers       | `/api/quiz-answers`          | Submit and score quiz responses   |
| Study Sessions     | `/api/study-sessions`        | Post, browse, RSVP sessions       |
| Lost & Found       | `/api/lost-found`            | Report, browse, claim items       |

---

## ⚡ Real-Time Quiz Flow (Socket.io)

```
Teacher clicks Launch
       ↓
Server emits  quiz:start  →  course:{courseId} room
       ↓
QuizLiveBanner appears on ALL student dashboards
       ↓
Student clicks "Take Quiz Now"  →  navigates to quiz page
       ↓
Server sends  quiz:question  with countdown timer
       ↓
Student selects answer  →  emits  quiz:answer
       ↓
Server marks correct/incorrect, calculates score
       ↓
Teacher views results at  /teacher/courses/:id/quizzes/:id/results
```

---

## 🔒 Security

- **Passwords** — Hashed with Bcrypt (10 salt rounds). Never stored in plain text.
- **JWT Tokens** — Signed with `JWT_SECRET`. Validated on every protected API request via `Authorization: Bearer <token>` header.
- **Route Guards** — `ProtectedRoute` React component blocks wrong-role navigation and redirects unauthenticated users to `/login`.
- **CORS** — Express CORS middleware restricts API access to allowed origins.
- **File Uploads** — Multer controls allowed file types and storage paths.

---

## 📋 Available Scripts

### Backend

| Command               | Description                          |
|-----------------------|--------------------------------------|
| `npm run dev`         | Start dev server with Nodemon        |
| `npm start`           | Start production server              |
| `npm run seed`        | Seed database with demo data         |
| `npm run init-db`     | Initialise database schema           |
| `npm run migrate`     | Run student fields migration         |
| `npm run migrate-teacher` | Run teacher fields migration     |

### Frontend

| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Start Vite dev server          |
| `npm run build` | Build production bundle        |
| `npm run preview` | Preview production build     |
| `npm run lint`  | Run Oxlint code linter         |

---

## 🗺️ Frontend Routes

### Admin Panel (`/admin/*`)
- `/admin/dashboard` — System analytics overview
- `/admin/students` — Student directory
- `/admin/students/add` — Register individual student
- `/admin/students/import` — Bulk CSV student import
- `/admin/teachers` — Faculty directory
- `/admin/teachers/add` — Register new teacher
- `/admin/courses` — Course catalog
- `/admin/courses/create` — Create new course
- `/admin/courses/assign-teachers` — Assign faculty to courses
- `/admin/courses/auto-enroll` — Bulk enroll student batches

### Teacher Panel (`/teacher/*`)
- `/teacher/dashboard` — Faculty overview with assigned courses
- `/teacher/submissions` — LabTrack report queue
- `/teacher/submissions/:id/grade` — Grade individual report
- `/teacher/courses/:id/materials` — Manage course files
- `/teacher/courses/:id/materials/upload` — Upload new material
- `/teacher/courses/:id/quizzes/create` — Build a new quiz
- `/teacher/courses/:id/quizzes/:id/launch` — Live quiz controller
- `/teacher/courses/:id/quizzes/:id/results` — Quiz analytics

### Student Portal (`/student/*`)
- `/student/dashboard` — Personal hub with live quiz banner
- `/student/courses` — Enrolled course cards
- `/student/courses/:id/materials` — Download course files
- `/student/courses/:id/labtrack/history` — View lab submissions
- `/student/courses/:id/labtrack/upload` — Submit lab report
- `/student/courses/:id/labtrack/submissions/:id` — Submission detail
- `/student/courses/:id/quizzes/:id/take` — Take live quiz
- `/student/courses/:id/quizzes/:id/results` — View quiz score
- `/student/bookmarks` — Personal bookmarks library
- `/student/study-sessions` — Browse study groups
- `/student/study-sessions/create` — Post a new study session
- `/student/study-sessions/:id` — Session detail & RSVP

### Shared (`/lost-found/*`) — All roles
- `/lost-found` — Browse all campus lost & found items
- `/lost-found/post` — Report a lost or found item
- `/lost-found/:id` — Item detail & claim form

---

## 🏃 Agile Project Management

This project was managed using **Jira Software** with an Agile Scrum framework:

- **2-week sprints** with planning, standups, review, and retrospective
- **Epic → User Story → Sub-task** issue hierarchy
- **Story Points** estimated using Fibonacci scale (1, 2, 3, 5, 8, 13)
- **Zephyr Scale** for test case management and execution tracking
- Full bidirectional traceability: User Story → Test Case → Defect → Fix

---

## 📄 License

This project is for academic and demonstration purposes.

---

## 👤 Author

**CampusHive** — Developed as a full-stack academic project.

GitHub: [https://github.com/failuresoul/CampusHive](https://github.com/failuresoul/CampusHive)