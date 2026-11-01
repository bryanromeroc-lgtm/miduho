"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useShell } from "@/components/shell/contexto";
import { MenuCuenta } from "@/components/shell/menu-cuenta";
import { BienvenidaMateria } from "./bienvenida";
import s from "./vista.module.css";

/*
  Encabezado flat propio de la vista de materia (decisión del operador del
  2026-10-31): escudo y nombre, «Volver a Mis materias» y la cuenta. Sin el
  menú sticker de MarcoJuego: dentro de la materia, todo es plano.
*/
export function EncabezadoMateria({
  volverHref,
  volverTexto = "Volver a Mis materias",
  volverDetalle,
  saltarA = { href: "#actividades", texto: "Saltar a las actividades" },
  rotulo,
  extra,
  bienvenida,
}: {
  volverHref: string;
  volverTexto?: string;
  /** Complemento de «Volver» que se oculta a la vista en pantallas angostas (sigue en el nombre accesible). */
  volverDetalle?: string;
  saltarA?: { href: string; texto: string };
  rotulo?: string;
  extra?: React.ReactNode;
  /** Aviso de primera visita; el reproductor no lo lleva. */
  bienvenida?: { materiaId: string; conActividades: boolean };
}) {
  const datos = useShell();
  return (
    <header className={s.encabezado}>
      <a href={saltarA.href} className={s.saltar}>
        {saltarA.texto}
      </a>
      <span className={s.marca}>
        <Image
          src="/images/escudo-colegio.jpg"
          alt="Escudo del Colegio Mi Dulce Hogar"
          width={40}
          height={40}
          className={s.escudo}
          priority
        />
        <span className={s.wordmark}>MIDUHO</span>
      </span>
      <Link href={volverHref} className={s.volver}>
        <ArrowLeft size={20} strokeWidth={2.6} aria-hidden="true" />
        <span>
          {volverTexto}
          {volverDetalle && <span className={s.volverDetalle}> {volverDetalle}</span>}
        </span>
      </Link>
      {(rotulo || extra) && (
        <div className={s.revision}>
          {rotulo && <span className={s.rotulo}>{rotulo}</span>}
          {extra}
        </div>
      )}
      {datos && bienvenida && <BienvenidaMateria {...bienvenida} cuenta={datos.correo} />}
      <span className={s.herramientas}>
        {datos?.grupo && <span className={s.grupo}>Grupo {datos.grupo}</span>}
        {datos && <MenuCuenta datos={datos} />}
      </span>
    </header>
  );
}
