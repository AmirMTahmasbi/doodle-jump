// moving-platform-debug.js - Debug and test moving platforms

// Add this to your console to test if functions exist
function debugMovingPlatforms() {
    console.log("=== MOVING PLATFORM DEBUG ===");

    // Check if functions exist
    console.log("shouldCreateMovingPlatform exists:", typeof shouldCreateMovingPlatform);
    console.log("createMovingPlatform exists:", typeof createMovingPlatform);
    console.log("getRandomMovementType exists:", typeof getRandomMovementType);
    console.log("updateMovingPlatform exists:", typeof updateMovingPlatform);
    console.log("PLATFORM_MOVEMENT_TYPES exists:", typeof PLATFORM_MOVEMENT_TYPES);

    // Check if required variables exist
    console.log("altitude exists:", typeof altitude, "value:", altitude);
    console.log("platformArray exists:", typeof platformArray, "length:", platformArray ? platformArray.length : "undefined");

    // Test the functions
    if (typeof shouldCreateMovingPlatform === 'function') {
        console.log("Testing shouldCreateMovingPlatform(null, 100):", shouldCreateMovingPlatform(null, 100));
        console.log("Testing shouldCreateMovingPlatform(null, 600):", shouldCreateMovingPlatform(null, 600));
    }

    if (typeof getRandomMovementType === 'function') {
        console.log("Testing getRandomMovementType(600):", getRandomMovementType(600));
    }

    // Check current platforms
    if (platformArray && platformArray.length > 0) {
        console.log("Current platforms:", platformArray.length);
        const movingPlatforms = platformArray.filter(p => p.type === "moving");
        console.log("Moving platforms found:", movingPlatforms.length);
        if (movingPlatforms.length > 0) {
            console.log("Moving platform details:", movingPlatforms[0]);
        }
    }
}

// Simple test function to force create a moving platform
function forceCreateMovingPlatform() {
    console.log("=== FORCE CREATING MOVING PLATFORM ===");

    if (typeof createMovingPlatform === 'function' && platformArray) {
        const testPlatform = createMovingPlatform(200, 300, 'horizontal', null);
        platformArray.push(testPlatform);
        console.log("Force created moving platform:", testPlatform);
        return testPlatform;
    } else {
        console.error("Cannot create moving platform - missing functions or platformArray");
        return null;
    }
}

// Override newPlatform function temporarily for testing
function overrideNewPlatformForTesting() {
    console.log("=== OVERRIDING newPlatform FOR TESTING ===");

    // Store original function
    if (!window.originalNewPlatform) {
        window.originalNewPlatform = window.newPlatform;
    }

    // Override with test version
    window.newPlatform = function(difficulty) {
        console.log("newPlatform called with difficulty:", difficulty);
        console.log("Current altitude:", altitude);

        // Force every 3rd platform to be moving for testing
        const shouldBeMoving = platformArray.length % 3 === 0;
        console.log("Should this platform be moving?", shouldBeMoving);

        if (shouldBeMoving && typeof createMovingPlatform === 'function') {
            let randomX = Math.floor((Math.random() * boardWidth * 3) / 4);
            let platformGap = 70;

            const movingPlatform = createMovingPlatform(
                randomX,
                platformArray[platformArray.length - 1].y - platformGap,
                'horizontal',
                difficulty
            );

            platformArray.push(movingPlatform);
            console.log("CREATED MOVING PLATFORM:", movingPlatform);
            return;
        }

        // Otherwise use original function
        if (window.originalNewPlatform) {
            window.originalNewPlatform(difficulty);
        }
    };

    console.log("newPlatform function overridden for testing");
}

// Restore original newPlatform function
function restoreOriginalNewPlatform() {
    if (window.originalNewPlatform) {
        window.newPlatform = window.originalNewPlatform;
        console.log("Original newPlatform function restored");
    }
}

// Run all debug functions
console.log("Moving platform debug functions loaded. Run these in console:");
console.log("1. debugMovingPlatforms() - Check if functions exist");
console.log("2. forceCreateMovingPlatform() - Force create one moving platform");
console.log("3. overrideNewPlatformForTesting() - Make every 3rd platform moving");
console.log("4. restoreOriginalNewPlatform() - Restore normal behavior");