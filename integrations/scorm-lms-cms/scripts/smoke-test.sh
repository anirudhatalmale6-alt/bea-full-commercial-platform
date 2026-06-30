#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${1:-http://localhost:4000}"
echo "Checking $BASE_URL/health"
curl -fsS "$BASE_URL/health" | grep -q 'ok'
echo "Health OK"
echo "For protected endpoints, login first or pass a valid JWT in AUTH_TOKEN."
if [[ -n "${AUTH_TOKEN:-}" ]]; then
  curl -fsS -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/api/lms/catalogue" > /tmp/lea_catalogue.json
  curl -fsS -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/api/scorm/packages" > /tmp/lea_scorm.json
  echo "Protected endpoint smoke checks passed."
fi
