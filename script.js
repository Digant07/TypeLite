class TypingSpeedTesterPro {
    constructor() {
        this.textSources = {
            general: [
                "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice.",
                "Programming is the art of telling another human being what one wants the computer to do. It requires logical thinking and problem-solving skills.",
                "Technology has revolutionized the way we live, work, and communicate. From smartphones to artificial intelligence, innovations continue to reshape our experiences."
            ],
            literature: [
                "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness. Charles Dickens captured the contradictions of his era.",
                "Call me Ishmael. Some years ago having little money in my purse, I thought I would sail about and see the watery part of the world.",
                "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune."
            ],
            technology: [
                "Artificial intelligence and machine learning are transforming how we interact with technology and process information in the digital age.",
                "Cloud computing enables on-demand access to computing resources and applications over the internet without direct management.",
                "Blockchain technology provides a decentralized ledger system that ensures transparency and security of digital transactions."
            ],
            quotes: [
                "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Stay hungry, stay foolish.",
                "Yesterday is history, tomorrow is a mystery, today is a gift. That's why it's called the present.",
                "Innovation distinguishes between a leader and a follower. Think different and challenge the status quo in everything you do."
            ],
            news: [
                "Scientists have discovered a new species of deep-sea creature that can survive in extreme pressure conditions previously thought impossible.",
                "The latest research in renewable energy shows promising advances in solar panel efficiency and battery storage technology.",
                "Economic analysts predict significant changes in global markets due to emerging technologies and shifting consumer behaviors."
            ]
        };

        this.difficultyLevels = {
            easy: { modifier: 0.8, description: "Simple words and common phrases" },
            medium: { modifier: 1.0, description: "Mixed content with moderate complexity" },
            hard: { modifier: 1.3, description: "Complex sentences and advanced vocabulary" },
            programming: { modifier: 1.5, description: "Code snippets and technical terms" }
        };

        this.programmingTexts = [
            "function calculateTypingSpeed(startTime, endTime, chars) { const duration = (endTime - startTime) / 1000; return Math.round((chars / 5) / (duration / 60)); }",
            "const tester = new TypingSpeedTester(); tester.initialize(); document.addEventListener('DOMContentLoaded', () => { tester.start(); });",
            "if (condition && array.length > 0) { return array.filter(item => item.isValid).map(item => ({ id: item.id, value: item.value })); }",
            "class DataProcessor { constructor(config) { this.config = config; } process(data) { return data.filter(this.isValid).map(this.transform); } }",
            "async function fetchData(id) { try { const response = await fetch(`/api/users/${id}`); return await response.json(); } catch (error) { throw error; } }"
        ];

        // Initialize state
        this.currentText = '';
        this.currentIndex = 0;
        this.isTyping = false;
        this.startTime = null;
        this.timeLeft = 60;
        this.timerInterval = null;
        this.errors = 0;
        this.totalChars = 0;
        this.correctChars = 0;
        this.keystrokeData = [];
        this.errorMap = new Map();
        this.problemKeys = new Map();
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.userLevel = 1;
        this.experience = 0;
        
        // Settings
        this.difficulty = 'medium';
        this.duration = 60;
        this.category = 'general';
        this.soundEnabled = true;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.loadRandomText();
        this.updateLevel();
        this.loadProgress();
    }
    
    initializeElements() {
        // Main elements
        const elements = ['textDisplay', 'textInput', 'startBtn', 'resetBtn', 'historyBtn', 'wpm', 'accuracy', 'timer', 'errors', 'streak', 'level', 'difficulty', 'duration', 'category', 'soundEnabled', 'results', 'finalWPM', 'finalAccuracy', 'finalErrors', 'finalChars', 'historyPanel', 'errorAnalysis', 'achievements', 'successSound', 'errorSound', 'completionSound'];
        elements.forEach(id => this[id] = document.getElementById(id));
        
        // Create aliases for common elements
        this.wpmElement = this.wpm;
        this.accuracyElement = this.accuracy;
        this.timerElement = this.timer;
        this.errorsElement = this.errors;
        this.streakElement = this.streak;
        this.levelElement = this.level;
        this.difficultySelect = this.difficulty;
        this.durationSelect = this.duration;
        this.categorySelect = this.category;
        this.soundCheckbox = this.soundEnabled;
        this.resultsPanel = this.results;
        this.successSound = this.successSound;
        this.errorSound = this.errorSound;
        this.completionSound = this.completionSound;
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startTest());
        this.resetBtn.addEventListener('click', () => this.resetTest());
        this.historyBtn.addEventListener('click', () => this.toggleHistory());
        
        // Close history button
        const closeHistoryBtn = document.getElementById('closeHistoryBtn');
        if (closeHistoryBtn) {
            closeHistoryBtn.addEventListener('click', () => this.toggleHistory());
        }
        
        this.textInput.addEventListener('input', (e) => this.handleTyping(e));
        this.textInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.saveSettings();
            this.loadRandomText();
        });
        
        this.durationSelect.addEventListener('change', (e) => {
            this.duration = parseInt(e.target.value);
            this.timeLeft = this.duration;
            this.timerElement.textContent = this.duration;
            this.saveSettings();
        });
        
        this.categorySelect.addEventListener('change', (e) => {
            this.category = e.target.value;
            this.saveSettings();
            this.loadRandomText();
        });
        
        this.soundCheckbox.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            this.saveSettings();
        });
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('typingTesterSettings') || '{}');
        
        // Load difficulty
        if (settings.difficulty) {
            this.difficulty = settings.difficulty;
            this.difficultySelect.value = this.difficulty;
        }
        
        // Load duration
        if (settings.duration) {
            this.duration = settings.duration;
            this.timeLeft = this.duration;
            this.durationSelect.value = this.duration;
            this.timerElement.textContent = this.duration;
        }
        
        // Load category
        if (settings.category) {
            this.category = settings.category;
            this.categorySelect.value = this.category;
        }
        
        // Load sound setting
        if (settings.soundEnabled !== undefined) {
            this.soundEnabled = settings.soundEnabled;
            this.soundCheckbox.checked = this.soundEnabled;
        }
    }
    
    saveSettings() {
        localStorage.setItem('typingTesterSettings', JSON.stringify({
            difficulty: this.difficulty,
            duration: this.duration,
            category: this.category,
            soundEnabled: this.soundEnabled
        }));
    }
    
    loadRandomText() {
        const texts = this.difficulty === 'programming' ? this.programmingTexts : this.textSources[this.category] || this.textSources.general;
        const numTexts = Math.ceil(800 / texts[0].length);
        
        let combinedText = '';
        for (let i = 0; i < numTexts; i++) {
            combinedText += texts[Math.floor(Math.random() * texts.length)] + (i < numTexts - 1 ? ' ' : '');
        }
        
        this.currentText = combinedText.replace(/\s+/g, ' ').replace(/\s*\.\s*/g, '. ').replace(/\s*,\s*/g, ', ').trim();
        
        // Apply difficulty modifier
        const modifier = this.difficultyLevels[this.difficulty].modifier;
        if (modifier !== 1.0) {
            const targetLength = Math.floor(this.currentText.length * modifier);
            if (targetLength < this.currentText.length && targetLength > 400) {
                const breakPoint = this.currentText.lastIndexOf('. ', targetLength) || this.currentText.lastIndexOf(' ', targetLength);
                if (breakPoint > targetLength * 0.8) this.currentText = this.currentText.substring(0, breakPoint + 1);
            }
        }
        
        this.displayText();
    }
    
    displayText() {
        let html = '';
        let charIndex = 0;
        
        for (let i = 0; i < this.currentText.length; i++) {
            const char = this.currentText[i];
            
            if (char === ' ') {
                html += `<span id="char-${charIndex}" class="text-char space-char">&nbsp;</span>`;
            } else if (char === '\n') {
                html += `<span id="char-${charIndex}" class="text-char"><br></span>`;
            } else {
                html += `<span id="char-${charIndex}" class="text-char">${char}</span>`;
            }
            charIndex++;
        }
        
        this.textDisplay.innerHTML = html;
    }
    
    startTest() {
        this.isTyping = true;
        this.startTime = Date.now();
        this.currentIndex = 0;
        this.errors = 0;
        this.totalChars = 0;
        this.correctChars = 0;
        this.keystrokeData = [];
        this.errorMap.clear();
        this.problemKeys.clear();
        this.currentStreak = 0;
        this.timeLeft = this.duration;
        
        this.textInput.disabled = false;
        this.textInput.value = '';
        this.textInput.focus();
        this.textInput.placeholder = 'Start typing the text above...';
        
        this.startBtn.disabled = true;
        this.startBtn.textContent = 'Typing...';
        
        this.resultsPanel.classList.add('hidden');
        this.historyPanel.classList.add('hidden');
        
        this.startTimer();
        this.highlightCurrentChar();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endTest();
            }
        }, 1000);
    }
    
    handleKeyDown(e) {
        if (!this.isTyping) return;
        
        this.keystrokeData.push({
            key: e.key,
            timestamp: Date.now(),
            correct: null
        });
        
        if (e.ctrlKey && ['v', 'c', 'x', 'a'].includes(e.key)) {
            e.preventDefault();
            return;
        }
    }
    
    handleTyping(e) {
        if (!this.isTyping) return;
        
        const typedText = e.target.value;
        const typedLength = typedText.length;
        
        if (typedLength > this.currentText.length - 50) {
            this.extendText();
        }
        
        this.totalChars = typedLength;
        this.correctChars = 0;
        this.errors = 0;
        
        this.clearHighlighting();
        
        for (let i = 0; i < typedLength; i++) {
            const charElement = document.getElementById(`char-${i}`);
            const typedChar = typedText[i];
            const correctChar = this.currentText[i];
            
            if (typedChar === correctChar) {
                charElement.classList.add('correct');
                this.correctChars++;
                this.currentStreak++;
                
                if (this.soundEnabled && this.currentStreak % 10 === 0) {
                    this.playSound(this.successSound);
                }
            } else {
                charElement.classList.add('incorrect');
                this.errors++;
                this.currentStreak = 0;
                
                const errorKey = `${correctChar} → ${typedChar}`;
                this.errorMap.set(errorKey, (this.errorMap.get(errorKey) || 0) + 1);
                this.problemKeys.set(correctChar, (this.problemKeys.get(correctChar) || 0) + 1);
                
                if (this.soundEnabled) {
                    this.playSound(this.errorSound);
                }
            }
        }
        
        if (this.currentStreak > this.bestStreak) {
            this.bestStreak = this.currentStreak;
        }
        
        this.currentIndex = typedLength;
        this.highlightCurrentChar();
        
        this.updateStats();
    }
    
    extendText() {
        const texts = this.difficulty === 'programming' ? this.programmingTexts : this.textSources[this.category] || this.textSources.general;
        const additionalText = texts[Math.floor(Math.random() * texts.length)]
            .replace(/\s+/g, ' ')
            .replace(/\s*\.\s*/g, '. ')
            .replace(/\s*,\s*/g, ', ')
            .trim();
        
        this.currentText += ' ' + additionalText;
        this.displayText();
    }
    
    clearHighlighting() {
        const allChars = this.textDisplay.querySelectorAll('span');
        allChars.forEach(char => {
            char.classList.remove('correct', 'incorrect', 'current');
        });
    }
    
    highlightCurrentChar() {
        if (this.currentIndex < this.currentText.length) {
            const currentChar = document.getElementById(`char-${this.currentIndex}`);
            if (currentChar) {
                currentChar.classList.add('current');
                
                this.scrollToCurrentChar(currentChar);
            }
        }
    }
    
    scrollToCurrentChar(currentChar) {
        const textDisplay = this.textDisplay;
        const charRect = currentChar.getBoundingClientRect();
        const displayRect = textDisplay.getBoundingClientRect();
        
        if (charRect.bottom > displayRect.bottom - 20) {
            const scrollAmount = charRect.bottom - displayRect.bottom + 40;
            textDisplay.scrollTop += scrollAmount;
        } else if (charRect.top < displayRect.top + 20) {
            const scrollAmount = displayRect.top - charRect.top + 40;
            textDisplay.scrollTop -= scrollAmount;
        }
    }
    
    updateStats() {
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60;
        const wordsTyped = this.correctChars / 5;
        const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        
        const accuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        
        this.wpmElement.textContent = wpm;
        this.accuracyElement.textContent = accuracy;
        this.errorsElement.textContent = this.errors;
        this.streakElement.textContent = this.bestStreak;
        this.levelElement.textContent = this.userLevel;
    }
    
    endTest() {
        this.isTyping = false;
        clearInterval(this.timerInterval);
        
        this.textInput.disabled = true;
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Test';
        
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60;
        const wordsTyped = this.correctChars / 5;
        const finalWPM = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        const finalAccuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        
        this.addExperience(finalWPM, finalAccuracy);
        
        this.finalWPM.textContent = finalWPM;
        this.finalAccuracy.textContent = `${finalAccuracy}%`;
        this.finalErrors.textContent = this.errors;
        this.finalChars.textContent = this.totalChars;
        
        this.showErrorAnalysis();
        
        this.checkAchievements(finalWPM, finalAccuracy);
        
        this.saveProgress(finalWPM, finalAccuracy);
        
        this.resultsPanel.classList.remove('hidden');
        
        if (this.soundEnabled) {
            this.playSound(this.completionSound);
        }
        
        if (finalWPM >= 60 && finalAccuracy >= 95) {
            this.celebrateGoodPerformance();
        }
    }
    
    showErrorAnalysis() {
        const commonErrorsList = document.getElementById('commonErrorsList');
        const problemKeysList = document.getElementById('problemKeysList');
        
        commonErrorsList.innerHTML = '';
        problemKeysList.innerHTML = '';
        
        if (this.errorMap.size === 0) {
            commonErrorsList.innerHTML = '<div class="perfect-message">🎉 Perfect Typing! No errors detected!</div>';
            problemKeysList.innerHTML = '<div class="perfect-message">🎯 Flawless Performance!</div>';
            return;
        }
        
        const sortedErrors = Array.from(this.errorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, Math.min(5, this.errorMap.size));
        
        if (sortedErrors.length > 0) {
            sortedErrors.forEach(([error, count]) => {
                const li = document.createElement('li');
                li.textContent = `${error} (${count} time${count > 1 ? 's' : ''})`;
                commonErrorsList.appendChild(li);
            });
        } else {
            commonErrorsList.innerHTML = '<div class="no-errors-message">✨ No repeated errors found!</div>';
        }
        
        const sortedKeys = Array.from(this.problemKeys.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, Math.min(8, this.problemKeys.size));
        
        if (sortedKeys.length > 0) {
            sortedKeys.forEach(([key, count]) => {
                const span = document.createElement('span');
                span.className = 'problem-key';
                span.textContent = key === ' ' ? 'SPACE' : key.toUpperCase();
                span.title = `${count} error${count > 1 ? 's' : ''} - Click for tips`;
                
                span.addEventListener('click', () => {
                    this.showKeyTip(key, count);
                });
                
                problemKeysList.appendChild(span);
            });
        } else {
            problemKeysList.innerHTML = '<div class="perfect-message">🎯 No Problem Keys!</div>';
        }
    }
    
    showKeyTip(key, errorCount) {
        const tips = {
            ' ': 'Use your dominant thumb for spacebar',
            'a': 'Left pinky for A key',
            's': 'Left ring finger for S key',
            'd': 'Left middle finger for D key',
            'f': 'Left index finger for F key',
            'j': 'Right index finger for J key',
            'k': 'Right middle finger for K key',
            'l': 'Right ring finger for L key'
        };
        
        const tip = tips[key.toLowerCase()] || `Practice the ${key.toUpperCase()} key more. Focus on proper finger placement.`;
        alert(`💡 Tip for "${key === ' ' ? 'SPACE' : key.toUpperCase()}" key:\n\n${tip}\n\nErrors: ${errorCount}`);
    }
    
    addExperience(wpm, accuracy) {
        const baseExp = Math.floor(wpm * (accuracy / 100));
        const difficultyMultiplier = this.difficultyLevels[this.difficulty].modifier;
        const experience = Math.floor(baseExp * difficultyMultiplier);
        
        this.experience += experience;
        
        const requiredExp = this.userLevel * 100;
        if (this.experience >= requiredExp) {
            this.userLevel++;
            this.experience = 0;
            this.showAchievement('Level Up!', `You reached level ${this.userLevel}!`, '🎉');
        }
        
        this.updateLevel();
    }
    
    updateLevel() {
        this.levelElement.textContent = this.userLevel;
    }
    
    checkAchievements(wpm, accuracy) {
        const achievements = [];
        
        if (wpm >= 40 && wpm < 60) achievements.push(['Speed Demon', 'Reached 40 WPM!', '🚀']);
        if (wpm >= 60 && wpm < 80) achievements.push(['Lightning Fingers', 'Reached 60 WPM!', '⚡']);
        if (wpm >= 80) achievements.push(['Typing Master', 'Reached 80 WPM!', '👑']);
        
        if (accuracy >= 95) achievements.push(['Perfectionist', 'Achieved 95%+ accuracy!', '🎯']);
        if (accuracy === 100) achievements.push(['Flawless Victory', 'Perfect accuracy!', '💎']);
        
        if (this.bestStreak >= 50) achievements.push(['Streak Master', 'Hit 50+ character streak!', '🔥']);
        
        achievements.forEach(([title, description, icon]) => {
            this.showAchievement(title, description, icon);
        });
    }
    
    showAchievement(title, description, icon) {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'achievement';
        achievementDiv.innerHTML = `
            <span class="achievement-icon">${icon}</span>
            <div class="achievement-text">
                <div class="achievement-title">${title}</div>
                <div class="achievement-description">${description}</div>
            </div>
        `;
        
        this.achievements.appendChild(achievementDiv);
        
        setTimeout(() => {
            achievementDiv.remove();
        }, 5000);
    }
    
    saveProgress(wpm, accuracy) {
        const progress = JSON.parse(localStorage.getItem('typingProgress') || '[]');
        
        progress.push({
            date: new Date().toISOString(),
            wpm: wpm,
            accuracy: accuracy,
            errors: this.errors,
            duration: this.duration,
            difficulty: this.difficulty,
            category: this.category
        });
        
        if (progress.length > 50) {
            progress.splice(0, progress.length - 50);
        }
        
        localStorage.setItem('typingProgress', JSON.stringify(progress));
    }
    
    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('typingProgress') || '[]');
        
        if (progress.length > 0) {
            document.getElementById('totalTests').textContent = progress.length;
            document.getElementById('bestWPM').textContent = Math.max(...progress.map(p => p.wpm));
            document.getElementById('avgWPM').textContent = Math.round(progress.reduce((sum, p) => sum + p.wpm, 0) / progress.length);
            document.getElementById('bestAccuracy').textContent = Math.max(...progress.map(p => p.accuracy)) + '%';
        }
    }
    
    toggleHistory() {
        if (this.historyPanel.classList.contains('hidden')) {
            this.historyPanel.classList.remove('hidden');
            this.displayRecentTests();
        } else {
            this.historyPanel.classList.add('hidden');
        }
    }
    
    displayRecentTests() {
        const progress = JSON.parse(localStorage.getItem('typingProgress') || '[]');
        const recentTestsList = document.getElementById('recentTestsList');
        
        recentTestsList.innerHTML = '';
        
        if (progress.length === 0) {
            recentTestsList.innerHTML = '<div class="no-tests">No test results available yet.</div>';
            return;
        }
        
        // Show last 10 tests, most recent first
        const recentTests = progress.slice(-10).reverse();
        
        recentTests.forEach((test, index) => {
            const testDate = new Date(test.date);
            const testDiv = document.createElement('div');
            testDiv.className = 'test-result-item';
            
            testDiv.innerHTML = `
                <div class="test-number">#${progress.length - index}</div>
                <div class="test-details">
                    <div class="test-metrics">
                        <span class="metric"><strong>${test.wpm}</strong> WPM</span>
                        <span class="metric"><strong>${test.accuracy}%</strong> Accuracy</span>
                        <span class="metric"><strong>${test.errors}</strong> Errors</span>
                    </div>
                    <div class="test-info">
                        <span class="test-date">${testDate.toLocaleDateString()} ${testDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span class="test-settings">${test.difficulty} • ${test.duration}s • ${test.category}</span>
                    </div>
                </div>
            `;
            
            recentTestsList.appendChild(testDiv);
        });
    }
    
    playSound(audioElement) {
        if (audioElement && this.soundEnabled) {
            audioElement.currentTime = 0;
            audioElement.play().catch(() => {
            });
        }
    }
    
    celebrateGoodPerformance() {
        this.resultsPanel.style.animation = 'none';
        setTimeout(() => {
            this.resultsPanel.style.animation = 'slideIn 0.6s ease-out';
        }, 10);
    }
    
    resetTest() {
        this.isTyping = false;
        clearInterval(this.timerInterval);
        
        this.currentIndex = 0;
        this.errors = 0;
        this.totalChars = 0;
        this.correctChars = 0;
        this.keystrokeData = [];
        this.errorMap.clear();
        this.problemKeys.clear();
        this.currentStreak = 0;
        this.timeLeft = this.duration;
        
        this.textInput.value = '';
        this.textInput.disabled = true;
        this.textInput.placeholder = "Click 'Start Test' and start typing here...";
        
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Test';
        
        this.resultsPanel.classList.add('hidden');
        this.historyPanel.classList.add('hidden');
        
        this.wpmElement.textContent = '0';
        this.accuracyElement.textContent = '100';
        this.timerElement.textContent = this.duration;
        this.errorsElement.textContent = '0';
        this.streakElement.textContent = this.bestStreak;
        
        this.loadRandomText();
    }
}

let typingTester;

document.addEventListener('DOMContentLoaded', () => {
    typingTester = new TypingSpeedTesterPro();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            typingTester.resetTest();
        }
        if (e.key === 'Escape') typingTester.resetTest();
        if (e.key === 'F1') {
            e.preventDefault();
            typingTester.toggleHistory();
        }
        // Prevent cheating
        if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key) && e.target.id === 'textInput') {
            e.preventDefault();
        }
    });
    
    // Window focus/blur handling
    window.addEventListener('blur', () => {
        if (typingTester.isTyping) clearInterval(typingTester.timerInterval);
    });
    
    window.addEventListener('focus', () => {
        if (typingTester.isTyping && typingTester.timeLeft > 0) typingTester.startTimer();
    });
    
    // Prevent right-click and text selection on display
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.getElementById('textDisplay').addEventListener('selectstart', (e) => e.preventDefault());
    
    // Reduced motion support
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduce-motion');
    }
});