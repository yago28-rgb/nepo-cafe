# NEPO Café · Pozuelo Coffee House

Web de NEPO Café, cafetería de especialidad en la Avenida Juan XXIII, 19 · Pozuelo de Alarcón (Madrid).

HTML, CSS y JavaScript sin dependencias ni paso de compilación.

## Verla en local

```bash
npx serve . -l 5000
```

y abre `http://localhost:5000`. (Abrir `index.html` con doble clic no carga bien el vídeo del hero.)

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html` | Inicio: hero con el vídeo, claim, accesos a las páginas, Instagram y horario resumido |
| `carta/index.html` | La Carta (`/carta/`). **La carta completa está aquí, en HTML** (visible sin JavaScript y legible por buscadores) |
| `nosotros/index.html` | Nosotros (`/nosotros/`): filosofía, los tres pilares y comunidad |
| `visitanos/index.html` | Visítanos (`/visitanos/`): dirección, horario, teléfono y mapa |
| `legal.html` | Aviso legal, privacidad y cookies (`noindex`) |
| `css/styles.css` | Estilos: paleta, tipografías, animaciones, responsive y movimiento reducido |
| `js/main.js` | Horario y estado «abierto», navbar, hero con vídeo guiado por el scroll, revelados, parallax, pestañas de la carta, cookies y mapa |
| `assets/` | Fotos originales, logo, vídeo y póster (ver `assets/README.md`) |
| `assets/img/` | Versiones optimizadas de las fotos (AVIF, WebP y JPG en varios anchos), generadas |
| `assets/fonts/` | Neuton y Plus Jakarta Sans alojadas en la web (licencia OFL): no se conecta con Google Fonts |
| `robots.txt`, `sitemap.xml`, `site.webmanifest` | SEO técnico |
| `scripts/optimize-images.mjs` | Regenera `assets/img/` y la imagen Open Graph |

## Editar contenido

Cada página es un HTML completo: la navbar, el pie y el aviso de cookies se repiten en las cuatro (no hay plantillas ni compilación). Si cambias uno, cámbialo en todas. Las páginas en subcarpeta usan rutas `../`.

- **Carta y precios:** en `carta/index.html`. Cada categoría es un `<section class="menu__cat">` con su `data-label` (el texto de la pestaña); cada producto, un `<li class="dish">`. JavaScript crea las pestañas a partir de ese HTML: no hay que tocar `main.js`. Si cambias un plato o un precio, cámbialo también en el JSON-LD `Menu` del `<head>` de esa página.
- **Horario:** `HOURS` y días especiales `SPECIAL` en `js/main.js`, la tabla `.hours` en `visitanos/index.html`, la franja de horario de `index.html`, el pie de las cuatro páginas y `openingHoursSpecification` en el JSON-LD de `index.html` y `visitanos/index.html`. Mantenlos iguales.
- **Fotos:** sustituye el archivo original en `assets/` y ejecuta `npm i --no-save sharp && node scripts/optimize-images.mjs`. Si cambian las proporciones, actualiza `width` y `height` del `<img>` correspondiente.

## Rendimiento

- Lo primero que se pinta del hero es un póster WebP de 15 KB. El vídeo (`assets/vertido.mp4`, ~8 MB) **solo se descarga tras la primera interacción** (scroll, toque o tecla) y nunca con «Ahorro de datos».
- Las animaciones se pausan fuera de pantalla y desaparecen con `prefers-reduced-motion`.
- Pendiente: recomprimir el vídeo (ver `assets/README.md`).
