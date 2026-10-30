"""Valida y publica en la app los libros de la corrida final.
Uso: python3 publicar.py [--seco]   (--seco solo valida)"""
import json, os, re, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from metadatos import M, DOBLE

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SALIDA = f"{RAIZ}/tools/flipbook-forge/salida"
seco = "--seco" in sys.argv
catalogo = [f["slug"] for f in json.load(open(f"{RAIZ}/tools/flipbook-forge/catalogo.json")) if f["estado"] == "ok"]
orden = [s for s in catalogo if s in M]

q = lambda s: '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'
limpio = lambda s: " ".join(re.sub(r"&#8211;|​", " ", s or "").split())

SUELTA = ["", "       El PDF viene en páginas sueltas, ya partidas por el editor: no hay",
          "       pliegos que recomponer. Se revisó que con la portada sola cada",
          "       doble plana cae en la misma pantalla del lector."]
DOBLEN = ["", "       El PDF es entero de dobles planas, portada envolvente incluida: se",
          "       convirtió con --doble-plana. La mitad derecha de la primera página es",
          "       la tapa y abre el libro; la izquierda es la contraportada y lo cierra."]

errores, titulos, entradas = [], [], []
ids = sorted(int(x) for x in re.findall(r'id: "lit-(\d+)"', open(f"{RAIZ}/apps/web/src/lib/datos.ts").read()))
siguiente = ids[-1] + 1
for slug in orden:
    f = f"{SALIDA}/{slug}/libro.json"
    if not os.path.exists(f):
        errores.append(f"{slug}: sin convertir"); continue
    j = json.load(open(f))
    m = M[slug]
    n = j["paginas"]
    archivos = set(os.listdir(f"{SALIDA}/{slug}"))
    faltan = [k for k in range(1, n + 1) if f"p{k:02d}.webp" not in archivos or f"t{k:02d}.webp" not in archivos]
    malos = [p for p in j["pliegos"] if p[1] != p[0] + 1 or p[0] % 2]
    h1 = j["hojas"][0]
    if faltan: errores.append(f"{slug}: faltan hojas {faltan[:5]}")
    if malos: errores.append(f"{slug}: pliegos desalineados {malos[:3]}")
    if h1["paginaPdf"] != 1: errores.append(f"{slug}: la hoja 1 no es la portada")
    if (slug in DOBLE) != (h1["mitad"] == "derecha"): errores.append(f"{slug}: doble plana mal aplicada")
    if not 0.5 < j["razon"] < 1.5: errores.append(f"{slug}: razon rara {j['razon']}")
    izq = sum(1 for h in j["hojas"] if h["mitad"] == "izquierda" and h["pliego"] is not None)
    if izq != len(j["pliegos"]): errores.append(f"{slug}: {izq} pliegos partidos pero {len(j['pliegos'])} alineados")

    tid = f"lit-{siguiente}"; siguiente += 1
    titulo = limpio(m.get("titulo", j["titulo"]))
    autor = limpio(m.get("autor", j["autor"]))
    editorial = m.get("editorial", j["editorial"])
    resumen = limpio(m.get("resumen", j["resumen"]))
    creditos = limpio(m.get("creditos", j["creditos"]))
    if not autor or not resumen or len(resumen) < 40: errores.append(f"{slug}: falta autor o resumen")
    titulos.append(f'  {{ id: {q(tid)}, titulo: {q(titulo)}, autor: {q(autor)}, tipo: "Libro", edad: {q(m["edad"])}, idioma: "Español" }},')
    rp = f", {len(j['pliegos'])} pliegos" if j["pliegos"] else ""
    nota = DOBLEN if slug in DOBLE else ([] if j["pliegos"] else SUELTA)
    com = [f"    /* {creditos}", "       —", f"       Maguaré · {j['origen']['url']}",
           f"       Convertido con flipbook-forge desde {j['origen']['archivo']}:",
           f"       {j['origen']['paginasPdf']} páginas de PDF → {n} hojas{rp}.", *nota]
    com[-1] += " */"
    campos = []
    if j["pliegos"]:
        pares = [f"[{a}, {b}]" for a, b in j["pliegos"]]
        campos = ["    pliegos: [", "\n".join("      " + ", ".join(pares[i:i + 7]) + "," for i in range(0, len(pares), 7)), "    ],"]
    entradas.append("\n".join(["  {", *com, f"    slug: {q(slug)},", f"    tituloId: {q(tid)},", f"    titulo: {q(titulo)},",
        f"    autor: {q(autor)},", f"    editorial: {q(editorial)},", f"    paginas: {n},", f"    razon: {j['razon']},", *campos,
        f"    edad: {q(m['edad'])},", f"    resumen: {q(resumen)},", "  },"]))
    print(f"  {tid}  {slug:58} {n:3} hojas  {len(j['pliegos']):2} pliegos  razon {j['razon']}")

if errores:
    print("\nERRORES:"); [print("  ", e) for e in errores]; sys.exit(1)
if seco:
    print("\nvalidación ok (seco)"); sys.exit(0)

for slug in orden:
    dst = f"{RAIZ}/content/libros/{slug}"
    if os.path.exists(dst): sys.exit(f"ya existe {dst}")
for slug in orden:
    shutil.copytree(f"{SALIDA}/{slug}", f"{RAIZ}/content/libros/{slug}")
p = f"{RAIZ}/apps/web/src/lib/datos.ts"; s = open(p).read()
ancla = next(l for l in s.split("\n") if f'id: "lit-{ids[-1]}"' in l)
s = s.replace(ancla + "\n", ancla + "\n" + "\n".join(titulos) + "\n", 1); open(p, "w").write(s)
p = f"{RAIZ}/apps/web/src/lib/libros.ts"; s = open(p).read()
ult = re.findall(r'tituloId: "lit-(\d+)"', s); ult_slug = re.findall(r'slug: "([^"]+)",\n    tituloId: "lit-' + str(ids[-1]) + '"', s)[0]
i = s.index(f'slug: "{ult_slug}"'); fin = s.index("  },\n", i) + len("  },\n")
s = s[:fin] + "\n".join(entradas) + "\n" + s[fin:]; open(p, "w").write(s)
print(f"\npublicados {len(orden)} libros")
