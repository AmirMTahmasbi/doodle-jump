// Board dimensions
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

// Doodler properties
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7/8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight
}

// Physics
let velocityX = 0;
let velocityY = 0; // Jump speed
let initialVelocityY = -8; // Starting velocity Y (jump)
let gravity = 0.4;

// Platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;

// Mobile controls
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let useDeviceOrientation = false;
let lastOrientation = 0;

window.onload = function() {
    console.log("Game loading...");
    board = document.getElementById("board");
    console.log("Board element:", board);
    
    if (!board) {
        console.error("Board element not found!");
        return;
    }
    
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
    console.log("Canvas context:", context);

    // Load images
    console.log("Loading images...");
    doodlerRightImg = new Image();
    doodlerRightImg.src = "./images/doodler-right.png";
    console.log("Doodler right image src:", doodlerRightImg.src);
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function() {
        console.log("Doodler right image loaded successfully");
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }
    doodlerRightImg.onerror = function() {
        console.error("Failed to load doodler right image:", doodlerRightImg.src);
    }

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./images/doodler-left.png";
    console.log("Doodler left image src:", doodlerLeftImg.src);
    doodlerLeftImg.onload = function() {
        console.log("Doodler left image loaded successfully");
    }
    doodlerLeftImg.onerror = function() {
        console.error("Failed to load doodler left image:", doodlerLeftImg.src);
    }

    platformImg = new Image();
    platformImg.src = "./images/platform.png";
    console.log("Platform image src:", platformImg.src);
    platformImg.onload = function() {
        console.log("Platform image loaded successfully");
    }
    platformImg.onerror = function() {
        console.error("Failed to load platform image:", platformImg.src);
    }

    velocityY = initialVelocityY;
    console.log("Placing platforms...");
    placePlatforms();
    console.log("Starting game loop...");
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
    
    // Add mobile controls
    if (isMobile) {
        console.log("Mobile device detected, adding touch controls");
        setupMobileControls();
    } else {
        console.log("Desktop device, using keyboard controls");
    }
    
    console.log("Game initialization complete!");
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    if (!context) {
        console.error("No canvas context available!");
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Doodler physics
    doodler.x += velocityX;
    doodler.y += velocityY;
    velocityY += gravity;

    // Wrap around screen horizontally
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    }
    else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    // Draw doodler
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    // Platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight * 3/4) {
            platform.y -= initialVelocityY; // Platforms move down
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY; // Jump
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Clear platforms and add new platforms
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); // Remove first element from array
        newPlatform(); // Add new platform on top
    }

    // Update score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    if (doodler.y > board.height) {
        gameOver = true;
    }

    if (gameOver) {
        if (isMobile) {
            context.fillText("Game Over: Tap to Restart", boardWidth/4, boardHeight*7/8);
        } else {
            context.fillText("Game Over: Press 'Space' to Restart", boardWidth/7, boardHeight*7/8);
        }
    }
}

function moveDoodler(e) {
    if (e.code == "ArrowLeft" || e.code == "KeyA") {
        // Move left
        moveLeft();
    }
    else if (e.code == "ArrowRight" || e.code == "KeyD") {
        // Move right
        moveRight();
    }
    else if (e.code == "Space" && gameOver) {
        // Reset
        resetGame();
    }
}

function moveLeft() {
    velocityX = -4;
    doodler.img = doodlerLeftImg;
}

function moveRight() {
    velocityX = 4;
    doodler.img = doodlerRightImg;
}

function resetGame() {
    doodler = {
        x: doodlerX,
        y: doodlerY,
        width: doodlerWidth,
        height: doodlerHeight
    }
    doodler.img = doodlerRightImg;
    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    gameOver = false;
    placePlatforms();
}

function setupMobileControls() {
    // Touch controls - tap left/right side of screen
    board.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (gameOver) {
            resetGame();
            return;
        }
        
        const touch = e.touches[0];
        const rect = board.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        
        if (x < boardWidth / 2) {
            // Tap on left side - move left
            console.log("Touch left side");
            moveLeft();
        } else {
            // Tap on right side - move right
            console.log("Touch right side");
            moveRight();
        }
    }, { passive: false });
    
    // Prevent default touch behaviors
    board.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    board.addEventListener('touchend', function(e) {
        e.preventDefault();
        // Stop movement when touch ends
        velocityX = 0;
    }, { passive: false });
    
    // Device orientation controls (optional)
    if (window.DeviceOrientationEvent) {
        console.log("Device orientation supported");
        window.addEventListener('deviceorientation', function(e) {
            if (useDeviceOrientation && !gameOver) {
                const tilt = e.gamma; // Left-right tilt
                
                if (tilt > 10) {
                    moveRight();
                } else if (tilt < -10) {
                    moveLeft();
                } else {
                    velocityX = 0;
                }
            }
        });
    }
    
    // Device orientation is always disabled on mobile
    useDeviceOrientation = false;
}

function placePlatforms() {
    platformArray = [];

    // Starting platform
    let platform = {
        img: platformImg,
        x: boardWidth/2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    }

    platformArray.push(platform);

    // Random platforms
    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth*3/4); // (0-1) * boardWidth*3/4
        let platform = {
            img: platformImg,
            x: randomX,
            y: boardHeight - 75*i - 150,
            width: platformWidth,
            height: platformHeight
        }

        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); // (0-1) * boardWidth*3/4
    let platform = {
        img: platformImg,
        x: randomX,
        y: platformArray[platformArray.length - 1].y - 115,
        width: platformWidth,
        height: platformHeight
    }

    platformArray.push(platform);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   // a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  // a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    // a's bottom left corner passes b's top left corner
}

function updateScore() {
    let points = Math.floor(50 * Math.random()); // (0-1) * 50 --> (0-50)
    if (velocityY < 0) { // Negative means doodler is jumping
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}
