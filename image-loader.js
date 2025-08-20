// image-loader.js - Image Loading and Asset Management

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
        // UI elements
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
        images[imageName.replace(".png", "").toLowerCase()] = img;
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
                setupDarkModeFallbacks();
                darkModeImagesLoaded = true;
            }
        };
        img.src = `./images_dark_mode/${imageName}`;
        // Store dark images with 'dark_' prefix (lowercase keys)
        images["dark_" + imageName.replace(".png", "").toLowerCase()] = img;
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
        "save_image",  // lowercase to match your file
        "restart"
    ];
    
    fallbackImages.forEach(imageName => {
        if (images[imageName]) {
            images["dark_" + imageName] = images[imageName];
            console.log(`🌙 Using normal ${imageName} as dark mode fallback`);
        }
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