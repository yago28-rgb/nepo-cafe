// Genera las versiones responsivas (AVIF + WebP + JPG) de las fotos de assets/
// en assets/img/, y la imagen Open Graph de 1200×630.
// Herramienta de desarrollo: la web no la necesita para funcionar (los archivos
// generados se versionan). Uso:  npm i --no-save sharp && node scripts/optimize-images.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT = "assets/img";
mkdirSync(OUT, { recursive: true });

// Nombre de salida → archivo fuente. Anchos: 480, 800 y 1200 si la fuente da para ello
// (nunca se amplía; el ancho máximo es el de la propia foto).
const PHOTOS = {
  "fachada": "assets/local-nepo.jpg",
  "espresso-portafiltro": "assets/cafe-especialidad.jpg",
  "espresso-barra": "assets/espresso-barra.jpg",
  "latte-art": "assets/latte-art.jpg",
  "tostadas-aguacate": "assets/tostadas-brutales.jpg",
  "rama-cafeto": "assets/rama-cafeto.jpg",
  "tueste": "assets/tueste.jpg",
  "horario-navidad": "assets/horario-navidad.jpg",
  "bolleria": "assets/ig-bolleria-casera-nepo.jpg",
  "molienda": "assets/ig-cafe-molido-portafiltro-nepo.jpg",
  "distribuidor": "assets/ig-distribuidor-portafiltro-nepo.jpg",
  "espresso-crema": "assets/ig-espresso-crema-cazo-nepo.jpg",
  "hilo-espresso": "assets/ig-hilo-espresso-taza-nepo.jpg",
  "leche-texturizada": "assets/ig-leche-texturizada-jarra-nepo.jpg",
  "tostada-pavo": "assets/ig-tostada-pavo-nepo.jpg",
};
const WIDTHS = [480, 800, 1200];

const report = {};
for (const [name, src] of Object.entries(PHOTOS)) {
  const meta = await sharp(src).metadata();
  const widths = [...new Set(WIDTHS.filter((w) => w < meta.width).concat(Math.min(meta.width, 1200)))].sort((a, b) => a - b);
  for (const w of widths) {
    const base = sharp(src).rotate().resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: 50, effort: 6 }).toFile(`${OUT}/${name}-${w}.avif`);
    await base.clone().webp({ quality: 72, effort: 6 }).toFile(`${OUT}/${name}-${w}.webp`);
  }
  // JPG de respaldo, solo el ancho mayor
  const max = widths.at(-1);
  await sharp(src).rotate().resize({ width: max }).jpeg({ quality: 78, mozjpeg: true }).toFile(`${OUT}/${name}-${max}.jpg`);
  report[name] = { widths, ratio: `${meta.width}x${meta.height}` };
}

// Open Graph 1200×630 (foto real de extracción en la barra)
await sharp("assets/cafe-especialidad.jpg")
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("assets/og-nepo-cafe.jpg");

console.log(JSON.stringify(report, null, 1));
