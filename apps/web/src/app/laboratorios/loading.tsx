import { Despegue } from "@/components/laboratorios/despegue";

/*
  Se muestra en cuanto alguien toca «Laboratorios», antes de que el
  segmento de ruta termine de llegar. Convención loading.js de Next:
  la respuesta es inmediata aunque la vista aún no exista.

  Cubre también /laboratorios/[unidad], de modo que abrir una ruta
  didáctica desde una misión entra por la misma puerta.
*/
export default function Cargando() {
  return <Despegue />;
}
