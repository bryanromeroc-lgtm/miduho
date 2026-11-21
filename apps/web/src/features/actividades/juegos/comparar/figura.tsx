import Image from "next/image";
import { describirColeccion, type Coleccion, type Objeto } from "./tipo";
import s from "./comparar.module.css";

/** Dos marcos de diez, cinco columnas por dos filas. La colección completa tiene una sola descripción accesible. */
export function FiguraComparar({ coleccion, objeto }: { coleccion: Coleccion; objeto: Objeto }) {
  return <div className={s.figura} role="img" aria-label={describirColeccion(coleccion.cantidad, objeto.singular, objeto.plural)}>
    {[0, 1].map((marco) => <div key={marco} className={s.marco} aria-hidden="true">
      {Array.from({ length: 10 }, (_, casilla) => <span key={casilla} className={s.casilla}>
        {marco * 10 + casilla < coleccion.cantidad && <Image src={objeto.imagen} alt="" width={320} height={320} unoptimized draggable={false} />}
      </span>)}
    </div>)}
  </div>;
}
