/**
 * Bloqueo temporal tras intentos fallidos (HU-01, RNF-SEG-6).
 *
 * Implementación en memoria del proceso: suficiente para un solo servidor
 * (un colegio). 🔶 Si se despliega con varias instancias, mover a una tabla
 * `LoginIntentos` o a una caché compartida.
 */
export const MAX_INTENTOS = 5;
export const VENTANA_MS = 15 * 60 * 1000;
export const BLOQUEO_MS = 15 * 60 * 1000;

type Registro = { fallos: number; primero: number; bloqueadoHasta: number };

export class ControlIntentos {
  private registros = new Map<string, Registro>();

  constructor(
    private ahora: () => number = Date.now,
    private max = MAX_INTENTOS,
    private ventana = VENTANA_MS,
    private bloqueo = BLOQUEO_MS,
  ) {}

  private clave(id: string) {
    return id.trim().toLowerCase();
  }

  estaBloqueado(id: string) {
    const r = this.registros.get(this.clave(id));
    return !!r && r.bloqueadoHasta > this.ahora();
  }

  registrarFallo(id: string) {
    const k = this.clave(id);
    const t = this.ahora();
    let r = this.registros.get(k);
    if (!r || t - r.primero > this.ventana) {
      r = { fallos: 0, primero: t, bloqueadoHasta: 0 };
    }
    r.fallos += 1;
    if (r.fallos >= this.max) {
      r.bloqueadoHasta = t + this.bloqueo;
      r.fallos = 0;
      r.primero = t;
    }
    this.registros.set(k, r);
  }

  limpiar(id: string) {
    this.registros.delete(this.clave(id));
  }
}

const globalParaIntentos = globalThis as unknown as { controlIntentos?: ControlIntentos };
export const controlIntentos =
  globalParaIntentos.controlIntentos ?? (globalParaIntentos.controlIntentos = new ControlIntentos());
