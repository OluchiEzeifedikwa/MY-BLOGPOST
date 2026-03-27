# MY-BLOGPOST

A RESTful blog API built with Express, TypeScript, Prisma, and PostgreSQL. Features user authentication, posts, comments, likes, notifications, and real-time WebSocket support.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **ORM:** Prisma (PostgreSQL)
- **Auth:** JWT + bcrypt
- **File Uploads:** Multer + Cloudinary
- **Validation:** Zod
- **Real-time:** WebSockets (ws)

## Project Structure

```
src/
├── controllers/   # Route handler logic
├── middleware/    # Auth, error handling, etc.
├── repository/    # Database access layer
├── routes/        # Express route definitions
├── services/      # Business logic
├── lib/           # Shared utilities/config
└── index.ts       # App entry point
```

## Getting Started

### Prerequisites

- Node.js v20+
- pnpm (`npm install -g pnpm`)
- A PostgreSQL database (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com))

### Setup

1. Clone the repo and install dependencies:

```bash
pnpm install
```

2. Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. Run Prisma migrations:

```bash
pnpm prisma migrate dev
```

4. Start the dev server:

```bash
pnpm dev
```

The server starts with `nodemon` and reloads on file changes.

## Data Models

| Model        | Description                        |
|--------------|------------------------------------|
| User         | Auth, profile, posts, comments     |
| Profile      | Bio, location, pronoun, avatar     |
| Post         | Title, content, image, published   |
| Comment      | Tied to a user and a post          |
| Like         | One like per user per post         |
| Notification | LIKE or COMMENT events per user    |
