/**
 * Cuentas de administración: SOLO para el equipo de desarrollo.
 *
 * La aplicación ya no crea cuentas ADMIN ni otorga o retira ese rol: la
 * coordinación administra estudiantes y docentes, y quien tiene acceso a la
 * base de datos administra a los administradores. Este script reutiliza los
 * mismos servicios de la app, así que aplica las mismas reglas (correo único,
 * último ADMIN activo protegido, carga docente, revocación de sesiones).
 *
 * Uso (desde apps/web, con DATABASE_URL apuntando a la base correcta):
 *   npm run cuentas:admin -- invitar  <correo> "<nombres>" "<apellidos>"
 *   npm run cuentas:admin -- otorgar  <correo>     # DOCENTE → Docente y administración
 *   npm run cuentas:admin -- retirar  <correo>     # Docente y administración → DOCENTE
 *   npm run cuentas:admin -- listar
 *
 * `invitar` crea un ADMIN puro pendiente de activación y emite un enlace de
 * 24 horas; sin SMTP configurado, el enlace se imprime en esta consola.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlBaseDatos } from "../src/lib/entorno";
import { combinacionDe, ETIQUETA_COMBINACION } from "../src/lib/usuarios";
import { crearServicioCuentas } from "../src/server/auth/cuentas";
import { ErrorDominio } from "../src/server/errores";
import { crearServicioUsuarios } from "../src/server/modules/usuarios/servicio";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: urlBaseDatos() }) });
const urlBase = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const cuentas = crearServicioCuentas(db, {
  urlBase,
  notificar: async (m) => {
    console.log(`\nInvitación para ${m.para}\n${m.texto}\n`);
  },
});
const usuarios = crearServicioUsuarios(db, cuentas);

/** El actor de los cambios de rol no es una cuenta del colegio. */
const ACTOR_DESARROLLO = "equipo-desarrollo";

const AYUDA = `Uso:
  npm run cuentas:admin -- invitar <correo> "<nombres>" "<apellidos>"
  npm run cuentas:admin -- otorgar <correo>
  npm run cuentas:admin -- retirar <correo>
  npm run cuentas:admin -- listar`;

async function idPorCorreo(correo: string) {
  const u = await db.usuario.findUnique({ where: { correo: correo.trim().toLowerCase() }, select: { id: true } });
  if (!u) throw new Error(`No existe una cuenta con el correo ${correo}.`);
  return u.id;
}

async function principal([orden, ...args]: string[]) {
  switch (orden) {
    case "invitar": {
      const [correo, nombres, apellidos] = args;
      if (!correo || !nombres || !apellidos) throw new Error(AYUDA);
      const r = await usuarios.crear({ correo: correo.trim().toLowerCase(), nombres, apellidos, combinacion: "ADMIN" });
      console.log(`Cuenta ADMIN creada (${r.correo}), pendiente de activación.`);
      return;
    }
    case "otorgar":
    case "retirar": {
      const [correo] = args;
      if (!correo) throw new Error(AYUDA);
      const id = await idPorCorreo(correo);
      const combinacion = orden === "otorgar" ? "DOCENTE_ADMIN" : "DOCENTE";
      await usuarios.cambiarRoles(ACTOR_DESARROLLO, id, combinacion);
      console.log(`${correo}: ahora es «${ETIQUETA_COMBINACION[combinacion]}». Sus sesiones abiertas se cerraron.`);
      return;
    }
    case "listar": {
      const filas = await db.usuario.findMany({
        where: { roles: { some: { rol: { codigo: "ADMIN" } } } },
        orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
        select: { correo: true, estado: true, roles: { select: { rol: { select: { codigo: true } } } } },
      });
      if (!filas.length) console.log("No hay cuentas con rol ADMIN.");
      for (const f of filas) {
        const c = combinacionDe(f.roles.map((r) => r.rol.codigo));
        console.log(`${f.correo}\t${c ? ETIQUETA_COMBINACION[c] : "sin rol válido"}\t${f.estado}`);
      }
      return;
    }
    default:
      throw new Error(AYUDA);
  }
}

principal(process.argv.slice(2))
  .catch((e: unknown) => {
    console.error(e instanceof ErrorDominio ? `${e.code}: ${e.message}` : e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
