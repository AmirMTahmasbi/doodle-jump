// game-graphics.js - Graphics, Assets, Rendering, and Interaction Systems

// ========== IMAGE LOADING ==========

// Load all game images
function loadAllImages() {
    console.log("Starting to load images...");

    const imageList = [
        // Normal mode images - load these first for fast game start
        "doodlejumpbg.png",
        "platform.png",
        "platform-broken.png",
        "gas_platform.png",
        "exploded_platform.png",
        "vote_box.png",
        "drone.png",
        "bullet.png",
        "akhoond_right.png",
        "akhoond_right_jetpack.png",
        "reform_right.png",
        "reform_right_jetpack.png",
        "lamizzade_right.png",
        "mountain_bg.png",
        "game_over.png", // Add game over background
        // UI elements
        "record.png",
        "Save_Image.png",
        "share_X.png",
        "restart.png",
    ];

    // Only load normal mode images initially for fast game start
    totalImages = imageList.length;

    console.log(
        `Loading ${totalImages} normal mode images for fast game start`,
    );

    // Load normal images
    imageList.forEach((imageName) => {
        const img = new Image();
        img.onload = function () {
            imagesLoaded++;
            console.log(
                `Loaded normal image ${imageName} (${imagesLoaded}/${totalImages})`,
            );
            if (imagesLoaded === totalImages) {
                console.log(
                    "Normal mode images loaded, starting dark mode loading and character selection",
                );
                // Load dark mode images immediately after normal images
                loadDarkModeImages();
                setTimeout(() => {
                    if (typeof initializeMenu === "function") {
                        initializeMenu();
                    } else {
                        console.error(
                            "initializeMenu function not found - menu.js may not be loaded",
                        );
                        context.fillStyle = "red";
                        context.font = "20px Arial";
                        context.textAlign = "center";
                        context.fillText(
                            "Error: menu.js not loaded",
                            boardWidth / 2,
                            boardHeight / 2,
                        );
                    }
                }, 100);
            }
        };
        img.onerror = function () {
            console.error(`Failed to load normal image ${imageName}`);
            createFallbackImage(imageName);
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                // Load dark mode images immediately after normal images
                loadDarkModeImages();
                setTimeout(() => {
                    if (typeof initializeMenu === "function") {
                        initializeMenu();
                    } else {
                        console.error("initializeMenu function not found");
                    }
                }, 100);
            }
        };
        img.src = `./images/${imageName}`;
        images[imageName.replace(".png", "")] = img;
    });
}

// Load dark mode images at startup (no longer progressive)
function loadDarkModeImages() {
    console.log("🌙 Loading dark mode assets at startup...");

    const darkImageList = [
        "doodlejumpbg.png",
        "platform.png",
        "platform-broken.png",
        "gas_platform.png",
        "exploded_platform.png",
        "vote_box.png",
        "drone.png",
        "bullet.png",
        "akhoond_right.png",
        "akhoond_right_jetpack.png",
        "reform_right.png",
        "reform_right_jetpack.png",
        "lamizzade_right.png",
        "mountain_bg.png",
        "game_over.png", // Add dark game over background
        // UI elements (same for both modes)
        "record.png",
        "Save_Image.png",
        "share_X.png",
        "restart.png",
    ];

    let darkImagesLoaded = 0;
    const totalDarkImages = darkImageList.length;

    // Load all dark mode images immediately
    darkImageList.forEach((imageName) => {
        const img = new Image();
        img.onload = function () {
            darkImagesLoaded++;
            console.log(
                `🌙 Loaded dark image ${imageName} (${darkImagesLoaded}/${totalDarkImages})`,
            );
            if (darkImagesLoaded === totalDarkImages) {
                console.log("🌙 All dark mode images loaded!");
                darkModeImagesLoaded = true;
            }
        };
        img.onerror = function () {
            console.error(`Failed to load dark image ${imageName}`);
            createFallbackImage("dark_" + imageName);
            darkImagesLoaded++;
            if (darkImagesLoaded === totalDarkImages) {
                console.log(
                    "🌙 Dark mode image loading completed (with some fallbacks)",
                );
                darkModeImagesLoaded = true;
            }
        };
        img.src = `./images_dark_mode/${imageName}`;
        // Store dark images with 'dark_' prefix
        images["dark_" + imageName.replace(".png", "")] = img;
    });
}

function createFallbackImage(imageName) {
    const canvas = document.createElement("canvas");
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = imageName.includes("platform")
        ? "#8B4513"
        : imageName.includes("drone")
          ? "#696969"
          : imageName.includes("vote")
            ? "#FFD700"
            : "#FF6B6B";
    ctx.fillRect(0, 0, 50, 50);
    ctx.fillStyle = "white";
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    ctx.fillText(imageName.split(".")[0], 25, 25);
    images[
        imageName.replace(".png", "").replace("doodlejumpbg", "doodlejumpbg")
    ] = canvas;
}

// ========== DRAWING FUNCTIONS ==========

function drawBackground(difficulty) {
    const currentLevel = getCurrentDifficultyLevel();
    const isDarkMode = currentLevel >= 7;

    console.log(
        `Drawing background - Current level: ${currentLevel}, isDarkMode: ${isDarkMode}`,
    );

    // Use mountain background for both modes, but dark version for level 7+
    if (isDarkMode) {
        // Dark mode - use dark version of mountain background
        console.log("Drawing dark mode background");
        if (images.dark_mountain_bg && images.dark_mountain_bg.width) {
            context.drawImage(
                images.dark_mountain_bg,
                0,
                0,
                boardWidth,
                boardHeight,
            );
            console.log("Using dark_mountain_bg");
        } else if (images.mountain_bg && images.mountain_bg.width) {
            // Fallback to normal mountain_bg if dark version not found
            console.log("Dark mountain_bg not found, using normal mountain_bg");
            context.drawImage(
                images.mountain_bg,
                0,
                0,
                boardWidth,
                boardHeight,
            );
        } else {
            console.log(
                "No mountain background images found, using dark fallback",
            );
            context.fillStyle = "#1a1a1a"; // Dark fallback
            context.fillRect(0, 0, boardWidth, boardHeight);
        }
    } else {
        // Day mode - use normal mountain background
        console.log("Drawing day mode background");
        if (images.mountain_bg && images.mountain_bg.width) {
            context.drawImage(
                images.mountain_bg,
                0,
                0,
                boardWidth,
                boardHeight,
            );
            console.log("Using mountain_bg");
        } else {
            console.log("Mountain background not found, using fallback");
            // Fallback - light background
            context.fillStyle = "#87CEEB"; // Sky blue
            context.fillRect(0, 0, boardWidth, boardHeight);
        }
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
        const y =
            (Math.random() * boardHeight + Date.now() * 0.2) % boardHeight;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 2, y + 10);
        context.stroke();
    }
}

function drawUI(difficulty) {
    // Much shorter horizontal bars at the top

    // Water bar - horizontal at top left (continuous bar)
    const barWidth = 80;
    const barHeight = 12;
    const barY = 15;

    // Water bar background
    context.fillStyle = "rgba(30, 58, 138, 0.3)";
    context.fillRect(15, barY, barWidth, barHeight);

    // Water bar fill
    context.fillStyle = "#3b82f6";
    const waterWidth = (water / 100) * barWidth;
    context.fillRect(15, barY, waterWidth, barHeight);

    // Water bar border
    context.strokeStyle = "#1e3a8a";
    context.lineWidth = 2;
    context.strokeRect(15, barY, barWidth, barHeight);

    // Water label
    context.fillStyle = "#1e3a8a";
    context.font = "12px 'Indie Flower'";
    context.textAlign = "left";
    context.fillText("💧", 15, barY - 3);

    // Electricity bar - draw fixed segments
    drawElectricityBar();

    // Score at center top
    context.fillStyle = "black";
    context.font = "bold 24px 'Patrick Hand'";
    context.textAlign = "center";
    context.fillText(score, boardWidth / 2, 30);

    // Draw altitude milestones - dotted red lines in background
    drawAltitudeMilestones();

    // Proximity to peak - small indicator at center
    context.fillStyle = "#00ff88";
    context.font = "12px 'Indie Flower'";

    // Difficulty level at bottom
    context.fillStyle = "black";
    context.font = "bold 14px 'Indie Flower'";
    context.fillText(difficulty.name, boardWidth / 2, boardHeight - 15);
}

// Draw electricity bar with fixed segments
function drawElectricityBar() {
    const currentLevel = getCurrentDifficultyLevel();

    // Don't draw electricity bar in dark mode (level 7+)
    if (currentLevel >= 7) {
        return;
    }

    // Draw each electricity segment
    electricitySegments.forEach((segment) => {
        if (!segment.visible) {
            return; // Skip hidden segments
        }

        // Segment background
        context.fillStyle = "rgba(127, 29, 29, 0.3)";
        context.fillRect(segment.x, segment.y, segment.width, segment.height);

        // Segment fill if active
        if (segment.filled) {
            // Color based on electricity level
            if (electricity > 60) {
                context.fillStyle = "#22c55e"; // Green when high
            } else if (electricity > 30) {
                context.fillStyle = "#fbbf24"; // Yellow when medium
            } else {
                context.fillStyle = "#ef4444"; // Red when low
            }
            context.fillRect(
                segment.x,
                segment.y,
                segment.width,
                segment.height,
            );
        }

        // Segment border
        context.strokeStyle = "#7f1d1d";
        context.lineWidth = 1;
        context.strokeRect(segment.x, segment.y, segment.width, segment.height);
    });

    // Electricity label (only if there are visible segments)
    const visibleSegments = electricitySegments.filter((seg) => seg.visible);
    if (visibleSegments.length > 0) {
        context.fillStyle = "#7f1d1d";
        context.font = "12px 'Indie Flower'";
        context.textAlign = "right";
        context.fillText("⚡", boardWidth - 15, 12);
    }
}

// Draw altitude milestone lines
function drawAltitudeMilestones() {
    const milestones = [1000, 2000, 3000, 4000, 5000, 6000]; // Updated milestone values

    milestones.forEach((milestone) => {
        // Calculate relative position on screen based on current altitude
        const relativeY = boardHeight - (milestone - altitude) * 2; // Adjust scale as needed

        // Only draw if the line would be visible on screen
        if (relativeY > 0 && relativeY < boardHeight) {
            // Draw dotted red line
            context.setLineDash([5, 5]); // Create dotted pattern
            context.strokeStyle = "rgba(255, 0, 0, 0.4)"; // Transparent red
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(0, relativeY);
            context.lineTo(boardWidth - 60, relativeY); // Don't overlap with milestone text
            context.stroke();
            context.setLineDash([]); // Reset line dash

            // Draw milestone level number on the right
            context.fillStyle = "rgba(255, 0, 0, 0.6)";
            context.font = "14px 'Indie Flower'";
            context.textAlign = "right";
            context.fillText(`${milestone}m`, boardWidth - 10, relativeY + 5);
        }
    });
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
        platformArray.forEach((platform) => {
            context.strokeStyle = "rgba(255, 255, 255, 0.3)";
            context.lineWidth = 1;
            context.strokeRect(
                platform.x,
                platform.y,
                platform.width,
                platform.height,
            );
        });
    }
}

// ========== GAME OBJECT UPDATES ==========

function updatePlatforms(difficulty) {
    const currentLevel = getCurrentDifficultyLevel();
    const isDarkMode = currentLevel >= 7;

    for (let i = platformArray.length - 1; i >= 0; i--) {
        let platform = platformArray[i];

        // Move platforms down when player goes up, but keep player visible
        if (velocityY < 0 && player.y < (boardHeight * 2) / 3) {
            // Changed from 3/4 to 2/3
            platform.y -= initialVelocityY;
        }

        if (detectCollision(player, platform) && velocityY >= 0) {
            // Check platform type
            if (platform.type === "gas" && difficulty.gasExplosions) {
                // Gas explosion ONLY when actually LANDING on platform (falling down with significant velocity)
                if (velocityY > 2) {
                    // Only explode when falling down with enough speed (actual landing)
                    createExplosion(platform.x, platform.y);
                    // Remove the exploded platform instead of keeping it
                    platformArray.splice(i, 1);
                    water -= 20;
                    if (water < 0) water = 0;

                    // Still allow player to jump after gas explosion
                    if (water > 0) {
                        velocityY = initialVelocityY; // Full jump height with water
                    } else {
                        velocityY = initialVelocityY * 0.7; // Reduced jump height without water
                    }
                    continue; // Skip to next platform since this one is removed
                }
                // Allow normal jumping from gas platform without penalty if just touching
                if (water > 0) {
                    velocityY = initialVelocityY; // Full jump height with water
                } else {
                    velocityY = initialVelocityY * 0.7; // Reduced jump height without water
                }
            } else if (platform.type === "broken") {
                // Broken platform disappears when hit
                platformArray.splice(i, 1);
                continue;
            } else if (platform.type !== "exploded") {
                // Jump height depends on water level
                if (water > 0) {
                    velocityY = initialVelocityY; // Full jump height with water
                } else {
                    velocityY = initialVelocityY * 0.7; // Reduced jump height without water
                }
            }
        }

        // Draw platform
        if (platform.img) {
            context.drawImage(
                platform.img,
                platform.x,
                platform.y,
                platform.width,
                platform.height,
            );
        }
    }

    // Keep player from going too high off screen
    if (player.y < 50) {
        // Move all platforms and objects down to keep player visible
        const pushDown = 50 - player.y;
        player.y = 50;

        platformArray.forEach((platform) => {
            platform.y += pushDown;
        });

        voteBoxArray.forEach((box) => {
            box.y += pushDown;
        });

        droneArray.forEach((drone) => {
            drone.y += pushDown;
        });

        bulletArray.forEach((bullet) => {
            bullet.y += pushDown;
        });

        explosionArray.forEach((explosion) => {
            explosion.y += pushDown;
        });
    }

    // Remove platforms that have gone off screen and add new ones
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform(difficulty);
    }

    // Always ensure there are enough platforms visible at the top
    while (
        platformArray.length > 0 &&
        platformArray[platformArray.length - 1].y > -50
    ) {
        newPlatform(difficulty);
    }
}

function updateVoteBoxes() {
    const currentLevel = getCurrentDifficultyLevel();
    const isDarkMode = currentLevel >= 7;

    for (let i = voteBoxArray.length - 1; i >= 0; i--) {
        let box = voteBoxArray[i];

        if (velocityY < 0 && player.y < (boardHeight * 2) / 3) {
            // Match platform movement
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

        // Draw vote box with appropriate image based on dark mode
        const voteBoxImg = isDarkMode
            ? images.dark_vote_box || images.vote_box
            : images.vote_box;
        context.drawImage(voteBoxImg, box.x, box.y, box.width, box.height);
    }
}

function updateDrones() {
    // Spawn new drones occasionally - much less frequently and one at a time
    if (Math.random() < 0.005) {
        // Reduced from 0.001 to 0.0005 for even less frequent spawning
        // Only spawn if there are fewer than 1 drone on screen
        if (droneArray.length < 3) {
            spawnDrone();
        }
    }

    const currentLevel = getCurrentDifficultyLevel();
    const isDarkMode = currentLevel >= 7;

    for (let i = droneArray.length - 1; i >= 0; i--) {
        let drone = droneArray[i];

        // Move drone
        drone.x += drone.velocityX;
        drone.y += drone.velocityY;

        // Drone shooting - 4-5 bullets over its lifetime
        if (drone.shotsRemaining > 0 && Math.random() < 0.02) {
            // Increased shooting frequency
            shootBullet(drone.x, drone.y);
            drone.shotsRemaining--;
        }

        // Update drone lifetime
        drone.lifetime--;

        // Remove drone after 15 seconds (assuming 60 FPS = 900 frames)
        if (
            drone.lifetime <= 0 ||
            drone.x < -50 ||
            drone.x > boardWidth + 50 ||
            drone.y > boardHeight + 50
        ) {
            droneArray.splice(i, 1);
            continue;
        }

        // Draw drone with appropriate image based on dark mode
        const droneImg = isDarkMode
            ? images.dark_drone || images.drone
            : images.drone;
        context.drawImage(
            droneImg,
            drone.x,
            drone.y,
            drone.width,
            drone.height,
        );
    }
}

function updateBullets() {
    const currentLevel = getCurrentDifficultyLevel();
    const isDarkMode = currentLevel >= 7;

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
        if (
            bullet.x < 0 ||
            bullet.x > boardWidth ||
            bullet.y < 0 ||
            bullet.y > boardHeight
        ) {
            bulletArray.splice(i, 1);
            continue;
        }

        // Draw bullet with appropriate image based on dark mode
        const bulletImg = isDarkMode
            ? images.dark_bullet || images.bullet
            : images.bullet;
        context.drawImage(
            bulletImg,
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height,
        );
    }
}

function updateExplosions() {
    const currentLevel = getCurrentDifficultyLevel();
    const isDarkMode = currentLevel >= 7;

    for (let i = explosionArray.length - 1; i >= 0; i--) {
        let explosion = explosionArray[i];

        explosion.timer--;

        if (explosion.timer <= 0) {
            explosionArray.splice(i, 1);
            continue;
        }

        // Draw explosion with reduced size and appropriate image based on dark mode
        const alpha = explosion.timer / 45; // Updated to match new timer duration
        context.globalAlpha = alpha;
        const explosionImg = isDarkMode
            ? images.dark_exploded_platform || images.exploded_platform
            : images.exploded_platform;
        context.drawImage(explosionImg, explosion.x, explosion.y, 60, 60); // Reduced from 80x80 to 60x60
        context.globalAlpha = 1;
    }
}

function createExplosion(x, y) {
    explosionArray.push({
        x: x - 20, // Increased offset for better centering
        y: y - 20,
        timer: 45, // Slightly longer duration for better visibility
    });
}

// ========== PLATFORM AND ENEMY SPAWNING ==========

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
    // Start with wider spacing (harder), decrease as altitude increases (easier)
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

function spawnDrone() {
    const side = Math.random() < 0.5 ? "left" : "right";
    droneArray.push({
        x: side === "left" ? -40 : boardWidth + 40,
        y: Math.random() * 200 + 50,
        width: 40,
        height: 30,
        velocityX: side === "left" ? 1 : -1,
        velocityY: Math.random() * 0.5 - 0.25,
        lifetime: 900, // 15 seconds at 60 FPS
        shotsRemaining: 4 + Math.floor(Math.random() * 2), // 4-5 shots
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
        velocityY: (dy / distance) * 3,
    });
}

// ========== GAME OVER SCREEN ==========

function drawGameOver() {
    // Draw special background
    let gameOverBg = images.game_over || images.doodlejumpbg;

    if (gameOverBg && gameOverBg.width) {
        context.drawImage(gameOverBg, 0, 0, boardWidth, boardHeight);
    } else {
        // Fallback gradient background
        const gradient = context.createLinearGradient(0, 0, 0, boardHeight);
        gradient.addColorStop(0, "#2c3e50");
        gradient.addColorStop(1, "#34495e");
        context.fillStyle = gradient;
        context.fillRect(0, 0, boardWidth, boardHeight);
    }

    // Semi-transparent overlay for better text readability
    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(0, 0, boardWidth, boardHeight);

    // Draw character at bottom left (large size)
    if (currentCharacter) {
        const charImg = images[currentCharacter + "_right"];

        if (charImg) {
            const charSize = 150; // Large character
            const charX = -10;
            const charY = boardHeight - charSize - 30;
            context.drawImage(charImg, charX, charY, charSize, charSize);
        }
    }

    // Main content area (avoiding character area)
    const contentStartX = boardWidth * 0.35; // Start after character
    const centerX = contentStartX + (boardWidth - contentStartX) / 2;

    // Game over title - different for level 7+
    context.textAlign = "center";

    // Draw "YOUR RECORD IS:" header using image
    if (images.record && images.record.width) {
        const recordImgWidth = 200;
        const recordImgHeight = 250;
        const recordX = centerX - recordImgWidth / 2 - 60;
        const recordY = boardHeight / 2 - 280;
        context.drawImage(
            images.record,
            recordX,
            recordY,
            recordImgWidth,
            recordImgHeight,
        );
    }

    // Draw score number inside the record box
    context.fillStyle = "#2c2c2c"; // Dark color for good contrast in the box
    context.font = "bold 32px 'Patrick Hand'"; // Large, bold font
    context.textAlign = "center";
    context.fillText(score, centerX - 60, 175);

    // Add level completion message below the record
    const gameLevel = getCurrentDifficultyLevel();
    let levelMessage = "";
    if (gameLevel >= 7) {
        levelMessage = "You reached the Gholleh! ";
    } else if (gameLevel >= 4) {
        levelMessage = "Close to Gholleh! ";
    } else {
        levelMessage = "Far from Gholleh! ";
    }

    context.fillStyle = "#FFD700"; // Yellow color
    context.font = "bold 32px 'Patrick Hand'";
    context.textAlign = "center";
    context.fillText(levelMessage, centerX - 60, 250);

    // Height record with special formatting for level 7+

    // Action buttons using your custom images
    const buttonY = boardHeight / 2 + 60;
    const buttonWidth = 120;
    const buttonHeight = 60;
    const buttonGap = 20;

    // Calculate button positions
    const totalButtonWidth = buttonWidth * 3 + buttonGap * 2;
    const startX = centerX - totalButtonWidth / 2;

    // Restart button
    const restartButton = {
        x: startX,
        y: buttonY - 25,
        width: buttonWidth,
        height: 90,
    };

    // Share on X button
    const shareButton = {
        x: startX + buttonWidth + buttonGap + 10,
        y: buttonY + 30,
        width: buttonWidth,
        height: 90,
    };

    // Save image button
    const saveButton = {
        x: centerX - 100,
        y: buttonY + 120,
        width: buttonWidth,
        height: 80,
    };

    // Store button positions for click detection
    gameOverButtons = { restartButton, shareButton, saveButton };

    // Draw buttons using your custom images
    if (images.restart && images.restart.width) {
        context.drawImage(
            images.restart,
            restartButton.x,
            restartButton.y,
            restartButton.width,
            restartButton.height,
        );
    }

    if (images.share_X && images.share_X.width) {
        context.drawImage(
            images.share_X,
            shareButton.x,
            shareButton.y,
            shareButton.width,
            shareButton.height,
        );
    }

    if (images.Save_Image && images.Save_Image.width) {
        context.drawImage(
            images.Save_Image,
            saveButton.x,
            saveButton.y,
            saveButton.width,
            saveButton.height,
        );
    }
}

// Helper function to check if point is inside button
function isPointInButton(x, y, button) {
    return (
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height
    );
}

// Modified drawGameOver function to handle button clicks
function handleGameOverClick(e) {
    if (!gameOver || !gameOverButtons) return;

    const rect = board.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (boardWidth / rect.width);
    const y = (e.clientY - rect.top) * (boardHeight / rect.height);

    // Check which button was clicked
    if (isPointInButton(x, y, gameOverButtons.restartButton)) {
        resetGame();
    } else if (isPointInButton(x, y, gameOverButtons.shareButton)) {
        shareOnTwitter();
    } else if (isPointInButton(x, y, gameOverButtons.saveButton)) {
        saveGameOverImage();
    }
}

// ========== SOCIAL SHARING FUNCTIONS ==========

// Share on Twitter/X functionality
function shareOnTwitter() {
    // Create a high-resolution square canvas for the share image
    const shareCanvas = document.createElement("canvas");
    const canvasSize = 720; // High resolution square (1080x1080)
    shareCanvas.width = canvasSize;
    shareCanvas.height = canvasSize;
    const shareContext = shareCanvas.getContext("2d");

    // Enable high-quality rendering
    shareContext.imageSmoothingEnabled = true;
    shareContext.imageSmoothingQuality = "high";

    // Draw the cropped square share image
    drawSquareShareImage(shareContext, canvasSize);

    // Convert canvas to blob with high quality
    shareCanvas.toBlob(
        function (blob) {
            // Create share text with game link
            const shareLevel = getCurrentDifficultyLevel();
            let achievementText = "";
            if (shareLevel >= 7) {
                achievementText = "reached the Gholleh! ";
            } else if (shareLevel >= 4) {
                achievementText = "got close to Gholleh! ";
            } else {
                achievementText = "started the climb! ";
            }

            const shareText = `🎮 I just ${achievementText} Score: ${score} - Play Peak Climb at ${window.location.href}`;

            // Try native share API first (works on mobile)
            if (navigator.share && navigator.canShare) {
                const shareData = {
                    title: "Peak Climb Challenge",
                    text: shareText,
                };

                // Add image if supported
                if (
                    blob &&
                    navigator.canShare({
                        files: [
                            new File([blob], "peak-climb-score.png", {
                                type: "image/png",
                            }),
                        ],
                    })
                ) {
                    shareData.files = [
                        new File([blob], "peak-climb-score.png", {
                            type: "image/png",
                        }),
                    ];
                }

                navigator.share(shareData).catch((err) => {
                    console.log("Share cancelled or failed:", err);
                    fallbackTwitterShare(shareText, blob);
                });
            } else {
                // Fallback for desktop
                fallbackTwitterShare(shareText, blob);
            }
        },
        "image/png",
        1.0,
    ); // Maximum quality
}

// Fallback Twitter share for desktop
function fallbackTwitterShare(text, imageBlob) {
    // Encode the text for URL
    const encodedText = encodeURIComponent(text + " " + window.location.href);

    // Open Twitter intent URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

    // If we have an image blob, also download it for manual attachment
    if (imageBlob) {
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "peak-climb-score.png";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show instructions
        alert(
            "📸 Image downloaded! Upload it to your tweet.\n\n🐦 Opening Twitter...",
        );
    }

    // Open Twitter
    window.open(twitterUrl, "_blank", "width=600,height=400");
}

// Save game over image (without buttons)
function saveGameOverImage() {
    // Create a high-resolution square canvas for the saved image
    const saveCanvas = document.createElement("canvas");
    const canvasSize = 1080; // High resolution square (1080x1080)
    saveCanvas.width = canvasSize;
    saveCanvas.height = canvasSize;
    const saveContext = saveCanvas.getContext("2d");

    // Enable high-quality rendering
    saveContext.imageSmoothingEnabled = true;
    saveContext.imageSmoothingQuality = "high";

    // Draw the square save image (same as share but with "SAVED" watermark)
    drawSquareSaveImage(saveContext, canvasSize);

    // Convert to blob and download with high quality
    saveCanvas.toBlob(
        function (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `peak-climb-score-${score}-${new Date().getTime()}.png`;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Show success message
            console.log("Game over image saved successfully!");
        },
        "image/png",
        1.0,
    ); // Maximum quality
}

// Draw square share image for social media
function drawSquareShareImage(ctx, canvasSize) {
    const shareCurrentLevel = getCurrentDifficultyLevel();

    // Use game_over background as base
    let gameOverBg = images.game_over;

    if (gameOverBg && gameOverBg.width) {
        // Draw cropped top portion of game_over.png as square
        const sourceSize = Math.min(gameOverBg.width, gameOverBg.height);
        ctx.drawImage(
            gameOverBg,
            0,
            0,
            sourceSize,
            sourceSize,
            0,
            0,
            canvasSize,
            canvasSize,
        );
    } else {
        // Fallback gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasSize);
        gradient.addColorStop(0, "#2c3e50");
        gradient.addColorStop(1, "#34495e");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    // Semi-transparent overlay for better text contrast
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw character at bottom left corner (smaller than in game over screen)
    if (currentCharacter) {
        const charImg = images[currentCharacter + "_right"];

        if (charImg) {
            const charSize = canvasSize * 0.4; // 15% of canvas size
            const charX = canvasSize * 0.05; // 5% margin from left
            const charY = canvasSize - charSize - canvasSize * 0.05; // 5% margin from bottom
            ctx.drawImage(charImg, charX, charY, charSize, charSize);
        }
    }

    // Draw record/score info in center
    if (images.record && images.record.width) {
        const recordSize = canvasSize * 0.4; // 40% of canvas size
        const recordX = (canvasSize - recordSize) / 2;
        const recordY = canvasSize * 0.17; // 15% from top
        ctx.drawImage(images.record, recordX, recordY, recordSize, recordSize);
    }

    // Draw score in center
    ctx.fillStyle = "#2c2c2c";
    ctx.font = `bold ${canvasSize * 0.06}px 'Patrick Hand'`; // 6% of canvas size
    ctx.textAlign = "center";
    ctx.fillText(score, canvasSize / 2, canvasSize * 0.45); // 45% from top

    // Add level completion message
    let levelMessage = "";
    if (shareCurrentLevel >= 7) {
        levelMessage = "Reached the Gholleh!";
    } else if (shareCurrentLevel >= 4) {
        levelMessage = "Close to Gholleh!";
    } else {
        levelMessage = "Far from Gholleh!";
    }

    ctx.fillStyle = "#FFD700"; // Yellow color
    ctx.font = `bold ${canvasSize * 0.06}px 'Patrick Hand'`; // 4% of canvas size
    ctx.textAlign = "center";
    ctx.fillText(levelMessage, canvasSize / 2, canvasSize * 0.55); // 52% from top

    // Add game title at bottom
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = `bold ${canvasSize * 0.045}px 'Patrick Hand'`; // 4.5% of canvas size
    ctx.textAlign = "center";
    ctx.fillText("Peak Climb Challenge", canvasSize / 2, canvasSize * 0.92); // 92% from top
}

// Draw square save image (same as share but with watermark)
function drawSquareSaveImage(ctx, canvasSize) {
    // Draw the same content as share image
    drawSquareShareImage(ctx, canvasSize);
}

// ========== GAME CONTROLS ==========

function setupGameControls() {
    console.log("Setting up game controls");

    // Remove existing event listeners without cloning
    board.removeEventListener("touchstart", handleMenuTouch);
    board.removeEventListener("touchend", handleMenuTouchEnd);
    board.removeEventListener("click", handleMenuClick);
    board.removeEventListener("touchmove", preventDefault);
    document.removeEventListener("keydown", handleMenuKeyboard);

    // Add game-specific event listeners
    board.addEventListener("touchstart", handleGameTouch, { passive: false });
    board.addEventListener("touchend", handleGameTouchEnd, { passive: false });
    board.addEventListener("click", handleGameClick, { passive: false });
    board.addEventListener(
        "touchmove",
        function (e) {
            e.preventDefault();
        },
        { passive: false },
    );

    // Add keyboard controls
    document.addEventListener("keydown", handleGameKeyboard, {
        passive: false,
    });
    document.addEventListener("keyup", handleGameKeyboardUp, {
        passive: false,
    });
}

function handleGameTouch(e) {
    e.preventDefault();
    console.log("Game touch detected");

    if (gameState === "playing" && gameOver) {
        // Convert touch to click event for consistency
        const touch = e.touches[0];
        const clickEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {},
        };
        handleGameOverClick(clickEvent);
        return;
    }

    const touch = e.touches[0];
    const rect = board.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (boardWidth / rect.width);
    const y = (touch.clientY - rect.top) * (boardHeight / rect.height);

    if (gameState === "playing") {
        if (x < boardWidth / 2) {
            moveLeft();
        } else {
            moveRight();
        }
    }
}

function handleGameTouchEnd(e) {
    e.preventDefault();
    velocityX = 0;
}

function handleGameClick(e) {
    e.preventDefault();
    console.log("Game click detected");

    if (gameState === "playing" && gameOver) {
        // Handle game over clicks
        handleGameOverClick(e);
        return;
    }

    const rect = board.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (boardWidth / rect.width);
    const y = (e.clientY - rect.top) * (boardHeight / rect.height);

    if (gameState === "playing") {
        if (x < boardWidth / 2) {
            moveLeft();
        } else {
            moveRight();
        }
    }
}

// Game keyboard controls
function handleGameKeyboard(e) {
    if (gameState === "playing") {
        if (e.code == "ArrowLeft" || e.code == "KeyA") {
            moveLeft();
        } else if (e.code == "ArrowRight" || e.code == "KeyD") {
            moveRight();
        } else if (e.code == "Space" && gameOver) {
            resetGame();
        }
    }
}

function handleGameKeyboardUp(e) {
    if (gameState === "playing") {
        if (
            e.code == "ArrowLeft" ||
            e.code == "KeyA" ||
            e.code == "ArrowRight" ||
            e.code == "KeyD"
        ) {
            velocityX = 0;
        }
    }
}

// Share functionality
function shareScore() {
    const text = `I climbed ${altitude}m and reached Gholleh! Score: ${score}`;
    if (navigator.share) {
        navigator.share({
            title: "Peak Climb Challenge",
            text: text,
            url: window.location.href,
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert("Score copied to clipboard!");
        });
    }
}