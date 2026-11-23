# Ubuntu deployment

The production
checkout is `~/apps/cse03/src`; Compose and its private `.env` are in
`~/apps/cse03` on `cse03`.

## Automatic publishing

The Windows scheduled task `TCM Website Auto Publish` starts the publisher at
sign-in. `scripts/start-auto-publish.ps1` runs it in the background. After saved
website files stop changing for 45 seconds, it commits and pushes `main` to
GitHub. Unsaved VS Code edits cannot be published. The computer needs internet
access and working GitHub authentication. The publisher does not need the VPN.

The publisher covers website source, public assets, Prisma source, scripts,
documentation, tests and the known root configuration files. Environment files,
SSH/VPN credentials, databases and build outputs stay excluded. Recognized
credential patterns and staged files outside this scope stop the attempt. Other
branches require manual publishing. Logs: `.local-deploy/publisher.log`.

Ubuntu's `tcm-ubuntu-deploy.timer` checks GitHub every minute, independently of
the Windows computer and VPN. It builds new revisions, checks for database
schema differences, restarts only `web`, and verifies the homepage through
Caddy. A failed homepage check restores the previous running image. The timer
never applies future database migrations automatically; schema differences stop
deployment for review. A blocked revision is not retried until its source or
environment changes, or an operator removes `.blocked-revision` after resolving
the cause. Database contents and volumes are never replaced by the publisher.

```sh
systemctl status tcm-ubuntu-deploy.timer
journalctl -u tcm-ubuntu-deploy.service -n 80 --no-pager
```

The Compose build passes `DEPLOY_REV` as a build argument so code or private
environment changes invalidate the final build step. Package installation is
cached separately from source changes. Secrets remain BuildKit mounts.

The public domain still needs to be routed by school IT to this Ubuntu host.
Neither publisher nor timer modifies central Dokploy or the school's proxy.

The development schema uses SQLite. The production Docker build must run:

```sh
node scripts/prepare-production-schema.cjs
npx prisma generate --schema=prisma/schema.production.prisma
npm run build
```

These commands run in the existing Compose build step with the `dotenv` secret
mounted. The generated production schema is ignored by Git. Never copy a local
SQLite database or local environment file to production.

Normal deployment after committing and pushing:

```sh
cd ~/apps/cse03
git -C src pull --ff-only
docker compose build web
docker compose up -d --no-deps web
docker compose ps
curl -fsS -o /dev/null -w '%{http_code}\n' -H 'Host: cse03.tcmusa.ai' http://127.0.0.1/
curl -fsS -o /dev/null -w '%{http_code}\n' https://cse03.tcmusa.ai/
```

For a schema change, obtain approval and create a private PostgreSQL backup
before applying it. Inspect the proposed SQL first. Do not use destructive
acceptance flags. The schema command for this deployment is:

```sh
docker compose run --rm --no-deps web npx prisma db push --schema=prisma/schema.production.prisma --skip-generate
```

Preserve the existing PostgreSQL volume and Caddy routing. Compare the public
homepage's Next.js asset paths with those returned directly by Ubuntu to detect
a domain still routed to an older server.
