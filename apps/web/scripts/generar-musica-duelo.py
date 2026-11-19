"""Compone una pista original de 16 s para el duelo de divisiones.

Ejecutar desde la raíz: python3 apps/web/scripts/generar-musica-duelo.py
Solo usa síntesis matemática y ruido seudoaleatorio; no incorpora muestras ajenas.
"""

from array import array
from math import exp, pi, sin, tanh
from pathlib import Path
from random import Random
from tempfile import NamedTemporaryFile
import subprocess
import wave

MUESTRAS = 22050
PULSO = 0.5  # 120 BPM
DURACION = 16
mezcla = array("f", [0.0]) * (MUESTRAS * DURACION)
azar = Random(731)


def nota(semitonos):
    return 440 * 2 ** ((semitonos - 69) / 12)


def agregar(inicio, duracion, sintetizar):
    primero = round(inicio * MUESTRAS)
    cantidad = round(duracion * MUESTRAS)
    for indice in range(cantidad):
        posicion = primero + indice
        if posicion >= len(mezcla):
            break
        t = indice / MUESTRAS
        mezcla[posicion] += sintetizar(t, duracion)


def bombo(t, _):
    return 0.36 * sin(2 * pi * (58 * t + 19 * (1 - exp(-32 * t)) / 32)) * exp(-18 * t)


def caja(t, _):
    return (azar.uniform(-1, 1) * 0.15 + sin(2 * pi * 180 * t) * 0.08) * exp(-22 * t)


def platillo(t, _):
    return azar.uniform(-1, 1) * 0.065 * exp(-58 * t)


def bajo(frecuencia):
    def voz(t, largo):
        envolvente = min(1, t * 80) * min(1, (largo - t) * 18)
        onda = sin(2 * pi * frecuencia * t) + 0.3 * sin(4 * pi * frecuencia * t)
        return 0.12 * envolvente * onda

    return voz


def arpegio(frecuencia):
    def voz(t, largo):
        envolvente = min(1, t * 180) * exp(-7 * t) * min(1, (largo - t) * 28)
        onda = sin(2 * pi * frecuencia * t) + 0.25 * sin(6 * pi * frecuencia * t)
        return 0.065 * envolvente * onda

    return voz


# Cuatro compases de Mi menor, repetidos con una variación melódica.
graves = [40, 36, 43, 38, 40, 36, 43, 38]
acordes = [(64, 67, 71, 74), (60, 64, 67, 72), (67, 71, 74, 79), (62, 66, 69, 74)]
for compas in range(8):
    origen = compas * 2
    for pulso in range(4):
        instante = origen + pulso * PULSO
        agregar(instante, 0.28, bombo)
        agregar(instante + 0.25, 0.11, platillo)
        if pulso in (1, 3):
            agregar(instante, 0.2, caja)
        agregar(instante, 0.42, bajo(nota(graves[compas])))
    for paso in range(8):
        altura = acordes[compas % 4][(paso + compas // 4) % 4]
        agregar(origen + paso * 0.25, 0.23, arpegio(nota(altura)))

salida = Path(__file__).resolve().parents[1] / "public/audio/juegos/robots/accion-original.mp3"
salida.parent.mkdir(parents=True, exist_ok=True)
with NamedTemporaryFile(suffix=".wav") as temporal:
    with wave.open(temporal.name, "wb") as archivo:
        archivo.setnchannels(1)
        archivo.setsampwidth(2)
        archivo.setframerate(MUESTRAS)
        for i, muestra in enumerate(mezcla):
            borde = min(1, i / (MUESTRAS * 0.04), (len(mezcla) - i) / (MUESTRAS * 0.04))
            archivo.writeframesraw(int(tanh(muestra * borde) * 25000).to_bytes(2, "little", signed=True))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", temporal.name, "-codec:a", "libmp3lame", "-b:a", "96k", str(salida)], check=True)
print(salida)
