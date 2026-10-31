import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Baloo_2, Nunito } from "next/font/google";
import { Ascenso } from "@/features/laboratorios/components/ascenso";
import { AperturaLibro } from "@/features/biblioteca/components/apertura";
import { ProveedorShell } from "@/components/shell/contexto";
import { obtenerDatosShell } from "@/server/shell";
import "@/styles/globals.css";
import "@/styles/shell.css";
import "@/styles/identidad.css";

// Títulos, placas, botones y cifras.
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Cuerpo y contenido pedagógico: legibilidad para lectores emergentes.
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
  // Next no tiene métricas de respaldo para esta familia; se declara a mano.
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

// Solo para Laboratorios, que conserva su tipografía (.cosmos la congela).
const archivo = Nunito({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "MIDUHO · Colegio Mi Dulce Hogar",
  description:
    "Plataforma educativa del Colegio Mi Dulce Hogar. El contenido ya está en la clase.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Identidad real del shell (Inc. 1R §10). null en rutas públicas.
  const datosShell = await obtenerDatosShell();
  return (
    <html lang="es-CO">
      <body className={`${baloo.variable} ${atkinson.variable} ${archivo.variable}`}>
        <ProveedorShell valor={datosShell}>{children}</ProveedorShell>
        {/* El ascenso vive en la raíz porque el viaje cruza rutas: sale de
            cualquier vista y llega al universo, y vuelve. Montarlo aquí
            evita que cada enlace tenga que saber del tránsito. */}
        <Ascenso />
        <AperturaLibro />
      </body>
    </html>
  );
}
