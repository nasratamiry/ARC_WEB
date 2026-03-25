import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const publicDir = path.join(projectRoot, 'public')

const slides = [
  { in: 'hero-slide-1.png', out: 'hero-slide-1' },
  { in: 'hero-slide-2.png', out: 'hero-slide-2' },
  { in: 'hero-slide-3.png', out: 'hero-slide-3' },
]

const buildOne = async ({ in: inputName, out }) => {
  const inputPath = path.join(publicDir, inputName)
  const base = sharp(inputPath).rotate()

  // Create a reasonable max width for hero to reduce payload.
  const resized = base.resize({ width: 1920, withoutEnlargement: true })

  await resized
    .clone()
    .avif({ quality: 55, effort: 6 })
    .toFile(path.join(publicDir, `${out}.avif`))

  await resized
    .clone()
    .webp({ quality: 70, effort: 5 })
    .toFile(path.join(publicDir, `${out}.webp`))
}

for (const slide of slides) {
  console.log(`Optimizing ${slide.in}...`)
  await buildOne(slide)
}

console.log('Done.')

