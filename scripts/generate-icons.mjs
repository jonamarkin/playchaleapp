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

        await sharp(inputPath)
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`✅ Generated icon-${size}x${size}.png`);
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
