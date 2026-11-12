import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mock = vi.hoisted(() => ({
  role: "ADMIN", cookie: "", count: 1,
  intercambio: vi.fn(), upsert: vi.fn(), update: vi.fn(), revocar: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => mock.cookie ? { value: mock.cookie } : undefined, delete: () => { mock.cookie = ""; } }) }));
vi.mock("@/server/http", () => ({
  manejar: async (fn: () => Promise<Response>) => { try { return await fn(); } catch { return new Response("error", { status: 403 }); } },
  requerirRol: async () => { if (mock.role !== "ADMIN") throw new Error("sin permiso"); return { id: "admin-ficticio" }; },
  verificarOrigen: () => {},
}));
vi.mock("@/server/db", () => ({ db: {
  desafioGoogle: { deleteMany: async () => ({ count: mock.count }) },
  integracionGoogle: {
    findUnique: async () => ({ id: "integracion-ficticia", correoGoogle: "cuenta-ficticia@example.test", refreshTokenCifrado: "token-cifrado" }),
    upsert: mock.upsert, update: mock.update,
  },
  solicitudEntrega: { updateMany: vi.fn() },
} }));
vi.mock("@/server/integraciones/google/oauth", () => ({
  intercambiarCodigo: mock.intercambio, correoGoogle: async () => "cuenta-ficticia@example.test",
  tienePermisoDrive: (scope: string) => scope.includes("drive.file"), revocarToken: mock.revocar,
}));
vi.mock("@/server/integraciones/google/drive", () => ({ olvidarToken: vi.fn() }));
import { cifrar } from "@/server/integraciones/google/cifrado";
import { GET } from "./route";
import { POST } from "../desconectar/route";

const base = "http://localhost:3000/api/integraciones/google/retorno";
function cookieValida() { mock.cookie = cifrar(JSON.stringify({ state: "estado-ficticio", verifier: "verificador-ficticio", usuarioId: "admin-ficticio" })); }
function retorno(query: string) { return GET(new NextRequest(`${base}?${query}`)); }

beforeEach(() => {
  process.env.CLAVE_CIFRADO_INTEGRACIONES = Buffer.alloc(32, 3).toString("base64");
  mock.role = "ADMIN"; mock.cookie = ""; mock.count = 1;
  mock.intercambio.mockReset().mockResolvedValue({ access_token: "access-ficticio", refresh_token: "refresh-ficticio", scope: "https://www.googleapis.com/auth/drive.file openid email" });
  mock.upsert.mockReset(); mock.update.mockReset(); mock.revocar.mockReset();
});

describe("rutas de integración Google", () => {
  it("rechaza state inválido o reutilizado antes del intercambio", async () => {
    cookieValida();
    expect((await retorno("state=otro&code=abc")).status).toBe(400);
    expect(mock.intercambio).not.toHaveBeenCalled();
    cookieValida(); mock.count = 0;
    expect((await retorno("state=estado-ficticio&code=abc")).status).toBe(400);
    expect(mock.intercambio).not.toHaveBeenCalled();
  });
  it("conserva la integración al cancelar o faltar drive.file", async () => {
    cookieValida();
    const cancelado = await retorno("state=estado-ficticio&error=access_denied");
    expect(cancelado.headers.get("location")).toContain("google=cancelado");
    expect(mock.upsert).not.toHaveBeenCalled();
    cookieValida(); mock.intercambio.mockResolvedValue({ access_token: "access-ficticio", refresh_token: "refresh-ficticio", scope: "openid email" });
    const incompleto = await retorno("state=estado-ficticio&code=abc");
    expect(incompleto.headers.get("location")).toContain("google=permisos");
    expect(mock.upsert).not.toHaveBeenCalled();
  });
  it("rechaza DOCENTE y desconecta sin borrar solicitudes", async () => {
    mock.role = "DOCENTE";
    expect((await retorno("state=estado-ficticio&code=abc")).status).toBe(403);
    mock.role = "ADMIN";
    const respuesta = await POST(new NextRequest("http://localhost:3000/api/integraciones/google/desconectar", { method: "POST" }));
    expect(respuesta.status).toBe(200);
    expect(mock.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ refreshTokenCifrado: null }) }));
  });
});
