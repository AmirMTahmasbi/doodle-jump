// rendering.js - Drawing Functions and Visual Effects

// ========== BACKGROUND AND ENVIRONMENT ==========

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

// ========== UI DRAWING ==========

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

    // Water label - use water.png instead of emoji
    if (images.water && images.water.width) {
        context.drawImage(images.water, 15, barY - 15, 16, 16); // Small icon above bar
    } else {
        // Fallback to emoji if image not found
        context.fillStyle = "#1e3a8a";
        context.font = "12px 'Indie Flower'";
        context.textAlign = "left";
        context.fillText("💧", 15, barY - 3);
    }

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

    // Electricity label - use elec.png instead of emoji
    const visibleSegments = electricitySegments.filter((seg) => seg.visible);
    if (visibleSegments.length > 0) {
        if (images.elec && images.elec.width) {
            context.drawImage(images.elec, boardWidth - 30, 5, 16, 16); // Small icon at top right
        } else {
            // Fallback to emoji if image not found
            context.fillStyle = "#7f1d1d";
            context.font = "12px 'Indie Flower'";
            context.textAlign = "right";
            context.fillText("⚡", boardWidth - 15, 12);
        }
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

// ========== EXPLOSIONS ==========

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