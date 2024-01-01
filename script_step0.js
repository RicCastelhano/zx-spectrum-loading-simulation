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

/**
 * Preload the game image
 */
function loadGameImg() {
    gameImg.src = "./assets/img/jet-pac-zx-spectrum-loading-screen.png";
    gameImg.onload = function () {
      ctx.drawImage(gameImg, 200, 200, 200, 200);
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





