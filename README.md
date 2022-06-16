# WebCrypt Session

# Example
```bash
cd examples/cloudflare
npx wrangler dev
```
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"username": "satoshi" }' \
  --cookie-jar dev/cookie.txt \
  http://localhost:8787/signIn
```
```bash
curl --cookie dev/cookie.txt  http://localhost:8787
```
