class JavaMemoryGame {
    constructor() {
        this.board = document.getElementById('gameBoard');
        this.timerElement = document.getElementById('timer');
        this.movesElement = document.getElementById('moves');
        this.scoreElement = document.getElementById('score');
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.startTime = null;
        this.gameTimer = null;
        
        this.javaQuestions = [
            {
                question: "Что выведет\nSystem.out.println(\"Hello\");",
                answer: "Hello"
            },
            {
                question: "Какой тип данных\nдля целых чисел?",
                answer: "int"
            },
            {
                question: "Ключевое слово для\nсоздания класса?",
                answer: "class"
            },
            {
                question: "Метод для получения\nдлины строки?",
                answer: ".length()"
            },
            {
                question: "Ключевое слово для\nнаследования?",
                answer: "extends"
            },
            {
                question: "Что означает JVM?",
                answer: "Java Virtual Machine"
            },
            {
                question: "Метод входа в\nJava программу?",
                answer: "main()"
            },
            {
                question: "Ключевое слово для\nконстант?",
                answer: "final"
            }
        ];
        
        this.customQuestions = [];
        this.isCustomGame = false;
        
        this.initializeGame();
        this.setupEventListeners();
        this.setupCustomGameModal();
    }
    
    initializeGame() {
        this.createCardPairs();
        this.shuffleCards();
        this.renderCards();
        this.resetStats();
    }
    
    createCardPairs() {
        this.cards = [];
        const questionsToUse = this.isCustomGame ? this.customQuestions : this.javaQuestions;
        
        questionsToUse.forEach((qa, index) => {
            // Карточка с вопросом
            this.cards.push({
                id: index * 2,
                type: 'question',
                content: qa.question,
                pairId: index,
                isMatched: false
            });
            
            // Карточка с ответом
            this.cards.push({
                id: index * 2 + 1,
                type: 'answer',
                content: qa.answer,
                pairId: index,
                isMatched: false
            });
        });
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    renderCards() {
        this.board.innerHTML = '';
        this.cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            this.board.appendChild(cardElement);
        });
        
        // Adjust font sizes after all cards are rendered
        setTimeout(() => {
            this.cards.forEach(card => {
                const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
                if (cardElement) {
                    this.adjustFontSize(cardElement);
                }
            });
        }, 100);
    }
    
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.cardId = card.id;
        
        cardDiv.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${card.content}</div>
            </div>
        `;
        
        cardDiv.addEventListener('click', () => this.handleCardClick(card));
        
        // Adjust font size after element is added to DOM
        setTimeout(() => this.adjustFontSize(cardDiv), 0);
        
        return cardDiv;
    }
    
    adjustFontSize(cardElement) {
        const cardBack = cardElement.querySelector('.card-back');
        if (!cardBack) return;
        
        const text = cardBack.textContent;
        const maxFontSize = 1.1; // em
        const minFontSize = 0.6; // em
        let fontSize = maxFontSize;
        
        // Reset to max font size to measure
        cardBack.style.fontSize = fontSize + 'em';
        
        // Check if text overflows
        while ((cardBack.scrollHeight > cardBack.clientHeight || 
                cardBack.scrollWidth > cardBack.clientWidth) && 
               fontSize > minFontSize) {
            fontSize -= 0.1;
            cardBack.style.fontSize = fontSize + 'em';
        }
        
        // Special handling for very long text
        if (text.length > 100) {
            fontSize = Math.min(fontSize, 0.8);
            cardBack.style.fontSize = fontSize + 'em';
        }
        
        if (text.length > 200) {
            fontSize = Math.min(fontSize, 0.7);
            cardBack.style.fontSize = fontSize + 'em';
        }
    }
    
    handleCardClick(card) {
        if (this.flippedCards.length >= 2 || card.isMatched) return;
        
        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
        if (cardElement.classList.contains('flipped')) return;
        
        this.flipCard(cardElement);
        this.flippedCards.push(card);
        
        if (!this.startTime) {
            this.startTimer();
        }
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateMoves();
            setTimeout(() => this.checkMatch(), 1000);
        }
    }
    
    flipCard(cardElement) {
        cardElement.classList.add('flipped');
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const card1Element = document.querySelector(`[data-card-id="${card1.id}"]`);
        const card2Element = document.querySelector(`[data-card-id="${card2.id}"]`);
        
        if (card1.pairId === card2.pairId) {
            // Совпадение найдено
            this.handleMatch(card1, card2, card1Element, card2Element);
        } else {
            // Совпадения нет
            this.handleMismatch(card1Element, card2Element);
        }
        
        this.flippedCards = [];
    }
    
    handleMatch(card1, card2, element1, element2) {
        card1.isMatched = true;
        card2.isMatched = true;
        
        element1.classList.add('matched');
        element2.classList.add('matched');
        
        this.matchedPairs++;
        this.score += 100;
        this.updateScore();
        
        const totalPairs = this.isCustomGame ? this.customQuestions.length : this.javaQuestions.length;
        if (this.matchedPairs === totalPairs) {
            setTimeout(() => this.showVictory(), 500);
        }
    }
    
    handleMismatch(element1, element2) {
        element1.classList.add('wrong');
        element2.classList.add('wrong');
        
        setTimeout(() => {
            element1.classList.remove('flipped', 'wrong');
            element2.classList.remove('flipped', 'wrong');
        }, 1000);
        
        this.score = Math.max(0, this.score - 10);
        this.updateScore();
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.gameTimer = setInterval(() => this.updateTimer(), 1000);
    }
    
    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateMoves() {
        this.movesElement.textContent = this.moves;
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    resetStats() {
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.startTime = null;
        this.flippedCards = [];
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        this.timerElement.textContent = '0:00';
        this.movesElement.textContent = '0';
        this.scoreElement.textContent = '0';
    }
    
    showVictory() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        const finalTime = this.timerElement.textContent;
        document.getElementById('finalTime').textContent = finalTime;
        document.getElementById('finalMoves').textContent = this.moves;
        document.getElementById('finalScore').textContent = this.score;
        
        const modal = document.getElementById('victoryModal');
        modal.classList.add('show');
    }
    
    hideVictory() {
        const modal = document.getElementById('victoryModal');
        modal.classList.remove('show');
    }
    
    newGame() {
        this.hideVictory();
        this.isCustomGame = false;
        this.initializeGame();
    }
    
    showHint() {
        const unflippedCards = this.cards.filter(card => !card.isMatched);
        if (unflippedCards.length < 2) return;
        
        // Найти случайную пару
        const randomPairId = unflippedCards[Math.floor(Math.random() * unflippedCards.length)].pairId;
        const pairCards = unflippedCards.filter(card => card.pairId === randomPairId);
        
        if (pairCards.length === 2) {
            pairCards.forEach(card => {
                const element = document.querySelector(`[data-card-id="${card.id}"]`);
                element.style.border = '3px solid #FFD700';
                setTimeout(() => {
                    element.style.border = '3px solid transparent';
                }, 2000);
            });
            
            this.score = Math.max(0, this.score - 25);
            this.updateScore();
        }
    }
    
    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.newGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('customGameBtn').addEventListener('click', () => this.showCustomModal());
        
        // Закрытие модального окна при клике вне его
        document.getElementById('victoryModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideVictory();
            }
        });
    }
    
    setupCustomGameModal() {
        const modal = document.getElementById('customGameModal');
        const addPairBtn = document.getElementById('addPairBtn');
        const startCustomGameBtn = document.getElementById('startCustomGameBtn');
        const cancelCustomBtn = document.getElementById('cancelCustomBtn');
        const fileUpload = document.getElementById('fileUpload');
        
        addPairBtn.addEventListener('click', () => this.addCardPair());
        startCustomGameBtn.addEventListener('click', () => this.startCustomGame());
        cancelCustomBtn.addEventListener('click', () => this.hideCustomModal());
        fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Закрытие модального окна при клике вне его
        modal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideCustomModal();
            }
        });
        
        // Обработка удаления пар
        document.getElementById('cardPairs').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-pair')) {
                e.target.parentElement.remove();
            }
        });
    }
    
    showCustomModal() {
        const modal = document.getElementById('customGameModal');
        modal.classList.add('show');
        this.resetCustomForm();
    }
    
    hideCustomModal() {
        const modal = document.getElementById('customGameModal');
        modal.classList.remove('show');
    }
    
    resetCustomForm() {
        const cardPairs = document.getElementById('cardPairs');
        cardPairs.innerHTML = `
            <div class="card-pair">
                <input type="text" placeholder="Вопрос" class="question-input">
                <input type="text" placeholder="Ответ" class="answer-input">
                <button type="button" class="remove-pair">×</button>
            </div>
        `;
        document.getElementById('fileUpload').value = '';
    }
    
    addCardPair() {
        const cardPairs = document.getElementById('cardPairs');
        const newPair = document.createElement('div');
        newPair.className = 'card-pair';
        newPair.innerHTML = `
            <input type="text" placeholder="Вопрос" class="question-input">
            <input type="text" placeholder="Ответ" class="answer-input">
            <button type="button" class="remove-pair">×</button>
        `;
        cardPairs.appendChild(newPair);
    }
    
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.parseCSVContent(content);
        };
        reader.readAsText(file);
    }
    
    parseCSVContent(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const cardPairs = document.getElementById('cardPairs');
        cardPairs.innerHTML = '';
        
        lines.forEach(line => {
            // Определяем разделитель: ; для ANKI формата, , для CSV
            const delimiter = line.includes(';') ? ';' : ',';
            const parts = line.split(delimiter);
            
            if (parts.length >= 2) {
                const question = parts[0].trim();
                const answer = parts.slice(1).join(delimiter).trim(); // Объединяем все части после первого разделителя
                
                if (question && answer) {
                    const pairDiv = document.createElement('div');
                    pairDiv.className = 'card-pair';
                    pairDiv.innerHTML = `
                        <input type="text" placeholder="Вопрос" class="question-input" value="${this.escapeHtml(question)}">
                        <input type="text" placeholder="Ответ" class="answer-input" value="${this.escapeHtml(answer)}">
                        <button type="button" class="remove-pair">×</button>
                    `;
                    cardPairs.appendChild(pairDiv);
                }
            }
        });
        
        if (cardPairs.children.length === 0) {
            this.addCardPair();
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    startCustomGame() {
        const pairs = this.collectCardPairs();
        if (pairs.length < 2) {
            alert('Добавьте минимум 2 пары карточек для игры!');
            return;
        }
        
        this.customQuestions = pairs;
        this.isCustomGame = true;
        this.hideCustomModal();
        this.initializeGame();
    }
    
    collectCardPairs() {
        const pairs = [];
        const cardPairElements = document.querySelectorAll('.card-pair');
        
        cardPairElements.forEach(pairElement => {
            const question = pairElement.querySelector('.question-input').value.trim();
            const answer = pairElement.querySelector('.answer-input').value.trim();
            
            if (question && answer) {
                pairs.push({ question, answer });
            }
        });
        
        return pairs;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new JavaMemoryGame();
});