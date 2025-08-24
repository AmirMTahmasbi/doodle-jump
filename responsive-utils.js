// responsive-utils.js - Complete Responsive Design Utilities

// Responsive scaling utilities
const ResponsiveUtils = {
    // Get scale factor based on screen size
    getScaleFactor() {
        const baseWidth = 450; // Your original design width
        const baseHeight = 900; // Your original design height
        
        // Calculate scale based on the smaller dimension to ensure everything fits
        const scaleX = boardWidth / baseWidth;
        const scaleY = boardHeight / baseHeight;
        
        // Use the smaller scale to ensure everything fits on screen
        return Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x for very large screens
    },
    
    // Scale a value based on screen size
    scale(value) {
        return value * this.getScaleFactor();
    },
    
    // Get responsive font size
    getFontSize(baseSize) {
        const scaleFactor = this.getScaleFactor();
        return Math.max(12, baseSize * scaleFactor); // Minimum 12px
    },
    
    // Get safe area margins (for notched phones)
    getSafeAreaMargins() {
        // Simple safe area detection
        const isIPhoneX = /iPhone|iPad|iPod|iOS/.test(navigator.userAgent) && window.screen.height >= 812;
        const isAndroidNotch = window.screen.height >= 800 && window.devicePixelRatio >= 2;
        
        // Use CSS env() values if available, otherwise fallback
        const safeAreaTop = this.getCSSEnvValue('safe-area-inset-top') || (isIPhoneX ? 44 : 20);
        const safeAreaBottom = this.getCSSEnvValue('safe-area-inset-bottom') || (isIPhoneX ? 34 : 20);
        
        return {
            top: safeAreaTop,
            bottom: safeAreaBottom,
            left: this.getCSSEnvValue('safe-area-inset-left') || 20,
            right: this.getCSSEnvValue('safe-area-inset-right') || 20
        };
    },
    
    // Helper to get CSS env() values
    getCSSEnvValue(property) {
        if (typeof CSS !== 'undefined' && CSS.supports) {
            try {
                const testElement = document.createElement('div');
                testElement.style.setProperty('--test', `env(${property})`);
                const value = getComputedStyle(testElement).getPropertyValue('--test');
                return value ? parseInt(value) : null;
            } catch (e) {
                return null;
            }
        }
        return null;
    },
    
    // Check if device is in landscape mode
    isLandscape() {
        return boardWidth > boardHeight;
    },
    
    // Get responsive button size
    getButtonSize(baseWidth, baseHeight) {
        const scale = this.getScaleFactor();
        return {
            width: Math.max(100, baseWidth * scale), // Minimum width
            height: Math.max(40, baseHeight * scale)  // Minimum height
        };
    },
    
    // Get responsive touch area (larger than visual element for easier tapping)
    getTouchArea(visualSize) {
        const minTouchSize = 44; // iOS HIG recommended minimum
        return Math.max(minTouchSize, visualSize * 1.2);
    }
};

// Override existing functions with responsive versions
if (typeof drawCharacterSelection === 'function') {
    const originalDrawCharacterSelection = drawCharacterSelection;
    
    drawCharacterSelection = function() {
        console.log("Drawing responsive character selection screen");

        // Clear the canvas properly
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, board.width, board.height);
        context.restore();

        // Draw background
        if (images.doodlejumpbg && images.doodlejumpbg.width) {
            context.drawImage(images.doodlejumpbg, 0, 0, boardWidth, boardHeight);
        } else {
            // Fallback background
            context.fillStyle = "#f4f1e8";
            context.fillRect(0, 0, boardWidth, boardHeight);
        }

        const safeArea = ResponsiveUtils.getSafeAreaMargins();
        const scale = ResponsiveUtils.getScaleFactor();

        // Game Title - responsive positioning
        context.save();
        const titleX = boardWidth - ResponsiveUtils.scale(130) - safeArea.right;
        const titleY = ResponsiveUtils.scale(80) + safeArea.top;
        
        context.translate(titleX, titleY);
        context.rotate(Math.PI / 12);
        context.fillStyle = "#cc0000";
        context.font = `bold ${ResponsiveUtils.getFontSize(38)}px 'Patrick Hand'`;
        context.textAlign = "center";
        context.fillText("doodle jump", 0, 0);

        // Subtitle
        context.fillStyle = "#666";
        context.font = `${ResponsiveUtils.getFontSize(32)}px 'Patrick Hand'`;
        context.fillText("the gholle edition", 0, ResponsiveUtils.scale(40));
        context.restore();

        // Quote - responsive positioning
        context.save();
        context.translate(boardWidth/2, ResponsiveUtils.scale(160) + safeArea.top);
        context.rotate(Math.PI / 12);
        context.font = `${ResponsiveUtils.getFontSize(20)}px 'Indie Flower'`;
        context.fillStyle = "#333";
        context.textAlign = "center";
        context.fillText('"we are close to the gholleh,', 0, 0);
        context.fillText('Fatigue is prohibited!"', 0, ResponsiveUtils.scale(25));
        context.restore();

        // Characters - responsive positioning
        const charSize = ResponsiveUtils.scale(120);
        const positions = getResponsiveCharacterPositions();

        characters.forEach((char, index) => {
            const pos = positions[index];

            // Character image with responsive sizing
            if (images[char.id + '_right']) {
                if (selectedCharacter === char.id) {
                    context.save();
                    context.shadowColor = "#ffff00";
                    context.shadowBlur = ResponsiveUtils.scale(25);
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
                context.font = `${ResponsiveUtils.getFontSize(18)}px 'Indie Flower'`;
                context.textAlign = "center";
                context.fillText(char.id, pos.x, pos.y);
            }
        });

        // Start button - responsive
        if (selectedCharacter) {
            drawResponsiveStartButton();
        }

        // Instructions - responsive
        if (!selectedCharacter) {
            context.fillStyle = "#666";
            context.font = `${ResponsiveUtils.getFontSize(18)}px 'Indie Flower'`;
            context.textAlign = "center";
            context.fillText("Tap a character to select", boardWidth/2, 
                           boardHeight - safeArea.bottom - ResponsiveUtils.scale(40));
        }
    };
}

// Get responsive character positions
function getResponsiveCharacterPositions() {
    const safeArea = ResponsiveUtils.getSafeAreaMargins();
    const centerY = boardHeight / 2;
    const spacing = ResponsiveUtils.scale(150);
    
    if (ResponsiveUtils.isLandscape()) {
        // Landscape layout - spread horizontally
        return [
            { x: boardWidth * 0.2, y: centerY - spacing/2 },           // Akhoond
            { x: boardWidth * 0.5, y: centerY },                       // Reform  
            { x: boardWidth * 0.8, y: centerY + spacing/2 }            // Lamizzade
        ];
    } else {
        // Portrait layout - your original layout but responsive
        return [
            { x: boardWidth/3, y: centerY - spacing/2 + safeArea.top },      // Akhoond
            { x: boardWidth/3, y: centerY + spacing/2 },                     // Reform
            { x: (boardWidth * 2)/3, y: centerY }                            // Lamizzade
        ];
    }
}

// Draw responsive start button
function drawResponsiveStartButton() {
    const safeArea = ResponsiveUtils.getSafeAreaMargins();
    const buttonSize = ResponsiveUtils.getButtonSize(250, 60);
    const buttonY = boardHeight - safeArea.bottom - ResponsiveUtils.scale(80);

    // Start button background
    context.fillStyle = "#4CAF50";
    const cornerRadius = ResponsiveUtils.scale(30);
    roundRect(context, boardWidth/2 - buttonSize.width/2, buttonY - buttonSize.height/2, 
              buttonSize.width, buttonSize.height, cornerRadius);
    context.fill();

    // Button border
    context.strokeStyle = "#333";
    context.lineWidth = ResponsiveUtils.scale(3);
    context.stroke();

    // Button text
    context.fillStyle = "#fff";
    context.font = `bold ${ResponsiveUtils.getFontSize(28)}px 'Patrick Hand'`;
    context.textAlign = "center";
    context.fillText("START CLIMBING!", boardWidth/2, buttonY + ResponsiveUtils.scale(10));
}

// Override selectCharacter function for responsive touch areas
if (typeof selectCharacter === 'function') {
    const originalSelectCharacter = selectCharacter;
    
    selectCharacter = function(x, y) {
        if (gameState !== 'character-select') return;

        const charSize = ResponsiveUtils.scale(120);
        const positions = getResponsiveCharacterPositions();
        const safeArea = ResponsiveUtils.getSafeAreaMargins();

        console.log(`Menu click at: ${x}, ${y}`);

        // Check character selection with responsive touch areas
        characters.forEach((char, index) => {
            const pos = positions[index];
            const distance = Math.sqrt((x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y));
            const touchRadius = ResponsiveUtils.getTouchArea(charSize/2);

            if (distance <= touchRadius) {
                selectedCharacter = char.id;
                console.log(`Selected character: ${char.id}`);
                drawCharacterSelection();
                return;
            }
        });

        // Check start button with responsive dimensions
        if (selectedCharacter) {
            const buttonSize = ResponsiveUtils.getButtonSize(250, 60);
            const buttonY = boardHeight - safeArea.bottom - ResponsiveUtils.scale(80);

            if (x >= boardWidth/2 - buttonSize.width/2 && x <= boardWidth/2 + buttonSize.width/2 && 
                y >= buttonY - buttonSize.height/2 && y <= buttonY + buttonSize.height/2) {
                console.log('Starting game with character:', selectedCharacter);
                if (typeof startGameFromMenu === 'function') {
                    startGameFromMenu();
                } else if (typeof startGame === 'function') {
                    startGame();
                }
            }
        }
    };
}

// Override drawUI function for responsive UI
if (typeof drawUI === 'function') {
    const originalDrawUI = drawUI;
    
    drawUI = function(difficulty) {
        const safeArea = ResponsiveUtils.getSafeAreaMargins();
        const scale = ResponsiveUtils.getScaleFactor();

        // Responsive bar dimensions
        const barWidth = ResponsiveUtils.scale(80);
        const barHeight = ResponsiveUtils.scale(12);
        const barY = safeArea.top + ResponsiveUtils.scale(15);

        // Water bar - responsive positioning
        context.fillStyle = "rgba(30, 58, 138, 0.3)";
        context.fillRect(safeArea.left + ResponsiveUtils.scale(15), barY, barWidth, barHeight);

        context.fillStyle = "#3b82f6";
        const waterWidth = (water / 100) * barWidth;
        context.fillRect(safeArea.left + ResponsiveUtils.scale(15), barY, waterWidth, barHeight);

        context.strokeStyle = "#1e3a8a";
        context.lineWidth = ResponsiveUtils.scale(2);
        context.strokeRect(safeArea.left + ResponsiveUtils.scale(15), barY, barWidth, barHeight);

        // Water icon - responsive
        if (images.water && images.water.width) {
            const iconSize = ResponsiveUtils.scale(16);
            context.drawImage(images.water, safeArea.left + ResponsiveUtils.scale(15), 
                             barY - iconSize - ResponsiveUtils.scale(5), iconSize, iconSize);
        } else {
            context.fillStyle = "#1e3a8a";
            context.font = `${ResponsiveUtils.getFontSize(12)}px 'Indie Flower'`;
            context.textAlign = "left";
            context.fillText("💧", safeArea.left + ResponsiveUtils.scale(15), barY - ResponsiveUtils.scale(3));
        }

        // Electricity bar - responsive (only show if not dark mode)
        const currentLevel = getCurrentDifficultyLevel();
        if (currentLevel < 7) {
            drawResponsiveElectricityBar();
        }

        // Score - responsive positioning and font size
        context.fillStyle = "black";
        context.font = `bold ${ResponsiveUtils.getFontSize(24)}px 'Patrick Hand'`;
        context.textAlign = "center";
        context.fillText(score, boardWidth / 2, safeArea.top + ResponsiveUtils.scale(30));

        // Draw altitude milestones
        drawAltitudeMilestones();

        // Difficulty level - responsive bottom positioning
        context.fillStyle = "black";
        context.font = `bold ${ResponsiveUtils.getFontSize(14)}px 'Indie Flower'`;
        context.textAlign = "center";
        context.fillText(difficulty.name, boardWidth / 2, 
                        boardHeight - safeArea.bottom - ResponsiveUtils.scale(15));
    };
}

// Responsive electricity bar
function drawResponsiveElectricityBar() {
    const safeArea = ResponsiveUtils.getSafeAreaMargins();
    
    // Update electricity segments with responsive positioning
    updateResponsiveElectricitySegments();

    // Draw segments (using existing logic but with updated positions)
    electricitySegments.forEach((segment) => {
        if (!segment.visible) return;

        context.fillStyle = "rgba(127, 29, 29, 0.3)";
        context.fillRect(segment.x, segment.y, segment.width, segment.height);

        if (segment.filled) {
            if (electricity > 60) {
                context.fillStyle = "#22c55e";
            } else if (electricity > 30) {
                context.fillStyle = "#fbbf24";
            } else {
                context.fillStyle = "#ef4444";
            }
            context.fillRect(segment.x, segment.y, segment.width, segment.height);
        }

        context.strokeStyle = "#7f1d1d";
        context.lineWidth = 1;
        context.strokeRect(segment.x, segment.y, segment.width, segment.height);
    });

    // Electricity icon - responsive
    if (images.elec && images.elec.width) {
        const iconSize = ResponsiveUtils.scale(16);
        context.drawImage(images.elec, boardWidth - safeArea.right - ResponsiveUtils.scale(30), 
                         safeArea.top + ResponsiveUtils.scale(5), iconSize, iconSize);
    } else {
        context.fillStyle = "#7f1d1d";
        context.font = `${ResponsiveUtils.getFontSize(12)}px 'Indie Flower'`;
        context.textAlign = "right";
        context.fillText("⚡", boardWidth - safeArea.right - ResponsiveUtils.scale(15), 
                        safeArea.top + ResponsiveUtils.scale(12));
    }
}

// Update electricity segments with responsive positioning
function updateResponsiveElectricitySegments() {
    if (!electricitySegments || electricitySegments.length === 0) return;
    
    const safeArea = ResponsiveUtils.getSafeAreaMargins();
    const barWidth = ResponsiveUtils.scale(80);
    const barHeight = ResponsiveUtils.scale(12);
    const totalSegments = electricitySegments.length;
    const segmentWidth = (barWidth - (totalSegments - 1) * ResponsiveUtils.scale(2)) / totalSegments;
    const segmentGap = ResponsiveUtils.scale(2);
    const electricityX = boardWidth - barWidth - safeArea.right - ResponsiveUtils.scale(15);
    const barY = safeArea.top + ResponsiveUtils.scale(15)-5;

    electricitySegments.forEach((segment, index) => {
        segment.x = electricityX + index * (segmentWidth + segmentGap);
        segment.y = barY;
        segment.width = segmentWidth;
        segment.height = barHeight;
    });
}

// Override drawGameOver for responsive design
if (typeof drawGameOver === 'function') {
    const originalDrawGameOver = drawGameOver;
    
    drawGameOver = function() {
        // Draw background
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

        // Semi-transparent overlay
        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(0, 0, boardWidth, boardHeight);

        const safeArea = ResponsiveUtils.getSafeAreaMargins();

        // Draw character - responsive sizing and positioning
        if (currentCharacter) {
            const charImg = images[currentCharacter + "_right"];
            if (charImg) {
                const charSize = ResponsiveUtils.scale(150);
                const charX = safeArea.left - ResponsiveUtils.scale(10);
                const charY = boardHeight - charSize - safeArea.bottom - ResponsiveUtils.scale(30);
                context.drawImage(charImg, charX, charY, charSize, charSize);
            }
        }

        // Main content area - responsive positioning
        const contentStartX = boardWidth * 0.35;
        const centerX = contentStartX + (boardWidth - contentStartX) / 2;

        // Record image - responsive sizing
        if (images.record && images.record.width) {
            const recordSize = ResponsiveUtils.scale(200);
            const recordX = centerX - recordSize / 2 - ResponsiveUtils.scale(60);
            const recordY = Math.max(safeArea.top + ResponsiveUtils.scale(50), 
                                   boardHeight / 2 - ResponsiveUtils.scale(280));
            context.drawImage(images.record, recordX, recordY, recordSize, recordSize * 1.25);
        }

        // Score - responsive font and positioning
        context.fillStyle = "#2c2c2c";
        context.font = `bold ${ResponsiveUtils.getFontSize(32)}px 'Patrick Hand'`;
        context.textAlign = "center";
        const scoreY = Math.max(boardHeight * 0.3, safeArea.top + ResponsiveUtils.scale(175));
        context.fillText(score, centerX - ResponsiveUtils.scale(60), scoreY);

        // Level message - responsive
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
        context.font = `bold ${ResponsiveUtils.getFontSize(28)}px 'Patrick Hand'`;
        context.textAlign = "center";
        context.fillText(levelMessage, centerX - ResponsiveUtils.scale(60), 
                        scoreY + ResponsiveUtils.scale(75));

        // Responsive buttons
        drawResponsiveGameOverButtons(centerX, safeArea);
    };
}

// Draw responsive game over buttons
function drawResponsiveGameOverButtons(centerX, safeArea) {
    const buttonSize = ResponsiveUtils.getButtonSize(120, 60);
    const buttonGap = ResponsiveUtils.scale(20);
    const baseButtonY = Math.max(boardHeight * 0.6, boardHeight / 2 + ResponsiveUtils.scale(60));

    // Calculate positions to keep buttons on screen
    const totalWidth = buttonSize.width * 2 + buttonGap; // Only 2 buttons side by side
    const startX = Math.max(safeArea.left, centerX - totalWidth / 2);
    const maxButtonY = boardHeight - safeArea.bottom - buttonSize.height - ResponsiveUtils.scale(20);

    // Restart button
    const restartButton = {
        x: startX,
        y: Math.min(baseButtonY, maxButtonY),
        width: buttonSize.width,
        height: buttonSize.height,
    };

    // Share button  
    const shareButton = {
        x: startX + buttonSize.width + buttonGap,
        y: Math.min(baseButtonY, maxButtonY),
        width: buttonSize.width,
        height: buttonSize.height,
    };

    // Save button - place below the other two
    const saveButton = {
        x: centerX - buttonSize.width/2,
        y: Math.min(baseButtonY + buttonSize.height + ResponsiveUtils.scale(20), maxButtonY),
        width: buttonSize.width,
        height: buttonSize.height,
    };

    // Store for click detection
    gameOverButtons = { restartButton, shareButton, saveButton };

    // Draw buttons with responsive images
    if (images.restart && images.restart.width) {
        context.drawImage(images.restart, restartButton.x, restartButton.y, 
                         restartButton.width, restartButton.height);
    }

    if (images.share_X && images.share_X.width) {
        context.drawImage(images.share_X, shareButton.x, shareButton.y, 
                         shareButton.width, shareButton.height);
    }

    if (images.Save_Image && images.Save_Image.width) {
        context.drawImage(images.Save_Image, saveButton.x, saveButton.y, 
                         saveButton.width, saveButton.height);
    }
}

console.log("Responsive utilities loaded successfully!");