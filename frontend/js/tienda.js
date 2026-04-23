// Lógica simulada de la tienda
let balance = 1000; // Saldo inicial simulado

// Cargar saldo guardado localmente si existe
document.addEventListener('DOMContentLoaded', () => {
    const savedBalance = localStorage.getItem('casino_balance');
    if (savedBalance) {
        balance = parseInt(savedBalance);
    } else {
        localStorage.setItem('casino_balance', balance);
    }
    updateBalanceDisplay();
});

function comprarFichas(cantidad) {
    // Simulación de pasarela de pago
    const confirmar = confirm(`¿Estás seguro de que quieres comprar ${cantidad} fichas?`);
    if (confirmar) {
        balance += cantidad;
        localStorage.setItem('casino_balance', balance);
        updateBalanceDisplay();
        alert(`¡Compra exitosa! Has añadido ${cantidad} fichas a tu saldo.`);
    }
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById('current-balance');
    if (balanceElement) {
        balanceElement.textContent = balance;
    }
}
