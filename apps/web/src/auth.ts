import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { HASH_SENUELO, verificarContrasena } from "@/server/auth/contrasena";
import { controlIntentos } from "@/server/auth/intentos";
import { esquemaLogin } from "@/server/auth/esquemas";
import { normalizarRoles, resolverContexto, type ContextoSesion } from "@/server/auth/sesion";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      contexto: ContextoSesion | null;
      debeCambiarContrasena: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    roles?: string[];
    versionSesion?: number;
    ultimoContexto?: string | null;
    debeCambiarContrasena?: boolean;
  }
}

/**
 * Auth.js v5 — Credentials (correo + contraseña) con sesión JWT.
 * Sin Google SSO en el Inc. 1 (docs/arquitectura-backend.md §5).
 * Cualquier fallo devuelve null → "Credenciales inválidas" genérico (HU-01).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV !== "production",
  providers: [
    Credentials({
      credentials: { correo: {}, contrasena: {} },
      async authorize(entrada) {
        const datos = esquemaLogin.safeParse(entrada);
        if (!datos.success) return null;
        const { correo, contrasena } = datos.data;

        if (controlIntentos.estaBloqueado(correo)) return null;

        const usuario = await db.usuario.findUnique({
          where: { correo },
          include: { roles: { include: { rol: true } } },
        });
        // Se compara siempre (señuelo si no hay usuario) para no filtrar existencia por tiempo.
        const valida = await verificarContrasena(contrasena, usuario?.hashContrasena ?? HASH_SENUELO);

        if (!usuario || !valida || usuario.estado !== "ACTIVO") {
          controlIntentos.registrarFallo(correo);
          return null;
        }

        controlIntentos.limpiar(correo);
        await db.usuario.update({ where: { id: usuario.id }, data: { ultimoAcceso: new Date() } });

        return {
          id: usuario.id,
          name: `${usuario.nombres} ${usuario.apellidos}`,
          email: usuario.correo,
          roles: usuario.roles.map((r) => r.rol.codigo),
          versionSesion: usuario.versionSesion,
          ultimoContexto: usuario.ultimoContexto,
          debeCambiarContrasena: usuario.debeCambiarContrasena,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.roles = user.roles ?? [];
        token.versionSesion = user.versionSesion;
        token.ultimoContexto = user.ultimoContexto ?? null;
        token.debeCambiarContrasena = user.debeCambiarContrasena ?? false;
        return token;
      }

      if (typeof token.userId !== "string" || typeof token.versionSesion !== "number") return token;
      const actual = await db.usuario.findUnique({
        where: { id: token.userId },
        select: {
          estado: true,
          versionSesion: true,
          ultimoContexto: true,
          debeCambiarContrasena: true,
          roles: { select: { rol: { select: { codigo: true } } } },
        },
      });
      if (!actual || actual.estado !== "ACTIVO" || actual.versionSesion !== token.versionSesion) {
        token.userId = "";
        token.roles = [];
        token.ultimoContexto = null;
        return token;
      }
      token.roles = normalizarRoles(actual.roles.map((r) => r.rol.codigo));
      token.ultimoContexto = actual.ultimoContexto;
      token.debeCambiarContrasena = actual.debeCambiarContrasena;
      return token;
    },
    session({ session, token }) {
      session.user.id = typeof token.userId === "string" ? token.userId : "";
      session.user.roles = Array.isArray(token.roles) ? (token.roles as string[]) : [];
      session.user.debeCambiarContrasena = token.debeCambiarContrasena === true;
      session.user.contexto = resolverContexto(
        session.user.roles,
        typeof token.ultimoContexto === "string" ? token.ultimoContexto : null,
      );
      return session;
    },
  },
});
