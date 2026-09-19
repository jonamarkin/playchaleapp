import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = path.join(__dirname, '..', 'public', 'icons', 'icon-512x512.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

async function generateIcons() {
    console.log('Generating PWA icons...');

    for (const size of sizes) {
        const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

        if (inputPath === outputPath) {
            console.log(`✅ Skipped icon-${size}x${size}.png (Source file)`);
            continue;
        }

        await sharp(inputPath)
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`✅ Generated icon-${size}x${size}.png`);
    }

    // Maskable variants: Android crops icons to its own shape, so the artwork needs a
    // safe zone. Without these, declaring "maskable" (as the manifest did for every icon)
    // means the logo gets clipped on most Android launchers.
    for (const size of [192, 512]) {
        const pad = Math.round(size * 0.2);
        const inner = size - pad * 2;
        await sharp({
            create: { width: size, height: size, channels: 4, background: '#111111' },
        })
            .composite([{ input: await sharp(inputPath).resize(inner, inner).png().toBuffer(), top: pad, left: pad }])
            .png()
            .toFile(path.join(outputDir, `maskable-${size}x${size}.png`));

        console.log(`✅ Generated maskable-${size}x${size}.png`);
    }

    // Also create favicon
    const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');
    await sharp(inputPath)
        .resize(32, 32)
        .png()
        .toFile(path.join(__dirname, '..', 'public', 'favicon.png'));

    console.log('✅ Generated favicon.png');
    console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
