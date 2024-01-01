const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fontFile = new FontFace(
    "ZX Spectrum-7 Regular",
    "url('./assets/fonts/zx_spectrum-7.woff')",
);
document.fonts.add(fontFile);

let gameImg = new Image();

let leadAndSyncSignalColors = ["#007A87", "#720000"];
let BitstreamSignalColors = ["#665B00", "#001459"];

let leadSignalColorsIndex = 0;
let renderLeaderSignalTimer;

/**
 * Preload the game image
 */
function loadGameImg() {
    gameImg.src = "./assets/img/jet-pac-zx-spectrum-loading-screen.png";
    gameImg.onload = function () {
        console.log("Assets loaded");
        startLeadSignal();
    };
}

/**
 * Preload the font face
 */
fontFile.load().then(
    () => {
      // font loaded successfully!;
      const ctx = canvas.getContext("2d");
  
      ctx.font = '36px "ZX Spectrum-7 Regular"';
      ctx.fillText("ZX Spectrum-7 Regular font loaded", 20, 50);
      loadGameImg();
    },
    (err) => {
      console.error(err);
    },
);

/**
 * Lead Signal Animation
 * Transition sequentially between the two colors, filling the entire canvas
 */

function startLeadSignal() {
    renderLeadSignal();
}

function renderLeadSignal() {
    ctx.fillStyle = leadAndSyncSignalColors[leadSignalColorsIndex];
    leadSignalColorsIndex = 1 - leadSignalColorsIndex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderLeaderSignalTimer = setTimeout(renderLeadSignal, 2000);
}

