/**
 * Límite de solicitudes de recuperación (requerimiento §4.4). Ventana fija en
 * memoria por clave (correo e IP por separado). Al exceder el límite la
 * solicitud se descarta en silencio: la respuesta al usuario es idéntica, así
 * no revela si la cuenta existe ni si fue limitada.
 * 🔶 Varias instancias requerirían almacenamiento compartido.
 */
export class LimiteSolicitudes {
  private registros = new Map<string, { cuenta: number; inicio: number }>();

  constructor(
    private max: number,
    private ventanaMs: number,
    private ahora: () => number = Date.now,
  ) {}

  /** Registra la solicitud y devuelve `true` si está dentro del límite. */
  permitir(clave: string) {
    const k = clave.trim().toLowerCase();
    const t = this.ahora();
    let r = this.registros.get(k);
    if (!r || t - r.inicio >= this.ventanaMs) r = { cuenta: 0, inicio: t };
    r.cuenta += 1;
    this.registros.set(k, r);
    if (this.registros.size > 10_000) this.purgar(t);
    return r.cuenta <= this.max;
  }

  private purgar(t: number) {
    for (const [k, r] of this.registros) if (t - r.inicio >= this.ventanaMs) this.registros.delete(k);
  }
}

const HORA = 60 * 60 * 1000;
const g = globalThis as unknown as { limiteRecuperacion?: { correo: LimiteSolicitudes; ip: LimiteSolicitudes } };

/** 3 solicitudes por correo y 10 por IP cada hora. */
export const limiteRecuperacion =
  g.limiteRecuperacion ??
  (g.limiteRecuperacion = { correo: new LimiteSolicitudes(3, HORA), ip: new LimiteSolicitudes(10, HORA) });

/** Evalúa ambas claves (siempre registra las dos para no crear un oráculo). */
export function recuperacionPermitida(correo: string, ip: string | null) {
  const porCorreo = limiteRecuperacion.correo.permitir(correo);
  const porIp = ip ? limiteRecuperacion.ip.permitir(ip) : true;
  return porCorreo && porIp;
}
