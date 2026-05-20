# StudentHub (student_forum)

Galala University student community platform — React frontend, Node.js API, PostgreSQL, Docker Compose with load balancing.

## Quick start

```bash
docker compose up --build -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| API (load balancer) | http://localhost:3000/api |

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gu.edu.eg` | `admin123456` |
| Student | `ahmed@gu.edu.eg` | `student123456` |

## Architecture

- **frontend** — React SPA (Nginx, port 80), proxies `/api` to load balancer
- **lb** — Nginx round-robin load balancer (port 3000)
- **api-1 / api-2** — Node.js + Express + Prisma API replicas
- **db** — PostgreSQL 16 with persistent volume `postgres_data`
- **seed** — one-shot Prisma seed job

Networks: `public_net` (frontend, lb) and `backend_net` (internal — db, APIs).

## Load balancing demo

```bash
for i in {1..6}; do curl -s http://localhost:3000/api/health | grep instance; done
docker stop studenthub-api-2-1   # traffic continues on api-1
```

## Local development

```bash
# API stack
docker compose up -d db lb api-1 api-2 seed

# Frontend dev server
cd frontend && npm install && npm run dev
```

Copy `.env.example` to `.env` if running services outside Docker.

## Course requirements (CSE 363)

1. **Compute isolation** — Docker containers per service  
2. **Network virtualization** — `public_net` + internal `backend_net`, hostname-based communication  
3. **Data persistence** — Docker volume `postgres_data`  
4. **Resource limits** — 0.5 CPU / 256MB on `api-1` and `api-2`  
5. **Option A: Load balancing** — Nginx distributes traffic across two API replicas  
