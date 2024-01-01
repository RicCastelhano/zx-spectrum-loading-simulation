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

let screenTextsArray = ["©  1983 Sinclair Research Ltd", "Load L", "Load \"L", "Load \"\"L", "Program:  Jetpac", "R Tape loading error"];
let leadAndSyncSignalColors = ["#007A87", "#720000"];
let BitstreamSignalColors = ["#665B00", "#001459"];

let leadSignalColorsIndex = 0;
let renderLeaderSignalTimer;

let totalLoadingBarsOnScreen = 30;
let barInitPosY = 0;

let contentPosX = canvas.width / 10;
let contentPosY = canvas.height / 10;
let contentWidth = canvas.width - canvas.width / 5;
let contentHeight = canvas.height - canvas.height / 5;

let numberOfSubblocksPerThird = 7;
let numberOfLinesPerSubblocksPerThird = 8;

let loadingImgPosY = 0;
let isImageDrawn = false;

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
    //   ctx.fillText("ZX Spectrum-7 Regular font loaded", 20, 50);
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

    if(!isImageDrawn){
        loadingImgPosY += 24;
        if (loadingImgPosY > 192 * 168) isImageDrawn = true;
    }
    startLoadingImage();

    requestAnimationFrame(renderBitstreamSignal);
}

/**
 * Simulation writing the initial prompt commands to load the game
 */

function startTextAnimation(id, timer){    
    setTimeout(this.renderText, timer, id);
}

function renderText(id){
    ctx.font = 'ZX Spectrum-7 Regular';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'top';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(screenTextsArray[id], canvas.width / 10, canvas.height - (canvas.height / 10));
}

/**
 * Simulation of the interior screen area loading animation
 */
function startLoadingImage(){
    ctx.fillStyle = "white";
    ctx.fillRect(contentPosX, contentPosY, contentWidth, contentHeight);
    renderLoadingImage();
}

function renderLoadingImage(){
    if(isImageDrawn){
        ctx.drawImage(gameImg, contentPosX, contentPosY, contentWidth, contentHeight);
    } else {
        let rectWidth = contentWidth
        let rectHeight = contentHeight / 168;
        let rectHeightOneThird = rectHeight * numberOfSubblocksPerThird * numberOfLinesPerSubblocksPerThird;

        ctx.fillStyle = "black";
        ctx.fillRect(contentPosX, contentPosY, contentWidth, contentHeight);
        ctx.globalCompositeOperation = 'xor';
        ctx.fillStyle = "white";
        let thirdBlockStartPos=0;
        
        let j = 0;
        ctx.beginPath();

        // the image loading was done in thirds
        for (j = 0; j < 3; j++) {

            if (loadingImgPosY <= (j+1) * numberOfSubblocksPerThird * numberOfLinesPerSubblocksPerThird * 192)
                break;
                
            ctx.rect(contentPosX, contentPosY + (j * rectHeightOneThird), contentWidth, rectHeightOneThird);
            thirdBlockStartPos += rectHeightOneThird;
        }
        let temploadingImgPosY = loadingImgPosY - (j * numberOfSubblocksPerThird * numberOfLinesPerSubblocksPerThird * 192);

        // each third is divided in 7 smaller blocks
        for (let i = 0; i < 7; i++) {
            if (i * 192 > temploadingImgPosY)
                break;
            let blockHeight = Math.ceil((temploadingImgPosY - (i * 192)) / 192 / numberOfSubblocksPerThird) * rectHeight;

            // ctx.rect(contentPosX, contentPosY + thirdBlockStartPos + (rectHeight * i * 8), contentWidth, blockHeight);
            ctx.rect(contentPosX, contentPosY + thirdBlockStartPos + (rectHeight * i * numberOfLinesPerSubblocksPerThird), contentWidth, blockHeight);
        }
        ctx.fill();
        ctx.drawImage(gameImg, contentPosX, contentPosY, contentWidth, contentHeight);
        ctx.globalCompositeOperation = 'source-over';    
    }
}

