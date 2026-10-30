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

export const esquemaCambioContrasena = z
  .object({
    actual: z.string({ error: "Escribe tu contraseña actual." }).min(1, "Escribe tu contraseña actual.").max(200),
    contrasena: contrasenaNueva,
    confirmacion: z.string({ error: "Confirma la contraseña." }),
  })
  .refine((d) => d.contrasena === d.confirmacion, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmacion"],
  });

const texto = (campo: string) =>
  z.string({ error: `Escribe ${campo}.` }).trim().min(1, `Escribe ${campo}.`).max(120, `${campo} es demasiado largo.`);

/** Datos mínimos para crear una cuenta (requerimiento §5). */
export const esquemaNuevaCuenta = z.object({ nombres: texto("los nombres"), apellidos: texto("los apellidos"), correo });

export const esquemaRestablecerEstudiantes = z.object({
  estudianteIds: z
    .array(z.string().min(1).max(64), { error: "Selecciona al menos un estudiante." })
    .min(1, "Selecciona al menos un estudiante.")
    .max(500, "Selecciona como máximo 500 estudiantes."),
});
