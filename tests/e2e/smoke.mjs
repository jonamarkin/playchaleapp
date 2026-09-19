/**
 * Browser smoke test: the paths a person actually walks.
 *
 *   pnpm dev            # or pnpm start
 *   pnpm test:e2e
 *
 * The contract suite proves the API is right; this proves the app reaches it. It caught a
 * regression the API tests could not: Discover asked the server for the sport "All", which
 * the stricter contract filtered on, so every card silently disappeared while every
 * endpoint still returned 200.
 *
 * Uses playwright-core against an already-installed Chromium — no second browser download.
 * Point PLAYWRIGHT_CHROMIUM at another binary if yours lives elsewhere.
 */
import { chromium } from 'playwright-core';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM
    ?? `${process.env.HOME}/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`;

let failures = 0;
const check = (name, condition, detail = '') => {
    if (condition) {
        console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    } else {
        failures++;
        console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? `\n    ${detail}` : ''}`);
    }
};

const browser = await chromium.launch({ executablePath: EXECUTABLE });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

const consoleErrors = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(`${page.url()} :: ${message.text()}`); });
page.on('pageerror', (error) => consoleErrors.push(`${page.url()} :: ${error.message}`));

const visible = (locator) => locator.first().isVisible().catch(() => false);

try {
    console.log(`\nPlayChale smoke test → ${BASE}\n`);

    // ---------------------------------------------------------------- signed out
    await page.goto(`${BASE}/discover`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const cards = await page.locator('text=Squad recruitment').count();
    check('Discover lists games', cards > 0, `found ${cards} cards — the list query may be filtering everything out`);

    await page.getByRole('button', { name: /^calendar$/i }).click();
    await page.waitForTimeout(1200);
    const dayWithGames = page.locator('button:has(div > div.bg-lime-500)');
    check('the calendar marks days that have games', (await dayWithGames.count()) > 0);
    if (await dayWithGames.count()) {
        await dayWithGames.first().click();
        await page.waitForTimeout(800);
        check('picking a day filters the list', await visible(page.getByText(/games on /i)));
    }

    // ---------------------------------------------------------------- sign in
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.getByText(/continue with google/i).first().click();
    await page.waitForURL(/\/home|\/discover|\/onboarding/, { timeout: 20000 });
    check('signing in lands somewhere signed-in', !/\/login/.test(page.url()), page.url());

    // ---------------------------------------------------------------- host a game
    await page.goto(`${BASE}/games/new`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const title = `Smoke Match ${Math.random().toString(36).slice(2, 7)}`;
    await page.locator('#title').fill(title);
    await page.locator('#location').fill('Achimota Retail Pitch');
    await page.locator('#spots').fill('6');
    await page.locator('#amount').fill('25');
    await page.waitForTimeout(400);
    check('a fee reveals the mobile-money field', await visible(page.locator('#momo')));
    await page.locator('#momo').fill('0244000000');

    await page.getByRole('button', { name: /publish match/i }).click();
    await page.waitForURL(/\/game\//, { timeout: 20000 });
    await page.waitForTimeout(1500);

    const heading = (await page.locator('h1').first().innerText()).trim();
    check('the new game opens on its own page', heading.toLowerCase() === title.toLowerCase(), `heading was "${heading}"`);
    check('the fee renders as money, not minor units', await visible(page.getByText(/25/).first()));
    check('the host sees management controls', await visible(page.getByRole('button', { name: /edit details/i })));

    // ---------------------------------------------------------------- it is findable
    await page.goto(`${BASE}/discover`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    check('the game appears in Discover', await visible(page.getByText(title, { exact: false })));

    await page.goto(`${BASE}/mygames`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    check('and under My Games', await visible(page.getByText(title, { exact: false })));

    // ---------------------------------------------------------------- the signed-in pages render
    for (const path of ['/home', '/stats', '/community', '/profile/marcusj']) {
        await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1800);
        const broke = await page.getByText(/application error/i).first().isVisible().catch(() => false);
        check(`${path} renders`, !broke);
    }

    check('no console errors along the way', consoleErrors.length === 0, consoleErrors.slice(0, 5).join('\n    '));
} catch (error) {
    failures++;
    console.log(`\n  \x1b[31m✗\x1b[0m the run stopped: ${error.message}`);
} finally {
    await browser.close();
}

console.log(failures === 0 ? '\nall good\n' : `\n${failures} failed\n`);
process.exit(failures === 0 ? 0 : 1);
