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
let initialVelocityY = -480; // Converted to per-second (-8 * 60)
let gravity = 24; // Converted to per-second (0.4 * 60)

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
    1: { name: "Far from Peak", altitude: 0, weather: false, drones: false, gasExplosions: true, darkness: 0 },
    2: { name: "Bad Weather", altitude: 3388, weather: true, drones: false, gasExplosions: true, darkness: 0.1 },
    3: { name: "Weather + Drones", altitude: 4498, weather: true, drones: true, gasExplosions: false, darkness: 0.2 },
    4: { name: "Weather + Gas + Drones", altitude: 5401, weather: false, drones: true, gasExplosions: true, darkness: 0.3 },
    5: { name: "Gas + Electricity Issues", altitude: 6402, weather: false, drones: true, gasExplosions: true, darkness: 0.5 },
    6: { name: "Water Shortage", altitude: 7403, weather: false, drones: true, gasExplosions: true, darkness: 0.55 },
    7: { name: "Close to Peak", altitude: 8404, weather: false, drones: false, gasExplosions: true, darkness: 0.6 },
    8: { name: "Peak", altitude: 9407, weather: true, drones: true, gasExplosions: true, darkness: 0.6 },
};

// --- Fixed-step globals ---
const STEP = 1 / 60;        // 60 Hz simulation
const MAX_STEPS = 5;
let acc = 0;
let last = performance.now();

// ========== RESPONSIVE INITIALIZATION ==========
window.onload = function () {
    console.log("Peak Climb Game loading...");
    board = document.getElementById("board");

    if (!board) {
        console.error("Board element not found!");
        return;
    }

    setupResponsiveCanvas();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    console.log(`Board initialized: ${boardWidth}x${boardHeight}`);
    console.log(`Player start position: ${playerX}, ${playerY}`);

    initializeElectricitySegments();
    loadAllImages();
    startMainLoop();
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

    player.img = images[selectedCharacter + "_right"];
    playerJetpackImg = images[selectedCharacter + "_right_jetpack"];

    if (!player.img) {
        console.error(`Failed to load character image: ${selectedCharacter}_right`);
        return;
    }

    water = 100;
    electricity = 100;
    score = 0;
    maxScore = 0;
    altitude = 0;
    gameOver = false;

    player.x = playerX;
    player.y = playerY;
    player.width = playerWidth;
    player.height = playerHeight;

    velocityX = 0;
    velocityY = initialVelocityY;

    platformArray = [];
    voteBoxArray = [];
    droneArray = [];
    bulletArray = [];
    explosionArray = [];

    resetElectricitySegments();
    placePlatforms();
    setupGameControls();
}

// Reset electricity segments to initial state
function resetElectricitySegments() {
    electricitySegments.forEach((segment) => {
        segment.visible = true;
        segment.filled = true;
    });
}

// Start the main loop
function startMainLoop() {
    last = performance.now();
    requestAnimationFrame(loop);
}

function loop(now = performance.now()) {
    if (gameState !== "playing") {
        render();
        requestAnimationFrame(loop);
        return;
    }

    acc += Math.min(0.25, (now - last) / 1000);
    last = now;

    let steps = 0;
    while (acc >= STEP && steps < MAX_STEPS) {
        fixedUpdate(STEP);
        acc -= STEP;
        steps++;
    }

    render();
    requestAnimationFrame(loop);
}

// Fixed timestep simulation
function fixedUpdate(dt) {
    if (gameOver) {
        return;
    }

    // Update altitude based on score
    altitude = Math.floor(score / 10);

    // Get current difficulty
    const currentDifficulty = getCurrentDifficulty();

    // Update resources
    updateResources(currentDifficulty, dt);

    // Update electricity segments
    updateElectricitySegments();

    // Player physics
    player.x += velocityX * dt;
    player.y += velocityY * dt;
    velocityY += gravity * dt;

    // Wrap around screen horizontally
    if (player.x > boardWidth) {
        player.x = 0;
    } else if (player.x + player.width < 0) {
        player.x = boardWidth;
    }

    // Update game objects with timestep
    updatePlatforms(dt, currentDifficulty); // Placeholder: implement with dt
    updateVoteBoxes(dt); // Placeholder: implement with dt
    if (currentDifficulty.drones) updateDrones(dt); // Placeholder: implement with dt
    updateBullets(dt); // Placeholder: implement with dt
    updateExplosions(dt); // Placeholder: implement with dt

    // Collision detection with platforms
    for (let platform of platformArray) {
        if (detectCollision(player, platform) && velocityY >= 0) {
            player.y = platform.y - player.height; // Land on platform
            velocityY = 0; // Stop falling
            break;
        }
    }

    // Update score
    updateScore(dt);

    // Check game over
    if (player.y > boardHeight || electricity <= 0) {
        gameOver = true;
    }

    // Update electricity flash timer
    if (electricityFlashTimer > 0) {
        electricityFlashTimer -= 1 * dt; // Scale by dt
    }
}

// Rendering function
function render() {
    if (gameState === "character-select") {
        drawCharacterSelection();
        return;
    } else if (gameState === "loading") {
        return; // TODO: Draw loading screen if defined
    }

    if (gameOver) {
        drawGameOver();
        return;
    }

    const currentDifficulty = getCurrentDifficulty();

    // Clear screen with background
    drawBackground(currentDifficulty);

    // Choose player image based on water availability, movement direction, and dark mode
    let currentPlayerImg;
    const currentLevel = getCurrentDifficultyLevel();
    const isDarkMode = currentLevel >= 7;

    let basePlayerImg, jetpackPlayerImg;
    if (isDarkMode) {
        basePlayerImg = images["dark_" + currentCharacter + "_right"];
        jetpackPlayerImg = images["dark_" + currentCharacter + "_right_jetpack"];
    } else {
        basePlayerImg = images[currentCharacter + "_right"];
        jetpackPlayerImg = images[currentCharacter + "_right_jetpack"];
    }

    if (!basePlayerImg) {
        console.warn(`Dark mode character image not found, falling back to normal mode`);
        basePlayerImg = images[currentCharacter + "_right"];
        jetpackPlayerImg = images[currentCharacter + "_right_jetpack"];
    }

    if (water > 0) {
        if (velocityY < 0) {
            currentPlayerImg = jetpackPlayerImg;
        } else {
            currentPlayerImg = basePlayerImg;
        }
    } else {
        currentPlayerImg = basePlayerImg;
    }

    if (currentPlayerImg) {
        context.drawImage(currentPlayerImg, player.x, player.y, player.width, player.height);
    }

    // Draw game objects (placeholders; implement these functions)
    drawPlatforms();
    drawVoteBoxes();
    if (currentDifficulty.drones) drawDrones();
    drawBullets();
    drawExplosions();

    // Draw UI
    drawUI(currentDifficulty);

    // Apply darkness overlay
    if (currentDifficulty.darkness > 0) {
        applyDarkness(currentDifficulty.darkness);
    }

    // Apply electricity flash effect
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

function updateResources(difficulty, dt) {
    const previousElectricity = electricity;
    const currentLevel = getCurrentDifficultyLevel();

    // Water consumption with every jump (when moving up)
    if (velocityY < 0) {
        water -= 12 * dt; // 0.2 * 60 scaled by dt
        if (water < 0) water = 0;
    }

    // Electricity consumption in higher levels
    if (difficulty.altitude >= 4000) {
        electricity -= 1.2 * dt; // 0.02 * 60 scaled by dt
        if (electricity < 0) electricity = 0;
    }

    if (Math.floor(electricity / 20) < Math.floor(previousElectricity / 20) && electricity < 80) {
        createElectricityFlash();
    }
}

function createElectricityFlash() {
    electricityFlashTimer = 30; // 0.5 sec at 60 Hz
}

function applyElectricityFlash() {
    if (electricityFlashTimer > 0) {
        const flashIntensity = electricityFlashTimer % 6 < 3 ? 0.15 : 0.05;
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
            electricitySegments[i].visible = false;
        } else {
            electricitySegments[i].visible = true;
        }
    }

    // Update filled state based on electricity percentage
    const visibleSegments = electricitySegments.filter((seg) => seg.visible);
    const filledSegmentCount = Math.ceil((electricity / 100) * visibleSegments.length);

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

function updateScore(dt) {
    let points = Math.floor(50 * Math.random() * dt * 60); // Scale points by frame time
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
    velocityX = -240; // -4 * 60
}

function moveRight() {
    velocityX = 240; // 4 * 60
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
        y: playerY + playerHeight, // Place just below player start
        width: platformWidth,
        height: platformHeight,
        type: "normal",
    };
    platformArray.push(platform);

    // Create more platforms initially with closer spacing
    for (let i = 0; i < 80; i++) {
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
        platformGap = 60;
    } else if (altitude < 2000) {
        platformGap = 65;
    } else if (altitude < 3000) {
        platformGap = 70;
    } else if (altitude < 4000) {
        platformGap = 70;
    } else if (altitude < 5000) {
        platformGap = 75;
    } else if (altitude < 6000) {
        platformGap = 75;
    } else {
        platformGap = 75;
    }

    console.log(`Creating new platform - Level: ${currentLevel}, Dark Mode: ${isDarkMode}, Gap: ${platformGap}`);

    // Choose image based on mode and difficulty
    if (isDarkMode) {
        if (difficulty.gasExplosions && Math.random() < 0.35) {
            platformType = "gas";
            platformImg = images.dark_gas_platform;
        } else if (Math.random() < 0.1) {
            platformType = "broken";
            platformImg = images["dark_platform-broken"];
        } else {
            platformImg = images.dark_platform;
        }
    } else {
        if (difficulty.gasExplosions && Math.random() < 0.15) {
            platformType = "gas";
            platformImg = images.gas_platform;
        } else if (Math.random() < 0.1) {
            platformType = "broken";
            platformImg = images["platform-broken"];
        } else {
            platformImg = images.platform;
        }
    }

    // Fallback if image not found
    if (!platformImg) {
        console.error(`Platform image not found for type: ${platformType}, dark mode: ${isDarkMode}`);
        platformImg = images.platform || createFallbackImage("platform.png");
    }

    let platform = {
        img: platformImg,
        x: randomX,
        y: platformArray[platformArray.length - 1].y - platformGap,
        width: platformType === "gas" ? gasPlatformWidth : platformWidth,
        height: platformType === "gas" ? gasPlatformHeight : platformHeight,
        type: platformType,
    };

    platformArray.push(platform);

    if (Math.random() < 0.15) {
        const voteBoxImg = isDarkMode ? images.dark_vote_box : images.vote_box;
        voteBoxArray.push({
            x: randomX + 70,
            y: platform.y - 40,
            width: 60,
            height: 60,
            img: voteBoxImg || images.vote_box,
        });
    }
}

// Placeholder functions (implement these based on your needs)
function loadAllImages() {
    // TODO: Implement image loading logic
    console.log("Image loading placeholder");
}

function setupGameControls() {
    // TODO: Implement control setup
    console.log("Game controls setup placeholder");
}

function drawCharacterSelection() {
    // TODO: Implement character selection screen
    console.log("Character selection drawing placeholder");
}

function drawGameOver() {
    // TODO: Implement game over screen
    console.log("Game over drawing placeholder");
}

function drawBackground(difficulty) {
    // TODO: Implement background drawing
    console.log("Background drawing placeholder");
}

function drawPlatforms() {
    // TODO: Implement platform drawing
    console.log("Platforms drawing placeholder");
}

function drawVoteBoxes() {
    // TODO: Implement vote boxes drawing
    console.log("Vote boxes drawing placeholder");
}

function drawDrones() {
    // TODO: Implement drones drawing
    console.log("Drones drawing placeholder");
}

function drawBullets() {
    // TODO: Implement bullets drawing
    console.log("Bullets drawing placeholder");
}

function drawExplosions() {
    // TODO: Implement explosions drawing
    console.log("Explosions drawing placeholder");
}

function drawUI(difficulty) {
    // TODO: Implement UI drawing (score, water, electricity)
    console.log("UI drawing placeholder");
}

function applyDarkness(darkness) {
    // TODO: Implement darkness overlay
    console.log("Darkness overlay placeholder");
}

function updatePlatforms(dt, difficulty) {
    // TODO: Implement platform updates with dt
    console.log("Platforms update placeholder");
}

function updateVoteBoxes(dt) {
    // TODO: Implement vote boxes updates with dt
    console.log("Vote boxes update placeholder");
}

function updateDrones(dt) {
    // TODO: Implement drones updates with dt
    console.log("Drones update placeholder");
}

function updateBullets(dt) {
    // TODO: Implement bullets updates with dt
    console.log("Bullets update placeholder");
}

function updateExplosions(dt) {
    // TODO: Implement explosions updates with dt
    console.log("Explosions update placeholder");
}

function createFallbackImage(filename) {
    // TODO: Implement fallback image creation
    console.log("Fallback image creation placeholder");
    return null; // Placeholder return
}