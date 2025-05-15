class MonteCarloAI {
    constructor() {
        this.maxSimulations = 700; // Nombre de simulations par coup
        this.simulationDepth = 15; // Profondeur max des simulations
    }

    // Sauvegarde complète de l'état du jeu
    saveGameState() {
        const state = {
            current_turn: current_turn,
            playing: playing,
            pieces: []
        };

        for (let i = 0; i < tab.length; i++) {
            const piece = {
                element: tab[i],
                classes: [...tab[i].classList],
                backgroundColor: tab[i].style.backgroundColor,
            };
            state.pieces.push(piece);
        }

        state.special = {
            wking: wking,
            bking: bking,
            wrooks: [...wrooks],
            brooks: [...brooks],
            dead_pieces: [...dead_pieces]
        };

        return state;
    }

    // Restauration complète de l'état du jeu
    restoreGameState(state) {
        current_turn = state.current_turn;
        playing = state.playing;

        for (const piece of state.pieces) {
            piece.element.className = '';
            for (const cls of piece.classes)
                piece.element.classList.add(cls);

            piece.element.style.backgroundColor = piece.backgroundColor;
        }

        // Restaure les variables spéciales
        wking = state.special.wking;
        bking = state.special.bking;
        wrooks = [...state.special.wrooks];
        brooks = [...state.special.brooks];
        dead_pieces = [...state.special.dead_pieces];

        reload.style.display = playing ? "none" : "block";

        // Met à jour les listes de pièces
        this.updatePieceLists();
    }

    // Met à jour les listes de pièces (blacks, whites)
    updatePieceLists() {
        blacks = [];
        whites = [];
        for (let i = 0; i < tab.length; i++) {
            if (inside("blanc", tab[i].classList)) whites.push(tab[i]);
            if (inside("noir", tab[i].classList)) blacks.push(tab[i]);
        }
    }

    // Méthode principale pour choisir le meilleur coup
    async getAIMove() {
        const originalState = this.saveGameState();
        const possibleMoves = this.getAllPossibleMovesForColor('noir');
        
        if (possibleMoves.length === 0) {
            this.restoreGameState(originalState);
            alert("Aucun coup possible à jouer, j'abandonne !");
            playing = false;
            caption.innerHTML = "Les blancs ont gagné";
            reload.style.display = "block";
            return null;
        }

        const moveScores = [];
        for (const move of possibleMoves) {
            // Applique le coup temporairement
            this.applyMove(move);
            
            let score = 0;
            let simulations = 0;
            
            // Simule plusieurs parties aléatoires
            for (let i = 0; i < this.maxSimulations; i++) {
                const simulationResult = this.simulateRandomGame();
                score += simulationResult;
                simulations++;
                
                // Restaure après simulation
                this.restoreGameState(this.saveGameState());
                this.applyMove(move);
            }
            
            moveScores.push({
                move: move,
                score: simulations > 0 ? score / simulations : 0
            });
            
            // Restaure l'état original
            this.restoreGameState(originalState);
        }
        
        // Trie et retourne le meilleur coup
        moveScores.sort((a, b) => b.score - a.score);
        return moveScores[0]?.move || possibleMoves[0];
    }

    // Liste tous les coups possibles pour une couleur
    getAllPossibleMovesForColor(color) {
        const moves = [];
        const pieces = color === 'blanc' ? whites : blacks;
        
        for (const piece of pieces) {
            // Réinitialise la liste des cibles
            target_list = [];
            
            // Trouve tous les coups possibles pour cette pièce
            move(piece, true);
            
            // Ajoute chaque coup possible à la liste
            for (const target of target_list) {
                moves.push({
                    piece: piece,
                    target: target
                });
            }
        }
        
        return moves;
    }

    // Applique un mouvement au plateau
    applyMove(move) {
        switch_piece(move.piece, move.target);
        current_turn = current_turn === 'blanc' ? 'noir' : 'blanc';
    }

    // Simule une partie aléatoire
    simulateRandomGame() {
        let depth = 0;
        let currentColor = 'blanc'; // Commence avec l'adversaire
        
        while (depth < this.simulationDepth && playing) {
            const moves = this.getAllPossibleMovesForColor(currentColor);
            if (moves.length === 0) break;
            
            // Coup aléatoire
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            this.applyMove(randomMove);
            
            // Vérifie l'échec et mat
            if (!playing) {
                return currentColor === 'noir' ? 1 : -1;
            }
            
            currentColor = currentColor === 'blanc' ? 'noir' : 'blanc';
            depth++;
        }
        
        // Évaluation de la position finale
        return this.evaluateBoard();
    }

    // Évaluation du plateau
    evaluateBoard() {
        let score = 0;
        
        // Valeur des pièces
        const pieceValues = {
            pawn: 1,
            knight: 3,
            fool: 3,
            rook: 5,
            queen: 9
        };
        
        // Compte le matériel
        for (const piece of whites) {
            for (const type in pieceValues) {
                if (inside(type, piece.classList)) {
                    score -= pieceValues[type];
                    break;
                }
            }
        }
        
        for (const piece of blacks) {
            for (const type in pieceValues) {
                if (inside(type, piece.classList)) {
                    score += pieceValues[type];
                    break;
                }
            }
        }
        return score / 10;
    }
}

// Utilisation
const ai = new MonteCarloAI();

async function playAI() {
    if (current_turn === 'noir' && playing) {
        const bestMove = await ai.getAIMove();
        if (bestMove) {
            // Applique le coup pour de vrai
            switch_piece(bestMove.piece, bestMove.target);
            king_alarm();
            current_turn = 'blanc';
            caption.innerHTML = "Tour des blancs";
        }
        else alert("J'ai perdu");
    }
}
