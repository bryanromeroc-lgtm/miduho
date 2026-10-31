-- Contexto persistido solo para cuentas ADMIN + DOCENTE. NULL significa que
-- todavía no se ha elegido y el primer acceso se resuelve como ADMIN.
ALTER TABLE "usuarios" ADD COLUMN "ultimoContexto" TEXT;

-- La versión es la fuente de revocación de los JWT. Los triggers evitan que una
-- ruta de escritura futura olvide invalidar sesiones al cambiar estado, clave o roles.
CREATE TRIGGER "usuarios_revocar_por_estado_o_clave"
AFTER UPDATE OF "estado", "hashContrasena" ON "usuarios"
FOR EACH ROW
WHEN OLD."estado" IS NOT NEW."estado"
  OR OLD."hashContrasena" IS NOT NEW."hashContrasena"
BEGIN
  UPDATE "usuarios"
  SET "versionSesion" = OLD."versionSesion" + 1,
      "sesionesRevocadasEn" = CURRENT_TIMESTAMP
  WHERE "id" = OLD."id";
END;

CREATE TRIGGER "usuarios_revocar_por_rol_retirado"
AFTER DELETE ON "usuarios_roles"
FOR EACH ROW
BEGIN
  UPDATE "usuarios"
  SET "versionSesion" = "versionSesion" + 1,
      "sesionesRevocadasEn" = CURRENT_TIMESTAMP
  WHERE "id" = OLD."usuarioId";
END;

CREATE TRIGGER "usuarios_revocar_por_rol_agregado"
AFTER INSERT ON "usuarios_roles"
FOR EACH ROW
BEGIN
  UPDATE "usuarios"
  SET "versionSesion" = "versionSesion" + 1,
      "sesionesRevocadasEn" = CURRENT_TIMESTAMP
  WHERE "id" = NEW."usuarioId";
END;

CREATE TRIGGER "usuarios_contexto_valido_insert"
BEFORE INSERT ON "usuarios"
FOR EACH ROW
WHEN NEW."ultimoContexto" IS NOT NULL
  AND NEW."ultimoContexto" NOT IN ('ADMIN', 'DOCENTE')
BEGIN
  SELECT RAISE(ABORT, 'ultimoContexto invalido');
END;

CREATE TRIGGER "usuarios_contexto_valido_update"
BEFORE UPDATE OF "ultimoContexto" ON "usuarios"
FOR EACH ROW
WHEN NEW."ultimoContexto" IS NOT NULL
  AND NEW."ultimoContexto" NOT IN ('ADMIN', 'DOCENTE')
BEGIN
  SELECT RAISE(ABORT, 'ultimoContexto invalido');
END;