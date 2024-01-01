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

const screenTextsArray = ["©  1983 Sinclair Research Ltd", "Load L", "Load \"L", "Load \"\"L", "Program:  Jetpac", "R Tape loading error"];
const leadAndSyncSignalColors = ["#007A87", "#720000"];
const BitstreamSignalColors = ["#665B00", "#001459"];

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
let isDrawingData = false;

let quitSyncSignal = false; 
let quitBitstreamSignal = false;

let clearGameArea = true;
/**
 * Preload the game image
 */
function loadGameImg() {
    gameImg.src = "./assets/img/jet-pac-zx-spectrum-loading-screen.png";
    gameImg.onload = function () {
        startSimulation();
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
    quitSyncSignal = true;
    quitBitstreamSignal = true;
    renderLeadSignal();
}

function renderLeadSignal() {
    ctx.fillStyle = leadAndSyncSignalColors[leadSignalColorsIndex];
    leadSignalColorsIndex = 1 - leadSignalColorsIndex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderGameArea();
    renderLeaderSignalTimer = setTimeout(renderLeadSignal, 2000);
}

/**
 * Sync Signal Animation
 * The same colors of the Lead Signal, dividing the entire screen with horizontal bars, with a downward, continuous movement
 */

function startSyncSignal() {
    quitSyncSignal = false;
    clearTimeout(renderLeaderSignalTimer);
    renderSyncsSignal();
}

function renderSyncsSignal() {
    if(quitSyncSignal) return;
    
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
   
    renderGameArea();
    if(!quitSyncSignal) requestAnimationFrame(renderSyncsSignal);
}


/**
 * Bitstream Signal Animation
 * The bitstream uses two different colors, fillind the entire screen with smaller bars (half the size of the other bars), and the motion speed is much faster
 * 
 */

function startBitstreamSignal() {
    quitSyncSignal = true;
    quitBitstreamSignal = false;
    renderBitstreamSignal();
}

function renderBitstreamSignal() {
    if (quitBitstreamSignal) return;

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

    renderGameArea();

    if(isDrawingData && !isImageDrawn){
        startLoadingImage();
        loadingImgPosY += 24;
        if (loadingImgPosY > 192 * 168) {
            isImageDrawn = true;
            startLeadSignal();
            setTimeout(startSyncSignal, 3000);
            setTimeout(()=>{quitSyncSignal = true}, 4000);
            startTextAnimation(5, 4050);
            setTimeout(renderLoadingImage, 4050);
        }
    }

    if(!quitBitstreamSignal) requestAnimationFrame(renderBitstreamSignal);
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
    
    if(id == 4) {
        ctx.fillText(screenTextsArray[id], contentPosX, contentPosY + 48);
        clearGameArea = false;
    }
    // else if(id == 5){
    //     ctx.fillText(screenTextsArray[id], canvas.width / 10, canvas.height - (canvas.height / 10));  
    // }
    else{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText(screenTextsArray[id], canvas.width / 10, canvas.height - (canvas.height / 10));  
    } 
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
        let rectWidth = contentWidth;
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

            ctx.rect(contentPosX, contentPosY + thirdBlockStartPos + (rectHeight * i * 8), contentWidth, blockHeight);
        }
        ctx.fill();
        ctx.drawImage(gameImg, contentPosX, contentPosY, contentWidth, contentHeight);
        ctx.globalCompositeOperation = 'source-over';    
    }
}

/**
 * Render the white area during the loading time
 */
function renderGameArea(){
    ctx.fillStyle = "white";
    ctx.fillRect(contentPosX, contentPosY, contentWidth, contentHeight);
    
    if(!clearGameArea) renderText(4);
    if(isImageDrawn) ctx.drawImage(gameImg, contentPosX, contentPosY, contentWidth, contentHeight);
}

/**
 * 
 */
function startLoadingSignal(){
    isDrawingData = true;
    startBitstreamSignal();
}

/**
 * Start Simulation
 * 1 - Command Prompts
 * 2 - Lead Signal
 * 3 - Sync Signal
 * 4 - Bitstream Signal
 * 5 - Lead Signal
 */
function startSimulation(){
    startTextAnimation(0, 200);
    startTextAnimation(1, 1000);
    startTextAnimation(2, 1250);
    startTextAnimation(3, 1500);
    setTimeout(startLeadSignal, 2500);
    setTimeout(startSyncSignal, 6000);
    setTimeout(startBitstreamSignal, 10000);
    setTimeout(startLeadSignal, 10250);
    startTextAnimation(4, 10500);
    setTimeout(startSyncSignal, 11250);
    setTimeout(startBitstreamSignal, 13000);
    setTimeout(startLeadSignal, 14000);
    setTimeout(startSyncSignal, 16000);
    setTimeout(startBitstreamSignal, 18000);
    setTimeout(startLeadSignal, 18250);
    setTimeout(startSyncSignal, 20000);
    setTimeout(startLoadingSignal, 22000);
}