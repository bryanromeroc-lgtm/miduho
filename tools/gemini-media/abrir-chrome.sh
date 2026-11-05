#!/usr/bin/env bash
# Abre Google Chrome con un perfil DEDICADO y el puerto de depuración 9222,
# para que Claude (playwright-core, connectOverCDP) controle tu sesión de Gemini chat.
# El perfil vive fuera de git (ver .gitignore). Inicia sesión en Gemini a mano, una sola vez.
set -euo pipefail
PERFIL="${GEMINI_PERFIL:-$HOME/.config/miduho-gemini-chrome}"
PUERTO="${GEMINI_PUERTO:-9222}"
exec env -u GTK_PATH -u GIO_MODULE_DIR -u GSETTINGS_SCHEMA_DIR -u GTK_EXE_PREFIX -u GTK_IM_MODULE_FILE -u LOCPATH -u LD_LIBRARY_PATH -u XDG_DATA_HOME -u XDG_DATA_DIRS -u XDG_CONFIG_DIRS google-chrome \
  --user-data-dir="$PERFIL" \
  --remote-debugging-port="$PUERTO" \
  --remote-debugging-address=127.0.0.1 \
  --no-first-run --no-default-browser-check \
  "https://gemini.google.com/app"
