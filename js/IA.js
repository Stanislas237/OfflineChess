class MonteCarloAI {
    constructor() {
        this.maxSimulations = 600; // Nombre de simulations par coup
        this.simulationDepth = 6; // Profondeur max des simulations
    }

    // Sauvegarde complète de l'état du jeu
    saveGameState() {
        const pieces = [];
        for (let i = 0; i < tab.length; i++)
            pieces.push({
                classes: [...tab[i].classList],
                backgroundColor: tab[i].style.backgroundColor,
            });

        return {
            current_turn,
            playing,
            pieces,
            wking: wking,
            bking: bking,
            wrooks: [...wrooks],
            brooks: [...brooks],
            dead_pieces: [...dead_pieces]
        };
    }

    // Restauration complète de l'état du jeu
    restoreGameState(state) {
        current_turn = state.current_turn;
        playing = state.playing;

        Array.from(tab).forEach((cell, i) => {
            cell.className = '';
            state.pieces[i].classes.forEach(cls => cell.classList.add(cls));
            cell.style.backgroundColor = state.pieces[i].backgroundColor;
        });

        // Restaure les variables spéciales
        wking = state.wking;
        bking = state.bking;
        wrooks = [...state.wrooks];
        brooks = [...state.brooks];
        dead_pieces = [...state.dead_pieces];

        reload.style.display = playing ? "none" : "block";

        // Met à jour les listes de pièces
        this.updatePieceLists();
    }

    // Met à jour les listes de pièces (blacks, whites)
    updatePieceLists() {
        blacks = [];
        whites = [];
        for (const cell of tab) {
            if (inside("blanc", cell.classList)) whites.push(cell);
            if (inside("noir", cell.classList)) blacks.push(cell);
        }
    }

    // Méthode principale pour choisir le meilleur coup
    async getAIMove() {
        const originalState = this.saveGameState();
        const possibleMoves = this.getAllPossibleMovesForColor('noir');
        
        if (possibleMoves.length === 0) {
            this.restoreGameState(originalState);
            playing = false;
            caption.innerHTML = "Les blancs ont gagné";
            reload.style.display = "block";
            return;
        }

        const moveScores = [];
        for (const move of possibleMoves) {
            // Applique le coup temporairement
            this.applyMove(move);
            const firstStepState = this.saveGameState();
            
            let score = 0;
            let simulations = 0;
            
            // Simule plusieurs parties aléatoires
            for (let i = 0; i < this.maxSimulations; i++) {
                const simulationResult = this.simulateRandomGame();
                score += simulationResult;
                simulations++;
                
                // Restaure après simulation
                this.restoreGameState(firstStepState);
            }
            
            moveScores.push({
                move: move,
                score: score / this.maxSimulations
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
        this.updatePieceLists();
    }

    // Simule une partie aléatoire
    simulateRandomGame() {
        let depth = 0;
        let color = "blanc"

        while (depth < this.simulationDepth && playing) {
            const moves = this.getAllPossibleMovesForColor(color);
            if (moves.length === 0) break;

            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            this.applyMove(randomMove);

            if (!playing)
                return color === 'noir' ? 50 : -60;

            color = current_turn;
            depth++;
        }

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
            queen: 10,
            king: 15
        };
        
        // Compte le matériel
        for (const piece of whites)
            for (const type in pieceValues)
                if (inside(type, piece.classList)) {
                    score -= pieceValues[type];
                    break;
                }        
        for (const piece of blacks)
            for (const type in pieceValues)
                if (inside(type, piece.classList)) {
                    score += pieceValues[type];
                    break;
                }
        return score / 15;
    }
}

// Utilisation
const ai = new MonteCarloAI();

async function playAI() {
    await new Promise(resolve => setTimeout(resolve, 100));

    if (current_turn === 'noir' && playing) {
        const bestMove = await ai.getAIMove();
        if (bestMove) {
            // Applique le coup pour de vrai
            caption.innerHTML = "Tour des blancs";
            switch_piece(bestMove.piece, bestMove.target);
            jeu();
            if (playing){
                king_alarm();
                current_turn = 'blanc';
            }
        }
    }
}
