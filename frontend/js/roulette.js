// Lógica de la Ruleta Europea

// Datos de la Ruleta
const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const blackNumbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];

// Estado del juego
let balance = 1000;
let currentChipValue = 5;
let currentBets = {}; // formato: { "spot_id": total_apostado }
let previousBets = null;
let totalBetAmount = 0;
let isSpinning = false;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar saldo de localStorage
    const savedBalance = localStorage.getItem('casino_balance');
    if (savedBalance) {
        balance = parseInt(savedBalance);
    } else {
        localStorage.setItem('casino_balance', balance);
    }
    updateBalanceDisplay();

    drawCSSWheel();
    generateNumbersGrid();
    generateComplexBets();
    setupChipSelection();
    setupBettingSpots();
    
    document.getElementById('btn-clear').addEventListener('click', clearBets);
    document.getElementById('btn-repeat').addEventListener('click', repeatBet);
    document.getElementById('btn-spin').addEventListener('click', spinWheel);
});

function drawCSSWheel() {
    const wheel = document.getElementById('wheel');
    const slices = 37;
    const sliceAngle = 360 / slices;
    
    // Secuencia exacta de la ruleta europea
    const sequence = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    
    let gradient = 'conic-gradient(';
    for (let i = 0; i < slices; i++) {
        const num = sequence[i];
        let color = '#111'; 
        if (num === 0) color = '#27ae60'; 
        else if (redNumbers.includes(num)) color = '#c0392b'; 
        
        const startAngle = i * sliceAngle;
        const endAngle = (i + 1) * sliceAngle;
        gradient += `${color} ${startAngle}deg ${endAngle}deg`;
        if (i < slices - 1) gradient += ', ';
    }
    gradient += ')';
    
    wheel.style.background = gradient;
    wheel.innerHTML = '<div class="wheel-inner"></div>';
}

function generateNumbersGrid() {
    const grid = document.getElementById('numbers-grid');
    // La ruleta europea tiene 3 columnas y 12 filas lógicas, pero en CSS Grid lo ponemos de lado.
    // Fila superior en la mesa: 3, 6, 9... 36
    // Fila medio: 2, 5, 8... 35
    // Fila inferior: 1, 4, 7... 34
    
    // Para simplificar la generación con CSS Grid (12 columnas x 3 filas)
    // El orden en el grid va de izquierda a derecha, arriba a abajo.
    const row3 = [3,6,9,12,15,18,21,24,27,30,33,36];
    const row2 = [2,5,8,11,14,17,20,23,26,29,32,35];
    const row1 = [1,4,7,10,13,16,19,22,25,28,31,34];
    
    const allRows = [...row3, ...row2, ...row1];
    
    allRows.forEach(num => {
        const spot = document.createElement('div');
        spot.className = `bet-spot number-spot ${getColor(num)}`;
        spot.dataset.bet = num.toString();
        spot.textContent = num;
        grid.appendChild(spot);
    });
}

function generateComplexBets() {
    const grid = document.getElementById('numbers-grid');
    
    // El grid tiene 12 columnas y 3 filas. Usamos porcentajes para posicionar hitboxes.
    const colStep = 100 / 12; 
    const rowStep = 100 / 3; 
    
    const createHitbox = (betIds, x, y) => {
        const hb = document.createElement('div');
        hb.className = 'bet-spot complex-bet-spot';
        hb.dataset.bet = betIds.join(',');
        hb.style.left = `calc(${x}% - 10px)`;
        hb.style.top = `calc(${y}% - 10px)`;
        grid.appendChild(hb);
    };

    const getNum = (c, r) => {
        if (r === 0) return 3 + 3*c;
        if (r === 1) return 2 + 3*c;
        if (r === 2) return 1 + 3*c;
    };

    // 1. Caballos Verticales
    for (let c = 0; c < 11; c++) {
        for (let r = 0; r < 3; r++) {
            const num1 = getNum(c, r);
            const num2 = getNum(c+1, r);
            createHitbox([num1, num2], (c+1)*colStep, r*rowStep + rowStep/2);
        }
    }
    
    // 2. Caballos Horizontales
    for (let c = 0; c < 12; c++) {
        for (let r = 0; r < 2; r++) {
            const num1 = getNum(c, r);
            const num2 = getNum(c, r+1);
            createHitbox([num1, num2], c*colStep + colStep/2, (r+1)*rowStep);
        }
    }
    
    // 3. Cuadros
    for (let c = 0; c < 11; c++) {
        for (let r = 0; r < 2; r++) {
            const numTopLeft = getNum(c, r);
            const numBotLeft = getNum(c, r+1);
            const numTopRight = getNum(c+1, r);
            const numBotRight = getNum(c+1, r+1);
            createHitbox([numTopLeft, numBotLeft, numTopRight, numBotRight], (c+1)*colStep, (r+1)*rowStep);
        }
    }
}

function getColor(number) {
    if (number === 0) return 'green';
    if (redNumbers.includes(number)) return 'red';
    if (blackNumbers.includes(number)) return 'black';
}

function setupChipSelection() {
    const chips = document.querySelectorAll('.bet-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            chips.forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentChipValue = parseInt(e.currentTarget.dataset.value);
        });
    });
}

function setupBettingSpots() {
    const spots = document.querySelectorAll('.bet-spot');
    spots.forEach(spot => {
        spot.addEventListener('click', placeBet);
    });
}

function placeBet(e) {
    if (isSpinning) return;
    
    const spot = e.currentTarget;
    const betId = spot.dataset.bet;
    
    if (balance < currentChipValue) {
        alert("¡No tienes suficientes fichas para esta apuesta!");
        return;
    }
    
    // Restar del balance
    balance -= currentChipValue;
    updateBalanceDisplay();
    
    // Registrar apuesta
    if (!currentBets[betId]) {
        currentBets[betId] = 0;
    }
    currentBets[betId] += currentChipValue;
    totalBetAmount += currentChipValue;
    document.getElementById('total-bet-amount').textContent = totalBetAmount;
    
    // Visualmente añadir la ficha
    renderChipOnSpot(spot, currentBets[betId]);
}

function renderChipOnSpot(spotElement, totalAmount) {
    // Buscar si ya hay una ficha y actualizarla, o crearla
    let chipDisplay = spotElement.querySelector('.placed-chip');
    if (!chipDisplay) {
        chipDisplay = document.createElement('div');
        chipDisplay.className = `placed-chip chip-val-${currentChipValue}`;
        spotElement.appendChild(chipDisplay);
    } else {
        // Actualizar clase de color según el valor actual que hemos añadido
        chipDisplay.className = `placed-chip chip-val-${currentChipValue}`;
    }
    chipDisplay.textContent = totalAmount;
}

function clearBets() {
    if (isSpinning) return;
    
    // Devolver fichas al balance
    balance += totalBetAmount;
    updateBalanceDisplay();
    
    // Limpiar estado
    currentBets = {};
    totalBetAmount = 0;
    document.getElementById('total-bet-amount').textContent = totalBetAmount;
    
    // Limpiar visual
    document.querySelectorAll('.placed-chip').forEach(el => el.remove());
}

function updateBalanceDisplay() {
    document.getElementById('player-balance').textContent = balance;
    localStorage.setItem('casino_balance', balance);
}

function spinWheel() {
    if (isSpinning) return;
    if (totalBetAmount === 0) {
        alert("¡Haz una apuesta primero!");
        return;
    }
    
    previousBets = { ...currentBets };
    isSpinning = true;
    document.getElementById('game-message').textContent = "No va más...";
    
    const wheel = document.getElementById('wheel');
    wheel.classList.remove('spinning');
    
    // Forzar reflow para reiniciar la animación
    void wheel.offsetWidth; 
    
    wheel.classList.add('spinning');
    
    // Generar resultado aleatorio
    const winningNumber = Math.floor(Math.random() * 37); // 0-36
    
    // Simular tiempo de giro (4 segundos)
    setTimeout(() => {
        wheel.classList.remove('spinning');
        showResult(winningNumber);
    }, 4000);
}

function showResult(winningNumber) {
    const resultDiv = document.getElementById('last-result');
    resultDiv.textContent = winningNumber;
    resultDiv.className = `result-number ${getColor(winningNumber)}`;
    
    document.getElementById('game-message').textContent = `El número ganador es ${winningNumber}`;
    
    resolveBets(winningNumber);
    
    isSpinning = false;
    currentBets = {};
    totalBetAmount = 0;
    document.getElementById('total-bet-amount').textContent = totalBetAmount;
    
    // Eliminar las fichas de la mesa después de un pequeño retraso
    setTimeout(() => {
        document.querySelectorAll('.placed-chip').forEach(el => el.remove());
        document.getElementById('game-message').textContent = "Hagan sus apuestas";
    }, 5000);
}

function resolveBets(winningNumber) {
    let winnings = 0;
    
    const winColor = getColor(winningNumber);
    const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
    const isOdd = winningNumber !== 0 && winningNumber % 2 !== 0;
    
    for (const [betId, amount] of Object.entries(currentBets)) {
        // Apuestas complejas (caballos, cuadros)
        if (betId.includes(',')) {
            const betNumbers = betId.split(',').map(n => parseInt(n));
            if (betNumbers.includes(winningNumber)) {
                // Pago proporcional a la cantidad de números
                // Caballo (2 núms) paga 17 a 1 -> multiplicador de 18
                // Cuadro (4 núms) paga 8 a 1 -> multiplicador de 9
                const payoutRatio = 36 / betNumbers.length; 
                winnings += amount * payoutRatio;
            }
        }
        // Apuesta a número exacto (Pleno - 35 a 1)
        else if (!isNaN(betId) && parseInt(betId) === winningNumber) {
            winnings += amount * 36; // Devuelve apuesta (1) + ganancia (35)
        }
        // Colores (1 a 1)
        else if (betId === winColor) {
            winnings += amount * 2;
        }
        // Par/Impar (1 a 1)
        else if (betId === 'even' && isEven) { winnings += amount * 2; }
        else if (betId === 'odd' && isOdd) { winnings += amount * 2; }
        // Mitades (1 a 1)
        else if (betId === '1to18' && winningNumber >= 1 && winningNumber <= 18) { winnings += amount * 2; }
        else if (betId === '19to36' && winningNumber >= 19 && winningNumber <= 36) { winnings += amount * 2; }
        // Docenas (2 a 1)
        else if (betId === '1st12' && winningNumber >= 1 && winningNumber <= 12) { winnings += amount * 3; }
        else if (betId === '2nd12' && winningNumber >= 13 && winningNumber <= 24) { winnings += amount * 3; }
        else if (betId === '3rd12' && winningNumber >= 25 && winningNumber <= 36) { winnings += amount * 3; }
        // Columnas (2 a 1)
        else if (betId === 'col1' && winningNumber !== 0 && winningNumber % 3 === 1) { winnings += amount * 3; }
        else if (betId === 'col2' && winningNumber !== 0 && winningNumber % 3 === 2) { winnings += amount * 3; }
        else if (betId === 'col3' && winningNumber !== 0 && winningNumber % 3 === 0) { winnings += amount * 3; }
    }
    
    if (winnings > 0) {
        alert(`¡Felicidades! Has ganado ${winnings} fichas.`);
        balance += winnings;
        updateBalanceDisplay();
    } else {
        // Mensaje de pérdida (opcional)
    }
}

function repeatBet() {
    if (isSpinning || !previousBets) return;
    
    let previousTotal = 0;
    for (let amount of Object.values(previousBets)) {
        previousTotal += amount;
    }
    
    if (previousTotal === 0) return;
    
    if (balance < previousTotal) {
        alert("¡No tienes suficientes fichas para repetir la apuesta!");
        return;
    }
    
    clearBets();
    
    balance -= previousTotal;
    totalBetAmount = previousTotal;
    document.getElementById('total-bet-amount').textContent = totalBetAmount;
    updateBalanceDisplay();
    
    currentBets = { ...previousBets };
    
    for (const [betId, amount] of Object.entries(currentBets)) {
        const spotElement = document.querySelector(`.bet-spot[data-bet="${betId}"]`);
        if (spotElement) {
            renderChipOnSpot(spotElement, amount);
        }
    }
}
