type Pregunta = { enunciado: string; opciones: string[] };

export function primerErrorMaterial(datos: { url: string; titulo: string; grupos: string[]; preguntas: Pregunta[] }) {
  if (!datos.url.trim()) return { campo: "material-url", mensaje: "Pega el enlace del video de YouTube." };
  if (datos.titulo.trim().length < 3) return { campo: "material-titulo", mensaje: "Escribe un título de al menos 3 caracteres." };
  if (datos.grupos.length === 0) return { campo: "material-combinacion", mensaje: "Selecciona al menos un grupo." };
  for (const [indice, pregunta] of datos.preguntas.entries()) {
    if (!pregunta.enunciado.trim()) return { campo: `pregunta-${indice}`, mensaje: `Escribe el enunciado de la pregunta ${indice + 1}.` };
    for (const [opcion, texto] of pregunta.opciones.entries()) {
      if (!texto.trim()) return { campo: `pregunta-${indice}-opcion-${opcion}`, mensaje: `Escribe la opción ${opcion + 1} de la pregunta ${indice + 1}.` };
    }
  }
  return null;
}

export function enfocarError(campo: string, buscar: (id: string) => { focus(): void } | null = (id) => document.getElementById(id)) {
  buscar(campo)?.focus();
}
