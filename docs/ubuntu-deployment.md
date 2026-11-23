# Ubuntu deployment

GitHub pushes do not automatically deploy this installation. The production
checkout is `~/apps/cse03/src`; Compose and its private `.env` are in
`~/apps/cse03` on `cse03`.

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
