// Health & Habit Tracker JavaScript

// Audio Manager Class
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.isMuted = false;
        this.init();
    }

    async init() {
        try {
            // Create audio context on user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    // Create a gentle success ding sound
    createSuccessSound() {
        if (!this.audioContext || this.isMuted) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Gentle bell-like sound
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.3);

        // Soft volume envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

        oscillator.type = 'sine';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);

        return oscillator;
    }

    // Create a gentle chime for quiz completion
    createChimeSound() {
        if (!this.audioContext || this.isMuted) return null;

        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Harmony notes
        oscillator1.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator2.frequency.setValueAtTime(659.25, this.audioContext.currentTime); // E5

        // Soft volume
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);

        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime + 0.1);
        
        oscillator1.stop(this.audioContext.currentTime + 0.6);
        oscillator2.stop(this.audioContext.currentTime + 0.7);

        return { oscillator1, oscillator2 };
    }

    playSuccessSound() {
        this.createSuccessSound();
    }

    playChimeSound() {
        this.createChimeSound();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}

// Loading Manager Class
class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
        this.globalOverlay = null;
        this.sectionOverlays = new Map();
        this.notificationQueue = [];
        this.isShowingNotification = false;
    }

    // Global loading overlay
    showGlobalLoading(message = 'Loading...') {
        if (this.globalOverlay) return;

        this.globalOverlay = document.createElement('div');
        this.globalOverlay.className = 'loading-overlay active';
        this.globalOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        document.body.appendChild(this.globalOverlay);
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.globalOverlay.classList.add('active');
        });
    }

    hideGlobalLoading() {
        if (!this.globalOverlay) return;
        
        this.globalOverlay.classList.remove('active');
        setTimeout(() => {
            if (this.globalOverlay && document.body.contains(this.globalOverlay)) {
                document.body.removeChild(this.globalOverlay);
                this.globalOverlay = null;
            }
        }, 300);
    }

    // Section loading overlay
    showSectionLoading(sectionId, message = 'Loading...') {
        const section = document.getElementById(sectionId);
        if (!section || this.sectionOverlays.has(sectionId)) return;

        const overlay = document.createElement('div');
        overlay.className = 'section-loading';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        
        section.appendChild(overlay);
        this.sectionOverlays.set(sectionId, overlay);
        
        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    }

    hideSectionLoading(sectionId) {
        const overlay = this.sectionOverlays.get(sectionId);
        if (!overlay) return;
        
        overlay.classList.remove('active');
        setTimeout(() => {
            const section = document.getElementById(sectionId);
            if (section && section.contains(overlay)) {
                section.removeChild(overlay);
            }
            this.sectionOverlays.delete(sectionId);
        }, 300);
    }

    // Button loading state
    showButtonLoading(buttonElement, loadingText = null) {
        if (buttonElement.classList.contains('btn-loading')) return;
        
        const originalText = buttonElement.innerHTML;
        buttonElement.setAttribute('data-original-text', originalText);
        
        if (loadingText) {
            buttonElement.innerHTML = `<span class="btn-text">${loadingText}</span>`;
        }
        
        buttonElement.classList.add('btn-loading');
        buttonElement.disabled = true;
    }

    hideButtonLoading(buttonElement) {
        if (!buttonElement.classList.contains('btn-loading')) return;
        
        const originalText = buttonElement.getAttribute('data-original-text');
        if (originalText) {
            buttonElement.innerHTML = originalText;
            buttonElement.removeAttribute('data-original-text');
        }
        
        buttonElement.classList.remove('btn-loading');
        buttonElement.disabled = false;
    }

    // Form loading state
    showFormLoading(formElement) {
        formElement.classList.add('form-loading');
        
        // Disable all form inputs
        const inputs = formElement.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            input.disabled = true;
            input.setAttribute('data-was-disabled', input.disabled);
        });
    }

    hideFormLoading(formElement) {
        formElement.classList.remove('form-loading');
        
        // Re-enable form inputs
        const inputs = formElement.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            const wasDisabled = input.getAttribute('data-was-disabled') === 'true';
            input.disabled = wasDisabled;
            input.removeAttribute('data-was-disabled');
        });
    }

    // Chart loading state
    showChartLoading(chartContainer) {
        const canvas = chartContainer.querySelector('canvas');
        if (canvas) {
            canvas.style.display = 'none';
        }
        
        if (!chartContainer.querySelector('.chart-loading')) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'chart-loading';
            loadingDiv.innerHTML = `
                <div class="loading-spinner">
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                    <div class="loading-text">Generating chart...</div>
                </div>
            `;
            chartContainer.appendChild(loadingDiv);
        }
    }

    hideChartLoading(chartContainer) {
        const loadingDiv = chartContainer.querySelector('.chart-loading');
        if (loadingDiv) {
            chartContainer.removeChild(loadingDiv);
        }
        
        const canvas = chartContainer.querySelector('canvas');
        if (canvas) {
            canvas.style.display = 'block';
        }
    }

    // Table loading state
    showTableLoading(tableElement) {
        tableElement.classList.add('table-loading');
        
        // Add skeleton rows if table is empty
        const tbody = tableElement.querySelector('tbody');
        if (tbody && tbody.children.length === 0) {
            for (let i = 0; i < 5; i++) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                `;
                tbody.appendChild(row);
            }
        }
    }

    hideTableLoading(tableElement) {
        tableElement.classList.remove('table-loading');
        
        // Remove skeleton rows
        const tbody = tableElement.querySelector('tbody');
        if (tbody) {
            const skeletonRows = tbody.querySelectorAll('tr:has(.skeleton)');
            skeletonRows.forEach(row => tbody.removeChild(row));
        }
    }

    // Loading notification
    showLoadingNotification(message, icon = '⏳') {
        const notification = document.createElement('div');
        notification.className = 'notification-loading';
        notification.innerHTML = `
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <span>${icon} ${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        return notification;
    }

    hideLoadingNotification(notification) {
        if (!notification) return;
        
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }

    // Progressive loading for lists
    addProgressiveLoading(container, items, renderFunction, delay = 100) {
        container.innerHTML = '';
        
        items.forEach((item, index) => {
            setTimeout(() => {
                const element = renderFunction(item);
                element.classList.add('progressive-load');
                container.appendChild(element);
                
                // Trigger animation
                requestAnimationFrame(() => {
                    element.classList.add('loaded');
                });
            }, index * delay);
        });
    }

    // Input loading state
    showInputLoading(inputElement) {
        const container = inputElement.closest('.form-group') || inputElement.parentElement;
        container.classList.add('field-loading');
        inputElement.disabled = true;
    }

    hideInputLoading(inputElement) {
        const container = inputElement.closest('.form-group') || inputElement.parentElement;
        container.classList.remove('field-loading');
        inputElement.disabled = false;
    }

    // Card loading state
    showCardLoading(cardElement) {
        cardElement.classList.add('card-loading');
    }

    hideCardLoading(cardElement) {
        cardElement.classList.remove('card-loading');
    }

    // Success/Error animations
    showSuccessAnimation(element) {
        element.classList.add('loading-success');
        setTimeout(() => {
            element.classList.remove('loading-success');
        }, 600);
    }

    showErrorAnimation(element) {
        element.classList.add('loading-error');
        setTimeout(() => {
            element.classList.remove('loading-error');
        }, 600);
    }

    // Sparkle animation for successful saves
    showSparkleAnimation(targetElement = null) {
        const sparkleContainer = document.createElement('div');
        sparkleContainer.className = 'sparkle-container';
        
        // Position relative to target element or viewport center
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            sparkleContainer.style.position = 'fixed';
            sparkleContainer.style.left = rect.left + rect.width / 2 + 'px';
            sparkleContainer.style.top = rect.top + rect.height / 2 + 'px';
            sparkleContainer.style.transform = 'translate(-50%, -50%)';
        } else {
            sparkleContainer.style.position = 'fixed';
            sparkleContainer.style.top = '20%';
            sparkleContainer.style.left = '50%';
            sparkleContainer.style.transform = 'translate(-50%, -50%)';
        }
        
        sparkleContainer.style.pointerEvents = 'none';
        sparkleContainer.style.zIndex = '10000';
        
        // Create sparkle particles
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle-particle';
            
            // Random position around center
            const angle = (Math.PI * 2 * i) / 20;
            const radius = Math.random() * 100 + 50;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            sparkle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 6 + 4}px;
                height: ${Math.random() * 6 + 4}px;
                background: ${['#ffd700', '#ffeb3b', '#4caf50', '#2196f3', '#e91e63'][Math.floor(Math.random() * 5)]};
                border-radius: 50%;
                transform: translate(${x}px, ${y}px) scale(0);
                animation: sparkle-burst 0.8s ease-out forwards;
                animation-delay: ${Math.random() * 0.3}s;
                box-shadow: 0 0 6px currentColor;
            `;
            
            sparkleContainer.appendChild(sparkle);
        }
        
        document.body.appendChild(sparkleContainer);
        
        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(sparkleContainer)) {
                document.body.removeChild(sparkleContainer);
            }
        }, 1200);
    }

    // Success notification with sparkles and sound
    showSuccessNotificationWithEffects(message, targetElement = null, useChime = false) {
        // Play sound effect
        if (window.audioManager) {
            if (useChime) {
                window.audioManager.playChimeSound();
            } else {
                window.audioManager.playSuccessSound();
            }
        }
        
        // Show sparkle animation
        this.showSparkleAnimation(targetElement);
        
        // Create enhanced success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="success-notification-content">
                <div class="success-icon">✨</div>
                <div class="success-text">${message}</div>
                <div class="success-checkmark">✓</div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
            z-index: 9999;
            font-weight: 500;
            transform: translateX(100%) scale(0.8);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            min-width: 280px;
            animation: success-bounce 0.6s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0) scale(1)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%) scale(0.8)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 400);
        }, 3000);
        
        return notification;
    }

    // Utility method to wrap async operations with loading
    async withLoading(operation, options = {}) {
        const {
            global = false,
            section = null,
            button = null,
            form = null,
            message = 'Loading...',
            successMessage = null,
            errorMessage = 'Operation failed'
        } = options;

        let notification = null;

        try {
            // Show loading states
            if (global) this.showGlobalLoading(message);
            if (section) this.showSectionLoading(section, message);
            if (button) this.showButtonLoading(button);
            if (form) this.showFormLoading(form);
            
            if (!global && !section) {
                notification = this.showLoadingNotification(message);
            }

            // Execute operation
            const result = await operation();

            // Show success animation
            if (button) this.showSuccessAnimation(button);
            if (form) this.showSuccessAnimation(form);

            return result;

        } catch (error) {
            // Show error animation
            if (button) this.showErrorAnimation(button);
            if (form) this.showErrorAnimation(form);
            
            console.error('Operation failed:', error);
            throw error;
            
        } finally {
            // Hide loading states
            if (global) this.hideGlobalLoading();
            if (section) this.hideSectionLoading(section);
            if (button) this.hideButtonLoading(button);
            if (form) this.hideFormLoading(form);
            if (notification) this.hideLoadingNotification(notification);
        }
    }
}

class HealthTracker {
    constructor() {
        this.entries = [];
        this.charts = {};
        this.currentEditingEntry = null;
        this.currentCalendarDate = new Date();
        this.currentDataView = 'table';
        this.currentChartMode = 'single';
        this.quizData = {};
        this.currentQuestionIndex = 0;
        this.questions = this.initializeQuestions();
        this.isFirebaseReady = false;
        this.loadingStates = new Set();
        this.loadingManager = new LoadingManager();
        this.audioManager = new AudioManager();
        this.init();
    }

    async init() {
        // Show initial loading
        this.loadingManager.showGlobalLoading('Initializing Health Tracker...');
        
        try {
            // Wait for Firebase to be available
            await this.waitForFirebase();
            
            this.setupEventListeners();
            this.setCurrentDate();
            
            // Load data from Firebase
            await this.loadEntriesFromFirebase();
            
            this.updateTodayView();
            this.updateInsights();
            this.updateHistory();
            this.updateDataView();
            this.checkDefaultSection();
        } finally {
            // Hide global loading
            setTimeout(() => {
                this.loadingManager.hideGlobalLoading();
            }, 500);
        }
    }

    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.db && window.firestore) {
                    this.isFirebaseReady = true;
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    async loadEntriesFromFirebase() {
        try {
            if (!this.isFirebaseReady) return;
            
            const { collection, getDocs, query, orderBy } = window.firestore;
            const entriesRef = collection(window.db, 'entries');
            const q = query(entriesRef, orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            
            this.entries = [];
            querySnapshot.forEach((doc) => {
                this.entries.push({
                    firebaseId: doc.id,
                    ...doc.data()
                });
            });
            
            this.showNotification('Data loaded from cloud! 🌐');
        } catch (error) {
            console.error('Error loading from Firebase:', error);
            this.showNotification('Failed to load cloud data. Using local storage as backup.');
            // Fallback to localStorage
            this.entries = JSON.parse(localStorage.getItem('healthEntries') || '[]');
        }
    }

    async saveEntryToFirebase(entry) {
        try {
            if (!this.isFirebaseReady) {
                throw new Error('Firebase not ready');
            }
            
            const { collection, addDoc, doc, updateDoc } = window.firestore;
            
            if (entry.firebaseId) {
                // Update existing document
                const docRef = doc(window.db, 'entries', entry.firebaseId);
                await updateDoc(docRef, entry);
                return entry.firebaseId;
            } else {
                // Add new document
                const docRef = await addDoc(collection(window.db, 'entries'), entry);
                return docRef.id;
            }
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            throw error;
        }
    }

    async deleteEntryFromFirebase(firebaseId) {
        try {
            if (!this.isFirebaseReady || !firebaseId) return;
            
            const { doc, deleteDoc } = window.firestore;
            const docRef = doc(window.db, 'entries', firebaseId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting from Firebase:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showSection(e.target.dataset.section);
            });
        });

        // Form submission
        document.getElementById('entryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEntry();
        });

        // Health rating slider
        const healthRating = document.getElementById('healthRating');
        const healthRatingValue = document.getElementById('healthRatingValue');
        healthRating.addEventListener('input', (e) => {
            healthRatingValue.textContent = e.target.value;
        });

        // Digestion rating slider
        const digestion = document.getElementById('digestion');
        const digestionValue = document.getElementById('digestionValue');
        digestion.addEventListener('input', (e) => {
            digestionValue.textContent = e.target.value;
        });

        // Sleep quality slider
        const sleepQuality = document.getElementById('sleepQuality');
        const sleepQualityValue = document.getElementById('sleepQualityValue');
        sleepQuality.addEventListener('input', (e) => {
            sleepQualityValue.textContent = e.target.value;
        });

        // Skin rating sliders
        const skinSliders = [
            'skinHands', 'skinArms', 'skinStomachBack', 'skinThighs', 'skinLegsFeet'
        ];
        skinSliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueDisplay = document.getElementById(sliderId + 'Value');
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
            });
        });

        // Gym session change handler
        const gymSession = document.getElementById('gymSession');
        const gymTypeGroup = document.getElementById('gymTypeGroup');
        gymSession.addEventListener('change', (e) => {
            if (e.target.value) {
                gymTypeGroup.style.display = 'block';
                gymTypeGroup.classList.add('show');
            } else {
                gymTypeGroup.style.display = 'none';
                gymTypeGroup.classList.remove('show');
                document.getElementById('gymType').value = '';
            }
        });

        // Date picker enhancement
        const entryDate = document.getElementById('entryDate');
        entryDate.addEventListener('focus', () => {
            this.setupDatePicker();
        });

        // Export buttons
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('exportXlsxBtn').addEventListener('click', () => this.exportXLSX());
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('entryDate').value = today;
        document.getElementById('todayDate').textContent = this.formatDate(new Date());
    }

    checkDefaultSection() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = this.entries.filter(entry => entry.date === today);
        
        // If no entries for today, default to "Add Entry" section
        if (todayEntries.length === 0) {
            this.showSection('log');
        }
    }

    setupDatePicker() {
        const entryDate = document.getElementById('entryDate');
        const today = new Date().toISOString().split('T')[0];
        const existingDates = this.entries.map(entry => entry.date);
        
        // Add custom styling for dates
        entryDate.addEventListener('input', (e) => {
            const selectedDate = e.target.value;
            if (existingDates.includes(selectedDate)) {
                // This date already has an entry
                const existingEntry = this.entries.find(entry => entry.date === selectedDate);
                if (confirm('An entry for this date already exists. Do you want to edit it?')) {
                    this.editEntry(existingEntry);
                }
            }
        });
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Update specific sections
        if (sectionName === 'insights') {
            setTimeout(() => this.updateInsights(), 100);
        } else if (sectionName === 'data') {
            setTimeout(() => this.updateDataView(), 100);
        }
    }

    async saveEntry() {
        const form = document.getElementById('entryForm');
        const submitBtn = document.querySelector('.submit-btn');
        
        const entry = {
            id: this.currentEditingEntry ? this.currentEditingEntry.id : Date.now(),
            date: document.getElementById('entryDate').value,
            healthRating: parseInt(document.getElementById('healthRating').value),
            whatIAte: document.getElementById('whatIAte').value,
            dietNotes: document.getElementById('dietNotes').value,
            triggers: document.getElementById('triggers').value,
            newFoods: document.getElementById('newFoods').value,
            digestion: parseInt(document.getElementById('digestion').value),
            skinHands: parseInt(document.getElementById('skinHands').value),
            skinArms: parseInt(document.getElementById('skinArms').value),
            skinStomachBack: parseInt(document.getElementById('skinStomachBack').value),
            skinThighs: parseInt(document.getElementById('skinThighs').value),
            skinLegsFeet: parseInt(document.getElementById('skinLegsFeet').value),
            newSpots: document.getElementById('newSpots').value,
            newSpotsNotes: document.getElementById('newSpotsNotes').value,
            existingSpotsChange: document.getElementById('existingSpotsChange').value,
            weight: parseFloat(document.getElementById('weight').value) || null,
            omega3: document.getElementById('omega3').value,
            melatonin: document.getElementById('melatonin').value,
            creatine: document.getElementById('creatine').value,
            finasteride: document.getElementById('finasteride').value,
            minoxidil: document.getElementById('minoxidil').value,
            diacladerm: document.getElementById('diacladerm').value,
            karela: document.getElementById('karela').value,
            gymSession: document.getElementById('gymSession').value,
            gymType: document.getElementById('gymType').value,
            gymNotes: document.getElementById('gymNotes').value,
            symptoms: document.getElementById('symptoms').value,
            mood: document.getElementById('mood').value,
            sleepDuration: parseFloat(document.getElementById('sleepDuration').value) || null,
            sleepQuality: parseInt(document.getElementById('sleepQuality').value),
            sleepNotes: document.getElementById('sleepNotes').value,
            notes: document.getElementById('notes').value,
            timestamp: this.currentEditingEntry ? this.currentEditingEntry.timestamp : new Date().toISOString()
        };

        const isUpdate = !!this.currentEditingEntry;
        const loadingMessage = isUpdate ? 'Updating entry...' : 'Saving entry...';

        try {
            await this.loadingManager.withLoading(async () => {
                if (this.currentEditingEntry) {
                    // Update existing entry
                    entry.firebaseId = this.currentEditingEntry.firebaseId;
                    await this.saveEntryToFirebase(entry);
                    
                    const index = this.entries.findIndex(e => e.id === this.currentEditingEntry.id);
                    this.entries[index] = entry;
                } else {
                    // Check if entry for this date already exists
                    const existingEntryIndex = this.entries.findIndex(e => e.date === entry.date);
                    if (existingEntryIndex >= 0) {
                        if (confirm('An entry for this date already exists. Do you want to update it?')) {
                            entry.firebaseId = this.entries[existingEntryIndex].firebaseId;
                            await this.saveEntryToFirebase(entry);
                            this.entries[existingEntryIndex] = { ...this.entries[existingEntryIndex], ...entry };
                        } else {
                            return;
                        }
                    } else {
                        // Save new entry to Firebase
                        const firebaseId = await this.saveEntryToFirebase(entry);
                        entry.firebaseId = firebaseId;
                        this.entries.push(entry);
                    }
                }

                // Backup to localStorage
                this.saveToLocalStorage();
            }, {
                button: submitBtn,
                form: form,
                message: loadingMessage
            });
            
            // Show enhanced success notification with sparkles and sound
            const successMessage = isUpdate ? 'Entry updated and synced! ☁️' : 'Entry saved and synced! ☁️';
            this.loadingManager.showSuccessNotificationWithEffects(successMessage, submitBtn);
            
            this.updateTodayView();
            this.updateHistory();
            this.updateDataView();
            this.clearForm();
            this.showSection('today');
            
        } catch (error) {
            console.error('Firebase save failed:', error);
            
            // Fallback to local storage only
            if (this.currentEditingEntry) {
                const index = this.entries.findIndex(e => e.id === this.currentEditingEntry.id);
                this.entries[index] = entry;
            } else {
                const existingEntryIndex = this.entries.findIndex(e => e.date === entry.date);
                if (existingEntryIndex >= 0) {
                    if (confirm('An entry for this date already exists. Do you want to update it?')) {
                        this.entries[existingEntryIndex] = { ...this.entries[existingEntryIndex], ...entry };
                    } else {
                        return;
                    }
                } else {
                    this.entries.push(entry);
                }
            }
            
            this.saveToLocalStorage();
            this.showNotification('Entry saved locally (cloud sync failed) 💾');
            
            this.updateTodayView();
            this.updateHistory();
            this.updateDataView();
            this.clearForm();
            this.showSection('today');
        }
    }

    editEntry(entry) {
        this.currentEditingEntry = entry;
        
        // Populate form with entry data
        document.getElementById('entryDate').value = entry.date;
        document.getElementById('healthRating').value = entry.healthRating || 5;
        document.getElementById('healthRatingValue').textContent = entry.healthRating || 5;
        document.getElementById('whatIAte').value = entry.whatIAte || '';
        document.getElementById('dietNotes').value = entry.dietNotes || '';
        document.getElementById('triggers').value = entry.triggers || '';
        document.getElementById('newFoods').value = entry.newFoods || '';
        document.getElementById('digestion').value = entry.digestion || 5;
        document.getElementById('digestionValue').textContent = entry.digestion || 5;
        document.getElementById('skinHands').value = entry.skinHands || 5;
        document.getElementById('skinHandsValue').textContent = entry.skinHands || 5;
        document.getElementById('skinArms').value = entry.skinArms || 5;
        document.getElementById('skinArmsValue').textContent = entry.skinArms || 5;
        document.getElementById('skinStomachBack').value = entry.skinStomachBack || 5;
        document.getElementById('skinStomachBackValue').textContent = entry.skinStomachBack || 5;
        document.getElementById('skinThighs').value = entry.skinThighs || 5;
        document.getElementById('skinThighsValue').textContent = entry.skinThighs || 5;
        document.getElementById('skinLegsFeet').value = entry.skinLegsFeet || 5;
        document.getElementById('skinLegsFeetValue').textContent = entry.skinLegsFeet || 5;
        document.getElementById('newSpots').value = entry.newSpots || '';
        document.getElementById('newSpotsNotes').value = entry.newSpotsNotes || '';
        document.getElementById('existingSpotsChange').value = entry.existingSpotsChange || '';
        document.getElementById('weight').value = entry.weight || '';
        document.getElementById('omega3').value = entry.omega3 || '';
        document.getElementById('melatonin').value = entry.melatonin || '';
        document.getElementById('creatine').value = entry.creatine || '';
        document.getElementById('finasteride').value = entry.finasteride || '';
        document.getElementById('minoxidil').value = entry.minoxidil || '';
        document.getElementById('diacladerm').value = entry.diacladerm || '';
        document.getElementById('karela').value = entry.karela || '';
        document.getElementById('gymSession').value = entry.gymSession || '';
        document.getElementById('gymType').value = entry.gymType || '';
        document.getElementById('gymNotes').value = entry.gymNotes || '';
        document.getElementById('symptoms').value = entry.symptoms || '';
        document.getElementById('mood').value = entry.mood || '';
        document.getElementById('sleepDuration').value = entry.sleepDuration || '';
        document.getElementById('sleepQuality').value = entry.sleepQuality || 5;
        document.getElementById('sleepQualityValue').textContent = entry.sleepQuality || 5;
        document.getElementById('sleepNotes').value = entry.sleepNotes || '';
        document.getElementById('notes').value = entry.notes || '';

        // Show gym type if gym session is selected
        const gymTypeGroup = document.getElementById('gymTypeGroup');
        if (entry.gymSession) {
            gymTypeGroup.style.display = 'block';
            gymTypeGroup.classList.add('show');
        }

        // Update submit button text
        document.querySelector('.submit-btn').textContent = 'Update Entry';
        
        this.showSection('log');
    }

    async deleteEntry(entryId) {
        if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            const entryToDelete = this.entries.find(entry => entry.id === entryId);
            
            try {
                await this.loadingManager.withLoading(async () => {
                    // Delete from Firebase if it has a firebaseId
                    if (entryToDelete && entryToDelete.firebaseId) {
                        await this.deleteEntryFromFirebase(entryToDelete.firebaseId);
                    }
                    
                    // Remove from local array
                    this.entries = this.entries.filter(entry => entry.id !== entryId);
                    this.saveToLocalStorage();
                }, {
                    message: 'Deleting entry...'
                });
                
                this.showNotification('Entry deleted and synced! ☁️');
            } catch (error) {
                console.error('Firebase delete failed:', error);
                
                // Even if Firebase fails, remove locally
                this.entries = this.entries.filter(entry => entry.id !== entryId);
                this.saveToLocalStorage();
                
                this.showNotification('Entry deleted locally (cloud sync failed) 💾');
            }
            
            this.updateTodayView();
            this.updateHistory();
            this.updateDataView();
        }
    }

    clearForm() {
        document.getElementById('entryForm').reset();
        this.setCurrentDate();
        document.getElementById('healthRatingValue').textContent = '5';
        document.getElementById('digestionValue').textContent = '5';
        document.getElementById('sleepQualityValue').textContent = '5';
        document.getElementById('skinHandsValue').textContent = '5';
        document.getElementById('skinArmsValue').textContent = '5';
        document.getElementById('skinStomachBackValue').textContent = '5';
        document.getElementById('skinThighsValue').textContent = '5';
        document.getElementById('skinLegsFeetValue').textContent = '5';
        document.getElementById('gymTypeGroup').style.display = 'none';
        document.getElementById('gymTypeGroup').classList.remove('show');
        document.querySelector('.submit-btn').textContent = 'Save Entry';
        this.currentEditingEntry = null;
    }

    saveToLocalStorage() {
        localStorage.setItem('healthEntries', JSON.stringify(this.entries));
    }

    updateTodayView() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = this.entries.filter(entry => entry.date === today);
        
        // Update quick stats
        const todayHealth = document.getElementById('todayHealth');
        const todayDigestion = document.getElementById('todayDigestion');
        const todayGym = document.getElementById('todayGym');
        const todaySleep = document.getElementById('todaySleep');

        if (todayEntries.length > 0) {
            const latestEntry = todayEntries[todayEntries.length - 1];
            todayHealth.textContent = latestEntry.healthRating || '-';
            todayDigestion.textContent = latestEntry.digestion || '-';
            todayGym.textContent = latestEntry.gymSession ? 
                latestEntry.gymSession.charAt(0).toUpperCase() + latestEntry.gymSession.slice(1) : '-';
            todaySleep.textContent = latestEntry.sleepQuality || '-';
        } else {
            todayHealth.textContent = '-';
            todayDigestion.textContent = '-';
            todayGym.textContent = '-';
            todaySleep.textContent = '-';
        }

        // Update today's entries display
        const todayEntriesContainer = document.getElementById('todayEntries');
        if (todayEntries.length === 0) {
            todayEntriesContainer.innerHTML = '<p class="no-data">No entries for today. <a href="#" onclick="app.showSection(\'log\')">Add your first entry</a></p>';
        } else {
            todayEntriesContainer.innerHTML = todayEntries.map(entry => this.createEntryCard(entry)).join('');
        }
    }

    createEntryCard(entry) {
        const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return `
            <div class="entry-card">
                <div class="entry-actions">
                    <button class="edit-btn" onclick="app.editEntry(${JSON.stringify(entry).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="delete-btn" onclick="app.deleteEntry(${entry.id})">Delete</button>
                </div>
                <div class="entry-meta">
                    <span class="entry-time">${time}</span>
                    <span class="entry-health-badge">Health: ${entry.healthRating}/10</span>
                </div>
                <div class="entry-details">
                    ${entry.whatIAte ? `<div class="entry-detail"><strong>What I Ate:</strong> ${entry.whatIAte}</div>` : ''}
                    ${entry.dietNotes ? `<div class="entry-detail"><strong>Diet Notes:</strong> ${entry.dietNotes}</div>` : ''}
                    ${entry.newFoods ? `<div class="entry-detail"><strong>New Foods:</strong> ${entry.newFoods}</div>` : ''}
                    ${entry.digestion ? `<div class="entry-detail"><strong>Digestion:</strong> ${entry.digestion}/10</div>` : ''}
                    ${this.getSkinSummary(entry) ? `<div class="entry-detail"><strong>Skin Status:</strong> ${this.getSkinSummary(entry)}</div>` : ''}
                    ${entry.newSpots && entry.newSpots !== '' ? `<div class="entry-detail"><strong>New Spots:</strong> ${entry.newSpots}</div>` : ''}
                    ${entry.weight ? `<div class="entry-detail"><strong>Weight:</strong> ${entry.weight}lb</div>` : ''}
                    ${this.getSupplementsSummary(entry) ? `<div class="entry-detail"><strong>Supplements:</strong> ${this.getSupplementsSummary(entry)}</div>` : ''}
                    ${entry.triggers ? `<div class="entry-detail"><strong>Triggers:</strong> ${entry.triggers}</div>` : ''}
                    ${entry.gymSession ? `<div class="entry-detail"><strong>Gym:</strong> ${entry.gymSession}${entry.gymType ? ` (${entry.gymType})` : ''}</div>` : ''}
                    ${entry.sleepDuration ? `<div class="entry-detail"><strong>Sleep:</strong> ${entry.sleepDuration}h (${entry.sleepQuality}/10)</div>` : ''}
                    ${entry.symptoms ? `<div class="entry-detail"><strong>Symptoms:</strong> ${entry.symptoms}</div>` : ''}
                    ${entry.mood ? `<div class="entry-detail"><strong>Mood:</strong> ${entry.mood}</div>` : ''}
                    ${entry.notes ? `<div class="entry-detail"><strong>Notes:</strong> ${entry.notes}</div>` : ''}
                </div>
            </div>
        `;
    }

    getSkinSummary(entry) {
        const skinAreas = {
            'Hands': entry.skinHands,
            'Arms': entry.skinArms,
            'Stomach/Back': entry.skinStomachBack,
            'Thighs': entry.skinThighs,
            'Legs/Feet': entry.skinLegsFeet
        };
        
        const summaryParts = [];
        Object.entries(skinAreas).forEach(([area, score]) => {
            if (score) {
                summaryParts.push(`${area}: ${score}/10`);
            }
        });
        
        return summaryParts.length > 0 ? summaryParts.join(', ') : '';
    }

    getSupplementsSummary(entry) {
        const supplements = [];
        const supplementFields = {
            'omega3': 'Omega 3',
            'melatonin': 'Melatonin',
            'creatine': 'Creatine',
            'finasteride': 'Finasteride',
            'minoxidil': 'Minoxidil',
            'diacladerm': 'Diacladerm',
            'karela': 'Karela'
        };
        
        Object.entries(supplementFields).forEach(([field, displayName]) => {
            if (entry[field] === 'yes') {
                supplements.push(displayName);
            }
        });
        
        return supplements.length > 0 ? supplements.join(', ') : '';
    }

    getSkinAverageScore(entry) {
        const skinScores = [
            entry.skinHands, entry.skinArms, entry.skinStomachBack, 
            entry.skinThighs, entry.skinLegsFeet
        ].filter(score => score !== undefined && score !== null);
        
        if (skinScores.length === 0) return null;
        return (skinScores.reduce((sum, score) => sum + score, 0) / skinScores.length).toFixed(1);
    }

    updateInsights() {
        this.updateSummaryStats();
        if (this.currentChartMode === 'single') {
            this.updateSelectedChart();
        } else {
            this.updateMultiChart();
        }
    }

    switchChartMode(mode) {
        this.currentChartMode = mode;
        
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Show/hide controls
        if (mode === 'single') {
            document.getElementById('singleChartControls').style.display = 'flex';
            document.getElementById('multiChartControls').style.display = 'none';
            document.getElementById('mainChartTitle').textContent = 'Health Rating Trend';
            this.updateSelectedChart();
        } else {
            document.getElementById('singleChartControls').style.display = 'none';
            document.getElementById('multiChartControls').style.display = 'block';
            document.getElementById('mainChartTitle').textContent = 'Multi-Metric Correlation Analysis';
            this.updateMultiChart();
        }
    }

    updateCurrentChart() {
        if (this.currentChartMode === 'single') {
            this.updateSelectedChart();
        } else {
            this.updateMultiChart();
        }
    }

    updateMultiChart() {
        const timeRange = parseInt(document.getElementById('timeRange').value);
        const entries = this.getEntriesFromLastNDays(timeRange);
        
        // Get selected metrics
        const selectedMetrics = this.getSelectedMetrics();
        
        if (selectedMetrics.length === 0) {
            // Show empty state
            if (this.charts.main) {
                this.charts.main.destroy();
            }
            const ctx = document.getElementById('mainChart').getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '16px Inter';
            ctx.fillStyle = '#718096';
            ctx.textAlign = 'center';
            ctx.fillText('Select metrics to display correlations', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }
        
        this.createMultiMetricChart(entries, selectedMetrics);
    }

    getSelectedMetrics() {
        const metrics = [
            { id: 'showHealth', field: 'healthRating', label: 'Health Rating', color: '#667eea' },
            { id: 'showDigestion', field: 'digestion', label: 'Digestion Quality', color: '#48bb78' },
            { id: 'showSleepQuality', field: 'sleepQuality', label: 'Sleep Quality', color: '#805ad5' },
            { id: 'showSkinHands', field: 'skinHands', label: 'Skin (Hands)', color: '#f56565' },
            { id: 'showSkinArms', field: 'skinArms', label: 'Skin (Arms)', color: '#ed8936' },
            { id: 'showSkinStomachBack', field: 'skinStomachBack', label: 'Skin (Stomach/Back)', color: '#ecc94b' },
            { id: 'showSkinThighs', field: 'skinThighs', label: 'Skin (Thighs)', color: '#38b2ac' },
            { id: 'showSkinLegsFeet', field: 'skinLegsFeet', label: 'Skin (Legs/Feet)', color: '#9f7aea' }
        ];
        
        return metrics.filter(metric => {
            const checkbox = document.getElementById(metric.id);
            return checkbox && checkbox.checked;
        });
    }

    createMultiMetricChart(entries, selectedMetrics) {
        // Destroy existing chart
        if (this.charts.main) {
            this.charts.main.destroy();
        }
        
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        // Prepare datasets for each selected metric
        const datasets = selectedMetrics.map(metric => {
            const data = this.prepareTimeSeriesData(entries, metric.field);
            return {
                label: metric.label,
                data: data.data,
                borderColor: metric.color,
                backgroundColor: metric.color + '20',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                fill: false,
                tension: 0.4
            };
        });
        
        // Get labels from the first metric (they should all be the same)
        const labels = selectedMetrics.length > 0 ? 
            this.prepareTimeSeriesData(entries, selectedMetrics[0].field).labels : [];
        
        this.charts.main = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#2d3748',
                        bodyColor: '#4a5568',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Rating (1-10)',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#fff',
                        hoverBorderWidth: 2
                    }
                }
            }
        });
    }

    selectAllMetrics() {
        const checkboxes = ['showHealth', 'showDigestion', 'showSleepQuality', 
                           'showSkinHands', 'showSkinArms', 'showSkinStomachBack', 
                           'showSkinThighs', 'showSkinLegsFeet'];
        
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = true;
        });
        
        this.updateMultiChart();
    }

    clearAllMetrics() {
        const checkboxes = ['showHealth', 'showDigestion', 'showSleepQuality', 
                           'showSkinHands', 'showSkinArms', 'showSkinStomachBack', 
                           'showSkinThighs', 'showSkinLegsFeet'];
        
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = false;
        });
        
        this.updateMultiChart();
    }

    selectSkinMetrics() {
        // Clear all first
        this.clearAllMetrics();
        
        // Select only skin metrics
        const skinCheckboxes = ['showSkinHands', 'showSkinArms', 'showSkinStomachBack', 
                               'showSkinThighs', 'showSkinLegsFeet'];
        
        skinCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = true;
        });
        
        this.updateMultiChart();
    }

    updateSummaryStats() {
        const last30Days = this.getEntriesFromLastNDays(30);
        const lastWeek = this.getEntriesFromLastNDays(7);

        // Average health rating
        const avgHealth = last30Days.length > 0 ? 
            (last30Days.reduce((sum, entry) => sum + (entry.healthRating || 0), 0) / last30Days.length).toFixed(1) : '-';
        document.getElementById('avgHealth').textContent = avgHealth;

        // Average sleep quality
        const sleepEntries = last30Days.filter(entry => entry.sleepQuality);
        const avgSleep = sleepEntries.length > 0 ? 
            (sleepEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / sleepEntries.length).toFixed(1) : '-';
        document.getElementById('avgSleep').textContent = avgSleep;

        // Weekly gym sessions
        const weeklyGym = lastWeek.filter(entry => entry.gymSession).length;
        document.getElementById('weeklyGym').textContent = weeklyGym;

        // Most common triggers
        const triggers = last30Days
            .filter(entry => entry.triggers)
            .map(entry => entry.triggers.toLowerCase())
            .join(', ')
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);
        
        const triggerCounts = {};
        triggers.forEach(trigger => {
            triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
        
        const mostCommon = Object.entries(triggerCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([trigger]) => trigger)
            .join(', ');
        
        document.getElementById('commonTriggers').textContent = mostCommon || 'None identified';
    }

    updateSelectedChart() {
        const chartType = document.getElementById('chartType').value;
        const timeRange = parseInt(document.getElementById('timeRange').value);
        const entries = this.getEntriesFromLastNDays(timeRange);
        
        // Update chart title
        const titles = {
            health: 'Health Rating Trend',
            digestion: 'Digestion Quality Trend',
            sleep: 'Sleep Quality & Duration',
            skin: 'Skin Status Trend',
            weight: 'Weight Tracking',
            mood: 'Mood Distribution',
            gym: 'Gym Activity Distribution',
            correlation: 'Health Correlations'
        };
        
        document.getElementById('mainChartTitle').textContent = titles[chartType];
        
        // Destroy existing chart
        if (this.charts.main) {
            this.charts.main.destroy();
        }
        
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        switch (chartType) {
            case 'health':
                this.createLineChart(ctx, entries, 'healthRating', 'Health Rating', '#667eea');
                break;
            case 'digestion':
                this.createLineChart(ctx, entries, 'digestion', 'Digestion Quality', '#48bb78');
                break;
            case 'sleep':
                this.createSleepChart(ctx, entries);
                break;
            case 'skin':
                this.createSkinChart(ctx, entries);
                break;
            case 'weight':
                this.createWeightChart(ctx, entries);
                break;
            case 'mood':
                this.createMoodChart(ctx, entries);
                break;
            case 'gym':
                this.createGymChart(ctx, entries);
                break;
            case 'correlation':
                this.createCorrelationChart(ctx, entries);
                break;
        }
    }

    createLineChart(ctx, entries, field, label, color) {
        const chartData = this.prepareTimeSeriesData(entries, field);
        
        this.charts.main = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: label,
                    data: chartData.data,
                    borderColor: color,
                    backgroundColor: color + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    createSkinChart(ctx, entries) {
        const skinAreas = ['skinHands', 'skinArms', 'skinStomachBack', 'skinThighs', 'skinLegsFeet'];
        const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac'];
        const labels = ['Hands', 'Arms', 'Stomach/Back', 'Thighs', 'Legs/Feet'];
        
        const datasets = skinAreas.map((area, index) => {
            const data = this.prepareTimeSeriesData(entries, area);
            return {
                label: labels[index],
                data: data.data,
                borderColor: colors[index],
                backgroundColor: colors[index] + '20',
                borderWidth: 2,
                pointRadius: 4
            };
        });

        this.charts.main = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.prepareTimeSeriesData(entries, 'skinHands').labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Skin Quality (1-10)'
                        }
                    }
                }
            }
        });
    }

    createWeightChart(ctx, entries) {
        const weightData = this.prepareTimeSeriesData(entries, 'weight');
        
        this.charts.main = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weightData.labels,
                datasets: [{
                    label: 'Weight (lb)',
                    data: weightData.data,
                    borderColor: '#9f7aea',
                    backgroundColor: '#9f7aea20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Weight (lb)'
                        }
                    }
                }
            }
        });
    }

    createSleepChart(ctx, entries) {
        const sleepData = this.prepareTimeSeriesData(entries, 'sleepQuality');
        const durationData = this.prepareTimeSeriesData(entries, 'sleepDuration');
        
        this.charts.main = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sleepData.labels,
                datasets: [{
                    label: 'Sleep Quality',
                    data: sleepData.data,
                    borderColor: '#805ad5',
                    backgroundColor: '#805ad520',
                    borderWidth: 3,
                    yAxisID: 'y'
                }, {
                    label: 'Sleep Duration (hours)',
                    data: durationData.data,
                    borderColor: '#38b2ac',
                    backgroundColor: '#38b2ac20',
                    borderWidth: 3,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        min: 0,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Sleep Quality'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 12,
                        title: {
                            display: true,
                            text: 'Hours'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    createMoodChart(ctx, entries) {
        const moodData = entries.reduce((acc, entry) => {
            if (entry.mood) {
                acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            }
            return acc;
        }, {});

        const moodOrder = ['terrible', 'poor', 'okay', 'good', 'excellent'];
        const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac'];

        this.charts.main = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: moodOrder.filter(mood => moodData[mood]),
                datasets: [{
                    data: moodOrder.filter(mood => moodData[mood]).map(mood => moodData[mood]),
                    backgroundColor: colors.slice(0, moodOrder.filter(mood => moodData[mood]).length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createGymChart(ctx, entries) {
        const gymData = entries.reduce((acc, entry) => {
            if (entry.gymSession) {
                acc[entry.gymSession] = (acc[entry.gymSession] || 0) + 1;
            }
            return acc;
        }, {});

        this.charts.main = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(gymData),
                datasets: [{
                    label: 'Workout Sessions',
                    data: Object.values(gymData),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb'],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createCorrelationChart(ctx, entries) {
        const correlationData = entries.filter(entry => 
            entry.healthRating && entry.sleepQuality
        ).map(entry => ({
            x: entry.sleepQuality,
            y: entry.healthRating
        }));

        this.charts.main = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Health vs Sleep Quality',
                    data: correlationData,
                    backgroundColor: '#667eea',
                    borderColor: '#667eea',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Sleep Quality'
                        },
                        min: 0,
                        max: 10
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Health Rating'
                        },
                        min: 0,
                        max: 10
                    }
                }
            }
        });
    }

    getEntriesFromLastNDays(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.entries.filter(entry => new Date(entry.date) >= cutoffDate);
    }

    prepareTimeSeriesData(entries, field) {
        // Sort entries by date
        const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Group by date and get the latest entry for each date
        const dailyData = {};
        sortedEntries.forEach(entry => {
            if (entry[field] !== undefined && entry[field] !== null) {
                dailyData[entry.date] = entry[field];
            }
        });

        const labels = Object.keys(dailyData).map(date => this.formatDateShort(new Date(date)));
        const data = Object.values(dailyData);

        return { labels, data };
    }

    // Data View Functions
    updateDataView() {
        if (this.currentDataView === 'table') {
            this.updateTableView();
        } else {
            this.updateCalendarView();
        }
    }

    switchDataView(viewType) {
        this.currentDataView = viewType;
        
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
        
        // Update view containers
        document.querySelectorAll('.data-view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewType}View`).classList.add('active');
        
        this.updateDataView();
    }

    updateTableView() {
        const filter = document.getElementById('dataColumnFilter').value;
        const sortedEntries = [...this.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const tableHead = document.getElementById('tableHead');
        const tableBody = document.getElementById('tableBody');
        
        // Define columns based on filter
        let columns = [];
        if (filter === 'all') {
            columns = [
                { key: 'date', label: 'Date' },
                { key: 'healthRating', label: 'Health' },
                { key: 'digestion', label: 'Digestion' },
                { key: 'sleepQuality', label: 'Sleep' },
                { key: 'weight', label: 'Weight' },
                { key: 'gymSession', label: 'Gym' },
                { key: 'mood', label: 'Mood' },
                { key: 'newSpots', label: 'New Spots' },
                { key: 'actions', label: 'Actions' }
            ];
        } else if (filter === 'health') {
            columns = [
                { key: 'date', label: 'Date' },
                { key: 'healthRating', label: 'Health Rating' },
                { key: 'mood', label: 'Mood' },
                { key: 'symptoms', label: 'Symptoms' },
                { key: 'weight', label: 'Weight' },
                { key: 'actions', label: 'Actions' }
            ];
        } else if (filter === 'diet') {
            columns = [
                { key: 'date', label: 'Date' },
                { key: 'whatIAte', label: 'What I Ate' },
                { key: 'dietNotes', label: 'Diet Notes' },
                { key: 'newFoods', label: 'New Foods' },
                { key: 'digestion', label: 'Digestion' },
                { key: 'triggers', label: 'Triggers' },
                { key: 'actions', label: 'Actions' }
            ];
        } else if (filter === 'activity') {
            columns = [
                { key: 'date', label: 'Date' },
                { key: 'gymSession', label: 'Gym Session' },
                { key: 'gymType', label: 'Workout Type' },
                { key: 'sleepDuration', label: 'Sleep Duration' },
                { key: 'sleepQuality', label: 'Sleep Quality' },
                { key: 'actions', label: 'Actions' }
            ];
        }
        
        // Create table header
        tableHead.innerHTML = `
            <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
        `;
        
        // Create table body
        tableBody.innerHTML = sortedEntries.map(entry => {
            const cells = columns.map(col => {
                if (col.key === 'actions') {
                    return `<td>
                        <button class="edit-btn" onclick="app.editEntry(${JSON.stringify(entry).replace(/"/g, '&quot;')})">Edit</button>
                        <button class="delete-btn" onclick="app.deleteEntry(${entry.id})">Delete</button>
                    </td>`;
                } else if (col.key === 'date') {
                    return `<td>${this.formatDateShort(new Date(entry.date))}</td>`;
                } else {
                    const value = entry[col.key];
                    return `<td>${value || '-'}</td>`;
                }
            }).join('');
            
            return `<tr>${cells}</tr>`;
        }).join('');
    }

    updateCalendarView() {
        const calendarContainer = document.getElementById('calendarContainer');
        const currentDate = this.currentCalendarDate;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        calendarContainer.innerHTML = `
            <div class="calendar-header">
                <button class="calendar-nav" onclick="app.navigateCalendar(-1)">‹</button>
                <h3>${monthNames[month]} ${year}</h3>
                <button class="calendar-nav" onclick="app.navigateCalendar(1)">›</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
                ${this.generateCalendarDays(year, month, firstDayOfWeek, daysInMonth)}
            </div>
        `;
    }

    generateCalendarDays(year, month, firstDayOfWeek, daysInMonth) {
        let html = '';
        
        // Previous month's trailing days
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            html += `<div class="calendar-day other-month">
                <div class="calendar-day-number">${day}</div>
            </div>`;
        }
        
        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = this.entries.find(e => e.date === dateStr);
            const hasEntry = entry ? 'has-entry' : '';
            
            const indicators = entry ? this.getCalendarIndicators(entry) : '';
            
            html += `<div class="calendar-day ${hasEntry}" onclick="app.selectCalendarDate('${dateStr}')">
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-indicators">${indicators}</div>
            </div>`;
        }
        
        return html;
    }

    getCalendarIndicators(entry) {
        let indicators = '';
        if (entry.healthRating >= 7) indicators += '<div class="calendar-indicator health"></div>';
        if (entry.gymSession) indicators += '<div class="calendar-indicator gym"></div>';
        if (entry.sleepQuality >= 7) indicators += '<div class="calendar-indicator sleep"></div>';
        return indicators;
    }

    navigateCalendar(direction) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + direction);
        this.updateCalendarView();
    }

    selectCalendarDate(dateStr) {
        const entry = this.entries.find(e => e.date === dateStr);
        if (entry) {
            this.editEntry(entry);
        } else {
            document.getElementById('entryDate').value = dateStr;
            this.showSection('log');
        }
    }

    updateHistory() {
        const historyList = document.getElementById('historyList');
        const sortedEntries = [...this.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (sortedEntries.length === 0) {
            historyList.innerHTML = '<p class="no-data">No entries found.</p>';
            return;
        }

        historyList.innerHTML = sortedEntries.map(entry => this.createHistoryEntry(entry)).join('');
    }

    createHistoryEntry(entry) {
        return `
            <div class="history-entry">
                <div class="entry-actions">
                    <button class="edit-btn" onclick="app.editEntry(${JSON.stringify(entry).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="delete-btn" onclick="app.deleteEntry(${entry.id})">Delete</button>
                </div>
                <div class="history-entry-header">
                    <span class="history-date">${this.formatDate(new Date(entry.date))}</span>
                    <span class="history-health">Health: ${entry.healthRating}/10</span>
                </div>
                <div class="history-content">
                    ${entry.whatIAte ? `
                        <div class="history-field">
                            <div class="history-field-label">What I Ate</div>
                            <div class="history-field-value">${entry.whatIAte}</div>
                        </div>
                    ` : ''}
                    ${entry.dietNotes ? `
                        <div class="history-field">
                            <div class="history-field-label">Diet Notes</div>
                            <div class="history-field-value">${entry.dietNotes}</div>
                        </div>
                    ` : ''}
                    ${entry.newFoods ? `
                        <div class="history-field">
                            <div class="history-field-label">New Foods</div>
                            <div class="history-field-value">${entry.newFoods}</div>
                        </div>
                    ` : ''}
                    ${entry.digestion ? `
                        <div class="history-field">
                            <div class="history-field-label">Digestion</div>
                            <div class="history-field-value">${entry.digestion}/10</div>
                        </div>
                    ` : ''}
                    ${this.getSkinSummary(entry) ? `
                        <div class="history-field">
                            <div class="history-field-label">Skin Status</div>
                            <div class="history-field-value">${this.getSkinSummary(entry)}</div>
                        </div>
                    ` : ''}
                    ${entry.newSpots && entry.newSpots !== '' ? `
                        <div class="history-field">
                            <div class="history-field-label">New Spots</div>
                            <div class="history-field-value">${entry.newSpots}</div>
                        </div>
                    ` : ''}
                    ${entry.weight ? `
                        <div class="history-field">
                            <div class="history-field-label">Weight</div>
                            <div class="history-field-value">${entry.weight}lb</div>
                        </div>
                    ` : ''}
                    ${this.getSupplementsSummary(entry) ? `
                        <div class="history-field">
                            <div class="history-field-label">Supplements</div>
                            <div class="history-field-value">${this.getSupplementsSummary(entry)}</div>
                        </div>
                    ` : ''}
                    ${entry.triggers ? `
                        <div class="history-field">
                            <div class="history-field-label">Triggers</div>
                            <div class="history-field-value">${entry.triggers}</div>
                        </div>
                    ` : ''}
                    ${entry.gymSession ? `
                        <div class="history-field">
                            <div class="history-field-label">Gym Session</div>
                            <div class="history-field-value">${entry.gymSession}${entry.gymType ? ` (${entry.gymType})` : ''} ${entry.gymNotes ? `- ${entry.gymNotes}` : ''}</div>
                        </div>
                    ` : ''}
                    ${entry.sleepDuration ? `
                        <div class="history-field">
                            <div class="history-field-label">Sleep</div>
                            <div class="history-field-value">${entry.sleepDuration}h (Quality: ${entry.sleepQuality}/10)</div>
                        </div>
                    ` : ''}
                    ${entry.symptoms ? `
                        <div class="history-field">
                            <div class="history-field-label">Symptoms</div>
                            <div class="history-field-value">${entry.symptoms}</div>
                        </div>
                    ` : ''}
                    ${entry.mood ? `
                        <div class="history-field">
                            <div class="history-field-label">Mood</div>
                            <div class="history-field-value">${entry.mood}</div>
                        </div>
                    ` : ''}
                    ${entry.notes ? `
                        <div class="history-field">
                            <div class="history-field-label">Additional Notes</div>
                            <div class="history-field-value">${entry.notes}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    filterHistory() {
        const filterValue = document.getElementById('historyFilter').value;
        if (!filterValue) return;

        const [year, month] = filterValue.split('-');
        const filteredEntries = this.entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() == year && (entryDate.getMonth() + 1) == month;
        });

        const historyList = document.getElementById('historyList');
        const sortedEntries = filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (sortedEntries.length === 0) {
            historyList.innerHTML = '<p class="no-data">No entries found for this month.</p>';
            return;
        }

        historyList.innerHTML = sortedEntries.map(entry => this.createHistoryEntry(entry)).join('');
    }

    clearHistoryFilter() {
        document.getElementById('historyFilter').value = '';
        this.updateHistory();
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateShort(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Export data
    exportData() {
        const dataStr = JSON.stringify(this.entries, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'health_tracker_data.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    exportCSV() {
        const headers = Object.keys(this.entries[0] || {});
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

        this.entries.forEach(entry => {
            const row = headers.map(header => {
                let cell = entry[header] === null || entry[header] === undefined ? '' : entry[header];
                if (typeof cell === 'string') {
                    cell = `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            });
            csvContent += row.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "health_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportXLSX() {
        const worksheet = XLSX.utils.json_to_sheet(this.entries);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Health Data");
        XLSX.writeFile(workbook, "health_data.xlsx");
    }

    // Import data
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    if (confirm('This will replace all existing data. Are you sure?')) {
                        this.entries = importedData;
                        this.saveToLocalStorage();
                        this.updateTodayView();
                        this.updateHistory();
                        this.updateDataView();
                        this.showNotification('Data imported successfully!');
                    }
                }
            } catch (error) {
                alert('Invalid file format. Please select a valid JSON file.');
            }
        };
        reader.readAsText(file);
    }

    // Bedtime Quiz Functions
    initializeQuestions() {
        return [
            {
                id: 'healthRating',
                icon: '❤️',
                title: 'How would you rate your overall health today?',
                subtitle: 'Think about your energy levels, how you felt physically, and your general well-being',
                type: 'rating',
                field: 'healthRating',
                min: 1,
                max: 10,
                labels: ['Terrible', 'Amazing']
            },
            {
                id: 'whatIAte',
                icon: '🍽️',
                title: 'What did you eat today?',
                subtitle: 'List all meals, snacks, and drinks you had throughout the day',
                type: 'textarea',
                field: 'whatIAte',
                placeholder: 'Breakfast: eggs and toast\nLunch: chicken salad\nDinner: pasta with vegetables...'
            },
            {
                id: 'dietNotes',
                icon: '📋',
                title: 'Any additional diet notes?',
                subtitle: 'Diet observations, reactions, or anything noteworthy about your eating today',
                type: 'textarea',
                field: 'dietNotes',
                placeholder: 'Felt bloated after lunch, craved sweets in afternoon, ate later than usual...'
            },
            {
                id: 'newFoods',
                icon: '🆕',
                title: 'Did you try any new foods today?',
                subtitle: 'Note any foods you ate for the first time or foods you don\'t normally eat',
                type: 'input',
                field: 'newFoods',
                placeholder: 'Quinoa salad, almond milk, etc.'
            },
            {
                id: 'digestion',
                icon: '🦠',
                title: 'How was your digestion today?',
                subtitle: 'Rate any bloating, stomach discomfort, or digestive issues',
                type: 'rating',
                field: 'digestion',
                min: 1,
                max: 10,
                labels: ['Very Poor', 'Perfect']
            },
            {
                id: 'triggers',
                icon: '⚠️',
                title: 'Did you notice any potential triggers?',
                subtitle: 'Foods, stress, activities, or other factors that might have affected your health',
                type: 'input',
                field: 'triggers',
                placeholder: 'Dairy products, spicy food, stress at work, lack of sleep...'
            },
            {
                id: 'skinHands',
                icon: '🖐️',
                title: 'How is the skin on your hands?',
                subtitle: 'Rate any redness, dryness, itching, or eczema symptoms',
                type: 'rating',
                field: 'skinHands',
                min: 1,
                max: 10,
                labels: ['Very Bad', 'Perfect']
            },
            {
                id: 'skinArms',
                icon: '💪',
                title: 'How is the skin on your arms?',
                subtitle: 'Check for any irritation, redness, or changes',
                type: 'rating',
                field: 'skinArms',
                min: 1,
                max: 10,
                labels: ['Very Bad', 'Perfect']
            },
            {
                id: 'skinStomachBack',
                icon: '🫃',
                title: 'How is the skin on your stomach and back?',
                subtitle: 'Look for any new spots, redness, or changes',
                type: 'rating',
                field: 'skinStomachBack',
                min: 1,
                max: 10,
                labels: ['Very Bad', 'Perfect']
            },
            {
                id: 'skinThighs',
                icon: '🦵',
                title: 'How is the skin on your thighs?',
                subtitle: 'Check for any irritation or changes',
                type: 'rating',
                field: 'skinThighs',
                min: 1,
                max: 10,
                labels: ['Very Bad', 'Perfect']
            },
            {
                id: 'skinLegsFeet',
                icon: '🦶',
                title: 'How is the skin on your legs and feet?',
                subtitle: 'Look for any dryness, redness, or other changes',
                type: 'rating',
                field: 'skinLegsFeet',
                min: 1,
                max: 10,
                labels: ['Very Bad', 'Perfect']
            },
            {
                id: 'newSpots',
                icon: '🔍',
                title: 'Did any new spots appear today?',
                subtitle: 'New eczema patches, rashes, or skin changes',
                type: 'select',
                field: 'newSpots',
                options: [
                    { value: '', text: 'Select...' },
                    { value: 'yes', text: 'Yes' },
                    { value: 'no', text: 'No' }
                ]
            },
            {
                id: 'newSpotsNotes',
                icon: '📍',
                title: 'Tell me about any new spots that appeared',
                subtitle: 'Describe the location, size, appearance of new spots',
                type: 'textarea',
                field: 'newSpotsNotes',
                placeholder: 'Small red patch on left forearm, about 2cm diameter, slightly raised...'
            },
            {
                id: 'existingSpotsChange',
                icon: '🔄',
                title: 'Any changes in existing spots?',
                subtitle: 'Note if existing spots got better, worse, changed color, size, etc.',
                type: 'textarea',
                field: 'existingSpotsChange',
                placeholder: 'Spot on wrist is less red today, patch on ankle seems slightly larger...'
            },
            {
                id: 'weight',
                icon: '⚖️',
                title: 'Did you weigh yourself today?',
                subtitle: 'Enter your weight if you stepped on the scale',
                type: 'number',
                field: 'weight',
                placeholder: '75.5',
                step: '0.01'
            },
            {
                id: 'supplements',
                icon: '💊',
                title: 'Which supplements did you take today?',
                subtitle: 'Select all the supplements and treatments you used',
                type: 'supplements',
                supplements: [
                    { field: 'omega3', label: 'Omega 3' },
                    { field: 'melatonin', label: 'Melatonin' },
                    { field: 'creatine', label: 'Creatine' },
                    { field: 'finasteride', label: 'Finasteride' },
                    { field: 'minoxidil', label: 'Minoxidil' },
                    { field: 'diacladerm', label: 'Diacladerm' },
                    { field: 'karela', label: 'Karela' }
                ]
            },
            {
                id: 'gymSession',
                icon: '🏋️',
                title: 'Did you exercise today?',
                subtitle: 'Choose the intensity of your workout',
                type: 'select',
                field: 'gymSession',
                options: [
                    { value: '', text: 'No exercise' },
                    { value: 'light', text: 'Light workout' },
                    { value: 'moderate', text: 'Moderate workout' },
                    { value: 'intense', text: 'Intense workout' }
                ]
            },
            {
                id: 'gymType',
                icon: '💪',
                title: 'What type of workout did you do?',
                subtitle: 'Select the main focus of your training session',
                type: 'select',
                field: 'gymType',
                condition: (quizData) => quizData.gymSession && quizData.gymSession !== '',
                options: [
                    { value: '', text: 'Select type...' },
                    { value: 'push', text: 'Push (Chest, Shoulders, Triceps)' },
                    { value: 'pull', text: 'Pull (Back, Biceps)' },
                    { value: 'legs', text: 'Legs (Quads, Hamstrings, Glutes, Calves)' },
                    { value: 'cardio', text: 'Cardio' },
                    { value: 'full-body', text: 'Full Body' },
                    { value: 'other', text: 'Other' }
                ]
            },
            {
                id: 'gymNotes',
                icon: '�',
                title: 'Any notes on your workout?',
                subtitle: 'Exercises, duration, how you felt, personal records, etc.',
                type: 'textarea',
                field: 'gymNotes',
                placeholder: 'Felt strong on bench press, ran 5k in 25 mins...',
                condition: (quizData) => quizData.gymSession && quizData.gymSession !== ''
            },
            {
                id: 'mood',
                icon: '��',
                title: 'How was your mood today?',
                subtitle: 'Your overall emotional state and mental well-being',
                type: 'select',
                field: 'mood',
                options: [
                    { value: '', text: 'Select mood...' },
                    { value: 'excellent', text: '😄 Excellent' },
                    { value: 'good', text: '😊 Good' },
                    { value: 'okay', text: '😐 Okay' },
                    { value: 'poor', text: '😔 Poor' },
                    { value: 'terrible', text: '😞 Terrible' }
                ]
            },
            {
                id: 'sleepDuration',
                icon: '⏰',
                title: 'How many hours did you sleep last night?',
                subtitle: 'Your total sleep time from when you fell asleep to when you woke up',
                type: 'number',
                field: 'sleepDuration',
                placeholder: '8.5',
                step: '0.01',
                min: '0',
                max: '24'
            },
            {
                id: 'sleepQuality',
                icon: '😴',
                title: 'How would you rate your sleep quality?',
                subtitle: 'Consider how rested you feel and how well you slept',
                type: 'rating',
                field: 'sleepQuality',
                min: 1,
                max: 10,
                labels: ['Terrible', 'Perfect']
            },
            {
                id: 'symptoms',
                icon: '🤒',
                title: 'Any symptoms or discomfort today?',
                subtitle: 'Headaches, fatigue, pain, or any other symptoms you experienced',
                type: 'input',
                field: 'symptoms',
                placeholder: 'Headache, fatigue, joint pain, etc.'
            },
            {
                id: 'notes',
                icon: '📝',
                title: 'Any additional notes about your day?',
                subtitle: 'Anything else you want to remember about today',
                type: 'textarea',
                field: 'notes',
                placeholder: 'Stressful day at work, felt energetic after workout, etc.'
            }
        ];
    }

    startQuiz() {
        this.quizData = {};
        this.currentQuestionIndex = 0;
        
        // Hide welcome screen
        document.getElementById('welcomeScreen').classList.remove('active');
        
        // Show question screen
        setTimeout(() => {
            document.getElementById('questionScreen').classList.add('active');
            this.showCurrentQuestion();
        }, 300);
        
        this.updateProgress();
    }

    showCurrentQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        if (!question) return;

        // Update question content
        document.getElementById('questionIcon').textContent = question.icon;
        document.getElementById('questionTitle').textContent = question.title;
        document.getElementById('questionSubtitle').textContent = question.subtitle;

        // Create input based on question type
        const inputContainer = document.getElementById('questionInput');
        inputContainer.innerHTML = this.createQuestionInput(question);

        // Set existing value if any
        if (this.quizData[question.field] !== undefined) {
            this.setQuestionValue(question, this.quizData[question.field]);
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.style.display = this.currentQuestionIndex > 0 ? 'flex' : 'none';
        nextBtn.innerHTML = this.currentQuestionIndex === this.questions.length - 1 ? 
            '<span>Finish</span><div class="btn-icon">✨</div>' : 
            '<span>Next</span><div class="btn-icon">→</div>';

        this.updateProgress();
    }

    createQuestionInput(question) {
        switch (question.type) {
            case 'rating':
                return `
                    <div class="quiz-rating">
                        <div class="quiz-slider">
                            <input type="range" id="quizInput" min="${question.min}" max="${question.max}" value="5" 
                                   oninput="updateQuizRatingValue(this.value)">
                            <div class="quiz-rating-value" id="ratingValue">5</div>
                        </div>
                        <div class="quiz-rating-labels">
                            <span>${question.labels[0]}</span>
                            <span>${question.labels[1]}</span>
                        </div>
                    </div>
                `;
            
            case 'textarea':
                return `<textarea class="quiz-textarea" id="quizInput" placeholder="${question.placeholder}"></textarea>`;
            
            case 'input':
                return `<input type="text" class="quiz-input" id="quizInput" placeholder="${question.placeholder}">`;
            
            case 'number':
                return `<input type="number" class="quiz-input" id="quizInput" placeholder="${question.placeholder}" 
                               step="${question.step || '1'}" min="${question.min || ''}" max="${question.max || ''}">`;
            
            case 'select':
                const options = question.options.map(opt => 
                    `<option value="${opt.value}">${opt.text}</option>`
                ).join('');
                return `<select class="quiz-select" id="quizInput">${options}</select>`;
            
            case 'supplements':
                const supplements = question.supplements.map(supp => `
                    <div class="quiz-supplement">
                        <label>${supp.label}</label>
                        <select data-field="${supp.field}">
                            <option value="">-</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                `).join('');
                return `<div class="quiz-supplements">${supplements}</div>`;
            
            default:
                return `<input type="text" class="quiz-input" id="quizInput">`;
        }
    }

    setQuestionValue(question, value) {
        if (question.type === 'supplements') {
            // Handle supplements separately
            question.supplements.forEach(supp => {
                const select = document.querySelector(`[data-field="${supp.field}"]`);
                if (select && this.quizData[supp.field]) {
                    select.value = this.quizData[supp.field];
                }
            });
        } else {
            const input = document.getElementById('quizInput');
            if (input) {
                input.value = value;
                if (question.type === 'rating') {
                    document.getElementById('ratingValue').textContent = value;
                }
            }
        }
    }

    nextQuestion() {
        this.saveCurrentAnswer();

        let nextIndex = this.currentQuestionIndex + 1;
        while (nextIndex < this.questions.length) {
            const nextQuestion = this.questions[nextIndex];
            if (!nextQuestion.condition || nextQuestion.condition(this.quizData)) {
                this.currentQuestionIndex = nextIndex;
                this.showCurrentQuestion();
                return;
            }
            // If condition is not met, skip this question and also clear any previous data for it
            if (this.quizData[nextQuestion.field]) {
                delete this.quizData[nextQuestion.field];
            }
            nextIndex++;
        }

        this.finishQuiz();
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.saveCurrentAnswer();
            
            let prevIndex = this.currentQuestionIndex - 1;
            while (prevIndex >= 0) {
                const prevQuestion = this.questions[prevIndex];
                if (!prevQuestion.condition || prevQuestion.condition(this.quizData)) {
                    this.currentQuestionIndex = prevIndex;
                    this.showCurrentQuestion();
                    return;
                }
                prevIndex--;
            }
        }
    }

    saveCurrentAnswer() {
        const question = this.questions[this.currentQuestionIndex];
        
        if (question.type === 'supplements') {
            // Handle supplements
            question.supplements.forEach(supp => {
                const select = document.querySelector(`[data-field="${supp.field}"]`);
                if (select && select.value) {
                    this.quizData[supp.field] = select.value;
                }
            });
        } else {
            const input = document.getElementById('quizInput');
            if (input && input.value) {
                if (question.type === 'rating' || question.type === 'number') {
                    this.quizData[question.field] = parseFloat(input.value);
                } else {
                    this.quizData[question.field] = input.value;
                }
            }
        }
    }

    updateProgress() {
        const visibleQuestions = this.questions.filter(q => !q.condition || q.condition(this.quizData));
        const currentVisibleIndex = visibleQuestions.findIndex(q => q.id === this.questions[this.currentQuestionIndex].id);

        const progress = ((currentVisibleIndex + 1) / visibleQuestions.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = 
            `Question ${currentVisibleIndex + 1} of ${visibleQuestions.length}`;
    }

    finishQuiz() {
        this.saveCurrentAnswer();
        
        // Hide question screen
        document.getElementById('questionScreen').classList.remove('active');
        
        // Show summary screen
        setTimeout(() => {
            document.getElementById('summaryScreen').classList.add('active');
            this.showSummary();
        }, 300);
    }

    showSummary() {
        const summaryContainer = document.getElementById('summaryCards');
        
        // Create summary cards
        const cards = [
            {
                icon: '❤️',
                title: 'Health Rating',
                value: this.quizData.healthRating ? `${this.quizData.healthRating}/10` : '-'
            },
            {
                icon: '🦠',
                title: 'Digestion',
                value: this.quizData.digestion ? `${this.quizData.digestion}/10` : '-'
            },
            {
                icon: '😴',
                title: 'Sleep Quality',
                value: this.quizData.sleepQuality ? `${this.quizData.sleepQuality}/10` : '-'
            },
            {
                icon: '😊',
                title: 'Mood',
                value: this.quizData.mood ? this.quizData.mood.charAt(0).toUpperCase() + this.quizData.mood.slice(1) : '-'
            },
            {
                icon: '🏋️',
                title: 'Exercise',
                value: this.quizData.gymSession ? `${this.quizData.gymSession.charAt(0).toUpperCase() + this.quizData.gymSession.slice(1)}${this.quizData.gymType ? ` (${this.quizData.gymType})` : ''}` : 'None'
            },
            {
                icon: '⚖️',
                title: 'Weight',
                value: this.quizData.weight ? `${this.quizData.weight}lb` : '-'
            }
        ];

        summaryContainer.innerHTML = cards.map(card => `
            <div class="summary-card">
                <div class="summary-card-icon">${card.icon}</div>
                <div class="summary-card-title">${card.title}</div>
                <div class="summary-card-value">${card.value}</div>
            </div>
        `).join('');
    }

    async saveQuizEntry() {
        const saveBtn = document.querySelector('[onclick="saveQuizEntry()"]');
        
        // Create entry from quiz data
        const entry = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            ...this.quizData
        };

        try {
            await this.loadingManager.withLoading(async () => {
                // Check if entry for today exists
                const today = entry.date;
                const existingEntryIndex = this.entries.findIndex(e => e.date === today);
                
                if (existingEntryIndex >= 0) {
                    if (confirm('An entry for today already exists. Do you want to update it?')) {
                        // Update existing entry
                        entry.firebaseId = this.entries[existingEntryIndex].firebaseId;
                        entry.id = this.entries[existingEntryIndex].id;
                        
                        await this.saveEntryToFirebase(entry);
                        this.entries[existingEntryIndex] = { ...this.entries[existingEntryIndex], ...entry };
                    } else {
                        return;
                    }
                } else {
                    // Save new entry to Firebase
                    const firebaseId = await this.saveEntryToFirebase(entry);
                    entry.firebaseId = firebaseId;
                    this.entries.push(entry);
                }

                // Backup to localStorage
                this.saveToLocalStorage();
            }, {
                button: saveBtn,
                message: 'Saving bedtime entry...'
            });

            // Show enhanced success notification with chime sound for quiz completion
            this.loadingManager.showSuccessNotificationWithEffects('Bedtime entry saved and synced! 🌙☁️', saveBtn, true);
            
            this.updateTodayView();
            this.updateHistory();
            this.updateDataView();
            
            // Reset quiz and go back to today view
            this.resetQuiz();
            this.showSection('today');
            
        } catch (error) {
            console.error('Firebase save failed:', error);
            
            // Fallback to local storage only
            const today = entry.date;
            const existingEntryIndex = this.entries.findIndex(e => e.date === today);
            
            if (existingEntryIndex >= 0) {
                if (confirm('An entry for today already exists. Do you want to update it?')) {
                    this.entries[existingEntryIndex] = { ...this.entries[existingEntryIndex], ...entry };
                } else {
                    return;
                }
            } else {
                this.entries.push(entry);
            }
            
            this.saveToLocalStorage();
            this.showNotification('Bedtime entry saved locally (cloud sync failed) 🌙💾');
            
            this.updateTodayView();
            this.updateHistory();
            this.updateDataView();
            
            // Reset quiz and go back to today view
            this.resetQuiz();
            this.showSection('today');
        }
    }

    restartQuiz() {
        this.resetQuiz();
        this.startQuiz();
    }

    resetQuiz() {
        this.quizData = {};
        this.currentQuestionIndex = 0;
        
        // Hide all screens
        document.querySelectorAll('.quiz-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show welcome screen
        document.getElementById('welcomeScreen').classList.add('active');
        
        // Reset progress
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressText').textContent = 'Question 1 of 20';
    }
}

// Global functions for HTML onclick handlers
function showSection(sectionName) {
    app.showSection(sectionName);
}

function filterHistory() {
    app.filterHistory();
}

function clearHistoryFilter() {
    app.clearHistoryFilter();
}

function switchDataView(viewType) {
    app.switchDataView(viewType);
}

function updateDataView() {
    app.updateDataView();
}

function updateSelectedChart() {
    app.updateSelectedChart();
}

function switchChartMode(mode) {
    app.switchChartMode(mode);
}

function updateCurrentChart() {
    app.updateCurrentChart();
}

function updateMultiChart() {
    app.updateMultiChart();
}

function selectAllMetrics() {
    app.selectAllMetrics();
}

function clearAllMetrics() {
    app.clearAllMetrics();
}

function selectSkinMetrics() {
    app.selectSkinMetrics();
}

// Quiz Global Functions
function startQuiz() {
    app.startQuiz();
}

function nextQuestion() {
    app.nextQuestion();
}

function previousQuestion() {
    app.previousQuestion();
}

function saveQuizEntry() {
    app.saveQuizEntry();
}

function restartQuiz() {
    app.restartQuiz();
}

function updateQuizRatingValue(value) {
    document.getElementById('ratingValue').textContent = value;
}

// Initialize the app
const app = new HealthTracker();

// Make app and audio manager globally available
window.app = app;
window.audioManager = app.audioManager;

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
