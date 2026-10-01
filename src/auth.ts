import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { HASH_SENUELO, verificarContrasena } from "@/server/auth/contrasena";
import { controlIntentos } from "@/server/auth/intentos";
import { esquemaLogin } from "@/server/auth/esquemas";

declare module "next-auth" {
  interface Session {
    user: { id: string; roles: string[] } & DefaultSession["user"];
  }
  interface User {
    roles?: string[];
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
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.roles = user.roles ?? [];
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = typeof token.userId === "string" ? token.userId : "";
      session.user.roles = Array.isArray(token.roles) ? (token.roles as string[]) : [];
      return session;
    },
  },
});
