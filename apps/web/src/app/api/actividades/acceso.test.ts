import { beforeEach, describe, expect, it, vi } from "vitest";

const contexto = vi.hoisted(() => ({ roles: null as string[] | null }));
const servicios = vi.hoisted(() => ({ crearMaterial: vi.fn(), iniciarIntento: vi.fn(), seguimiento: vi.fn() }));

vi.mock("@/server/http", () => ({
  verificarOrigen: () => undefined,
  leerCuerpo: async () => ({}),
  requerirRol: async (permitidos: string[]) => {
    if (!contexto.roles) throw Object.assign(new Error("Inicia sesión"), { status: 401 });
    if (!contexto.roles.some((rol) => permitidos.includes(rol))) throw Object.assign(new Error("Sin permiso"), { status: 403 });
    return { id: "cuenta", roles: contexto.roles };
  },
  manejar: async (fn: () => Promise<Response>) => {
    try { return await fn(); } catch (error) {
      return new Response(null, { status: (error as { status?: number }).status ?? 500 });
    }
  },
}));
vi.mock("@/server/modules/actividades", () => ({
  esquemasActividades: { crearMaterial: {}, enviarIntento: {} },
  servicioActividades: servicios,
}));

import { POST as crear } from "./material/route";
import { POST as iniciar } from "./asignaciones/[id]/intentos/route";
import { GET as seguir } from "./material/[actividadId]/seguimiento/route";

const req = {} as never;
const params = { params: Promise.resolve({ id: "asignacion", actividadId: "actividad" }) };

beforeEach(() => {
  contexto.roles = null;
  vi.clearAllMocks();
});

describe("acceso a rutas de actividades", () => {
  it("responde 401 sin sesión", async () => {
    expect((await crear(req)).status).toBe(401);
    expect((await iniciar(req, params)).status).toBe(401);
    expect((await seguir(req, params)).status).toBe(401);
    expect(servicios.crearMaterial).not.toHaveBeenCalled();
    expect(servicios.iniciarIntento).not.toHaveBeenCalled();
  });

  it("impide que un estudiante use rutas docentes", async () => {
    contexto.roles = ["ESTUDIANTE"];
    expect((await crear(req)).status).toBe(403);
    expect((await seguir(req, params)).status).toBe(403);
    expect(servicios.crearMaterial).not.toHaveBeenCalled();
    expect(servicios.seguimiento).not.toHaveBeenCalled();
  });

  it("impide que una docente inicie intentos como estudiante", async () => {
    contexto.roles = ["DOCENTE"];
    expect((await iniciar(req, params)).status).toBe(403);
    expect(servicios.iniciarIntento).not.toHaveBeenCalled();
  });
});
