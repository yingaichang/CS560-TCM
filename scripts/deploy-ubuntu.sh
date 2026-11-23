#!/usr/bin/env bash
set -Eeuo pipefail
cd "$HOME/apps/cse03"
exec 9> .deploy.lock
flock -n 9 || exit 0
git -C src fetch origin main
target=$(git -C src rev-parse origin/main)
environment=$(sha256sum .env | cut -d ' ' -f 1)
revision="$target-$environment"
if [[ -f .deployed-revision && $(cat .deployed-revision) == "$revision" ]]; then exit 0; fi
if [[ -f .blocked-revision && $(cat .blocked-revision) == "$revision" ]]; then
  echo "This revision needs attention; see the previous service log."
  exit 0
fi
fail() {
  printf '%s\n' "$revision" > .blocked-revision
  echo "Deployment stopped; existing database and previous running website are preserved."
}
trap fail ERR
if [[ -n $(git -C src status --porcelain) ]]; then
  echo 'Server checkout contains local changes; refusing to overwrite them.'
  exit 1
fi
git -C src merge --ff-only origin/main
running=$(docker compose ps -q web)
previous=''
if [[ -n "$running" ]]; then
  previous=$(docker inspect -f '{{.Image}}' "$running")
  docker image tag "$previous" cse03-web:rollback
fi
export DEPLOY_REV="$revision"
docker compose build web
# Future database changes require review; never apply migrations automatically.
if ! docker compose run --rm --no-deps -T web npx prisma migrate diff \
  --from-schema-datasource prisma/schema.production.prisma \
  --to-schema-datamodel prisma/schema.production.prisma --exit-code; then
  echo 'Database schema differs or cannot be checked. Review and approve it before deployment.'
  fail
  exit 1
fi
docker compose up -d --no-deps web
healthy=false
for attempt in {1..15}; do
  code=$(curl -sS --max-time 10 -o /dev/null -w '%{http_code}' -H 'Host: cse03.tcmusa.ai' http://127.0.0.1/ || true)
  if [[ "$code" == 200 ]]; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  if [[ -n "$previous" ]]; then
    docker image tag "$previous" cse03-web
    docker compose up -d --no-deps web
  fi
  echo 'New homepage failed its health check; restored the previous web image.'
  fail
  exit 1
fi
printf '%s\n' "$revision" > .deployed-revision
rm -f .blocked-revision
echo "Ubuntu deployment verified: $target (homepage HTTP 200)."
