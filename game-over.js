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
        const recordX = centerX - recordImgWidth / 2;
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
    context.fillText(score, centerX, recordY + 150); // Adjusted to align within the record box

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
    context.fillText(levelMessage, centerX, recordY + 200); // Positioned below the record header

    // Action buttons using your custom images
    const buttonY = boardHeight / 2 + 120; // Moved up to fit within canvas
    const buttonWidth = 120;
    const buttonHeight = 90;
    const buttonGap = 20;

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