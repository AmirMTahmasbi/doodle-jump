// game-objects.js - Game Object Updates and Management

// ========== PLATFORM MANAGEMENT ==========
function updatePlatforms(difficulty) {
    const currentLevel = getCurrentDifficultyLevel();
    const isDarkMode = currentLevel >= 7;

    for (let i = platformArray.length - 1; i >= 0; i--) {
        let platform = platformArray[i];

        // UPDATE MOVING PLATFORMS FIRST
        if (platform.type === "moving") {
            // Simple horizontal movement
            if (platform.movementType === "horizontal") {
                platform.x += platform.speed * platform.direction;

                // Bounce off boundaries
                if (platform.x <= platform.minX || platform.x >= platform.maxX) {
                    platform.direction *= -1;
                }
            }
            // Simple bounce movement
            else if (platform.movementType === "bounce") {
                platform.bounceOffset += platform.bounceSpeed * platform.speed;
                platform.y = platform.originalY + Math.sin(platform.bounceOffset) * platform.bounceHeight;
            }
        }

        // Move platforms down when player goes up, but keep player visible
        if (velocityY < 0 && player.y < (boardHeight * 2) / 3) {
            platform.y -= initialVelocityY;

            // Update moving platform original positions when screen scrolls
            if (platform.type === "moving") {
                platform.originalY -= initialVelocityY;
            }
        }

        if (detectCollision(player, platform) && velocityY >= 0) {
            // Check platform type
            if (platform.type === "gas" && difficulty.gasExplosions) {
                if (velocityY > 2) {
                    createExplosion(platform.x, platform.y);
                    platformArray.splice(i, 1);
                    water -= 20;
                    if (water < 0) water = 0;

                    if (water > 0) {
                        velocityY = initialVelocityY;
                    } else {
                        velocityY = initialVelocityY * 0.7;
                    }
                    continue;
                }
                if (water > 0) {
                    velocityY = initialVelocityY;
                } else {
                    velocityY = initialVelocityY * 0.7;
                }
            } else if (platform.type === "broken") {
                platformArray.splice(i, 1);
                continue;
            } else if (platform.type !== "exploded") {
                // Normal jump for all platforms including moving
                if (water > 0) {
                    velocityY = initialVelocityY;
                } else {
                    velocityY = initialVelocityY * 0.7;
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

    // FIXED: Keep player centered in screen (improved camera following)
    const targetPlayerY = boardHeight * 0.4; // Keep player at 40% from top (better than fixed 50px)
    
    if (player.y < targetPlayerY) {
        // Calculate how much to push everything down to center the player
        const pushDown = targetPlayerY - player.y;
        player.y = targetPlayerY;

        platformArray.forEach((platform) => {
            platform.y += pushDown;

            // Update moving platform original positions
            if (platform.type === "moving") {
                platform.originalY += pushDown;
            }
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

    // Calculate dynamic spacing
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

    console.log(
        `Creating new platform - Level: ${currentLevel}, Dark Mode: ${isDarkMode}, Gap: ${platformGap}, Altitude: ${altitude}`,
    );

    // CHECK FOR MOVING PLATFORM FIRST - START AT 50m FOR TESTING
    if (altitude > 50 && Math.random() < 0.3) { // 30% chance after 50m for testing
        console.log("🔄 ATTEMPTING TO CREATE MOVING PLATFORM");

        // Simple movement types for testing
        const movementTypes = ['horizontal', 'bounce'];
        const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];

        // Create moving platform manually since createMovingPlatform might not exist
        const movingPlatform = {
            img: isDarkMode ? (images.dark_platform || images.platform) : images.platform,
            x: randomX,
            y: platformArray[platformArray.length - 1].y - platformGap,
            width: platformWidth,
            height: platformHeight,
            type: "moving",

            // Movement properties
            movementType: movementType,
            originalX: randomX,
            originalY: platformArray[platformArray.length - 1].y - platformGap,
            speed: 0.3 + Math.random() * 0.4, // SLOWER: 0.3-0.7 instead of 1-3
            direction: Math.random() < 0.5 ? 1 : -1,

            // Movement bounds
            minX: Math.max(0, randomX - 100),
            maxX: Math.min(boardWidth - platformWidth, randomX + 100),

            // For bounce movement
            bounceHeight: 15, // SMALLER bounce: 15 instead of 30
            bounceSpeed: 0.05, // SLOWER bounce: 0.05 instead of 0.1
            bounceOffset: Math.random() * Math.PI * 2
        };

        platformArray.push(movingPlatform);
        console.log("✅ CREATED MOVING PLATFORM:", movingPlatform.movementType, "at altitude", altitude);
        return; // Exit early, don't create regular platform
    }

    // Regular platform creation logic (existing code)
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

    if (!platformImg) {
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

    // Vote boxes
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

// ========== VOTE BOX MANAGEMENT ==========

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

// ========== DRONE MANAGEMENT ==========

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

// ========== BULLET MANAGEMENT ==========

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