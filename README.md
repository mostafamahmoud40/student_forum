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
| **Monitoring dashboard (Grafana)** | http://localhost:3030 |
| cAdvisor (raw container UI) | http://localhost:8081 |
| Prometheus | http://localhost:9090 |

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

## Monitoring dashboard (live demo)

Open **Grafana** during the demo: http://localhost:3030  
- Login (optional): `admin` / `admin` — or use anonymous view  
- Dashboard: **StudentHub Live Monitoring** (auto-loaded, refreshes every 5s)

Shows:
- **Container metrics** (CPU, memory, network) per Docker cgroup via cAdvisor — panels group by `id` (Docker cgroup path) because Compose service labels are not always exported on cgroup v2.
- **DB memory** uses the container `image` label matching `postgres`.
- **Application metrics** from `api-1` and `api-2` (HTTP req/s, process CPU/RAM via Prometheus)

If container panels show **No data**, restart Grafana after `docker compose up -d` so the updated dashboard JSON is re-provisioned: `docker compose restart grafana`.

Generate traffic while watching the dashboard:

```bash
for i in {1..30}; do curl -s http://localhost/api/health > /dev/null; done
```

Stack: `cadvisor` → `prometheus` → `grafana` (see `monitoring/`).

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
