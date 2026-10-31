-- INC1R-03 · Ciclos de contraseña por rol.
-- Distingue el propósito del token de un solo uso: RECUPERACION (ADMIN/DOCENTE
-- activos) o INVITACION (ADMIN puro pendiente de activación). Ambos guardan solo
-- el SHA-256 del token y vencen a las 24 horas.
ALTER TABLE "restablecimientos_contrasena" ADD COLUMN "tipo" TEXT NOT NULL DEFAULT 'RECUPERACION';

CREATE TRIGGER "restablecimientos_tipo_valido_insert"
BEFORE INSERT ON "restablecimientos_contrasena"
FOR EACH ROW
WHEN NEW."tipo" NOT IN ('RECUPERACION', 'INVITACION')
BEGIN
  SELECT RAISE(ABORT, 'tipo de token invalido');
END;

CREATE TRIGGER "restablecimientos_tipo_valido_update"
BEFORE UPDATE OF "tipo" ON "restablecimientos_contrasena"
FOR EACH ROW
WHEN NEW."tipo" NOT IN ('RECUPERACION', 'INVITACION')
BEGIN
  SELECT RAISE(ABORT, 'tipo de token invalido');
END;
