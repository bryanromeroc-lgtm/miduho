/*
  MIDUHO · CONTRATO DE DIRECCIÓN

  THESIS: El día de un curso es una banda de planchas de color leída de
  izquierda a derecha sobre una regla de horas — el friso que la docente
  clava sobre el tablero. Rechaza el panel LMS de sidebar y tarjetas
  iguales, y rechaza la planilla beige de la propuesta anterior, cuyo
  registro de archivo institucional no correspondía a una escuela primaria.

  OWN-WORLD: Planchas saturadas del escudo que POSEEN la región entera —
  azul #00658B Literatura, naranja #B4501F Robótica, verde #4A6111
  Emprendimiento — cada una con un estante blanco de radio 15px adentro.
  Fichas de fondo pálido sin borde; ranuras punteadas que invitan en vez de
  rayar; botones pastilla; barra tinta que no pertenece a ningún área;
  Archivo Narrow 700 a escala de cartel. Reconocible sin una sola palabra.

  STORY: La docente ve su día completo de un vistazo, entiende cuál clase
  tiene material y cuál está vacía sin leer una cifra, y entra a la de
  ahora en un clic. Cuando proyecta la pantalla, los 25 niños leen los
  rótulos desde sus puestos.

  FIRST VIEWPORT: Titular condensado arriba a la izquierda con la nota de
  lectura a la derecha; debajo, la banda de trechos a todo el ancho, cada
  uno con hora, área, nombre de clase y su estante de fichas, y el botón de
  entrar al pie; bajo cada trecho, su marca en la regla de horas, la activa
  en el color de su área. El friso ENVUELVE a la línea siguiente: nunca
  scroll horizontal, con 4 asignaturas o con 14.

  FORM: Friso de Aula, candidato 6 de la lista propia (el mapa de aula y el
  plan de estudios como diagrama de pared), asignado por la tirada
  (seed fabf4e66, scope direction, mode operate, índice 6). Staging: comp B
  «el friso literal», elegido por el usuario entre tres composiciones.
*/
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Ascenso } from "@/components/laboratorios/ascenso";
import { AperturaLibro } from "@/components/biblioteca/apertura";
import "./globals.css";

const archivo = Nunito({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MIDUHO · Colegio Mi Dulce Hogar",
  description:
    "Plataforma educativa del Colegio Mi Dulce Hogar. El contenido ya está en la clase.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO">
      <body className={archivo.variable}>
        {children}
        {/* El ascenso vive en la raíz porque el viaje cruza rutas: sale de
            cualquier vista y llega al universo, y vuelve. Montarlo aquí
            evita que cada enlace tenga que saber del tránsito. */}
        <Ascenso />
        <AperturaLibro />
      </body>
    </html>
  );
}
