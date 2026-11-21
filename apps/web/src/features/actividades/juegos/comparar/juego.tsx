"use client";

import Image from "next/image";
import { ArrowRight, FlaskConical, Minus, Plus, Target } from "lucide-react";
import { useState } from "react";
import {
  Avanzar,
  Aviso,
  useFocoAlCambiar,
  type PropsJuego,
} from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Chispas, useReaccion } from "../comun/efectos";
import { useEfectosGrabados } from "../comun/efectos-grabados";
import { Escuchar, useLecturaAutomatica } from "../comun/escuchar";
import { Guirnalda, type EstadoRonda } from "../comun/piezas";
import { useVozActividad } from "../comun/escuchar";
import { FiguraComparar } from "./figura";
import {
  esCorrecta,
  frase,
  relacionDe,
  RELACIONES,
  SIMBOLOS,
  solucion,
  type Coleccion,
  type ContenidoComparar,
  type Objeto,
  type RespuestaComparar,
} from "./tipo";
import s from "./comparar.module.css";

const ETIQUETAS = {
  mayor: "es mayor que",
  menor: "es menor que",
  igual: "es igual a",
} as const;
type Lado = "izquierda" | "derecha";

export function JuegoComparar({
  contenido,
  alTerminar,
}: PropsJuego<ContenidoComparar>) {
  const [vista, setVista] = useState<"laboratorio" | "retos">("laboratorio");
  const rutas = Object.fromEntries(
    Object.entries(contenido.efectos ?? {}).map(([k, v]) => [k, v ? [v] : []]),
  ) as Record<keyof NonNullable<ContenidoComparar["efectos"]>, string[]>;
  const sonido = useEfectosGrabados(rutas);
  const [lab, setLab] = useState(contenido.inicial);
  const [indice, setIndice] = useState(0);
  const [ajuste, setAjuste] = useState(contenido.rondas[0].derecha.cantidad);
  const [intentos, setIntentos] = useState<RespuestaComparar[]>([]);
  const [respuestas, setRespuestas] = useState<
    Record<string, RespuestaComparar>
  >({});
  const [estados, setEstados] = useState<EstadoRonda[]>(() =>
    contenido.rondas.map(() => "pendiente"),
  );
  const { reaccion, disparar } = useReaccion();
  const voz = useVozActividad();
  const reto = contenido.rondas[indice];
  const enunciado = reto.enunciado ?? contenido.enunciadoLeer;
  const audioEnunciado =
    reto.audio ?? (reto.clase === "leer" ? contenido.audioLeer : undefined);

  const titulo = useFocoAlCambiar<HTMLHeadingElement>(
    vista === "retos" ? indice : -1,
  );
  const ultimo = intentos.at(-1);
  const acerto = ultimo !== undefined && esCorrecta(reto, ultimo);
  const cerrada = acerto || intentos.length >= 2;
  const derechaReto =
    reto.clase === "construir"
      ? { ...reto.derecha, cantidad: ajuste }
      : reto.derecha;
  const objetos = new Map(contenido.objetos.map((o) => [o.id, o]));
  const objetoDe = (id: string) => objetos.get(id)!;
  const pose = !ultimo ? "reposo" : acerto ? "senala" : "duda";

  function cambiarLab(lado: Lado, cambio: Partial<Coleccion>) {
    setLab((x) => ({ ...x, [lado]: { ...x[lado], ...cambio } }));
  }
  function cambiarCantidad(
    lado: Lado,
    valor: number,
    actual: number,
    alCambiar: (n: number) => void,
  ) {
    if (valor < 0 || valor > 20) {
      sonido.tocar("limite");
      return;
    }
    if (actual !== valor) {
      alCambiar(valor);
      sonido.tocar("cambiar");
    }
  }
  function responder(respuesta: RespuestaComparar) {
    if (cerrada) return;
    voz.callar();
    const nuevos = [...intentos, respuesta];
    setIntentos(nuevos);
    if (nuevos.length === 1)
      setRespuestas((x) => ({ ...x, [reto.id]: respuesta }));
    const bien = esCorrecta(reto, respuesta);
    sonido.tocar(bien ? "acierto" : "error");
    if (bien) disparar(nuevos.length === 1 ? "acierto" : "corregida");
    if (bien || nuevos.length === 2)
      setEstados((x) =>
        x.map((v, i) =>
          i === indice
            ? nuevos.length === 1 && bien
              ? "bien"
              : "corregida"
            : v,
        ),
      );
  }
  function avanzar() {
    voz.callar();
    if (indice === contenido.rondas.length - 1) {
      sonido.tocar("fin");
      alTerminar(respuestas);
      return;
    }
    sonido.tocar("avanzar");
    const nuevo = indice + 1;
    setIndice(nuevo);
    setAjuste(contenido.rondas[nuevo].derecha.cantidad);
    setIntentos([]);
  }

  return (
    <div className={s.juego}>
      <div className={s.modos} role="group" aria-label="Parte de la actividad">
        <button
          type="button"
          aria-pressed={vista === "laboratorio"}
          onClick={() => setVista("laboratorio")}
        >
          <FlaskConical aria-hidden="true" /> Laboratorio
        </button>
        <button
          type="button"
          aria-pressed={vista === "retos"}
          onClick={() => {
            sonido.tocar("retos");
            setVista("retos");
          }}
        >
          <Target aria-hidden="true" /> Retos
        </button>
      </div>
      <section
        hidden={vista !== "laboratorio"}
        className={s.panel}
        aria-labelledby="comparar-lab"
      >
        <h2 id="comparar-lab">Laboratorio</h2>
        {contenido.escena?.personaje && (
          <Image
            className={s.labArmi}
            src={contenido.escena.personaje.reposo}
            alt=""
            aria-hidden="true"
            width={1440}
            height={1623}
            sizes="(max-width: 720px) 90px, 320px"
            loading="eager"
            unoptimized
            draggable={false}
          />
        )}
        <div className={s.lectura} aria-live="polite">
          <strong>{frase(lab.izquierda.cantidad, lab.derecha.cantidad)}</strong>
          <span>
            {lab.izquierda.cantidad}{" "}
            {SIMBOLOS[relacionDe(lab.izquierda.cantidad, lab.derecha.cantidad)]}{" "}
            {lab.derecha.cantidad}
          </span>
          <Escuchar
            texto={frase(lab.izquierda.cantidad, lab.derecha.cantidad)}
          />
        </div>
        <div className={s.columnas}>
          {(["izquierda", "derecha"] as const).map((lado) => (
            <ColeccionPanel
              key={lado}
              lado={lado}
              coleccion={lab[lado]}
              objeto={objetoDe(lab[lado].objeto)}
              objetos={contenido.objetos}
              onCantidad={(n) =>
                cambiarCantidad(lado, n, lab[lado].cantidad, (v) =>
                  cambiarLab(lado, { cantidad: v }),
                )
              }
              onObjeto={(id) => {
                cambiarLab(lado, { objeto: id });
                sonido.tocar("elegir");
              }}
            />
          ))}
        </div>
        <div className={s.acciones}>
          <button
            type="button"
            className={rp.secundario}
            onClick={() => {
              setLab(contenido.inicial);
              sonido.tocar("reiniciar");
            }}
          >
            Volver a empezar
          </button>
          <button
            type="button"
            className={rp.principal}
            onClick={() => {
              sonido.tocar("retos");
              setVista("retos");
            }}
          >
            Empezar los retos <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </section>
      <section
        hidden={vista !== "retos"}
        className={s.retos}
        aria-label="Retos"
      >
        {vista === "retos" && (
          <LecturaReto
            clave={reto.id}
            texto={enunciado}
            audio={audioEnunciado}
          />
        )}
        <div className={s.progreso}>
          <Guirnalda estados={estados} actual={indice} />
          <button
            type="button"
            aria-pressed={sonido.activo}
            onClick={sonido.alternar}
          >
            Efectos: {sonido.activo ? "sí" : "no"}
          </button>
        </div>
        <div
          className={s.escena}
          style={
            contenido.escena?.fondo
              ? { backgroundImage: `url(${contenido.escena.fondo})` }
              : undefined
          }
          data-estado={!ultimo ? "reposo" : acerto ? "acierto" : "fallo"}
        >
          <Chispas reaccion={reaccion} />
          <div className={s.mesa} key={reto.id}>
            <div className={s.enunciadoFila}>
              <h2 ref={titulo} tabIndex={-1}>
                {enunciado}
              </h2>
              <Escuchar texto={enunciado} audio={audioEnunciado} />
            </div>
            <div className={s.columnas}>
              <ColeccionPanel
                lado="izquierda"
                coleccion={reto.izquierda}
                objeto={objetoDe(reto.izquierda.objeto)}
              />
              <ColeccionPanel
                lado="derecha"
                coleccion={derechaReto}
                objeto={objetoDe(derechaReto.objeto)}
                onCantidad={
                  reto.clase === "construir" && !cerrada
                    ? (n) => cambiarCantidad("derecha", n, ajuste, setAjuste)
                    : undefined
                }
              />
            </div>
            {reto.clase === "leer" ? (
              <div
                className={s.relaciones}
                role="group"
                aria-label="Elige la relación de izquierda a derecha"
              >
                {RELACIONES.map((r) => (
                  <div key={r} className={s.relacion}>
                    <button
                      type="button"
                      className={rp.opcion}
                      disabled={cerrada || intentos.includes(r)}
                      data-estado={
                        cerrada && r === reto.correcta
                          ? "ok"
                          : intentos.includes(r)
                            ? "no"
                            : undefined
                      }
                      onClick={() => {
                        sonido.tocar("elegir");
                        responder(r);
                      }}
                    >
                      {ETIQUETAS[r]} <b>{SIMBOLOS[r]}</b>
                    </button>
                    <Escuchar
                      texto={ETIQUETAS[r]}
                      audio={contenido.audioRelaciones?.[r]}
                      soloIcono
                    />
                  </div>
                ))}
              </div>
            ) : (
              !cerrada && (
                <button
                  type="button"
                  className={rp.principal}
                  onClick={() => {
                    sonido.tocar("boton");
                    responder(ajuste);
                  }}
                >
                  Comprobar
                </button>
              )
            )}
            <Aviso
              tono={!ultimo ? null : acerto ? "ok" : cerrada ? "no" : "neutro"}
            >
              {!ultimo
                ? ""
                : acerto
                  ? `¡Muy bien! ${reto.explicacion}`
                  : cerrada
                    ? `Solución: ${solucion(reto)}. ${reto.explicacion}`
                    : `Inténtalo otra vez. ${reto.pista}`}
            </Aviso>
            {cerrada && (
              <div className={s.acciones}>
                <Avanzar onClick={avanzar} enfocar={vista === "retos"}>
                  {indice === contenido.rondas.length - 1
                    ? "Ver resultado"
                    : "Seguir"}{" "}
                  <ArrowRight aria-hidden="true" />
                </Avanzar>
              </div>
            )}
          </div>
          {contenido.escena?.personaje && (
            <div className={s.personaje} aria-hidden="true">
              <Image
                src={contenido.escena.personaje[pose]}
                alt=""
                width={1440}
                height={1623}
                sizes="(max-width: 720px) 1px, 35vw"
                unoptimized
                draggable={false}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ColeccionPanel({
  lado,
  coleccion,
  objeto,
  objetos,
  onCantidad,
  onObjeto,
}: {
  lado: Lado;
  coleccion: Coleccion;
  objeto: Objeto;
  objetos?: Objeto[];
  onCantidad?: (n: number) => void;
  onObjeto?: (id: string) => void;
}) {
  return (
    <div className={s.coleccion}>
      <h3>{lado === "izquierda" ? "Izquierda" : "Derecha"}</h3>
      <div
        className={s.contador}
        role="group"
        aria-label={`Cantidad de la ${lado}`}
      >
        {onCantidad && (
          <button
            type="button"
            aria-label={`Quitar uno a la ${lado}${coleccion.cantidad === 0 ? ": límite 0" : ""}`}
            title={coleccion.cantidad === 0 ? "Límite: 0" : "Quitar uno"}
            aria-disabled={coleccion.cantidad === 0}
            onClick={() => onCantidad(coleccion.cantidad - 1)}
          >
            <Minus aria-hidden="true" />
          </button>
        )}
        <output
          aria-live="polite"
          aria-label={`${coleccion.cantidad} ${coleccion.cantidad === 1 ? objeto.singular : objeto.plural}`}
        >
          {coleccion.cantidad}
        </output>
        {onCantidad && (
          <button
            type="button"
            aria-label={`Agregar uno a la ${lado}${coleccion.cantidad === 20 ? ": límite 20" : ""}`}
            title={coleccion.cantidad === 20 ? "Límite: 20" : "Agregar uno"}
            aria-disabled={coleccion.cantidad === 20}
            onClick={() => onCantidad(coleccion.cantidad + 1)}
          >
            <Plus aria-hidden="true" />
          </button>
        )}
      </div>
      <FiguraComparar coleccion={coleccion} objeto={objeto} />
      {objetos && onObjeto && (
        <div
          className={s.objetos}
          role="group"
          aria-label={`Objeto de la ${lado}`}
        >
          {objetos.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={o.id === objeto.id}
              onClick={() => onObjeto(o.id)}
            >
              <Image
                src={o.imagen}
                alt=""
                width={320}
                height={320}
                unoptimized
              />
              {o.plural}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LecturaReto({
  clave,
  texto,
  audio,
}: {
  clave: string;
  texto: string;
  audio?: string;
}) {
  useLecturaAutomatica(clave, texto, audio);
  return null;
}
