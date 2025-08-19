// game-core.js - Core Game Logic and State Management

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

// ========== INITIALIZATION ==========
window.onload = function () {
    console.log("Peak Climb Game loading...");
    board = document.getElementById("board");

    if (!board) {
        console.error("Board element not found!");
        return;
    }

    // Set canvas to full viewport size for better resolution
    board.width = window.innerWidth;
    board.height = window.innerHeight;
    boardWidth = window.innerWidth;
    boardHeight = window.innerHeight;

    context = board.getContext("2d");

    // Enable high DPI scaling for crisp text
    const dpr = window.devicePixelRatio || 1;
    const rect = board.getBoundingClientRect();

    board.width = rect.width * dpr;
    board.height = rect.height * dpr;

    context.scale(dpr, dpr);

    board.style.width = rect.width + "px";
    board.style.height = rect.height + "px";

    // Update board dimensions
    boardWidth = rect.width;
    boardHeight = rect.height;

    // Calculate player starting position based on actual board size
    playerX = boardWidth / 2 - playerWidth / 2;
    playerY = (boardHeight * 7) / 8 - playerHeight;

    console.log(`Board initialized: ${boardWidth}x${boardHeight}`);
    console.log(`Player start position: ${playerX}, ${playerY}`);

    initializeElectricitySegments();
    loadAllImages();
};

// Initialize electricity bar segments with fixed positions
function initializeElectricitySegments() {
    electricitySegments = [];
    const barWidth = 80;
    const barHeight = 12;
    const totalSegments = 5; // Always create 5 segments
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
            visible: true, // All segments start visible
            filled: true, // All segments start filled
        });
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
    requestAnimationFrame(update);
}

// Reset electricity segments to initial state
function resetElectricitySegments() {
    electricitySegments.forEach((segment) => {
        segment.visible = true;
        segment.filled = true;
    });
}

// Main game loop
function update() {
    if (gameState !== "playing") {
        console.log("Update called but game state is:", gameState);
        return;
    }

    requestAnimationFrame(update);

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
    for (let level = 7; level >= 1; level--) {
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
