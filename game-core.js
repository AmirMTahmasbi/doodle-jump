// game-core.js - Core Game Logic and State Management with Responsive Design

// Global canvas variables (shared between menu and game)
let board;
let boardWidth = 450;
let boardHeight = 900;
let context;

// Game state
let gameState = "loading"; // 'loading', 'character-select', 'playing'
let currentCharacter = null;

// Player properties
let playerWidth = 70;
let playerHeight = 70;
let playerX;
let playerY;
let playerImg;
let playerJetpackImg;

let player = {
    x: 0,
    y: 0,
    width: playerWidth,
    height: playerHeight,
    img: null,
};

// Physics
let velocityX = 0;
let velocityY = 0;
let initialVelocityY = -8;
let gravity = 0.4;

// Game mechanics
let water = 100;
let electricity = 100;
let score = 0;
let maxScore = 0;
let gameOver = false;
let altitude = 0;

// Platform arrays and images
let platformArray = [];
let voteBoxArray = [];
let droneArray = [];
let bulletArray = [];
let explosionArray = [];

let platformWidth = 60;
let platformHeight = 18;
let gasPlatformWidth = 75; // Larger width for gas platforms
let gasPlatformHeight = 50; // Larger height for gas platforms

// Load all images
let images = {};
let imagesLoaded = 0;
let totalImages = 0;
let darkModeImagesLoaded = false; // Track if dark mode images are loaded

// Electricity bar segments - fixed positions
let electricitySegments = [];

// Global variable to store button positions for click detection
let gameOverButtons = {};

// Global variable for electricity flash effect
let electricityFlashTimer = 0;

// Difficulty levels based on altitude - much slower progression
const difficultyLevels = {
    1: {
        name: "Far from Peak",
        altitude: 0,
        weather: false,
        drones: false,
        gasExplosions: true,
        darkness: 0,
    },
    2: {
        name: "Bad Weather",
        altitude: 3388,
        weather: true,
        drones: false,
        gasExplosions: true,
        darkness: 0.1,
    },
    3: {
        name: "Weather + Drones",
        altitude: 4498,
        weather: true,
        drones: true,
        gasExplosions: false,
        darkness: 0.2,
    },
    4: {
        name: "Weather + Gas + Drones",
        altitude: 5401,
        weather: false,
        drones: true,
        gasExplosions: true,
        darkness: 0.3,
    },
    5: {
        name: "Gas + Electricity Issues",
        altitude: 6402,
        weather: false,
        drones: true,
        gasExplosions: true,
        darkness: 0.5,
    },
    6: {
        name: "Water Shortage",
        altitude: 7403,
        weather: false,
        drones: true,
        gasExplosions: true,
        darkness: 0.55,
    },
    7: {
        name: "Close to Peak",
        altitude: 8404,
        weather: false,
        drones: false,
        gasExplosions: true,
        darkness: 0.6,
    },
    8: {
        name: "Peak",
        altitude: 9407,
        weather: true,
        drones: true,
        gasExplosions: true,
        darkness: 0.6,
    },
};

// ========== RESPONSIVE INITIALIZATION ==========
window.onload = function () {
    console.log("Peak Climb Game loading...");
    board = document.getElementById("board");

    if (!board) {
        console.error("Board element not found!");
        return;
    }

    // Set up responsive canvas
    setupResponsiveCanvas();
    
    // Handle orientation changes and resizes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    console.log(`Board initialized: ${boardWidth}x${boardHeight}`);
    console.log(`Player start position: ${playerX}, ${playerY}`);

    initializeElectricitySegments();
    loadAllImages();
};

function setupResponsiveCanvas() {
    // Get actual viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate optimal canvas size maintaining aspect ratio
    const targetAspectRatio = 0.5; // 1:2 ratio (width:height)
    
    let canvasWidth, canvasHeight;
    
    if (viewportWidth / viewportHeight > targetAspectRatio) {
        // Viewport is wider than target ratio - constrain by height
        canvasHeight = viewportHeight;
        canvasWidth = canvasHeight * targetAspectRatio;
    } else {
        // Viewport is taller than target ratio - constrain by width  
        canvasWidth = viewportWidth;
        canvasHeight = canvasWidth / targetAspectRatio;
    }
    
    // Ensure minimum playable size
    canvasWidth = Math.max(320, canvasWidth);
    canvasHeight = Math.max(480, canvasHeight);
    
    // Set canvas size
    boardWidth = canvasWidth;
    boardHeight = canvasHeight;
    
    // Set up high DPI rendering
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual canvas size for sharp rendering
    board.width = canvasWidth * dpr;
    board.height = canvasHeight * dpr;
    
    // Set display size
    board.style.width = canvasWidth + 'px';
    board.style.height = canvasHeight + 'px';
    
    // Get context and scale for high DPI
    context = board.getContext("2d");
    context.scale(dpr, dpr);
    
    // Update player starting position
    playerX = boardWidth / 2 - playerWidth / 2;
    playerY = (boardHeight * 7) / 8 - playerHeight;
    
    console.log(`Responsive canvas setup: ${canvasWidth}x${canvasHeight} (DPR: ${dpr})`);
    console.log(`Viewport: ${viewportWidth}x${viewportHeight}`);
}

function handleResize() {
    // Debounce resize events
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        console.log("Handling resize...");
        setupResponsiveCanvas();
        
        // Reinitialize electricity segments with new dimensions
        if (typeof initializeElectricitySegments === 'function') {
            initializeElectricitySegments();
        }
        
        // Redraw current screen
        if (gameState === 'character-select') {
            if (typeof drawCharacterSelection === 'function') {
                drawCharacterSelection();
            }
        } else if (gameState === 'playing' && gameOver) {
            if (typeof drawGameOver === 'function') {
                drawGameOver();
            }
        }
    }, 100);
}

function handleOrientationChange() {
    // Handle orientation change with delay for iOS
    setTimeout(() => {
        console.log("Handling orientation change...");
        handleResize();
    }, 500);
}

// Initialize electricity bar segments with responsive positioning
function initializeElectricitySegments() {
    if (typeof ResponsiveUtils !== 'undefined') {
        // Use responsive utilities if available
        electricitySegments = [];
        const safeArea = ResponsiveUtils.getSafeAreaMargins();
        const barWidth = ResponsiveUtils.scale(80);
        const barHeight = ResponsiveUtils.scale(12);
        const totalSegments = 5;
        const segmentWidth = (barWidth - (totalSegments - 1) * ResponsiveUtils.scale(2)) / totalSegments;
        const segmentGap = ResponsiveUtils.scale(2);
        const electricityX = boardWidth - barWidth - safeArea.right - ResponsiveUtils.scale(15);
        const barY = safeArea.top + ResponsiveUtils.scale(15);

        for (let i = 0; i < totalSegments; i++) {
            electricitySegments.push({
                x: electricityX + i * (segmentWidth + segmentGap),
                y: barY,
                width: segmentWidth,
                height: barHeight,
                visible: true,
                filled: true,
            });
        }
    } else {
        // Fallback to original initialization
        console.warn("ResponsiveUtils not loaded, using fallback electricity segments");
        electricitySegments = [];
        const barWidth = 80;
        const barHeight = 12;
        const totalSegments = 5;
        const segmentWidth = (barWidth - (totalSegments - 1) * 2) / totalSegments;
        const segmentGap = 2;
        const electricityX = boardWidth - barWidth - 15;
        const barY = 15;

        for (let i = 0; i < totalSegments; i++) {
            electricitySegments.push({
                x: electricityX + i * (segmentWidth + segmentGap),
                y: barY,
                width: segmentWidth,
                height: barHeight,
                visible: true,
                filled: true,
            });
        }
    }
}

// Initialize game (called from menu)
function initializeGame(selectedCharacter) {
    if (!selectedCharacter) {
        console.error("No character provided to initializeGame!");
        return;
    }

    console.log("Initializing game with character:", selectedCharacter);
    gameState = "playing";
    currentCharacter = selectedCharacter;

    // Load selected character images
    player.img = images[selectedCharacter + "_right"];
    playerJetpackImg = images[selectedCharacter + "_right_jetpack"];

    if (!player.img) {
        console.error(
            `Failed to load character image: ${selectedCharacter}_right`,
        );
        return;
    }

    // Reset game state
    water = 100;
    electricity = 100;
    score = 0;
    maxScore = 0;
    altitude = 0;
    gameOver = false;

    // Reset player position
    player.x = playerX;
    player.y = playerY;
    player.width = playerWidth;
    player.height = playerHeight;

    velocityX = 0;
    velocityY = initialVelocityY;

    // Clear arrays
    platformArray = [];
    voteBoxArray = [];
    droneArray = [];
    bulletArray = [];
    explosionArray = [];

    // Reset electricity segments
    resetElectricitySegments();

    placePlatforms();
    setupGameControls();

    console.log("Game initialized, starting main loop");
    startMainLoop();
    /* RAF removed for fixed-step */
}

// Reset electricity segments to initial state
function resetElectricitySegments() {
    electricitySegments.forEach((segment) => {
        segment.visible = true;
        segment.filled = true;
    });
}


// === Fixed-timestep main loop (60 Hz simulation) ===
const STEP = 1 / 60;
const MAX_STEPS = 1; // ensure we never double-run updates per frame
let __acc = 0;
let __last = performance.now();

function startMainLoop() {
  __last = performance.now();
  requestAnimationFrame(__loop);
}

function __loop(now = performance.now()) {
  // Accumulate real time
  __acc += Math.min(0.25, (now - __last) / 1000);
  __last = now;

  // Run at a fixed 60Hz rate (at most one step per RAF)
  if (__acc >= STEP) {
    update();     // your existing update does simulation+render
    __acc -= STEP;
  }

  requestAnimationFrame(__loop);
}
// === End fixed-timestep loop ===
// Main game loop
function update() {
    if (gameState !== "playing") {
        console.log("Update called but game state is:", gameState);
        return;
    }

    /* RAF removed for fixed-step */

    if (gameOver) {
        drawGameOver();
        return;
    }

    // Update altitude based on score
    altitude = Math.floor(score / 10);

    // Get current difficulty
    const currentDifficulty = getCurrentDifficulty();

    // Update resources
    updateResources(currentDifficulty);

    // Update electricity segments
    updateElectricitySegments();

    // Clear screen with background
    drawBackground(currentDifficulty);

    // Player physics
    player.x += velocityX;
    player.y += velocityY;
    velocityY += gravity;

    // Wrap around screen horizontally
    if (player.x > boardWidth) {
        player.x = 0;
    } else if (player.x + player.width < 0) {
        player.x = boardWidth;
    }

    // Choose player image based on water availability, movement direction, and dark mode
    let currentPlayerImg;
    const currentLevel = getCurrentDifficultyLevel();
    const isDarkMode = currentLevel >= 7;

    // Get the appropriate character images based on dark mode
    let basePlayerImg, jetpackPlayerImg;
    if (isDarkMode) {
        basePlayerImg = images["dark_" + currentCharacter + "_right"];
        jetpackPlayerImg =
            images["dark_" + currentCharacter + "_right_jetpack"];
        console.log(
            `Using dark mode character images: base=${basePlayerImg ? "found" : "NOT FOUND"}, jetpack=${jetpackPlayerImg ? "found" : "NOT FOUND"}`,
        );
    } else {
        basePlayerImg = images[currentCharacter + "_right"];
        jetpackPlayerImg = images[currentCharacter + "_right_jetpack"];
    }

    // Fallback to normal images if dark mode images not found
    if (!basePlayerImg) {
        console.warn(
            `Dark mode character image not found, falling back to normal mode`,
        );
        basePlayerImg = images[currentCharacter + "_right"];
        jetpackPlayerImg = images[currentCharacter + "_right_jetpack"];
    }

    if (water > 0) {
        // With water: use jetpack when going up, normal when going down
        if (velocityY < 0) {
            currentPlayerImg = jetpackPlayerImg; // Jetpack when going up with water
        } else {
            currentPlayerImg = basePlayerImg; // Normal when falling even with water
        }
    } else {
        // Without water: always use normal image (no jetpack)
        currentPlayerImg = basePlayerImg;
    }

    // Draw player
    if (currentPlayerImg) {
        context.drawImage(
            currentPlayerImg,
            player.x,
            player.y,
            player.width,
            player.height,
        );
    }

    // Update and draw platforms
    updatePlatforms(currentDifficulty);

    // Update and draw vote boxes
    updateVoteBoxes();

    // Update and draw drones
    if (currentDifficulty.drones) {
        updateDrones();
    }

    // Update and draw bullets
    updateBullets();

    // Update and draw explosions
    updateExplosions();

    // Update score
    updateScore();

    // Draw UI
    drawUI(currentDifficulty);

    // Check game over - only when player falls off screen or electricity runs out
    if (player.y > board.height) {
        gameOver = true;
    }

    // Apply darkness overlay
    if (currentDifficulty.darkness > 0) {
        applyDarkness(currentDifficulty.darkness);
    }

    // Apply electricity flash effect (should be last)
    applyElectricityFlash();
}

function getCurrentDifficulty() {
    for (let level = 8; level >= 1; level--) {
        if (altitude >= difficultyLevels[level].altitude) {
            return difficultyLevels[level];
        }
    }
    return difficultyLevels[1];
}

// Helper function to get current difficulty level number
function getCurrentDifficultyLevel() {
    for (let level = 8; level >= 1; level--) {
        if (altitude >= difficultyLevels[level].altitude) {
            return level;
        }
    }
    return 1;
}

function updateResources(difficulty) {
    const previousElectricity = electricity;
    const currentLevel = getCurrentDifficultyLevel();

    // Water consumption with every jump (when moving up) - reduced amount
    if (velocityY < 0) {
        // When jumping up
        water -= 0.2; // Reduced from 0.5 to 0.2 for longer gameplay
        if (water < 0) water = 0;
    }

    // Electricity consumption in higher levels - much slower
    if (difficulty.altitude >= 4000) {
        // Changed from 2000 to 4000
        electricity -= 0.02; // Reduced from 0.05 to 0.02
        if (electricity < 0) electricity = 0;
    }

    // Flash screen when electricity decreases significantly
    if (
        Math.floor(electricity / 20) < Math.floor(previousElectricity / 20) &&
        electricity < 80
    ) {
        createElectricityFlash();
    }
}

function createElectricityFlash() {
    electricityFlashTimer = 30; // Flash for 30 frames (more visible)
}

function applyElectricityFlash() {
    if (electricityFlashTimer > 0) {
        electricityFlashTimer--;

        // Create stronger flashing effect
        const flashIntensity = electricityFlashTimer % 6 < 3 ? 0.15 : 0.05; // More noticeable flash
        context.fillStyle = `rgba(255, 255, 0, ${flashIntensity})`;
        context.fillRect(0, 0, boardWidth, boardHeight);
    }
}

// Update electricity segments based on difficulty level
function updateElectricitySegments() {
    const currentLevel = getCurrentDifficultyLevel();

    // Hide segments based on difficulty level (segments get hidden from right to left)
    for (let i = 0; i < electricitySegments.length; i++) {
        if (i >= 6 - currentLevel) {
            // Level 1: 5 visible, Level 2: 4 visible, etc.
            electricitySegments[i].visible = false;
        } else {
            electricitySegments[i].visible = true;
        }
    }

    // Update filled state based on electricity percentage
    const visibleSegments = electricitySegments.filter((seg) => seg.visible);
    const filledSegmentCount = Math.ceil(
        (electricity / 100) * visibleSegments.length,
    );

    visibleSegments.forEach((segment, index) => {
        segment.filled = index < filledSegmentCount;
    });
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function updateScore() {
    let points = Math.floor(50 * Math.random());
    if (velocityY < 0) {
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    } else if (velocityY >= 0) {
        maxScore -= points;
    }
}

function moveLeft() {
    velocityX = -4;
}

function moveRight() {
    velocityX = 4;
}

function resetGame() {
    console.log("Resetting game, returning to menu");
    gameState = "character-select";
    if (typeof returnToMenu === "function") {
        returnToMenu();
    } else {
        console.error("returnToMenu function not found in menu.js");
    }
}

// ========== PLATFORM MANAGEMENT ==========

function placePlatforms() {
    platformArray = [];

    // Starting platform
    let platform = {
        img: images.platform,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight,
        type: "normal",
    };
    platformArray.push(platform);

    // Create MANY MORE platforms initially with closer spacing
    for (let i = 0; i < 80; i++) { // Increased from 30 to 80 platforms
        newPlatform(difficultyLevels[1]);
    }
}

function newPlatform(difficulty) {
    let randomX = Math.floor((Math.random() * boardWidth * 3) / 4);
    let platformType = "normal";
    let platformImg;

    const currentLevel = getCurrentDifficultyLevel();
    const isDarkMode = currentLevel >= 7;

    // Calculate dynamic spacing based on altitude/difficulty
    let platformGap;
    if (altitude < 1000) {
        platformGap = 60; // Harder at the beginning - wider gaps
    } else if (altitude < 2000) {
        platformGap = 65; // Getting easier
    } else if (altitude < 3000) {
        platformGap = 70; // Medium spacing
    } else if (altitude < 4000) {
        platformGap = 70; // Closer spacing
    } else if (altitude < 5000) {
        platformGap = 75; // Even closer
    } else if (altitude < 6000) {
        platformGap = 75; // Very close
    } else {
        platformGap = 75; // Easiest spacing at high altitude
    }

    console.log(
        `Creating new platform - Level: ${currentLevel}, Dark Mode: ${isDarkMode}, Gap: ${platformGap}`,
    );

    // Choose image based on mode and difficulty
    if (isDarkMode) {
        // Dark mode images
        console.log("Using dark mode images");
        if (difficulty.gasExplosions && Math.random() < 0.35) { // Increased from 0.3 to 0.35 for more gas platforms
            platformType = "gas";
            platformImg = images.dark_gas_platform;
            console.log(
                `Selected dark gas platform: ${platformImg ? "found" : "NOT FOUND"}`,
            );
        } else if (Math.random() < 0.1) {
            platformType = "broken";
            platformImg = images["dark_platform-broken"];
            console.log(
                `Selected dark broken platform: ${platformImg ? "found" : "NOT FOUND"}`,
            );
        } else {
            platformImg = images.dark_platform;
            console.log(
                `Selected dark normal platform: ${platformImg ? "found" : "NOT FOUND"}`,
            );
        }
    } else {
        // Normal mode images
        console.log("Using normal mode images");
        if (difficulty.gasExplosions && Math.random() < 0.15) { // Increased from 0.1 to 0.15 for more gas platforms
            platformType = "gas";
            platformImg = images.gas_platform;
            console.log(
                `Selected normal gas platform: ${platformImg ? "found" : "NOT FOUND"}`,
            );
        } else if (Math.random() < 0.1) {
            platformType = "broken";
            platformImg = images["platform-broken"];
            console.log(
                `Selected normal broken platform: ${platformImg ? "found" : "NOT FOUND"}`,
            );
        } else {
            platformImg = images.platform;
            console.log(
                `Selected normal platform: ${platformImg ? "found" : "NOT FOUND"}`,
            );
        }
    }

    // Fallback if image not found
    if (!platformImg) {
        console.error(
            `Platform image not found for type: ${platformType}, dark mode: ${isDarkMode}`,
        );
        console.log("Available image keys:", Object.keys(images));
        platformImg = images.platform || createFallbackImage("platform.png"); // Use normal platform as fallback
    }

    let platform = {
        img: platformImg,
        x: randomX,
        y: platformArray[platformArray.length - 1].y - platformGap, // Use dynamic gap
        width: platformType === "gas" ? gasPlatformWidth : platformWidth,
        height: platformType === "gas" ? gasPlatformHeight : platformHeight,
        type: platformType,
    };

    platformArray.push(platform);

    // Vote boxes remain the same - original 15% chance
    if (Math.random() < 0.15) {
        const voteBoxImg = isDarkMode ? images.dark_vote_box : images.vote_box;
        console.log(
            `Creating vote box - Dark mode: ${isDarkMode}, Image found: ${voteBoxImg ? "yes" : "no"}`,
        );

        voteBoxArray.push({
            x: randomX + 70,
            y: platform.y - 40,
            width: 60,
            height: 60,
            img: voteBoxImg || images.vote_box, // Fallback to normal vote box
        });
    }
}