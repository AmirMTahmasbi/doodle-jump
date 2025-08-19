// input-controls.js - Game Input and Control Management

// ========== GAME CONTROLS SETUP ==========

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

// ========== TOUCH CONTROLS ==========

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

// ========== MOUSE CONTROLS ==========

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

// ========== KEYBOARD CONTROLS ==========

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

// ========== MOVEMENT FUNCTIONS ==========

function moveLeft() {
    velocityX = -4;
}

function moveRight() {
    velocityX = 4;
}

// ========== UTILITY FUNCTIONS ==========

function preventDefault(e) {
    e.preventDefault();
}