// game-over.js - Game Over Screen and Social Sharing

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

    // Draw character at bottom left (large size, scaled)
    if (currentCharacter) {
        const charImg = images[currentCharacter + "_right"];
        if (charImg) {
            const charSize = boardHeight * 0.167; // 1/6th of height, roughly 150px at 900px height
            const charX = -boardWidth * 0.022; // ~10px margin at 450px width
            const charY = boardHeight - charSize - boardHeight * 0.033; // ~30px margin
            context.drawImage(charImg, charX, charY, charSize, charSize);
        }
    }

    // Main content area (avoiding character area)
    const contentStartX = boardWidth * 0.35; // 35% from left, after character
    const centerX = contentStartX + (boardWidth - contentStartX) / 2;

    // Game over title - different for level 7+
    context.textAlign = "center";

    // Draw "YOUR RECORD IS:" header using image
    if (images.record && images.record.width) {
        const recordImgWidth = boardWidth * 0.444; // ~200px at 450px width
        const recordImgHeight = boardHeight * 0.278; // ~250px at 900px height
        const recordX = centerX - recordImgWidth / 2 - 80;
        const recordY = boardHeight * 0.13; // ~280px from top at 900px height
        context.drawImage(images.record, recordX, recordY, recordImgWidth, recordImgHeight);
    }

    // Draw score number inside the record box
    context.fillStyle = "#2c2c2c";
    context.font = `bold ${boardHeight * 0.036}px 'Patrick Hand'`; // ~32px at 900px height
    context.textAlign = "center";
    context.fillText(score, centerX- boardWidth * 0.444 / 2 - 120, boardHeight * 0.13 + boardHeight * 0.4); // ~150px down, centered in box

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

    context.fillStyle = "#FFD700";
    context.font = `bold ${boardHeight * 0.036}px 'Patrick Hand'`;
    context.textAlign = "center";
    context.fillText(levelMessage, centerX, recordY + boardHeight * 0.222); // ~200px down, below record

    // Action buttons using your custom images
    const buttonY = boardHeight * 0.667; // ~600px at 900px height, middle-lower part
    const buttonWidth = boardWidth * 0.267; // ~120px at 450px width
    const buttonHeight = boardHeight * 0.1; // ~90px at 900px height
    const buttonGap = boardWidth * 0.044; // ~20px at 450px width

    // Calculate button positions
    const totalButtonWidth = buttonWidth * 3 + buttonGap * 2;
    const startX = centerX - totalButtonWidth / 2;

    // Restart button
    const restartButton = {
        x: startX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
    };

    // Share on X button
    const shareButton = {
        x: startX + buttonWidth + buttonGap,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
    };

    // Save image button
    const saveButton = {
        x: startX + (buttonWidth + buttonGap) * 2,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
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
    const canvasSize = 720; // High resolution square
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

            if (navigator.share && navigator.canShare) {
                const shareData = { title: "Peak Climb Challenge", text: shareText };
                if (blob && navigator.canShare({ files: [new File([blob], "peak-climb-score.png", { type: "image/png" })] })) {
                    shareData.files = [new File([blob], "peak-climb-score.png", { type: "image/png" })];
                }
                navigator.share(shareData).catch((err) => {
                    console.log("Share cancelled or failed:", err);
                    fallbackTwitterShare(shareText, blob);
                });
            } else {
                fallbackTwitterShare(shareText, blob);
            }
        },
        "image/png",
        1.0,
    );
}

// Fallback Twitter share for desktop
function fallbackTwitterShare(text, imageBlob) {
    const encodedText = encodeURIComponent(text + " " + window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

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
        alert("📸 Image downloaded! Upload it to your tweet.\n\n🐦 Opening Twitter...");
    }

    window.open(twitterUrl, "_blank", "width=600,height=400");
}

// Save game over image (without buttons)
function saveGameOverImage() {
    const saveCanvas = document.createElement("canvas");
    const canvasSize = 1080; // High resolution square
    saveCanvas.width = canvasSize;
    saveCanvas.height = canvasSize;
    const saveContext = saveCanvas.getContext("2d");

    saveContext.imageSmoothingEnabled = true;
    saveContext.imageSmoothingQuality = "high";

    drawSquareSaveImage(saveContext, canvasSize);

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
            console.log("Game over image saved successfully!");
        },
        "image/png",
        1.0,
    );
}

// Draw square share image for social media
function drawSquareShareImage(ctx, canvasSize) {
    const shareCurrentLevel = getCurrentDifficultyLevel();

    let gameOverBg = images.game_over;
    if (gameOverBg && gameOverBg.width) {
        const sourceSize = Math.min(gameOverBg.width, gameOverBg.height);
        ctx.drawImage(gameOverBg, 0, 0, sourceSize, sourceSize, 0, 0, canvasSize, canvasSize);
    } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasSize);
        gradient.addColorStop(0, "#2c3e50");
        gradient.addColorStop(1, "#34495e");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    if (currentCharacter) {
        const charImg = images[currentCharacter + "_right"];
        if (charImg) {
            const charSize = canvasSize * 0.4;
            const charX = canvasSize * 0.05;
            const charY = canvasSize - charSize - canvasSize * 0.05;
            ctx.drawImage(charImg, charX, charY, charSize, charSize);
        }
    }

    if (images.record && images.record.width) {
        const recordSize = canvasSize * 0.4;
        const recordX = (canvasSize - recordSize) / 2;
        const recordY = canvasSize * 0.17;
        ctx.drawImage(images.record, recordX, recordY, recordSize, recordSize);
    }

    ctx.fillStyle = "#2c2c2c";
    ctx.font = `bold ${canvasSize * 0.06}px 'Patrick Hand'`;
    ctx.textAlign = "center";
    ctx.fillText(score, canvasSize / 2, canvasSize * 0.45);

    let levelMessage = "";
    if (shareCurrentLevel >= 7) {
        levelMessage = "Reached the Gholleh!";
    } else if (shareCurrentLevel >= 4) {
        levelMessage = "Close to Gholleh!";
    } else {
        levelMessage = "Far from Gholleh!";
    }

    ctx.fillStyle = "#FFD700";
    ctx.font = `bold ${canvasSize * 0.06}px 'Patrick Hand'`;
    ctx.textAlign = "center";
    ctx.fillText(levelMessage, canvasSize / 2, canvasSize * 0.55);

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = `bold ${canvasSize * 0.045}px 'Patrick Hand'`;
    ctx.textAlign = "center";
    ctx.fillText("Peak Climb Challenge", canvasSize / 2, canvasSize * 0.92);
}

// Draw square save image (same as share but with watermark)
function drawSquareSaveImage(ctx, canvasSize) {
    drawSquareShareImage(ctx, canvasSize);
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
        navigator.clipboard.writeText(text).then(() => {
            alert("Score copied to clipboard!");
        });
    }
}