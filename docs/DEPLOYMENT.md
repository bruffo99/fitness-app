# Deployment

## Production URL

- `https://fitness.ruffo.ai`

## Current Production Topology

This app is deployed on the VPS behind Traefik.

- **Traefik** handles TLS and hostname routing on ports 80/443
- **fitness-proxy** exposes the `fitness.ruffo.ai` route to Traefik
- **fitness-app** is the Dockerized Next.js application
- Traefik currently forwards `fitness.ruffo.ai` traffic to `http://127.0.0.1:3004`
- The app container runs with `network_mode: host` so it can bind directly to port `3004`

## Server-Side Compose Files

These currently live on the VPS and are not fully represented inside this repo:

- Traefik: `/docker/traefik/docker-compose.yml`
- Fitness route stub: `/docker/fitness-proxy/docker-compose.yml`
- Fitness app runtime: `/docker/fitness-app/docker-compose.yml`

## App Deployment Compose

Current VPS runtime compose file:

```yaml
services:
  fitness-app:
    build: /root/projects/fitness-app-v2
    container_name: fitness-app
    restart: unless-stopped
    network_mode: host
    env_file:
      - /root/projects/fitness-app-v2/.env
    environment:
      NODE_ENV: production
      PORT: 3004
```

## Build Notes

The Docker image requires Prisma client generation during build.
That is handled in the app `Dockerfile` before `npm run build`.

## Redeploy

From the VPS:

```bash
git -C /root/projects/fitness-app-v2 pull

docker compose -f /docker/fitness-app/docker-compose.yml up -d --build
```

## Verify

```bash
docker ps | grep fitness-app

docker logs --tail 100 fitness-app

curl -I https://fitness.ruffo.ai
```

## Rollback

The previous fitness site still exists at:

- `/root/projects/fitness-site`

Traefik route stub:

- `/docker/fitness-proxy/docker-compose.yml`

If rollback is needed, point the fitness service URL back to port `3000` and recreate the fitness-proxy container.

## Known Cleanup Opportunity

Infra is currently split between:

- app repo contents
- VPS-local compose files under `/docker`

A cleaner future state would be:

- keep app runtime compose in repo
- keep environment-specific override values outside repo
- document Traefik route expectations more explicitly
