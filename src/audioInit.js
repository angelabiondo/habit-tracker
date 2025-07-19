// Audio context initialization and state change handling
window.addEventListener('DOMContentLoaded', () => {
    // Initialize audio context on first user interaction
    document.addEventListener('click', function initAudio() {
        if (window.audioManager && window.audioManager.audioContext && 
            window.audioManager.audioContext.state === 'suspended') {
            window.audioManager.audioContext.resume();
        }
        // Remove this listener after first interaction
        document.removeEventListener('click', initAudio);
    }, { once: true });

    // Handle audio context state changes
    if (window.audioManager && window.audioManager.audioContext) {
        window.audioManager.audioContext.addEventListener('statechange', () => {
            console.log('Audio context state:', window.audioManager.audioContext.state);
        });
    }
});
