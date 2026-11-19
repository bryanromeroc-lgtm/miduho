# tools/mapas

Genera la geometría de los mapas del tipo de actividad `mapa` (no se despliega).

## Colombia por departamentos

```bash
# 1. Natural Earth, Admin 1 – States, Provinces, 1:10m (dominio público)
curl -L -o ne1.zip https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_1_states_provinces.zip
unzip ne1.zip -d ne
# 2. Generar (usa mapshaper con npx; no es dependencia del proyecto)
node tools/mapas/generar-colombia.mjs ne
```

Escribe `apps/web/src/features/actividades/juegos/mapa/colombia.ts`: 33 unidades (32 departamentos y Bogotá D. C.) con nombre en español de Colombia, región natural, trazado SVG, punto interior y vecinos. Versión usada: Natural Earth 5.1.1, descargada el 2026-11-07.

Decisiones del script:

- Natural Earth codifica Bogotá como `CO-CUN`; se renombra a `CO-DC`. Se descarta `CO-X01` (unidad sin departamento).
- Vecinos con la geometría **completa** (comparten ≥ 2 vértices); después se simplifica al 12 % conservando la topología.
- Proyección equirectangular con corrección por coseno de 4° de latitud (en el trópico la deformación es mínima) a un `viewBox` de 760 de ancho.
- San Andrés y Providencia van en un recuadro arriba a la izquierda, a otra escala y sin simplificar; los cayos lejanos no caben y se omiten.
- 🔶 Cada departamento pertenece a **una** región natural (Pacífica = Chocó, Valle del Cauca, Cauca y Nariño). Varios abarcan dos regiones: validar con la docente.

Licencia de la fuente: <https://www.naturalearthdata.com/about/terms-of-use/> (dominio público, sin atribución obligatoria).
