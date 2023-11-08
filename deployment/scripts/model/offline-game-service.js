export class OfflineGameService {
    static DELAY_MS = 1000; // Konstante für simulierte Verzögerung

    constructor() {
        this.possibleHands = Object.keys(this.#resultLookup);
    }

    // Interner Zustand der Spielerdaten
    #playerState = {
        Hulk: {
            user: 'Hulk',
            win: 1,
            lost: 6,
        },
        Spiderman: {
            user: 'Spiderman',
            win: 25,
            lost: 0,
        },
        Thor: {
            user: 'Thor',
            win: 12,
            lost: 5,
        },
    };

    // Entscheidungsmatrix für die Spiellogik
    #resultLookup = {
        Stein: {
            Stein: 0,
            Schere: 1,
            Papier: -1,
            Brunnen: -1,
            Streichholz: 1,
        },
        Schere: {
            Stein: -1,
            Schere: 0,
            Papier: 1,
            Brunnen: -1,
            Streichholz: 1,
        },
        Papier: {
            Stein: 1,
            Schere: -1,
            Papier: 0,
            Brunnen: 1,
            Streichholz: -1,
        },
        Brunnen: {
            Stein: 1,
            Schere: 1,
            Papier: -1,
            Brunnen: 0,
            Streichholz: -1,
        },
        Streichholz: {
            Stein: -1,
            Schere: -1,
            Papier: 1,
            Brunnen: 1,
            Streichholz: 0,
        }
    };

    // Funktion zum Abrufen der Rangliste
    async getRankings() {
        // Spieler und deren Siege in ein Array umwandeln
        const playerWins = Object.entries(this.#playerState).map(([user, { win }]) => ({ user, win }));
    
        // Array anhand der Siegesanzahl sortieren
        playerWins.sort((a, b) => b.win - a.win);
    
        // Rangliste basierend auf den sortierten Spielern erstellen
        const rankings = playerWins.map((player, index) => ({
            rank: index + 1,
            wins: player.win,
            players: [player.user],
        }));
    
        // Zusammenführen von Spielern mit gleicher Anzahl an Siegen
        for (let i = 0; i < rankings.length; i++) {
            for (let j = i + 1; j < rankings.length; j++) {
                if (rankings[i].wins === rankings[j].wins) {
                    rankings[i].players.push(...rankings[j].players);
                    rankings.splice(j, 1);
                    j--; // Index anpassen, nachdem ein Element entfernt wurde
                }
            }
        }

        return Promise.resolve(rankings);
    }
    
    // Funktion zur Auswertung eines Spielzugs
    async evaluate(playerName, playerHand) {
        if (!this.#resultLookup[playerHand]) {
            throw new Error(`Ungültige Spielerhand: ${playerHand}`);
        }

        const systemHand = this.possibleHands[Math.floor(Math.random() * this.possibleHands.length)];
        const gameEval = this.#resultLookup[playerHand][systemHand];

        if (!(playerName in this.#playerState)) {
            this.#playerState[playerName] = { user: playerName, win: 0, lost: 0 };
        }

        if (gameEval === 1) {
            this.#playerState[playerName].win++;
        } else if (gameEval === -1) {
            this.#playerState[playerName].lost++;
        }

        return {
            playerHand,
            systemHand,
            result: gameEval,
        };
    }
}
