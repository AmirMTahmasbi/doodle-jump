// Combined Game File - Menu + Game Logic
// Political Peak Climb Game - "Close to the Peak"

let board;
let boardWidth = 450;
let boardHeight = 900;
let context;

// Game states
let gameState = 'character-select';
let selectedCharacter = null;

// Character options
const characters = [
    {
        id: 'akhoond',
        normal: './images/akhoond_right.png',
        jetpack: './images/akhoond_right_jetpack.png'
    },
    {
        id: 'reform', 
        normal: './images/reform_right.png',
        jetpack: './images/reform_right_jetpack.png'
    },
    {
        id: 'lamizzade',
        normal: './images/lamizzade_right.png',
        jetpack: './images/lamizzade_right.png'
    }
];

// Player properties
let playerWidth = 70;
let playerHeight = 70;
let playerX = boardWidth / 2 - playerWidth / 2;
let playerY = boardHeight * 7/8 - playerHeight;
let playerImg;
let playerJetpackImg;

let player = {
    x: playerX,
    y: playerY,
    width: playerWidth,
    height: playerHeight,
    img: null
}

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

// Load all images
let images = {};
let imagesLoaded = 0;
let totalImages = 0;

// Difficulty levels based on altitude
const difficultyLevels = {
    1: { name: "Far from Peak", altitude: 0, weather: false, drones: false, gasExplosions: false, darkness: 0 },
    2: { name: "Bad Weather", altitude: 500, weather: true, drones: false, gasExplosions: false, darkness: 0.1 },
    3: { name: "Weather + Drones", altitude: 1000, weather: true, drones: true, gasExplosions: false, darkness: 0.2 },
    4: { name: "Weather + Gas + Drones", altitude: 1500, weather: true, drones: true, gasExplosions: true, darkness: 0.3 },
    5: { name: "Gas + Electricity Issues", altitude: 2000, weather: true, drones: true, gasExplosions: true, darkness: 0.5 },
    6: { name: "Water Shortage", altitude: 2500, weather: true, drones: true, gasExplosions: true, darkness: 0.7 },
    7: { name: "Close to Peak", altitude: 3000, weather: true, drones: true, gasExplosions: true, darkness: 0.9 }
};

// ========== INITIALIZATION ==========
window.onload = function() {
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

    board.style.width = rect.width + 'px';
    board.style.height = rect.height + 'px';

    // Update board dimensions
    boardWidth = rect.width;
    boardHeight = rect.height;

    loadAllImages();
}

function loadAllImages() {
    const imageList = [
        'doodlejumpbg.png',
        'platform.png',
        'platform-broken.png',
        'gas_platform.png',
        'exploded_platform.png',
        'vote_box.png',
        'drone.png',
        'bullet.png',
        'akhoond_right.png',
        'akhoond_right_jetpack.png',
        'reform_right.png', 
        'reform_right_jetpack.png',
        'lamizzade_right.png'
    ];

    totalImages = imageList.length;

    imageList.forEach(imageName => {
        const img = new Image();
        img.onload = function() {
            imagesLoaded++;
            console.log(`Loaded ${imageName} (${imagesLoaded}/${totalImages})`);
            if (imagesLoaded === totalImages) {
                console.log("All images loaded, starting character selection");
                showCharacterSelection();
            }
        };
        img.onerror = function() {
            console.error(`Failed to load ${imageName}`);
            // Create fallback colored rectangles for missing images
            const canvas = document.createElement('canvas');
            canvas.width = 50;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = imageName.includes('platform') ? '#8B4513' : 
                          imageName.includes('drone') ? '#696969' :
                          imageName.includes('vote') ? '#FFD700' : '#FF6B6B';
            ctx.fillRect(0, 0, 50, 50);
            ctx.fillStyle = 'white';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(imageName.split('.')[0], 25, 25);
            images[imageName.replace('.png', '').replace('doodlejumpbg', 'doodlejumpbg')] = canvas;

            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                showCharacterSelection();
            }
        };
        img.src = `./images/${imageName}`;
        images[imageName.replace('.png', '')] = img;
    });
}

// ========== MENU FUNCTIONS ==========
function showCharacterSelection() {
    gameState = 'character-select';
    drawCharacterSelection();
    setupMobileControls();
}

function drawCharacterSelection() {
    // Draw Doodle Jump background
    if (images.doodlejumpbg && images.doodlejumpbg.width) {
        context.drawImage(images.doodlejumpbg, 0, 0, boardWidth, boardHeight);
    } else {
        // Fallback - notebook paper style background
        context.fillStyle = "#f4f1e8";
        context.fillRect(0, 0, boardWidth, boardHeight);

        // Draw grid lines
        context.strokeStyle = "rgba(200, 200, 200, 0.3)";
        context.lineWidth = 1;
        for (let i = 0; i < boardHeight; i += 25) {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(boardWidth, i);
            context.stroke();
        }
        for (let i = 0; i < boardWidth; i += 25) {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, boardHeight);
            context.stroke();
        }
    }

    // Game Title in red - positioned at top right, rotated clockwise
    context.save();
    context.translate(boardWidth - 130, 80);
    context.rotate(Math.PI / 12); // 15 degrees clockwise
    context.fillStyle = "#cc0000";
    context.font = "bold 38px 'Patrick Hand'";
    context.textAlign = "center";
    context.fillText("doodle jump", 0, 0);

    // Subtitle
    context.fillStyle = "#666";
    context.font = "32px 'Patrick Hand'";
    context.fillText("the gholle edition", 0, 40);
    context.restore();

    // Quote - also rotated slightly
    context.save();
    context.translate(boardWidth/2, 160);
    context.rotate(Math.PI / 12);
    context.font = "20px 'Indie Flower'";
    context.fillStyle = "#333";
    context.textAlign = "center";
    context.fillText('"we are close to the gholleh,', 0, 0);
    context.fillText('Fatigue is prohibited!"', 0, 25);
    context.restore();

    // Draw characters
    const charSize = 120;
    const positions = [
        { x: boardWidth/3, y: 250 },           // Akhoond
        { x: boardWidth/3, y: 400 },           // Reform
        { x: (boardWidth * 4)/5, y: 300 }      // Lamizzade
    ];

    characters.forEach((char, index) => {
        const pos = positions[index];

        // Character image
        if (images[char.id + '_right']) {
            // Selection highlight (glow effect around character)
            if (selectedCharacter === char.id) {
                context.save();
                context.shadowColor = "#ffff00";
                context.shadowBlur = 25;
                context.drawImage(images[char.id + '_right'], 
                    pos.x - charSize/2, pos.y - charSize/2, charSize, charSize);
                context.restore();
            } else {
                context.drawImage(images[char.id + '_right'], 
                    pos.x - charSize/2, pos.y - charSize/2, charSize, charSize);
            }
        } else {
            // Fallback
            context.fillStyle = selectedCharacter === char.id ? "#ffff00" : "#ccc";
            context.beginPath();
            context.arc(pos.x, pos.y, charSize/2, 0, 2 * Math.PI);
            context.fill();
            context.fillStyle = "#333";
            context.font = "18px 'Indie Flower'";
            context.textAlign = "center";
            context.fillText(char.id, pos.x, pos.y);
        }
    });

    // Start button at bottom
    if (selectedCharacter) {
        const buttonY = boardHeight - 80;
        const buttonWidth = 250;
        const buttonHeight = 60;

        // Start button background
        context.fillStyle = "#4CAF50";
        roundRect(context, boardWidth/2 - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 30);
        context.fill();

        // Button border
        context.strokeStyle = "#333";
        context.lineWidth = 3;
        context.stroke();

        // Button text
        context.fillStyle = "#fff";
        context.font = "bold 28px 'Patrick Hand'";
        context.textAlign = "center";
        context.fillText("START CLIMBING!", boardWidth/2, buttonY + 10);
    }

    // Instructions at bottom
    if (!selectedCharacter) {
        context.fillStyle = "#666";
        context.font = "18px 'Indie Flower'";
        context.textAlign = "center";
        context.fillText("Tap a character to select", boardWidth/2, boardHeight - 40);
    }
}

// Helper function for rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function selectCharacter(x, y) {
    if (gameState !== 'character-select') return;

    const charSize = 120;
    const positions = [
        { x: boardWidth/3, y: 250 },           // Akhoond
        { x: boardWidth/3, y: 400 },           // Reform
        { x: (boardWidth * 4)/5, y: 300 }      // Lamizzade
    ];

    console.log(`Click at: ${x}, ${y}`);

    // Check character selection
    characters.forEach((char, index) => {
        const pos = positions[index];
        const distance = Math.sqrt((x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y));

        if (distance <= charSize/2) {
            selectedCharacter = char.id;
            console.log(`Selected character: ${char.id}`);
            drawCharacterSelection();
            return;
        }
    });

    // Check start button
    if (selectedCharacter) {
        const buttonY = boardHeight - 80;
        const buttonWidth = 250;
        const buttonHeight = 60;

        if (x >= boardWidth/2 - buttonWidth/2 && x <= boardWidth/2 + buttonWidth/2 && 
            y >= buttonY - buttonHeight/2 && y <= buttonY + buttonHeight/2) {
            console.log('Starting game with character:', selectedCharacter);
            startGame();
        }
    }
}

// ========== GAME FUNCTIONS ==========
function startGame() {
    if (!selectedCharacter) return;

    gameState = 'playing';

    // Load selected character images
    player.img = images[selectedCharacter + '_right'];
    playerJetpackImg = images[selectedCharacter + '_right_jetpack'];

    // Reset game state
    water = 100;
    electricity = 100;
    score = 0;
    maxScore = 0;
    altitude = 0;
    gameOver = false;

    player.x = playerX;
    player.y = playerY;
    velocityX = 0;
    velocityY = initialVelocityY;

    // Clear arrays
    platformArray = [];
    voteBoxArray = [];
    droneArray = [];
    bulletArray = [];
    explosionArray = [];

    placePlatforms();
    requestAnimationFrame(update);
}

function update() {
    if (gameState !== 'playing') return;

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

    // Choose player image based on water level
    const currentPlayerImg = water > 0 ? playerJetpackImg : player.img;

    // Draw player
    if (currentPlayerImg) {
        context.drawImage(currentPlayerImg, player.x, player.y, player.width, player.height);
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

    // Check game over
    if (player.y > board.height || water <= 0) {
        gameOver = true;
    }

    // Apply darkness overlay
    if (currentDifficulty.darkness > 0) {
        applyDarkness(currentDifficulty.darkness);
    }
}

function getCurrentDifficulty() {
    for (let level = 7; level >= 1; level--) {
        if (altitude >= difficultyLevels[level].altitude) {
            return difficultyLevels[level];
        }
    }
    return difficultyLevels[1];
}

function updateResources(difficulty) {
    // Water consumption based on jetpack usage
    if (water > 0 && (velocityX !== 0 || velocityY < 0)) {
        water -= 0.08;
        if (water < 0) water = 0;
    }

    // Electricity consumption in higher levels
    if (difficulty.altitude >= 2000) {
        electricity -= 0.05;
        if (electricity < 0) electricity = 0;
    }
}

function drawBackground(difficulty) {
    // Draw Doodle Jump background
    if (images.doodlejumpbg && images.doodlejumpbg.width) {
        context.drawImage(images.doodlejumpbg, 0, 0, boardWidth, boardHeight);
    } else {
        context.fillStyle = "#f4f1e8";
        context.fillRect(0, 0, boardWidth, boardHeight);
    }

    // Weather effects
    if (difficulty.weather) {
        drawWeatherEffects();
    }
}

function drawWeatherEffects() {
    // Simple rain effect
    context.strokeStyle = "rgba(200, 200, 255, 0.5)";
    context.lineWidth = 1;
    for (let i = 0; i < 50; i++) {
        const x = (Math.random() * boardWidth + Date.now() * 0.1) % boardWidth;
        const y = (Math.random() * boardHeight + Date.now() * 0.2) % boardHeight;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 2, y + 10);
        context.stroke();
    }
}

function updatePlatforms(difficulty) {
    for (let i = platformArray.length - 1; i >= 0; i--) {
        let platform = platformArray[i];

        if (velocityY < 0 && player.y < boardHeight * 3/4) {
            platform.y -= initialVelocityY;
        }

        if (detectCollision(player, platform) && velocityY >= 0) {
            // Check platform type
            if (platform.type === 'gas' && difficulty.gasExplosions) {
                // Gas explosion
                createExplosion(platform.x, platform.y);
                platform.type = 'exploded';
                platform.img = images.exploded_platform;
                water -= 20;
                if (water < 0) water = 0;
            } else if (platform.type === 'broken') {
                // Broken platform disappears when hit
                platformArray.splice(i, 1);
                continue;
            } else if (platform.type !== 'exploded') {
                velocityY = initialVelocityY;
            }
        }

        // Draw platform
        if (platform.img) {
            context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
        }
    }

    // Remove platforms that have gone off screen and add new ones
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform(difficulty);
    }
}

function updateVoteBoxes() {
    for (let i = voteBoxArray.length - 1; i >= 0; i--) {
        let box = voteBoxArray[i];

        if (velocityY < 0 && player.y < boardHeight * 3/4) {
            box.y -= initialVelocityY;
        }

        if (detectCollision(player, box)) {
            // Collect vote box - refill water
            water += 30;
            if (water > 100) water = 100;
            voteBoxArray.splice(i, 1);
            continue;
        }

        // Remove if off screen
        if (box.y >= boardHeight) {
            voteBoxArray.splice(i, 1);
            continue;
        }

        // Draw vote box
        context.drawImage(images.vote_box, box.x, box.y, box.width, box.height);
    }
}

function updateDrones() {
    // Spawn new drones occasionally
    if (Math.random() < 0.005) {
        spawnDrone();
    }

    for (let i = droneArray.length - 1; i >= 0; i--) {
        let drone = droneArray[i];

        // Move drone
        drone.x += drone.velocityX;
        drone.y += drone.velocityY;

        // Drone shooting
        if (Math.random() < 0.01) {
            shootBullet(drone.x, drone.y);
        }

        // Remove if off screen
        if (drone.x < -50 || drone.x > boardWidth + 50 || drone.y > boardHeight + 50) {
            droneArray.splice(i, 1);
            continue;
        }

        // Draw drone
        context.drawImage(images.drone, drone.x, drone.y, drone.width, drone.height);
    }
}

function updateBullets() {
    for (let i = bulletArray.length - 1; i >= 0; i--) {
        let bullet = bulletArray[i];

        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;

        // Check collision with player
        if (detectCollision(player, bullet)) {
            water -= 15;
            if (water < 0) water = 0;
            bulletArray.splice(i, 1);
            continue;
        }

        // Remove if off screen
        if (bullet.x < 0 || bullet.x > boardWidth || bullet.y < 0 || bullet.y > boardHeight) {
            bulletArray.splice(i, 1);
            continue;
        }

        // Draw bullet
        context.drawImage(images.bullet, bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function updateExplosions() {
    for (let i = explosionArray.length - 1; i >= 0; i--) {
        let explosion = explosionArray[i];

        explosion.timer--;

        if (explosion.timer <= 0) {
            explosionArray.splice(i, 1);
            continue;
        }

        // Draw explosion
        const alpha = explosion.timer / 30;
        context.globalAlpha = alpha;
        context.drawImage(images.exploded_platform, explosion.x, explosion.y, 80, 80);
        context.globalAlpha = 1;
    }
}

function createExplosion(x, y) {
    explosionArray.push({
        x: x - 10,
        y: y - 10,
        timer: 30
    });
}

function spawnDrone() {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    droneArray.push({
        x: side === 'left' ? -40 : boardWidth + 40,
        y: Math.random() * 200 + 50,
        width: 40,
        height: 30,
        velocityX: side === 'left' ? 1 : -1,
        velocityY: Math.random() * 0.5 - 0.25
    });
}

function shootBullet(droneX, droneY) {
    // Aim towards player
    const dx = player.x - droneX;
    const dy = player.y - droneY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    bulletArray.push({
        x: droneX,
        y: droneY,
        width: 8,
        height: 8,
        velocityX: (dx / distance) * 3,
        velocityY: (dy / distance) * 3
    });
}

function placePlatforms() {
    platformArray = [];

    // Starting platform
    let platform = {
        img: images.platform,
        x: boardWidth/2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight,
        type: 'normal'
    }
    platformArray.push(platform);

    // Random platforms
    for (let i = 0; i < 6; i++) {
        newPlatform(difficultyLevels[1]);
    }
}

function newPlatform(difficulty) {
    let randomX = Math.floor(Math.random() * boardWidth * 3/4);
    let platformType = 'normal';
    let platformImg = images.platform;

    // Determine platform type based on difficulty
    if (difficulty.gasExplosions && Math.random() < 0.3) {
        platformType = 'gas';
        platformImg = images.gas_platform;
    } else if (Math.random() < 0.1) {
        platformType = 'broken';
        platformImg = images['platform-broken'];
    }

    let platform = {
        img: platformImg,
        x: randomX,
        y: platformArray[platformArray.length - 1].y - 115,
        width: platformWidth,
        height: platformHeight,
        type: platformType
    }

    platformArray.push(platform);

    // Occasionally spawn vote boxes
    if (Math.random() < 0.15) {
        voteBoxArray.push({
            x: randomX + 70,
            y: platform.y - 40,
            width: 60,
            height: 45
        });
    }
}

function drawUI(difficulty) {
    // Sidebar background with better styling
    const gradient = context.createLinearGradient(0, 0, 60, 0);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
    gradient.addColorStop(1, "rgba(44, 62, 80, 0.6)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 60, boardHeight);

    // Water meter
    context.fillStyle = "#1e3a8a";
    context.fillRect(5, 50, 20, 120);
    context.fillStyle = "#3b82f6";
    const waterHeight = (water / 100) * 120;
    context.fillRect(5, 170 - waterHeight, 20, waterHeight);

    // Water meter border
    context.strokeStyle = "rgba(255, 255, 255, 0.3)";
    context.lineWidth = 1;
    context.strokeRect(5, 50, 20, 120);

    // Electricity meter
    context.fillStyle = "#7f1d1d";
    context.fillRect(30, 50, 20, 120);
    context.fillStyle = "#fbbf24";
    const electricityHeight = (electricity / 100) * 120;
    context.fillRect(30, 170 - electricityHeight, 20, electricityHeight);

    // Electricity meter border
    context.strokeStyle = "rgba(255, 255, 255, 0.3)";
    context.lineWidth = 1;
    context.strokeRect(30, 50, 20, 120);

    // Icons and labels
    context.fillStyle = "#fff";
    context.font = "12px Arial";
    context.textAlign = "left";
    context.fillText("💧", 5, 45);
    context.fillText("⚡", 30, 45);
    context.fillText("🏔️", 5, 195);

    // Resource percentages
    context.font = "10px 'Indie Flower'";
    context.fillStyle = "#00aaff";
    context.fillText(`${Math.floor(water)}%`, 5, 185);
    context.fillStyle = "#fbbf24";
    context.fillText(`${Math.floor(electricity)}%`, 30, 185);

    // Proximity to peak
    const proximity = Math.min((altitude / 3000) * 100, 100);
    context.fillStyle = "#00ff88";
    context.fillText(`${proximity.toFixed(0)}%`, 5, 210);

    // Score with better styling
    context.fillStyle = "black";
    context.font = "bold 18px 'Patrick Hand'";
    context.textAlign = "center";
    context.fillText(score, boardWidth/2, 35);

    // Difficulty level
    context.fillStyle = "black";
    context.font = "bold 14px 'Indie Flower'";
    context.fillText(difficulty.name, boardWidth/2, boardHeight - 15);
}

function applyDarkness(level) {
    context.fillStyle = `rgba(0, 0, 0, ${level})`;
    context.fillRect(0, 0, boardWidth, boardHeight);

    // Show only eyes of character in complete darkness
    if (level > 0.8) {
        context.fillStyle = "white";
        context.beginPath();
        context.arc(player.x + 20, player.y + 20, 4, 0, 2 * Math.PI);
        context.arc(player.x + 35, player.y + 20, 4, 0, 2 * Math.PI);
        context.fill();

        // Show platform outlines
        platformArray.forEach(platform => {
            context.strokeStyle = "rgba(255, 255, 255, 0.3)";
            context.lineWidth = 1;
            context.strokeRect(platform.x, platform.y, platform.width, platform.height);
        });
    }
}

function drawGameOver() {
    context.fillStyle = "rgba(0, 0, 0, 0.9)";
    context.fillRect(0, 0, boardWidth, boardHeight);

    // Game over title
    context.fillStyle = "white";
    context.font = "bold 28px 'Patrick Hand'";
    context.textAlign = "center";
    context.fillText("You reached", boardWidth/2, boardHeight/2 - 80);

    context.fillStyle = "#ff6b6b";
    context.font = "bold 32px 'Patrick Hand'";
    context.fillText("Gholleh!", boardWidth/2, boardHeight/2 - 40);

    // Stats
    context.fillStyle = "white";
    context.font = "20px 'Indie Flower'";
    context.fillText(`Score: ${score}`, boardWidth/2, boardHeight/2 + 10);
    context.fillText(`Altitude: ${altitude}m`, boardWidth/2, boardHeight/2 + 40);

    // Instructions
    context.font = "16px 'Indie Flower'";
    context.fillStyle = "lightgreen";
    context.fillText("Tap to restart", boardWidth/2, boardHeight/2 + 80);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
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
    gameState = 'character-select';
    selectedCharacter = null;
    showCharacterSelection();
}

// ========== CONTROLS ==========
function setupMobileControls() {
    // Remove existing listeners
    board.removeEventListener('touchstart', handleTouch);
    board.removeEventListener('touchend', handleTouchEnd);
    board.removeEventListener('click', handleClick);

    // Touch events for mobile
    board.addEventListener('touchstart', handleTouch, { passive: false });
    board.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Mouse events for desktop
    board.addEventListener('click', handleClick, { passive: false });

    board.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
}

function handleTouch(e) {
    e.preventDefault();

    const touch = e.touches[0];
    const rect = board.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (boardWidth / rect.width);
    const y = (touch.clientY - rect.top) * (boardHeight / rect.height);

    if (gameState === 'character-select') {
        selectCharacter(x, y);
    } else if (gameState === 'playing') {
        if (gameOver) {
            resetGame();
            return;
        }

        if (x < boardWidth / 2) {
            moveLeft();
        } else {
            moveRight();
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    velocityX = 0;
}

function handleClick(e) {
    e.preventDefault();

    const rect = board.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (boardWidth / rect.width);
    const y = (e.clientY - rect.top) * (boardHeight / rect.height);

    if (gameState === 'character-select') {
        selectCharacter(x, y);
    } else if (gameState === 'playing') {
        if (gameOver) {
            resetGame();
            return;
        }

        if (x < boardWidth / 2) {
            moveLeft();
        } else {
            moveRight();
        }
    }
}

// Desktop keyboard controls
document.addEventListener("keydown", function(e) {
    if (gameState === 'playing') {
        if (e.code == "ArrowLeft" || e.code == "KeyA") {
            moveLeft();
        } else if (e.code == "ArrowRight" || e.code == "KeyD") {
            moveRight();
        } else if (e.code == "Space" && gameOver) {
            resetGame();
        }
    } else if (gameState === 'character-select') {
        if (e.code === "Digit1") {
            selectedCharacter = 'akhoond';
            drawCharacterSelection();
        } else if (e.code === "Digit2") {
            selectedCharacter = 'reform';
            drawCharacterSelection();
        } else if (e.code === "Digit3") {
            selectedCharacter = 'lamizzade';
            drawCharacterSelection();
        } else if (e.code === "Space" && selectedCharacter) {
            startGame();
        }
    }
});

document.addEventListener("keyup", function(e) {
    if (gameState === 'playing') {
        if (e.code == "ArrowLeft" || e.code == "KeyA" || e.code == "ArrowRight" || e.code == "KeyD") {
            velocityX = 0;
        }
    }
});

// Share functionality
function shareScore() {
    const text = `I climbed ${altitude}m and reached Gholleh! Score: ${score}`;
    if (navigator.share) {
        navigator.share({
            title: 'Peak Climb Challenge',
            text: text,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Score copied to clipboard!');
        });
    }
}