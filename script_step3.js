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

let totalLoadingBarsOnScreen = 30;
let barInitPosY = 0;

/**
 * Preload the game image
 */
function loadGameImg() {
    gameImg.src = "./assets/img/jet-pac-zx-spectrum-loading-screen.png";
    gameImg.onload = function () {
        console.log("Assets loaded");
        startBitstreamSignal();
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

/**
 * Sync Signal Animation
 * The same colors of the Lead Signal, dividing the entire screen with horizontal bars, with a downward, continuous movement
 */

function startSyncSignal() {
    renderSyncsSignal();
}

function renderSyncsSignal() {
    ctx.fillStyle = leadAndSyncSignalColors[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = leadAndSyncSignalColors[1];
    let barHeight = canvas.height / 30;
    
    for (let i = -1; i < totalLoadingBarsOnScreen; i += 2) {
        ctx.fillRect(0, i * barHeight+barInitPosY, canvas.width, barHeight);
    }
    barInitPosY++;
    if (barInitPosY > barHeight * 2)
        barInitPosY = 0;
   
    requestAnimationFrame(renderSyncsSignal);
}


/**
 * Bitstream Signal Animation
 * The bitstream uses two different colors, fillind the entire screen with smaller bars (half the size of the other bars), and the motion speed is much faster
 * 
 */

function startBitstreamSignal() {
    renderBitstreamSignal();
}

function renderBitstreamSignal() {
    ctx.fillStyle = BitstreamSignalColors[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BitstreamSignalColors[1];
    let barHeight = canvas.height / 60;
    let barInitPosY = -barHeight;
    for (let i = 0; i < totalLoadingBarsOnScreen * 2; i++) {
        let randomThickness = Math.floor(Math.random() * 2 + 1);
        let thickness = barHeight * randomThickness;
        ctx.fillStyle = BitstreamSignalColors[i % 2];
        ctx.fillRect(0, barInitPosY, canvas.width, thickness);
        barInitPosY += thickness;
    }
    requestAnimationFrame(renderBitstreamSignal);
}