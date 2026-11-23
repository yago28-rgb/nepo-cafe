# Imágenes de NEPO Café

Fotos originales. La web no las enlaza directamente: usa las versiones optimizadas de `assets/img/`,
que se generan con `node scripts/optimize-images.mjs` (ver el README principal).

| Archivo | Origen | Tamaño | Dónde aparece |
|---|---|---|---|
| `cafe-especialidad.jpg` | Repositorio original | 1130×754 | Filosofía · pilar 01, imagen Open Graph |
| `tostadas-brutales.jpg` | Repositorio original | 736×1052 | Carta (Tostadas) |
| `rama-cafeto.jpg` | Repositorio original | 960×640 | Filosofía · pilar 03 |
| `tueste.jpg` | Repositorio original | 1080×719 | Filosofía · pilar 03 |
| `local-nepo.jpg` | Repositorio original | **320×400** | Comunidad (fachada) |
| `espresso-barra.jpg` | Repositorio original | **320×400** | Comunidad |
| `latte-art.jpg` | Repositorio original | **320×400** | Filosofía · pilar 02 |
| `horario-navidad.jpg` | Repositorio original | 320×400 | Aviso de Navidad (visible 15/11–25/12) |
| `ig-*.jpg` (7 fotos) | Instagram @nepo.cafe | **640 px** | Carta, Filosofía y rejilla de Instagram |

Publicaciones de Instagram de origen: hilo de espresso CMYAXjYlE8h · espresso con crema CMYAeBulzY5 ·
molienda Cno7y0RDeX- · distribuidor DYelV6aDRZo · leche texturizada DX_WIidjAyE · tostada de pavo CjNmEH_jiJu ·
bollería DE5HIfbKVI1.

**Pendiente:** las fotos marcadas en negrita son pequeñas. Hacen falta los originales en alta resolución
(≥1600 px) y, sobre todo, fotos del **interior, la terraza y el equipo en barra**, que ahora no existen.

## Vídeo del vertido (hero)

| Archivo               | Uso |
|-----------------------|-----|
| `vertido.mp4`         | Vídeo real del café vertiéndose en el vaso. Avanza y retrocede con el scroll. |

Vídeo actual: «A Person Pouring Coffee in a Glass», de Mikhail Nilov en Pexels (https://www.pexels.com/video/6933519/), licencia Pexels (uso comercial gratuito, sin atribución obligatoria). Si lo cambias, regenera también el póster con su primer fotograma.

Mientras el vídeo no carga (o si falla), se ve `vertido-poster.webp`, su primer fotograma.

**Cómo grabarlo**
- Trípode fijo, sin mover la cámara. Fondo liso y claro (crema / madera clara).
- Vertical **4:5** (p. ej. 1080×1350), 6–10 segundos.
- Empieza con el vaso vacío y termina con el vaso lleno y quieto.

**Prepararlo para que el scroll vaya fluido** (imprescindible: todos los fotogramas clave y sin audio):

```bash
ffmpeg -i original.mov -vf "scale=1080:-2,fps=30" -an -c:v libx264 -preset slow -crf 22 -g 1 -pix_fmt yuv420p -movflags +faststart vertido.mp4
```

(Instala ffmpeg con `brew install ffmpeg`.) El actual pesa ~8 MB y no se ha podido recomprimir aquí (no había ffmpeg). Objetivo: 720 px de ancho, `-crf 26`, menos de 4 MB.
