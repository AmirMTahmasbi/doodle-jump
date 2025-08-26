// audio-system.js - Complete Audio System for Game Soundtrack

// Audio manager object
const AudioManager = {
    soundtrack: null,
    isLoaded: false,
    isPlaying: false,
    volume: 0.5,
    isMuted: false,
    
    // Initialize audio system
    init() {
        console.log("Initializing audio system...");
        this.loadSoundtrack();
        this.setupVolumeControls();
    },
    
    // Load the soundtrack
    loadSoundtrack() {
        this.soundtrack = new Audio('./soundtrack.mp3');
        
        // Set audio properties
        this.soundtrack.loop = true;
        this.soundtrack.volume = this.volume;
        this.soundtrack.preload = 'auto';
        
        // Audio event listeners
        this.soundtrack.addEventListener('loadeddata', () => {
            console.log("Soundtrack loaded successfully");
            this.isLoaded = true;
        });
        
        this.soundtrack.addEventListener('error', (e) => {
            console.error("Failed to load soundtrack:", e);
        });
        
        this.soundtrack.addEventListener('ended', () => {
            console.log("Soundtrack ended");
            this.isPlaying = false;
        });
        
        this.soundtrack.addEventListener('play', () => {
            console.log("Soundtrack started playing");
            this.isPlaying = true;
        });
        
        this.soundtrack.addEventListener('pause', () => {
            console.log("Soundtrack paused");
            this.isPlaying = false;
        });
    },
    
    // Play soundtrack
    async play() {
        if (!this.isLoaded || !this.soundtrack) {
            console.warn("Soundtrack not loaded yet");
            return;
        }
        
        if (this.isMuted) {
            console.log("Audio is muted, not playing");
            return;
        }
        
        try {
            await this.soundtrack.play();
            this.isPlaying = true;
        } catch (error) {
            console.error("Failed to play soundtrack:", error);
            // Handle autoplay policy restrictions
            this.handleAutoplayBlocked();
        }
    },
    
    // Pause soundtrack
    pause() {
        if (this.soundtrack && this.isPlaying) {
            this.soundtrack.pause();
            this.isPlaying = false;
        }
    },
    
    // Stop soundtrack
    stop() {
        if (this.soundtrack) {
            this.soundtrack.pause();
            this.soundtrack.currentTime = 0;
            this.isPlaying = false;
        }
    },
    
    // Toggle play/pause
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },
    
    // Set volume (0.0 to 1.0)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.soundtrack) {
            this.soundtrack.volume = this.isMuted ? 0 : this.volume;
        }
    },
    
    // Mute/unmute
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.soundtrack) {
            this.soundtrack.volume = this.isMuted ? 0 : this.volume;
        }
        console.log(this.isMuted ? "Audio muted" : "Audio unmuted");
    },
    
    // Handle autoplay restrictions
    handleAutoplayBlocked() {
        console.log("Autoplay blocked - will start music on user interaction");
        
        // Create a function to start music on first user interaction
        const startMusicOnInteraction = async () => {
            try {
                await this.play();
                // Remove listeners after successful play
                document.removeEventListener('click', startMusicOnInteraction);
                document.removeEventListener('touchstart', startMusicOnInteraction);
                document.removeEventListener('keydown', startMusicOnInteraction);
            } catch (error) {
                console.error("Still couldn't play audio:", error);
            }
        };
        
        // Add listeners for user interaction
        document.addEventListener('click', startMusicOnInteraction, { once: true });
        document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
        document.addEventListener('keydown', startMusicOnInteraction, { once: true });
    },
    
    // Setup volume controls (optional UI)
    setupVolumeControls() {
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyM') {
                this.toggleMute();
            } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
                this.setVolume(this.volume + 0.1);
            } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
                this.setVolume(this.volume - 0.1);
            }
        });
    }
};

// Integration with your existing game states
const GameAudioIntegration = {
    // Start music when menu loads
    onMenuStart() {
        AudioManager.play();
    },
    
    // Continue music during gameplay
    onGameStart() {
        if (!AudioManager.isPlaying) {
            AudioManager.play();
        }
    },
    
    // Keep music during game over
    onGameOver() {
        // Music continues playing
    },
    
    // Pause music when game loses focus
    onGamePause() {
        AudioManager.pause();
    },
    
    // Resume music when game gains focus
    onGameResume() {
        AudioManager.play();
    }
};

// Auto-initialize when page loads
window.addEventListener('load', () => {
    AudioManager.init();
});

// Handle page visibility changes (pause when tab hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        AudioManager.pause();
    } else {
        AudioManager.play();
    }
});

// Integrate with your existing game functions
// Add these calls to your existing functions:

// In your initializeMenu function, add:
// GameAudioIntegration.onMenuStart();

// In your initializeGame function, add:
// GameAudioIntegration.onGameStart();

// In your drawGameOver function, add:
// GameAudioIntegration.onGameOver();

console.log("Audio system loaded successfully");