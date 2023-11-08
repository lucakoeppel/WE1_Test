import { gameService } from './model/game-service.js';

// Utility-Funktion zur Anzeige von Nachrichten auf dem Bildschirm.
function showMessage(message) {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = message;
    messageBox.style.display = 'block';

    // Nachricht nach einigen Sekunden ausblenden.
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

// Funktion, um zwischen Startbildschirm und Spielbildschirm zu wechseln.
function toggleScreens() {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    startScreen.style.display = startScreen.style.display === 'none' ? 'block' : 'none';
    gameScreen.style.display = gameScreen.style.display === 'none' ? 'block' : 'none';
}

// Initialisierungsfunktion, um das Spiel zu starten.
function startGame() {
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();

    if (playerName) {
        toggleScreens();
        playerNameInput.disabled = true;
        document.getElementById('playerNameDisplay').textContent = `${playerName}, es ist Zeit zu wählen!`;
        document.getElementById('history-list').innerHTML = '';
    } else {
        showMessage('Bitte trage deinen Namen ein, um zu starten.');
    }
}

// Anzeigen der Rangliste.
async function displayRankings() {
    const rankingListElement = document.getElementById('ranking-list');
    rankingListElement.innerHTML = '';

    try {
        const rankings = await gameService.getRankings();
        rankings.forEach(rankingEntry => {
            const entryElement = document.createElement('li');
            entryElement.textContent = `Platz ${rankingEntry.rank}: ${rankingEntry.wins} Siege - ${rankingEntry.players.join(', ')}`;
            rankingListElement.appendChild(entryElement);
        });
        rankingListElement.style.display = 'block';
    } catch (error) {
        showMessage('Fehler beim Laden der Rangliste.');
    }
}

// Update der Spieloberfläche mit dem Ergebnis des Zugs.
function updateResultDisplay(result) {
    const playerChoiceDisplay = document.getElementById('player-choice');
    const computerChoiceDisplay = document.getElementById('computer-choice');

    if (playerChoiceDisplay && computerChoiceDisplay) {
        playerChoiceDisplay.textContent = `Deine Wahl: ${result.playerHand}`;
        computerChoiceDisplay.textContent = `Gegner: ${result.systemHand}`;
    } else {
        showMessage('Anzeigeelemente für die Auswahl nicht gefunden.');
    }
}

// Generierung des Textes basierend auf dem Spielresultat.
function getResultText(result) {
    switch(result) {
        case 1: return 'Sieg!';
        case -1: return 'Niederlage!';
        default: return 'Unentschieden!';
    }
}

// Aktualisierung der Spielhistorie.
function updateHistoryList(result) {
    const historyList = document.getElementById('history-list');
    const historyEntry = document.createElement('div');
    historyEntry.classList.add('history-entry');
    historyEntry.textContent = `${result.playerHand} gegen ${result.systemHand}: ${getResultText(result.result)}`;

    if (historyList.firstChild) {
        historyList.insertBefore(historyEntry, historyList.firstChild);
    } else {
        historyList.appendChild(historyEntry);
    }
}

// Durchführung eines Spielzugs.
async function playRound(event) {
    const playerHand = event.target.getAttribute('data-hand');
    const playerName = document.getElementById('playerName').value.trim();

    if (playerName) {
        try {
            const result = await gameService.evaluate(playerName, playerHand);
            updateResultDisplay(result);
            updateHistoryList(result);
            document.getElementById('history-section').style.display = 'block';
        } catch (error) {
            showMessage('Fehler beim Ausführen des Spielzugs.');
        }
    } else {
        showMessage('Bitte gib deinen Namen ein, bevor du spielst.');
    }
}

// Funktion zur Rückkehr zum Startbildschirm und zum Zurücksetzen des Namenseingabefelds
function showStartScreen() {
    // Setze die Startelemente zurück und zeige sie an
    const playerNameInput = document.getElementById('playerName');
    playerNameInput.value = '';
    playerNameInput.disabled = false; // Reaktiviere das Namenseingabefeld
    document.getElementById('start-screen').style.display = 'block';

    // Verberge die Spieloberfläche und den Spielverlauf
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('history-section').style.display = 'none';

    // Aktualisiere und zeige die Rangliste an
    displayRankings();
}

// Aktualisieren Sie die setupEventListeners-Funktion, um showStartScreen aufzurufen
function setupEventListeners() {
    document.getElementById('startGame').addEventListener('click', startGame);
    document.querySelectorAll('.hand').forEach(button => {
        button.addEventListener('click', playRound);
    });
    // Verwenden Sie die aktualisierte showStartScreen-Funktion
    document.getElementById('backToStart').addEventListener('click', showStartScreen);
}

// Initialisierung des Spiels nach dem Laden des DOM.
document.addEventListener('DOMContentLoaded', async () => {
    await displayRankings();
    setupEventListeners();
});
