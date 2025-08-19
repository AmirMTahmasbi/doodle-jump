// menu.js - Character Selection Menu System

// Character selection state
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

// Initialize menu (called from game.js after images load)
function initializeMenu() {
    console.log("Initializing character selection menu...");
    gameState = 'character-select';
    selectedCharacter = null;
    drawCharacterSelection();
    setupMenuControls();
}

// Draw character selection screen
function drawCharacterSelection() {
    console.log("Drawing character selection screen");

    // Clear the canvas properly
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, board.width, board.height);
    context.restore();

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
    const positions = getCharacterPositions();

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
        drawStartButton();
    }

    // Instructions at bottom
    if (!selectedCharacter) {
        context.fillStyle = "#666";
        context.font = "18px 'Indie Flower'";
        context.textAlign = "center";
        context.fillText("Tap a character to select", boardWidth/2, boardHeight - 40);
    }
}

// Get character positions (centralized)
function getCharacterPositions() {
    return [
        { x: boardWidth/3, y: 250 },           // Akhoond
        { x: boardWidth/3, y: 400 },           // Reform
        { x: (boardWidth * 4)/5, y: 300 }      // Lamizzade
    ];
}

// Draw start button
function drawStartButton() {
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

// Character selection logic
function selectCharacter(x, y) {
    if (gameState !== 'character-select') return;

    const charSize = 120;
    const positions = getCharacterPositions();

    console.log(`Menu click at: ${x}, ${y}`);

    // Check character selection
    characters.forEach((char, index) => {
        const pos = positions[index];
        const distance = Math.sqrt((x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y));

        console.log(`Character ${char.id} at ${pos.x}, ${pos.y}, distance: ${distance}, threshold: ${charSize/2}`);

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
            startGameFromMenu();
        }
    }
}

// Start game from menu
function startGameFromMenu() {
    if (!selectedCharacter) {
        console.error('No character selected!');
        return;
    }

    console.log('Transitioning from menu to game with character:', selectedCharacter);

    // Call the game initialization function
    if (typeof initializeGame === 'function') {
        initializeGame(selectedCharacter);
    } else {
        console.error('initializeGame function not found in game.js');
    }
}

// Setup menu controls
function setupMenuControls() {
    console.log("Setting up menu controls");

    // Remove any existing event listeners
    removeAllEventListeners();

    // Add menu-specific event listeners
    board.addEventListener('touchstart', handleMenuTouch, { passive: false });
    board.addEventListener('touchend', handleMenuTouchEnd, { passive: false });
    board.addEventListener('click', handleMenuClick, { passive: false });
    board.addEventListener('touchmove', preventDefault, { passive: false });

    // Add keyboard controls
    document.addEventListener('keydown', handleMenuKeyboard, { passive: false });
}

// Helper function for preventing default
function preventDefault(e) {
    e.preventDefault();
}

// Remove all event listeners (helper function)
function removeAllEventListeners() {
    // Simply remove and re-add event listeners without cloning
    board.removeEventListener('touchstart', handleMenuTouch);
    board.removeEventListener('touchend', handleMenuTouchEnd);
    board.removeEventListener('click', handleMenuClick);
    board.removeEventListener('touchmove', preventDefault);
    document.removeEventListener('keydown', handleMenuKeyboard);
}

// Handle menu touch events
function handleMenuTouch(e) {
    e.preventDefault();
    console.log("Menu touch detected");

    const touch = e.touches[0];
    const rect = board.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (boardWidth / rect.width);
    const y = (touch.clientY - rect.top) * (boardHeight / rect.height);

    selectCharacter(x, y);
}

function handleMenuTouchEnd(e) {
    e.preventDefault();
}

function handleMenuClick(e) {
    e.preventDefault();
    console.log("Menu click detected");

    const rect = board.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (boardWidth / rect.width);
    const y = (e.clientY - rect.top) * (boardHeight / rect.height);

    selectCharacter(x, y);
}

// Menu keyboard controls
function handleMenuKeyboard(e) {
    if (gameState === 'character-select') {
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
            startGameFromMenu();
        }
    }
}

// Return to menu function (called from game)
function returnToMenu() {
    console.log("Returning to character selection menu");
    gameState = 'character-select';
    selectedCharacter = null;
    initializeMenu();
}