document.addEventListener('DOMContentLoaded', () => {
    // === Referencias al DOM ===
    const balanceEl = document.getElementById('player-balance');
    const dealerScoreEl = document.getElementById('dealer-score');
    const playerScoreEl = document.getElementById('player-score');
    const dealerCardsEl = document.getElementById('dealer-cards');
    const playerCardsEl = document.getElementById('player-cards');
    const gameMessageEl = document.getElementById('game-message');
    const blackjackTable = document.querySelector('.blackjack-table');

    const bettingControls = document.getElementById('betting-controls');
    const actionControls = document.getElementById('action-controls');
    const endControls = document.getElementById('end-controls');
    const btnDeal = document.getElementById('btn-deal');
    const btnHit = document.getElementById('btn-hit');
    const btnStand = document.getElementById('btn-stand');
    const btnNewGame = document.getElementById('btn-new-game');
    const currentBetEl = document.getElementById('current-bet');
    const betButtons = document.querySelectorAll('.bet-btn');

    // === Estado del juego ===
    let balance = 1000;
    let currentBet = 0;
    let playerHand = [];
    let dealerHand = [];
    let gameOver = false;

    // Palos y valores
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    // === Inicialización ===
    initGame();

    function initGame() {
        const saved = localStorage.getItem('casino_balance');
        if (saved !== null) {
            balance = parseInt(saved, 10);
        } else {
            localStorage.setItem('casino_balance', balance);
        }
        updateBalanceDisplay();
    }

    function updateBalanceDisplay() {
        balanceEl.textContent = balance;
    }

    function saveBalance() {
        localStorage.setItem('casino_balance', balance);
    }

    // === Baraja (infinita) ===
    function getRandomCard() {
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const rank = ranks[Math.floor(Math.random() * ranks.length)];
        return { suit, rank };
    }

    function getCardValue(card) {
        if (['J', 'Q', 'K'].includes(card.rank)) return 10;
        if (card.rank === 'A') return 11;
        return parseInt(card.rank, 10);
    }

    function isRedSuit(suit) {
        return suit === '♥' || suit === '♦';
    }

    // === Cálculo de puntuación ===
    function calculateScore(hand) {
        let score = 0;
        let aces = 0;

        for (const card of hand) {
            score += getCardValue(card);
            if (card.rank === 'A') aces++;
        }

        // Los ases bajan de 11 a 1 si nos pasamos
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }

    // === Renderizado de cartas ===
    function createCardElement(card, hidden = false) {
        const el = document.createElement('div');
        el.classList.add('playing-card');

        if (hidden) {
            el.classList.add('card-back');
            el.dataset.hidden = 'true';
            el.dataset.rank = card.rank;
            el.dataset.suit = card.suit;
        } else {
            el.classList.add('card-front');
            el.classList.add(isRedSuit(card.suit) ? 'card-red' : 'card-black');

            el.innerHTML = `
                <div class="card-corner">${card.rank}<br>${card.suit}</div>
                <div class="card-center">${card.suit}</div>
                <div class="card-corner-bottom">${card.rank}<br>${card.suit}</div>
            `;
        }

        return el;
    }

    function renderHands(revealDealer = false) {
        // Cartas del jugador
        playerCardsEl.innerHTML = '';
        for (const card of playerHand) {
            playerCardsEl.appendChild(createCardElement(card));
        }
        playerScoreEl.textContent = calculateScore(playerHand);

        // Cartas del crupier
        dealerCardsEl.innerHTML = '';
        dealerHand.forEach((card, i) => {
            if (i === 1 && !revealDealer) {
                dealerCardsEl.appendChild(createCardElement(card, true));
            } else {
                dealerCardsEl.appendChild(createCardElement(card));
            }
        });

        if (revealDealer) {
            dealerScoreEl.textContent = calculateScore(dealerHand);
        } else {
            // Solo mostrar valor de la primera carta
            dealerScoreEl.textContent = getCardValue(dealerHand[0]) + ' + ?';
        }
    }

    // === Controles de Apuesta ===
    betButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.bet, 10);
            if (amount > balance) {
                showMessage('Saldo insuficiente', 'msg-lose');
                return;
            }
            currentBet = amount;
            currentBetEl.textContent = currentBet;
            btnDeal.disabled = false;

            // Marcar botón seleccionado
            betButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // === Repartir ===
    btnDeal.addEventListener('click', () => {
        if (currentBet <= 0 || currentBet > balance) return;

        // Descontar apuesta
        balance -= currentBet;
        saveBalance();
        updateBalanceDisplay();

        // Reset
        gameOver = false;
        playerHand = [];
        dealerHand = [];
        blackjackTable.classList.remove('table-win');

        // Repartir 2 cartas a cada uno
        playerHand.push(getRandomCard());
        dealerHand.push(getRandomCard());
        playerHand.push(getRandomCard());
        dealerHand.push(getRandomCard());

        renderHands(false);

        // Comprobar Blackjack natural
        const playerScore = calculateScore(playerHand);
        const dealerScore = calculateScore(dealerHand);

        if (playerScore === 21 && dealerScore === 21) {
            // Ambos Blackjack → Empate
            renderHands(true);
            endGame('push', '¡Doble Blackjack! Empate');
            return;
        }

        if (playerScore === 21) {
            // Blackjack del jugador → Paga 3:2
            renderHands(true);
            endGame('blackjack', '¡BLACKJACK!');
            return;
        }

        if (dealerScore === 21) {
            // Blackjack del crupier
            renderHands(true);
            endGame('lose', 'Blackjack del Crupier');
            return;
        }

        // Turno del jugador
        showMessage('¿Pedir o Plantarse?', '');
        switchControls('action');
    });

    // === Pedir Carta (Hit) ===
    btnHit.addEventListener('click', () => {
        if (gameOver) return;

        playerHand.push(getRandomCard());
        renderHands(false);

        const score = calculateScore(playerHand);
        if (score > 21) {
            renderHands(true);
            endGame('lose', '¡Te has pasado!');
        } else if (score === 21) {
            // 21 exacto, se planta automáticamente
            dealerTurn();
        }
    });

    // === Plantarse (Stand) ===
    btnStand.addEventListener('click', () => {
        if (gameOver) return;
        dealerTurn();
    });

    // === Turno del Crupier ===
    function dealerTurn() {
        renderHands(true);

        // El crupier pide hasta tener 17 o más
        let dealerScore = calculateScore(dealerHand);
        let delay = 0;

        function dealerDraw() {
            dealerScore = calculateScore(dealerHand);
            if (dealerScore < 17) {
                delay += 600;
                setTimeout(() => {
                    dealerHand.push(getRandomCard());
                    renderHands(true);
                    dealerDraw();
                }, 600);
            } else {
                setTimeout(() => {
                    resolveGame();
                }, 400);
            }
        }

        dealerDraw();
    }

    // === Resolución ===
    function resolveGame() {
        const playerScore = calculateScore(playerHand);
        const dealerScore = calculateScore(dealerHand);

        if (dealerScore > 21) {
            endGame('win', '¡El crupier se pasa! Tú ganas');
        } else if (playerScore > dealerScore) {
            endGame('win', '¡Has ganado!');
        } else if (playerScore < dealerScore) {
            endGame('lose', 'El crupier gana');
        } else {
            endGame('push', 'Empate');
        }
    }

    // === Fin de Partida ===
    function endGame(result, message) {
        gameOver = true;
        renderHands(true);

        switch (result) {
            case 'blackjack':
                const bjWin = Math.floor(currentBet * 2.5); // Apuesta + 1.5x (pago 3:2)
                balance += bjWin;
                showMessage(message + ` (+${bjWin})`, 'msg-blackjack');
                blackjackTable.classList.add('table-win');
                break;
            case 'win':
                const winAmount = currentBet * 2; // Apuesta + 1:1
                balance += winAmount;
                showMessage(message + ` (+${winAmount})`, 'msg-win');
                blackjackTable.classList.add('table-win');
                break;
            case 'push':
                balance += currentBet; // Devolver apuesta
                showMessage(message + ' (Devuelta)', 'msg-push');
                break;
            case 'lose':
                showMessage(message, 'msg-lose');
                break;
        }

        saveBalance();
        updateBalanceDisplay();
        switchControls('end');
    }

    // === Nueva Partida ===
    btnNewGame.addEventListener('click', () => {
        playerHand = [];
        dealerHand = [];
        gameOver = false;
        currentBet = 0;
        currentBetEl.textContent = '0';
        btnDeal.disabled = true;
        betButtons.forEach(b => b.classList.remove('selected'));
        blackjackTable.classList.remove('table-win');

        playerCardsEl.innerHTML = '';
        dealerCardsEl.innerHTML = '';
        playerScoreEl.textContent = '0';
        dealerScoreEl.textContent = '?';

        showMessage('Haz tu apuesta', '');
        switchControls('betting');
    });

    // === Utilidades ===
    function showMessage(text, cssClass) {
        gameMessageEl.textContent = text;
        gameMessageEl.className = '';
        if (cssClass) gameMessageEl.classList.add(cssClass);
    }

    function switchControls(phase) {
        bettingControls.classList.add('hidden');
        actionControls.classList.add('hidden');
        endControls.classList.add('hidden');

        switch (phase) {
            case 'betting': bettingControls.classList.remove('hidden'); break;
            case 'action': actionControls.classList.remove('hidden'); break;
            case 'end': endControls.classList.remove('hidden'); break;
        }
    }
});
