// Prueba de carga k6 · requisitos no funcionales (openspec: operacion-plataforma).
// 250 usuarios virtuales durante 10 min: inicio de sesión, inicio, biblioteca,
// abrir un libro y, para docentes, Mi curso. Umbrales: p95 < 500 ms y errores < 1 %.
// La descarga de páginas de libros (/libros/*) no se mide: la sirve el proxy.
//
// Cuentas: CSV de scripts/poblar-demo.ts (rol,curso,nombres,apellidos,correo,contrasena),
// datos ficticios. Guía completa en docs/operacion.md:
//   docker run --rm -i --network host -v "$PWD/tests/carga:/carga" -v "$CREDENCIALES:/cred.csv:ro" \
//     -e BASE=https://localhost -e CREDENCIALES=/cred.csv grafana/k6:1.8.2 run /carga/escenario.js
import http from "k6/http";
import { check, fail, group, sleep } from "k6";
import { SharedArray } from "k6/data";

const BASE = (__ENV.BASE || "https://localhost").replace(/\/$/, "");
const LIBROS = ["prestame-tus-ojos", "una-sonrisa-de-mariposa", "palabra-ultima", "la-muneca-negra"];

const cuentas = new SharedArray("cuentas", () => {
  const [, ...filas] = open(__ENV.CREDENCIALES || "/cred.csv").replace(/^﻿/, "").trim().split("\n");
  return filas
    .map((f) => f.split(","))
    .filter(([rol]) => rol === "DOCENTE" || rol === "ESTUDIANTE")
    .map(([rol, , , , correo, contrasena]) => ({ rol, correo, contrasena }));
});

export const options = {
  insecureSkipTLSVerify: __ENV.TLS_INTERNO !== "0", // `tls internal` en la LAN o en local
  noCookiesReset: true, // la sesión de cada VU dura toda la prueba
  scenarios: {
    navegacion: {
      executor: "ramping-vus",
      stages: [
        { duration: "2m", target: 250 },
        { duration: "7m", target: 250 },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    "http_req_duration{medir:si}": ["p(95)<500"],
    "http_req_failed{medir:si}": ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};

const pagina = (ruta, nombre) => {
  const r = http.get(`${BASE}${ruta}`, { tags: { medir: "si", name: nombre }, redirects: 0 });
  check(r, { [`${nombre} 200`]: (x) => x.status === 200 });
  return r;
};

function iniciarSesion(cuenta) {
  const csrf = http.get(`${BASE}/api/auth/csrf`, { tags: { medir: "si", name: "csrf" } }).json("csrfToken");
  const r = http.post(
    `${BASE}/api/auth/callback/credentials`,
    { csrfToken: csrf, correo: cuenta.correo, contrasena: cuenta.contrasena, callbackUrl: `${BASE}/` },
    { headers: { Origin: BASE }, tags: { medir: "si", name: "login" }, redirects: 0 },
  );
  const ok = check(r, { "login emite sesión": (x) => x.status === 302 && !!x.cookies["__Secure-authjs.session-token"] });
  if (!ok) fail(`inicio de sesión fallido (${r.status})`);
}

export default function navegar() {
  const cuenta = cuentas[(__VU - 1) % cuentas.length];
  // Cada VU entra una vez (la cookie persiste en su jar entre iteraciones).
  if (__ITER === 0) group("inicio de sesión", () => iniciarSesion(cuenta));

  group("inicio", () => pagina("/", "inicio"));
  sleep(2 + Math.random() * 3);
  group("biblioteca", () => pagina("/biblioteca", "biblioteca"));
  sleep(2 + Math.random() * 3);
  group("abrir libro", () => pagina(`/biblioteca/leer/${LIBROS[__ITER % LIBROS.length]}`, "leer"));
  sleep(5 + Math.random() * 5);
  if (cuenta.rol === "DOCENTE") {
    group("mi curso", () => pagina("/mi-curso", "mi-curso"));
    sleep(2 + Math.random() * 3);
  }
}
