# Docker setup

The Compose stack runs the React client, NestJS server, and an isolated MongoDB:

- Client: http://localhost:8080
- Server: http://localhost:3000
- Docker MongoDB: `mongodb://localhost:27018/permission-management`

MongoDB is exposed on port `27018` so it does not conflict with the existing Windows MongoDB on port `27017`.

## Start everything with one command

Optionally copy `.env.example` to `.env` and change `JWT_SECRET`, then run from the repository root:

```powershell
npm run docker:up
```

This single command builds and starts the client, server, and MongoDB. The server automatically creates an idempotent review account on startup:

```text
username: superadmin
role: ANOMALY_ADMIN
```

Log in as `superadmin`. Each reviewer starts with an otherwise empty database and can create their own review data through the application.

View status and logs with:

```powershell
docker compose ps
docker compose logs -f server client mongo
```

## Development with live reload

With Docker Desktop running, start from the repository root:

```powershell
npm run docker:dev
```

Open http://localhost:8080. React and NestJS reload when you edit their source files. Logs appear in the terminal; press Ctrl+C to stop, or run `npm run docker:dev:down` to remove the containers while preserving MongoDB data.

Stop the production stack with `docker compose down` before switching to development, since both use the same ports and database. After changing dependencies, stop development, run `docker compose -f compose.dev.yaml run --rm --no-deps server npm ci` (replace `server` with `client` for frontend dependencies), then restart development.

## Stop or reset

Stop containers while preserving Docker MongoDB data:

```powershell
docker compose down
```

Delete the Docker MongoDB data and start fresh:

```powershell
docker compose down --volumes
```

The last command permanently deletes only that reviewer's database stored in the Compose volume. On the next `npm run docker:up`, MongoDB starts empty and the server recreates `superadmin` automatically.
