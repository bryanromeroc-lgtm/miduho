#!/usr/bin/env python3
"""Convierte una pose generada por Gemini (fondo blanco) en un sprite listo para el juego.

1. Quita el fondo blanco: solo el blanco CONECTADO AL BORDE (relleno desde los bordes),
   así los brillos blancos dentro del personaje se conservan. Suaviza el halo del contorno.
2. Si se da --como, coloca la pose en un lienzo del MISMO tamaño que esa imagen de
   referencia (la pose normal del personaje), con la misma altura de personaje y los
   pies en el mismo suelo: al cambiar de pose el personaje no salta.
3. Guarda .webp (calidad 82) o .png según la extensión de salida.

Uso:
  python3 tools/gemini-media/recortar-pose.py entrada.jpg salida.webp [--como pose-normal.webp] [--alto 0.96]

Solo necesita Pillow (no numpy).
"""
import argparse

from PIL import Image, ImageChops, ImageDraw, ImageFilter


def recortar(im: Image.Image, umbral: int = 232, halo: int = 70) -> Image.Image:
    im = im.convert("RGB")
    r, g, b = im.split()
    minimo = ImageChops.darker(ImageChops.darker(r, g), b)  # alto = casi blanco
    mascara = minimo.point(lambda v: 255 if v > umbral else 0)
    w, h = mascara.size
    bordes = [(i, 0) for i in range(0, w, 20)] + [(i, h - 1) for i in range(0, w, 20)]
    bordes += [(0, j) for j in range(0, h, 20)] + [(w - 1, j) for j in range(0, h, 20)]
    for p in bordes:
        if mascara.getpixel(p) == 255:
            ImageDraw.floodfill(mascara, p, 128)
    fondo = mascara.point(lambda v: 255 if v == 128 else 0)
    banda = fondo.filter(ImageFilter.MaxFilter(5))
    alfa_borde = minimo.point(lambda v: max(0, min(255, int((255 - v) * 255 / halo))))
    alfa = Image.new("L", im.size, 255)
    alfa.paste(alfa_borde, mask=banda)
    alfa.paste(0, mask=fondo)
    sprite = im.copy()
    sprite.putalpha(alfa)
    return sprite.crop(alfa.getbbox())


def encajar(sprite: Image.Image, referencia: Image.Image, alto_rel: float) -> Image.Image:
    ref = referencia.convert("RGBA")
    caja = ref.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    escala = (caja[3] - caja[1]) * alto_rel / sprite.height
    if sprite.width * escala > ref.width * 0.98:
        escala = ref.width * 0.98 / sprite.width
    sprite = sprite.resize((round(sprite.width * escala), round(sprite.height * escala)), Image.LANCZOS)
    lienzo = Image.new("RGBA", ref.size, (0, 0, 0, 0))
    centro = (caja[0] + caja[2]) / 2
    x = round(min(max(centro - sprite.width / 2, 0), ref.width - sprite.width))
    lienzo.alpha_composite(sprite, (x, caja[3] - sprite.height))
    return lienzo


def main() -> None:
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("entrada")
    a.add_argument("salida")
    a.add_argument("--como", help="pose normal del personaje: misma caja, altura y suelo")
    a.add_argument("--alto", type=float, default=0.96, help="altura relativa a la pose normal (0.96 = un poco agachado)")
    args = a.parse_args()
    sprite = recortar(Image.open(args.entrada))
    if args.como:
        sprite = encajar(sprite, Image.open(args.como), args.alto)
    if args.salida.lower().endswith(".webp"):
        sprite.save(args.salida, quality=82, method=6)
    else:
        sprite.save(args.salida)
    print(f"{args.salida} {sprite.size[0]}×{sprite.size[1]}")


if __name__ == "__main__":
    main()
