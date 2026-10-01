import { z } from "zod";

const correo = z
  .string({ error: "Escribe tu correo." })
  .trim()
  .toLowerCase()
  .min(1, "Escribe tu correo.")
  .pipe(z.email("Escribe un correo válido."));

export const esquemaLogin = z.object({
  correo,
  contrasena: z.string({ error: "Escribe tu contraseña." }).min(1, "Escribe tu contraseña.").max(200),
});

export const esquemaSolicitudRecuperacion = z.object({ correo });

/** Política mínima de contraseña (🔶 por confirmar con el colegio). */
export const contrasenaNueva = z
  .string({ error: "Escribe la nueva contraseña." })
  .min(10, "La contraseña debe tener al menos 10 caracteres.")
  .max(200, "La contraseña es demasiado larga.")
  .regex(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/, "La contraseña debe incluir al menos una letra.")
  .regex(/[0-9]/, "La contraseña debe incluir al menos un número.");

export const esquemaRestablecer = z
  .object({
    token: z.string({ error: "El enlace no es válido." }).min(20, "El enlace no es válido.").max(200, "El enlace no es válido."),
    contrasena: contrasenaNueva,
    confirmacion: z.string({ error: "Confirma la contraseña." }),
  })
  .refine((d) => d.contrasena === d.confirmacion, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmacion"],
  });
