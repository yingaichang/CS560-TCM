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

Windows task controls (PowerShell):

```powershell
Get-ScheduledTask -TaskName 'TCM Website Auto Publish'
& ./scripts/pause-auto-publish.ps1
& ./scripts/pause-auto-publish.ps1 -Resume
Start-ScheduledTask -TaskName 'TCM Website Auto Publish'
```

Use the pause helper to stop publishing while editing a group of files. The pause
persists across sign-ins until resumed. Stopping the Windows task alone may leave
its detached Node process running; use the helper for reliable publishing control.

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

The public domain must be routed by school IT to this Ubuntu host. The live
status page compares public and Ubuntu asset fingerprints to confirm the switch.
Neither publisher nor timer modifies central Dokploy or the school's proxy.

## Live system checks

The admin-only architecture status page now runs actual read-only service checks
with a 30-second cache. It checks database connectivity and required schema
columns, Clerk API authentication, SMTP connection/authentication, Stripe's
read-only API, deployment revision evidence and the public-domain asset version.
It never sends messages, sends verification codes, charges a card or changes
database data. API connectivity does not verify end-to-end delivery or complete
unfinished clinical, account, student or AI features.

The operator can run the identical checks over SSH without bypassing page access:

```sh
cd ~/apps/cse03
docker compose exec -T web node scripts/check-system-connections.cjs
```

Only safe summaries are emitted. Missing provider configuration stays incomplete;
rejected credentials and routing mismatches are reported as failures. Never change
these results to success without performing the corresponding check. The Ubuntu
deployment script writes a private `.local-deploy/deployment-status.json` after a
successful HTTP 200 check; Compose mounts that directory read-only into `web` and
the status page compares the evidence with the image's `SITE_BUILD_REVISION`.

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
