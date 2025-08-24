// ... (keep existing global variables and difficultyLevels as before)

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

// ... (keep setupResponsiveCanvas, handleResize, handleOrientationChange, initializeElectricitySegments as before)

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
    updatePlatforms(dt, currentDifficulty); // Ensure this function exists and uses dt
    updateVoteBoxes(dt); // Ensure this function exists and uses dt
    if (currentDifficulty.drones) updateDrones(dt); // Ensure this function exists and uses dt
    updateBullets(dt); // Ensure this function exists and uses dt
    updateExplosions(dt); // Ensure this function exists and uses dt

    // Collision detection with platforms
    for (let platform of platformArray) {
        if (detectCollision(player, platform) && velocityY >= 0) {
            player.y = platform.y - player.height; // Land on platform
            velocityY = 0; // Stop falling
            break;
        }
    }

    // Update score
    updateScore(dt); // Modified to accept dt

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

    // Draw game objects
    drawPlatforms(); // Ensure this function exists to draw platformArray
    drawVoteBoxes(); // Ensure this function exists to draw voteBoxArray
    if (currentDifficulty.drones) drawDrones(); // Ensure this function exists to draw droneArray
    drawBullets(); // Ensure this function exists to draw bulletArray
    drawExplosions(); // Ensure this function exists to draw explosionArray

    // Draw UI
    drawUI(currentDifficulty);

    // Apply darkness overlay
    if (currentDifficulty.darkness > 0) {
        applyDarkness(currentDifficulty.darkness);
    }

    // Apply electricity flash effect
    applyElectricityFlash();
}

// ... (keep getCurrentDifficulty, getCurrentDifficultyLevel, updateElectricitySegments, detectCollision as before)

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

// ... (keep placePlatforms, newPlatform as before, ensuring they work with the new structure)