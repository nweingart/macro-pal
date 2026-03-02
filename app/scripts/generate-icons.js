const sharp = require('sharp');
const path = require('path');

// Macro Pal mascot - cute orange blob with face
const createMascotSVG = (size) => {
  const scale = size / 1024;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#fff7ed"/>

  <!-- Body shadow -->
  <ellipse cx="512" cy="780" rx="280" ry="60" fill="#fdba74" opacity="0.5"/>

  <!-- Body - cute blob shape -->
  <path d="
    M512 180
    C720 180 820 320 820 480
    C820 640 720 760 512 760
    C304 760 204 640 204 480
    C204 320 304 180 512 180
  " fill="url(#bodyGradient)"/>

  <!-- Body highlight -->
  <ellipse cx="420" cy="380" rx="80" ry="100" fill="#fff" opacity="0.3"/>

  <!-- Left eye white -->
  <ellipse cx="400" cy="450" rx="70" ry="80" fill="#fff"/>
  <!-- Left eye pupil -->
  <ellipse cx="410" cy="460" rx="35" ry="45" fill="#1f2937"/>
  <!-- Left eye shine -->
  <circle cx="425" cy="440" r="15" fill="#fff"/>

  <!-- Right eye white -->
  <ellipse cx="624" cy="450" rx="70" ry="80" fill="#fff"/>
  <!-- Right eye pupil -->
  <ellipse cx="634" cy="460" rx="35" ry="45" fill="#1f2937"/>
  <!-- Right eye shine -->
  <circle cx="649" cy="440" r="15" fill="#fff"/>

  <!-- Happy mouth -->
  <path d="M400 580 Q512 680 624 580" stroke="#1f2937" stroke-width="20" fill="none" stroke-linecap="round"/>

  <!-- Cheeks (blush) -->
  <ellipse cx="300" cy="520" rx="45" ry="30" fill="#fb923c" opacity="0.6"/>
  <ellipse cx="724" cy="520" rx="45" ry="30" fill="#fb923c" opacity="0.6"/>

  <!-- Small arm/hand left -->
  <ellipse cx="220" cy="550" rx="50" ry="40" fill="#f97316"/>

  <!-- Small arm/hand right doing thumbs up -->
  <ellipse cx="804" cy="520" rx="50" ry="40" fill="#f97316"/>
  <ellipse cx="830" cy="470" rx="20" ry="35" fill="#f97316"/>

  <!-- Gradients -->
  <defs>
    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#fb923c"/>
      <stop offset="100%" style="stop-color:#f97316"/>
    </linearGradient>
  </defs>
</svg>`;
};

// Create adaptive icon SVG (just the mascot, transparent bg)
const createAdaptiveSVG = (size) => {
  return `
<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Body shadow -->
  <ellipse cx="512" cy="780" rx="280" ry="60" fill="#fdba74" opacity="0.5"/>

  <!-- Body - cute blob shape -->
  <path d="
    M512 180
    C720 180 820 320 820 480
    C820 640 720 760 512 760
    C304 760 204 640 204 480
    C204 320 304 180 512 180
  " fill="url(#bodyGradient)"/>

  <!-- Body highlight -->
  <ellipse cx="420" cy="380" rx="80" ry="100" fill="#fff" opacity="0.3"/>

  <!-- Left eye white -->
  <ellipse cx="400" cy="450" rx="70" ry="80" fill="#fff"/>
  <!-- Left eye pupil -->
  <ellipse cx="410" cy="460" rx="35" ry="45" fill="#1f2937"/>
  <!-- Left eye shine -->
  <circle cx="425" cy="440" r="15" fill="#fff"/>

  <!-- Right eye white -->
  <ellipse cx="624" cy="450" rx="70" ry="80" fill="#fff"/>
  <!-- Right eye pupil -->
  <ellipse cx="634" cy="460" rx="35" ry="45" fill="#1f2937"/>
  <!-- Right eye shine -->
  <circle cx="649" cy="440" r="15" fill="#fff"/>

  <!-- Happy mouth -->
  <path d="M400 580 Q512 680 624 580" stroke="#1f2937" stroke-width="20" fill="none" stroke-linecap="round"/>

  <!-- Cheeks (blush) -->
  <ellipse cx="300" cy="520" rx="45" ry="30" fill="#fb923c" opacity="0.6"/>
  <ellipse cx="724" cy="520" rx="45" ry="30" fill="#fb923c" opacity="0.6"/>

  <!-- Small arm/hand left -->
  <ellipse cx="220" cy="550" rx="50" ry="40" fill="#f97316"/>

  <!-- Small arm/hand right doing thumbs up -->
  <ellipse cx="804" cy="520" rx="50" ry="40" fill="#f97316"/>
  <ellipse cx="830" cy="470" rx="20" ry="35" fill="#f97316"/>

  <!-- Gradients -->
  <defs>
    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#fb923c"/>
      <stop offset="100%" style="stop-color:#f97316"/>
    </linearGradient>
  </defs>
</svg>`;
};

// Splash screen SVG with mascot and text
const createSplashSVG = (size) => {
  return `
<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#fff7ed"/>

  <!-- Mascot (scaled down and moved up) -->
  <g transform="translate(512, 340) scale(0.55)">
    <!-- Body shadow -->
    <ellipse cx="0" cy="300" rx="280" ry="60" fill="#fdba74" opacity="0.5"/>

    <!-- Body - cute blob shape -->
    <path d="
      M0 -300
      C208 -300 308 -160 308 0
      C308 160 208 280 0 280
      C-208 280 -308 160 -308 0
      C-308 -160 -208 -300 0 -300
    " fill="url(#bodyGradient)"/>

    <!-- Body highlight -->
    <ellipse cx="-92" cy="-100" rx="80" ry="100" fill="#fff" opacity="0.3"/>

    <!-- Left eye white -->
    <ellipse cx="-112" cy="-30" rx="70" ry="80" fill="#fff"/>
    <!-- Left eye pupil -->
    <ellipse cx="-102" cy="-20" rx="35" ry="45" fill="#1f2937"/>
    <!-- Left eye shine -->
    <circle cx="-87" cy="-40" r="15" fill="#fff"/>

    <!-- Right eye white -->
    <ellipse cx="112" cy="-30" rx="70" ry="80" fill="#fff"/>
    <!-- Right eye pupil -->
    <ellipse cx="122" cy="-20" rx="35" ry="45" fill="#1f2937"/>
    <!-- Right eye shine -->
    <circle cx="137" cy="-40" r="15" fill="#fff"/>

    <!-- Happy mouth -->
    <path d="M-112 100 Q0 200 112 100" stroke="#1f2937" stroke-width="20" fill="none" stroke-linecap="round"/>

    <!-- Cheeks (blush) -->
    <ellipse cx="-212" cy="40" rx="45" ry="30" fill="#fb923c" opacity="0.6"/>
    <ellipse cx="212" cy="40" rx="45" ry="30" fill="#fb923c" opacity="0.6"/>

    <!-- Small arm/hand left -->
    <ellipse cx="-292" cy="70" rx="50" ry="40" fill="#f97316"/>

    <!-- Small arm/hand right -->
    <ellipse cx="292" cy="40" rx="50" ry="40" fill="#f97316"/>
    <ellipse cx="318" cy="-10" rx="20" ry="35" fill="#f97316"/>
  </g>

  <!-- App Name -->
  <text x="512" y="680" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="72" font-weight="700" fill="#1f2937">
    Macro Pal
  </text>

  <!-- Tagline -->
  <text x="512" y="740" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="400" fill="#9ca3af">
    Your friendly macro tracker
  </text>

  <!-- Gradients -->
  <defs>
    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#fb923c"/>
      <stop offset="100%" style="stop-color:#f97316"/>
    </linearGradient>
  </defs>
</svg>`;
};

// Favicon SVG (simplified for small size)
const createFaviconSVG = (size) => {
  return `
<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#fff7ed" rx="12"/>
  <ellipse cx="32" cy="34" rx="22" ry="20" fill="#f97316"/>
  <ellipse cx="26" cy="32" rx="5" ry="6" fill="#fff"/>
  <ellipse cx="38" cy="32" rx="5" ry="6" fill="#fff"/>
  <circle cx="27" cy="33" r="2.5" fill="#1f2937"/>
  <circle cx="39" cy="33" r="2.5" fill="#1f2937"/>
  <path d="M26 42 Q32 47 38 42" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;
};

async function generateIcons() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  console.log('🎨 Generating Macro Pal icons...\n');

  // Generate main icon (1024x1024)
  console.log('📱 Creating icon.png (1024x1024)...');
  await sharp(Buffer.from(createMascotSVG(1024)))
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));

  // Generate adaptive icon (1024x1024)
  console.log('🤖 Creating adaptive-icon.png (1024x1024)...');
  await sharp(Buffer.from(createAdaptiveSVG(1024)))
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));

  // Generate splash icon with text (1024x1024)
  console.log('💦 Creating splash-icon.png (1024x1024)...');
  await sharp(Buffer.from(createSplashSVG(1024)))
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));

  // Generate favicon (64x64)
  console.log('🌐 Creating favicon.png (64x64)...');
  await sharp(Buffer.from(createFaviconSVG(64)))
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));

  console.log('\n✅ All icons generated successfully!');
  console.log('📁 Files saved to:', assetsDir);
}

generateIcons().catch(console.error);
