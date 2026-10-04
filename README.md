# Lanes — Project Management Tool

A full-stack, real-time project management tool (Trello/Asana-style): auth, projects with
members, drag-and-drop boards, task cards with assignees/priority/due dates/labels, threaded
comments, and live notifications — all synced instantly across everyone viewing a board.

**Stack:** React 18 + Vite + Tailwind (frontend) · Node.js + Express + MongoDB/Mongoose +
Socket.IO (backend) · JWT auth · Zustand for client state.

## Project structure

```
pmt/
├── backend/          Express API + Socket.IO server
│   └── src/
│       ├── config/        MongoDB connection
│       ├── models/        User, Project, List, Task, Comment, Notification
│       ├── controllers/   Route handlers (business logic + socket emits)
│       ├── routes/        Express routers
│       ├── middleware/    JWT auth guard, error handling
│       ├── sockets/       Socket.IO auth + room management
│       └── utils/         Token signing, permission helpers
└── frontend/         React app
    └── src/
        ├── api/            Axios wrappers per resource
        ├── store/          Zustand stores (auth, notifications)
        ├── lib/            Socket.IO client
        ├── components/     Board, task card, modals, navbar, etc.
        └── pages/          Login, Register, Dashboard, ProjectBoard
```

## How it works

- **Auth:** email/password, bcrypt-hashed, JWT bearer tokens (7-day expiry). The token is
  reused to authenticate the Socket.IO connection (`socket.handshake.auth.token`).
- **Data model:** a `Project` has embedded `members` (with `owner`/`admin`/`member` roles).
  Each project owns `List`s (columns — To Do / In Progress / Done by default), each list owns
  `Task`s (cards), each task owns `Comment`s. `Notification`s are created server-side whenever
  someone is assigned a task, a task they're on gets a comment, or they're added to a project.
- **Real-time:** every mutating request (create/update/move/delete on lists, tasks, comments,
  members) emits a Socket.IO event to the room `project:<id>`, so everyone with that board open
  sees the change immediately — including the board owner's own actions, which keeps every
  client's state derived from one source of truth. A second room, `user:<id>`, is used to push
  live notifications regardless of which page someone is on.
- **Drag-and-drop:** handled with `@hello-pangea/dnd` on the frontend and a dedicated
  `POST /tasks/:id/move` endpoint that re-indexes both the source and destination lists.

## Running it locally

> **New to this?** Follow the detailed walkthrough in [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)
> (installing Node, choosing MongoDB, troubleshooting). The short version is below.

### 1. MongoDB
Use a local install (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
— either way you just need a connection string.

### 2. Backend
```bash
cd backend
cp .env.example .env     # then fill in MONGODB_URI and a real JWT_SECRET
npm install
npm run dev               # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env      # defaults already point at localhost:5000
npm install
npm run dev                # http://localhost:5173
```

Open two browser windows side by side, sign up as two different users, add the second user to
a project by email from the **Invite** button, and drag a card — the other window updates
instantly.

## Notable API routes

| Method | Route                          | Purpose                        |
|--------|---------------------------------|---------------------------------|
| POST   | `/api/auth/register`            | Create account                 |
| POST   | `/api/auth/login`               | Sign in                        |
| GET    | `/api/projects`                 | List my projects               |
| POST   | `/api/projects`                 | Create project (seeds 3 lists) |
| GET    | `/api/projects/:id`              | Full board (project+lists+tasks)|
| POST   | `/api/projects/:id/members`      | Invite by email                |
| POST   | `/api/lists`                     | Add a column                   |
| POST   | `/api/tasks`                     | Create a card                  |
| POST   | `/api/tasks/:id/move`            | Drag-and-drop move              |
| POST   | `/api/tasks/:taskId/comments`    | Comment on a card               |
| GET    | `/api/notifications`             | My notifications                |

## Possible next steps

Password reset flow, file attachments on tasks, activity log per project, and CSV/board
export would all be natural follow-ups if you want to keep extending this.
