document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM
    const balanceElement = document.getElementById('player-balance');
    const betElement = document.getElementById('bet-amount');
    const btnSpin = document.getElementById('btn-spin');
    const btnBetMinus = document.getElementById('btn-bet-minus');
    const btnBetPlus = document.getElementById('btn-bet-plus');
    const gameMessage = document.getElementById('game-message');
    const slotMachine = document.querySelector('.slot-machine');
    
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];

    // Variables de estado
    let balance = 1000;
    let currentBet = 10;
    const betOptions = [10, 25, 50, 100];
    let betIndex = 0;
    let isSpinning = false;

    // Símbolos y multiplicadores
    const symbols = ['🍒', '🍋', '🍉', '🍇', '🔔', '💎', '7️⃣'];
    const multipliers = {
        '7️⃣': 100,
        '💎': 50,
        '🔔': 25,
        '🍇': 15,
        '🍉': 10,
        '🍋': 5,
        '🍒': 5
    };

    // Inicialización
    initGame();

    function initGame() {
        const savedBalance = localStorage.getItem('casino_balance');
        if (savedBalance !== null) {
            balance = parseInt(savedBalance, 10);
        } else {
            localStorage.setItem('casino_balance', balance);
        }
        updateDisplay();
    }

    function updateDisplay() {
        balanceElement.textContent = balance;
        betElement.textContent = currentBet;
    }

    function saveBalance() {
        localStorage.setItem('casino_balance', balance);
    }

    // Controles de Apuesta
    btnBetMinus.addEventListener('click', () => {
        if (isSpinning) return;
        if (betIndex > 0) {
            betIndex--;
            currentBet = betOptions[betIndex];
            updateDisplay();
        }
    });

    btnBetPlus.addEventListener('click', () => {
        if (isSpinning) return;
        if (betIndex < betOptions.length - 1) {
            betIndex++;
            currentBet = betOptions[betIndex];
            updateDisplay();
        }
    });

    // Lógica del giro
    btnSpin.addEventListener('click', () => {
        if (isSpinning) return;
        
        if (balance < currentBet) {
            showMessage('Saldo insuficiente para esta apuesta', 'red');
            return;
        }

        // Descontar apuesta
        balance -= currentBet;
        saveBalance();
        updateDisplay();
        
        isSpinning = true;
        btnSpin.disabled = true;
        slotMachine.classList.remove('win-animation');
        showMessage('Girando...', '#fff');

        // Añadir clase de animación
        reels.forEach(reel => reel.classList.add('spinning'));

        // Determinar resultado y detener rodillos con retraso
        const results = [];
        
        reels.forEach((reel, index) => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            results.push(randomSymbol);
            
            setTimeout(() => {
                reel.classList.remove('spinning');
                reel.querySelector('.symbol').textContent = randomSymbol;
                
                // Si es el último rodillo, calcular premio
                if (index === reels.length - 1) {
                    calculatePayout(results);
                }
            }, 1000 + (index * 500)); // El rodillo 1 para a 1s, el 2 a 1.5s, el 3 a 2s
        });
    });

    function calculatePayout(results) {
        isSpinning = false;
        btnSpin.disabled = false;

        const [s1, s2, s3] = results;
        let winAmount = 0;

        if (s1 === s2 && s2 === s3) {
            // Tres iguales
            winAmount = currentBet * multipliers[s1];
            showMessage(`¡BOTE! Has ganado ${winAmount} fichas`, 'gold');
            slotMachine.classList.add('win-animation');
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
            // Dos iguales - recuperas apuesta
            winAmount = currentBet * 1;
            showMessage(`¡Casi! Recuperas tu apuesta (${winAmount} fichas)`, 'lightgreen');
        } else {
            // Nada
            showMessage('Suerte la próxima vez', '#ccc');
        }

        if (winAmount > 0) {
            balance += winAmount;
            saveBalance();
            updateDisplay();
        }
    }

    function showMessage(msg, color) {
        gameMessage.textContent = msg;
        gameMessage.style.color = color;
    }
});
