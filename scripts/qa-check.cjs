/* 临时 QA 脚本：桌面/移动视口截图 + 交互 + 控制台检查（交付前删除） */
const path = require('path');
const { chromium } = require('C:/Users/MECHREVO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const BASE = 'http://localhost:8765/';
const OUT = process.env.QA_OUT || 'C:/Users/MECHREVO/.codex/visualizations/2026/08/04/019fca81-9031-7470-b3c3-ee879cc6a622';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });

  // ---------- 桌面视口 ----------
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('[console] ' + msg.text());
  });
  page.on('pageerror', (err) => errors.push('[pageerror] ' + err.message));

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  console.log('TITLE:', await page.title());
  console.log('URL:', page.url());

  // 首屏内容
  const h1 = await page.locator('h1').first().textContent();
  console.log('H1:', h1.trim());
  const navCount = await page.locator('.site-nav a').count();
  console.log('NAV LINKS:', navCount);

  // 画廊是否渲染
  await page.waitForSelector('.gallery-item', { timeout: 20000 });
  const galleryCount = await page.locator('.gallery-item').count();
  console.log('GALLERY ITEMS:', galleryCount);

  // 灯箱交互
  await page.locator('.gallery-item').first().click();
  await page.waitForTimeout(400);
  console.log('LIGHTBOX VISIBLE:', await page.locator('#lightbox').isVisible());
  await page.locator('#lightboxNext').click();
  await page.waitForTimeout(200);
  const cap2 = await page.locator('#lightboxCaption').textContent();
  console.log('LIGHTBOX CAPTION AFTER NEXT:', cap2.trim());
  await page.keyboard.press('Escape');
  console.log('LIGHTBOX CLOSED:', !(await page.locator('#lightbox').isVisible()));

  // 滚动 + 锚点
  await page.locator('.site-nav a[href="#projects"]').click();
  await page.waitForTimeout(800);
  const projHeading = await page.locator('#projects h2').isVisible();
  console.log('SCROLL TO PROJECTS OK:', projHeading);

  // 视频元素
  const videoSrc = await page.locator('video source').getAttribute('src');
  console.log('VIDEO SRC:', videoSrc);

  // 下载链接
  const dlHref = await page.locator('.nav-cta').getAttribute('href');
  console.log('DOWNLOAD HREF:', dlHref);

  await page.screenshot({ path: path.join(OUT, 'site-desktop.png'), fullPage: true });
  console.log('SAVED: site-desktop.png');

  // ---------- 移动视口 ----------
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const mErrors = [];
  m.on('console', (msg) => {
    if (msg.type() === 'error') mErrors.push('[console] ' + msg.text());
  });
  m.on('pageerror', (err) => mErrors.push('[pageerror] ' + err.message));
  await m.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });

  // 移动端菜单
  await m.locator('#navToggle').click();
  const navOpen = await m.locator('#siteNav').evaluate((el) => el.classList.contains('open'));
  console.log('MOBILE NAV OPENS:', navOpen);
  await m.locator('#navToggle').click();

  await m.waitForSelector('.gallery-item', { timeout: 20000 });
  await m.screenshot({ path: path.join(OUT, 'site-mobile.png'), fullPage: true });
  console.log('SAVED: site-mobile.png');

  // 水平溢出检查
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log('MOBILE HORIZONTAL OVERFLOW px:', overflow);

  console.log('DESKTOP ERRORS:', errors.length ? errors.join(' | ') : 'none');
  console.log('MOBILE ERRORS:', mErrors.length ? mErrors.join(' | ') : 'none');

  await browser.close();
  console.log('QA DONE');
})().catch((e) => {
  console.error('QA FAILED:', e);
  process.exit(1);
});
