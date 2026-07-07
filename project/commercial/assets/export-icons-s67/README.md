# Kit de marca FinNort — export s.67 (07/07/2026)

Set completo de PNG del **icono R3 «barras sólidas» en espejo** (monograma N+F reflejado → se lee **F→N**) + wordmark + lockup.
Todo derivado de las fuentes vivas de s.66 (`favicon.svg` / `BrandLogo.tsx` / `BrandWordmark.tsx`).
Generado con `@resvg/resvg-js` (rasterizador WASM) desde los dos SVG fuente de esta carpeta. Reproducible: ver `render.mjs` / `wordmark.mjs` (en scratchpad).

> Contexto: búsqueda de imágenes en Google sin resultados similares → **probable registrable**. Falta el registro formal 9+36 (EUIPO/TMview).

## Fuentes SVG (editables, en esta carpeta)
| Archivo | Uso |
|---|---|
| `icon-tile.svg` | Icono con tile navy y esquinas redondeadas (copia de `public/favicon.svg`). |
| `icon-fullbleed.svg` | Icono con fondo a sangre (sin esquinas transparentes), marcas dentro de la safe-zone. Para apple-touch / maskable. |

## Icono — PNG
| Archivo | px | Variante | Uso típico |
|---|---|---|---|
| `finnort-favicon-16.png` | 16 | tile | favicon navegador |
| `finnort-favicon-32.png` | 32 | tile | favicon navegador |
| `finnort-favicon-48.png` | 48 | tile | favicon / atajos |
| `finnort-icon-256.png` | 256 | tile | uso general / previews |
| `finnort-social-1024.png` | 1024 | tile | avatar de redes (Instagram, X, YouTube, TikTok…) |
| **`finnort-master-2048.png`** | **2048** | **tile** | **MÁSTER para el registro EUIPO (clase 9+36)** |
| `finnort-apple-touch-180.png` | 180 | full-bleed | apple-touch-icon (iOS) |
| `finnort-android-chrome-192.png` | 192 | full-bleed | PWA / Android (maskable) |
| `finnort-android-chrome-512.png` | 512 | full-bleed | PWA / Android (maskable) |

## Wordmark y lockup — PNG (fondo transparente)
La `t` final va en **minúscula** a propósito; **F** y **N** en teal, resto en el color base.
| Archivo | Variante | Teal / texto | Uso |
|---|---|---|---|
| `finnort-wordmark-dark.png` | sobre oscuro | `#22d3ee` / blanco | solo el nombre, para fondos oscuros |
| `finnort-wordmark-light.png` | sobre claro | `#0891b2` / navy `#0f2233` | solo el nombre, para fondos claros |
| `finnort-lockup-dark.png` | sobre oscuro | icono + nombre (horizontal) | firma completa, fondos oscuros |
| `finnort-lockup-light.png` | sobre claro | icono + nombre (horizontal) | firma completa, fondos claros |
| `finnort-lockup-stacked-dark.png` | sobre oscuro | icono arriba + nombre debajo (vertical) | firma apilada, fondos oscuros |
| `finnort-lockup-stacked-light.png` | sobre claro | icono arriba + nombre debajo (vertical) | firma apilada, fondos claros |

> Nota: el wordmark usa la fuente del sistema (`system-ui` → aquí **Segoe UI**). En otras plataformas la app lo renderiza con su propia system-font; estos PNG fijan la versión Segoe UI.

## ⚠️ Obsoleto (limpieza pendiente, no urgente)
La carpeta hermana `export-icons-s62/` contiene el icono **«Pico Norte» YA DESCARTADO** (s.62). No usar. Anotado en `08_MEJORAS.md` para limpieza.
