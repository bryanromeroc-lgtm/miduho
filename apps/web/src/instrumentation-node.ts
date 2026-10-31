import { urlBaseDatos, variableObligatoria } from "@/lib/entorno";

try {
  urlBaseDatos();
  variableObligatoria("AUTH_SECRET", "Genérala con `npx auth secret`.");
} catch (e) {
  // Un error en register() solo se registra y deja el servidor roto pero vivo; mejor salir.
  console.error(`MIDUHO no puede iniciar: ${(e as Error).message}`);
  process.exit(1);
}
