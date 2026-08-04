/* 素材预处理脚本：
   1. 将源文件夹中的硬件照片压缩为网页用图片（最大宽 1400px, JPEG q80）
   2. 处理个人照片（最大宽 900px）
   3. 复制项目视频到站点目录
   4. 生成画廊 manifest.json（供前端按分组展示）
   运行：node scripts/prepare-assets.cjs
*/
const path = require('path');
const fs = require('fs/promises');
const sharp = require('C:/Users/MECHREVO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const SRC = process.env.RESUME_SRC || 'E:\\';
const SITE = path.join(__dirname, '..');
const GALLERY_DIR = path.join(SITE, 'assets', 'images', 'gallery');
const IMG_DIR = path.join(SITE, 'assets', 'images');
const VIDEO_DIR = path.join(SITE, 'assets', 'video');

const GROUPS = [
  {
    key: 'uwb',
    title: 'UWB 定位与无线通信',
    files: [
      '4个UWB实物图.jpg',
      'UWB信标+基站.jpg',
      'UWB信标基站反面实物图.jpg',
      'uwb板反面（）裸.jpg',
      'STM32+2,4G无线透传遥控器.jpg',
    ],
  },
  {
    key: 'motor',
    title: '电机驱动与控制',
    files: [
      'C8T6+TB6612双路电机驱动板.jpg',
      'C8T6+TB6612四路电机驱动大板.png',
      'C8T6四路电机驱动小板.jpg',
      'F103ZET6 F407ZGT6四路电机驱动+四路舵机驱动+六路PWM输入1.jpg',
      'STM32c8t6拓展板+电机驱动.jpg',
      'C8T6按键式舵机角度可调系统.jpg',
    ],
  },
  {
    key: 'power',
    title: '电源与继电器',
    files: [
      'C8T6五路继电器控制.png',
      'C8T6五路输出数控电源板.jpg',
      'dc-dc多路降压板（lm2596）.jpg',
      'MP1584 DC-DC可调降压小板+LED电量监测.png',
      'MPPT太阳能供电控制.png',
      'STM32F103+继电器电源板.jpg',
      'dc-dc降压板多路.png',
      'MP1584 DC-DC降压小板.png',
    ],
  },
  {
    key: 'board',
    title: '核心板与拓展外设',
    files: [
      'STM32407裸板.jpg',
      'stm32f103核心板.jpg',
      'stm32f103拓展板.jpg',
      'stm32拓展板.jpg',
      'stm32f4四层板.png',
      '嵌入式STM32F407+多接口.jpg',
      '嵌入式比赛STM32F407+外部接口板.jpg',
      'USB-TTL_CH340.jpg',
      'USB2.0扩展坞-插件.png',
      '五路红外传感器.png',
    ],
  },
];

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[（）()]/g, '')
    .replace(/[\s+]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '');
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function main() {
  await ensureDir(GALLERY_DIR);
  await ensureDir(IMG_DIR);
  await ensureDir(VIDEO_DIR);

  const manifest = [];
  let idx = 0;

  for (const group of GROUPS) {
    for (const name of group.files) {
      const src = path.join(SRC, name);
      let stat;
      try {
        stat = await fs.stat(src);
      } catch {
        console.log('MISS:', name);
        continue;
      }
      if (!stat.isFile()) continue;
      idx += 1;
      const slug = `g${String(idx).padStart(2, '0')}`;
      const outName = `${slug}.jpg`;
      const outPath = path.join(GALLERY_DIR, outName);
      try {
        await sharp(src, { failOn: 'none' })
          .rotate()
          .resize({ width: 1400, withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(outPath);
        manifest.push({
          file: `assets/images/gallery/${outName}`,
          title: name.replace(/\.[^.]+$/, ''),
          group: group.key,
        });
        console.log('OK:', name, '->', outName);
      } catch (e) {
        console.log('ERR:', name, e.message);
      }
    }
  }

  // 个人照片
  const portraitSrc = path.join(SRC, 'mmexport1773913557119.png');
  try {
    await sharp(portraitSrc)
      .resize({ width: 900, withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toFile(path.join(IMG_DIR, 'portrait.jpg'));
    console.log('OK: portrait.jpg');
  } catch (e) {
    console.log('ERR portrait:', e.message);
  }

  // 项目视频（原始副本；如后续压缩成功会覆盖）
  const videoSrc = path.join(SRC, 'video_20260404_161808.mp4');
  try {
    const out = path.join(VIDEO_DIR, 'project-demo.mp4');
    await fs.copyFile(videoSrc, out);
    const st = await fs.stat(out);
    console.log('OK: video copied,', (st.size / 1024 / 1024).toFixed(1), 'MB');
  } catch (e) {
    console.log('ERR video:', e.message);
  }

  await fs.writeFile(
    path.join(IMG_DIR, 'manifest.json'),
    JSON.stringify({ groups: GROUPS, items: manifest }, null, 2),
    'utf-8'
  );
  console.log('manifest written, total items:', manifest.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
