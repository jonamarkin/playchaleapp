import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');
const inputPath = path.join(publicDir, 'playchalelogo_final.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

async function generateIcons() {
    console.log('Generating PWA icons...');

    for (const size of sizes) {
        const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

        await sharp(inputPath)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png({
                compressionLevel: 9,
                palette: size <= 192,
            })
            .toFile(outputPath);

        console.log(`✅ Generated icon-${size}x${size}.png`);
    }

    await sharp(inputPath)
        .resize(512, 512, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9 })
        .toFile(path.join(publicDir, 'playchalelogo_final.optimized.png'));

    await fs.rename(
        path.join(publicDir, 'playchalelogo_final.optimized.png'),
        path.join(publicDir, 'playchalelogo_final.png'),
    );

    await sharp(inputPath)
        .resize(32, 32)
        .png({ compressionLevel: 9, palette: true })
        .toFile(path.join(publicDir, 'favicon.png'));

    console.log('✅ Generated favicon.png');
    console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
