# GOG Mail Bridge Ops Note

## Purpose

The fitness app does **not** send email directly from inside the container.
Instead, it posts to a small localhost bridge that runs on the VPS host and sends mail using the already-working `gog gmail send` path.

## Current Flow

1. User submits inquiry on `https://fitness.ruffo.ai`
2. `app/api/prospects/route.ts` saves the lead
3. The app asynchronously calls the local bridge at `GOG_MAIL_BRIDGE_URL`
4. The bridge runs `gog gmail send`
5. Two emails are sent:
   - confirmation email to the lead
   - notification email to Ruffo

## Runtime Pieces

### App
- Repo: `/root/projects/fitness-app-v2`
- Live container: `fitness-app`
- Public URL: `https://fitness.ruffo.ai`

### Bridge
- Script: `/root/projects/fitness-app-v2/scripts/gog-mail-bridge.mjs`
- systemd unit: `/etc/systemd/system/gog-mail-bridge.service`
- Health check: `http://127.0.0.1:3011/health`

## Critical Environment Variables

### App `.env`
Located at:
- `/root/projects/fitness-app-v2/.env`

Important values:
- `GOG_MAIL_BRIDGE_URL`
- `GOG_MAIL_BRIDGE_TOKEN`
- `PROSPECT_NOTIFICATION_EMAIL`
- `OWNER_NAME`
- `BUSINESS_NAME`
- `PUBLIC_APP_URL`
- `GMAIL_USER` (used as reply/sender identity context in templates)

### Bridge service env
Currently wired directly in the systemd unit for reliability:
- `GOG_MAIL_ACCOUNT=jarvis@ruffo.ai`
- `GOG_KEYRING_PASSWORD=...`
- `GOG_MAIL_BRIDGE_TOKEN=...`

## Restart Commands

### Restart bridge
```bash
systemctl daemon-reload
systemctl restart gog-mail-bridge.service
systemctl status gog-mail-bridge.service --no-pager
```

### Restart app
```bash
docker compose -f /docker/fitness-app/docker-compose.yml up -d --build
```

## Verify

### Bridge health
```bash
curl http://127.0.0.1:3011/health
```

### Bridge direct send
```bash
curl -X POST http://127.0.0.1:3011/send \
  -H 'Content-Type: application/json' \
  -H 'x-bridge-token: <TOKEN>' \
  --data '{
    "messages": [
      {
        "to": "brian@ruffo.ai",
        "subject": "Bridge test",
        "body": "Bridge test body"
      }
    ]
  }'
```

### Logs
```bash
journalctl -u gog-mail-bridge.service -n 100 --no-pager

docker logs --tail 100 fitness-app
```

## Token Rotation

If you rotate `GOG_MAIL_BRIDGE_TOKEN`:
1. update `/root/projects/fitness-app-v2/.env`
2. update `/etc/systemd/system/gog-mail-bridge.service`
3. restart bridge
4. redeploy/restart app container

Both sides must match.

## Notes

- Direct Gmail/Nodemailer inside the app was abandoned because npm registry access failed and the host already had a working Gmail send path through `gog`.
- The bridge uses `jarvis@ruffo.ai` because that gog account already had working auth on this VPS.
- If mail suddenly stops working, check:
  - bridge token mismatch
  - keyring password mismatch
  - gog auth/token state for `jarvis@ruffo.ai`
