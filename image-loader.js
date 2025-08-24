// image-loader.js - Image Loading and Asset Management (FIXED VERSION)

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
        "Akhoond_right.png",         // Note: Capital A
        "Akhoond_right_jetpack.png", // Note: Capital A
        "reform_right.png",
        "reform_right_jetpack.png",
        "lamizzade_right.png",
        "lamizzade_right_jetpack.png",
        "mountain_bg.png",
        "game_over.png",
        // UI elements - KEEP EXACT CASE
        "record.png",
        "Save_Image.png",
        "share_X.png",
        "restart.png",
        // Resource icons
        "water.png",
        "elec.png",
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
                `✅ Loaded normal image ${imageName} (${imagesLoaded}/${totalImages})`,
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
            console.error(`❌ Failed to load normal image ${imageName}`);
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
        
        // FIXED: Store with consistent key naming
        let imageKey = imageName.replace(".png", "");
        
        // Special handling for different image types
        if (imageKey.includes("Akhoond")) {
            // Convert Akhoond to akhoond for consistency with character system
            imageKey = imageKey.replace("Akhoond", "akhoond");
        } else if (imageKey.includes("_right") || imageKey === "doodlejumpbg") {
            // Convert character images to lowercase for consistency
            imageKey = imageKey.toLowerCase();
        }
        // UI elements (Save_Image, share_X, etc.) keep their original case
        
        images[imageKey] = img;
        console.log(`📝 Stored image with key: "${imageKey}"`);
    });
}

// Load dark mode images at startup (no longer progressive)
function loadDarkModeImages() {
    console.log("🌙 Loading dark mode assets at startup...");

    // Only load dark mode images that actually exist
    const darkImageList = [
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
        "mountain_bg.png",
        "share_X.png",
        // Missing from dark mode folder, will use normal versions as fallback:
        // - doodlejumpbg.png
        // - lamizzade_right.png
        // - lamizzade_right_jetpack.png  
        // - game_over.png
        // - record.png
        // - Save_Image.png
        // - restart.png
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
                console.log("🌙 All available dark mode images loaded!");
                // Set up fallbacks for missing dark mode images
                setupDarkModeFallbacks();
                darkModeImagesLoaded = true;
                // Debug loaded images
                debugLoadedImages();
            }
        };
        img.onerror = function () {
            console.error(`❌ Failed to load dark image ${imageName}`);
            createFallbackImage("dark_" + imageName);
            darkImagesLoaded++;
            if (darkImagesLoaded === totalDarkImages) {
                console.log(
                    "🌙 Dark mode image loading completed (with some fallbacks)",
                );
                setupDarkModeFallbacks();
                darkModeImagesLoaded = true;
                // Debug loaded images
                debugLoadedImages();
            }
        };
        img.src = `./images_dark_mode/${imageName}`;
        
        // FIXED: Store dark images with consistent naming
        let imageKey = "dark_" + imageName.replace(".png", "");
        
        // Apply same naming rules as normal images
        if (imageKey.includes("akhoond")) {
            // Already lowercase, keep as is
        } else if (imageKey.includes("_right")) {
            // Convert to lowercase for consistency
            imageKey = imageKey.toLowerCase();
        }
        // UI elements keep their case
        
        images[imageKey] = img;
        console.log(`📝 Stored dark image with key: "${imageKey}"`);
    });
}

// Set up fallbacks for missing dark mode images
function setupDarkModeFallbacks() {
    const fallbackImages = [
        "doodlejumpbg",
        "lamizzade_right", 
        "lamizzade_right_jetpack",
        "game_over",
        "record",
        "Save_Image",  // Keep original case
        "share_X",     // Keep original case
        "restart"
    ];
    
    fallbackImages.forEach(imageName => {
        if (images[imageName]) {
            images["dark_" + imageName] = images[imageName];
            console.log(`🌙 Using normal ${imageName} as dark mode fallback`);
        } else {
            console.warn(`⚠️ Fallback image ${imageName} not found for dark mode`);
        }
    });
}

// Debug function to check what images are actually loaded
function debugLoadedImages() {
    console.log("🔍 === IMAGE LOADING DEBUG ===");
    console.log("Total images loaded:", Object.keys(images).length);
    console.log("All image keys:", Object.keys(images).sort());
    
    // Check specific problematic images
    const criticalImages = ['share_X', 'Save_Image', 'restart', 'record'];
    criticalImages.forEach(key => {
        if (images[key]) {
            console.log(`✅ ${key}: FOUND (width: ${images[key].width}, height: ${images[key].height})`);
        } else {
            console.log(`❌ ${key}: NOT FOUND`);
            // Check for variations
            const variations = Object.keys(images).filter(k => k.toLowerCase().includes(key.toLowerCase()));
            if (variations.length > 0) {
                console.log(`   Possible variations: ${variations.join(', ')}`);
            }
        }
    });
    
    // Check character images
    const characters = ['akhoond', 'reform', 'lamizzade'];
    characters.forEach(char => {
        const normalKey = char + '_right';
        const jetpackKey = char + '_right_jetpack';
        console.log(`${char}: normal=${!!images[normalKey]}, jetpack=${!!images[jetpackKey]}`);
    });
    
    console.log("🔍 === END DEBUG ===");
}

function createFallbackImage(imageName) {
    console.log(`Creating fallback for: ${imageName}`);
    
    const canvas = document.createElement("canvas");
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    
    // Color coding for different image types
    if (imageName.includes("platform")) {
        ctx.fillStyle = "#8B4513"; // Brown for platforms
    } else if (imageName.includes("drone")) {
        ctx.fillStyle = "#696969"; // Gray for drones
    } else if (imageName.includes("vote")) {
        ctx.fillStyle = "#FFD700"; // Gold for vote boxes
    } else if (imageName.includes("share") || imageName.includes("Save")) {
        ctx.fillStyle = "#4CAF50"; // Green for UI buttons
    } else {
        ctx.fillStyle = "#FF6B6B"; // Red for everything else
    }
    
    ctx.fillRect(0, 0, 50, 50);
    ctx.fillStyle = "white";
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    
    // Split long names
    const shortName = imageName.split(".")[0];
    if (shortName.length > 8) {
        const parts = shortName.split('_');
        ctx.fillText(parts[0], 25, 20);
        if (parts[1]) {
            ctx.fillText(parts[1], 25, 35);
        }
    } else {
        ctx.fillText(shortName, 25, 25);
    }
    
    // Store with consistent naming
    let imageKey = imageName.replace(".png", "");
    if (imageKey.includes("Akhoond")) {
        imageKey = imageKey.replace("Akhoond", "akhoond");
    } else if (imageKey.includes("_right") || imageKey === "doodlejumpbg") {
        imageKey = imageKey.toLowerCase();
    }
    
    images[imageKey] = canvas;
    console.log(`📝 Created fallback for key: "${imageKey}"`);
}

// Add global debug function for console use
window.debugGameImages = function() {
    debugLoadedImages();
};

// Add image verification function
window.verifyImages = function() {
    console.log("🔍 === IMAGE VERIFICATION ===");
    
    // Test critical UI images
    const uiImages = ['share_X', 'Save_Image', 'restart'];
    uiImages.forEach(key => {
        const img = images[key];
        if (img) {
            console.log(`${key}:`, {
                exists: true,
                width: img.width,
                height: img.height,
                complete: img.complete,
                src: img.src
            });
        } else {
            console.log(`${key}: NOT FOUND`);
        }
    });
    
    // Show canvas context state
    if (typeof context !== 'undefined' && context) {
        console.log("Canvas context: OK");
        console.log("Canvas dimensions:", boardWidth + "x" + boardHeight);
    } else {
        console.log("Canvas context: NOT AVAILABLE");
    }
    
    console.log("🔍 === END VERIFICATION ===");
};

console.log("📦 Image loader loaded successfully!");
console.log("🔧 Debug functions available: debugGameImages(), verifyImages()");