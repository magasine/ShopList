#!/usr/bin/env sh
# Monta dist/ com apenas os arquivos públicos do app, para o Cloudflare Pages.
# Configuração no painel do Pages:
#   Build command:          sh build.sh
#   Build output directory: dist
# Qualquer arquivo novo que deva ir para o ar precisa entrar na lista abaixo.
set -eu

FILES="
index.html
manual.html
privacy.html
terms.html
reset.html
sw.js
manifest.json
icon-192.png
icon-512.png
icon-maskable.png
_headers
"

rm -rf dist
mkdir dist
for f in $FILES; do
  cp "$f" dist/
done

echo "dist/ pronto:"
ls -la dist
