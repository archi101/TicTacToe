import React, { useEffect, useState } from 'react';
import './BoardComponent.css';
import beepSound from '../../Sounds/ecg-machine-beep-gfx-sounds-1-1-00-00.mp3';


const BoardComponent = () => {
    const initialNumberOfPlayers = JSON.parse(localStorage.getItem("numberOfPlayers")) || 2;
    const getInitialBoardSize = (players) => players + 1;


    const [numberOfPlayers, setNumberOfPlayers] = useState(initialNumberOfPlayers);
    const [boardSize, setBoardSize] = useState(getInitialBoardSize(initialNumberOfPlayers));
    const [board, setBoard] = useState(() => {
        const savedBoard = localStorage.getItem("board");
        if (savedBoard) {
            const parsedBoard = JSON.parse(savedBoard);

            if (parsedBoard.length === Math.pow(getInitialBoardSize(initialNumberOfPlayers), 2)) {
                return parsedBoard;
            }
        }
        return Array(Math.pow(getInitialBoardSize(initialNumberOfPlayers), 2)).fill(null);
    });
    const [chance, setChance] = useState(() => parseInt(localStorage.getItem('chance')) || 0);
    const [status, setStatus] = useState(() => localStorage.getItem('status') || "Player 1's turn");
    const [activePlayer, setActivePlayer] = useState(() => parseInt(localStorage.getItem('activePlayer')) || 1);
    const [modalState, setModalState] = useState(() => JSON.parse(localStorage.getItem('modalState')) || false);
    const [winningLine, setWinningLine] = useState(() => JSON.parse(localStorage.getItem('winningLine')) || []);
    const [playerScores, setPlayerScores] = useState(() => JSON.parse(localStorage.getItem("playerScores")) || Array(5).fill(0));
    const [playerModalState, setPlayerModalState] = useState(false);

    const beep = new Audio(beepSound);
    const playerSymbols = ['X', 'O', 'A', 'B', 'C', 'D', 'E', 'F'];


    const handlePlayerChange = (numPlayers) => {
        setNumberOfPlayers(numPlayers);
        const newBoardSize = getInitialBoardSize(numPlayers);
        setBoardSize(newBoardSize);


        const newBoard = Array(Math.pow(newBoardSize, 2)).fill(null);
        setBoard(newBoard);
        setChance(0);
        setStatus("Player 1's turn");
        setModalState(false);
        setWinningLine([]);
        setPlayerModalState(false);


        localStorage.setItem("numberOfPlayers", JSON.stringify(numPlayers));
        localStorage.setItem("board", JSON.stringify(newBoard));
        localStorage.setItem("chance", "0");
        localStorage.setItem("status", "Player 1's turn");
        localStorage.setItem("activePlayer", "1");
        localStorage.setItem("modalState", "false");
        localStorage.setItem("winningLine", "[]");
    };


    useEffect(() => {
        setActivePlayer(chance % numberOfPlayers + 1);
    }, [chance, numberOfPlayers]);


    useEffect(() => {
        if (board) {
            localStorage.setItem("board", JSON.stringify(board));
            localStorage.setItem("chance", chance.toString());
            localStorage.setItem("status", status);
            localStorage.setItem("activePlayer", activePlayer.toString());
            localStorage.setItem("playerScores", JSON.stringify(playerScores));
            localStorage.setItem('modalState', JSON.stringify(modalState));
            localStorage.setItem('winningLine', JSON.stringify(winningLine));
        }
    }, [board, chance, status, activePlayer, playerScores, modalState, winningLine]);

    const calculateWinner = (squares) => {
        const winLength = (boardSize);
        const lines = [];


        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col <= boardSize - winLength; col++) {
                const line = Array.from({ length: winLength }, (_, i) => row * boardSize + col + i);
                lines.push(line);
            }
        }


        for (let col = 0; col < boardSize; col++) {
            for (let row = 0; row <= boardSize - winLength; row++) {
                const line = Array.from({ length: winLength }, (_, i) => (row + i) * boardSize + col);
                lines.push(line);
            }
        }


        for (let row = 0; row <= boardSize - winLength; row++) {
            for (let col = 0; col <= boardSize - winLength; col++) {
                const line = Array.from({ length: winLength }, (_, i) => (row + i) * boardSize + col + i);
                lines.push(line);
            }
        }


        for (let row = 0; row <= boardSize - winLength; row++) {
            for (let col = winLength - 1; col < boardSize; col++) {
                const line = Array.from({ length: winLength }, (_, i) => (row + i) * boardSize + col - i);
                lines.push(line);
            }
        }


        for (let line of lines) {
            const values = line.map(i => squares[i]);
            if (values[0] && values.every(v => v === values[0])) {
                return { player: values[0], line };
            }
        }

        return null;
    };

    const handleDisplay = (index) => {
        if (board[index] || calculateWinner(board)) return;

        beep.play();
        const updatedBoard = [...board];
        updatedBoard[index] = playerSymbols[activePlayer - 1];
        setBoard(updatedBoard);

        const result = calculateWinner(updatedBoard);
        if (result) {
            const winningPlayer = playerSymbols.indexOf(result.player) + 1;
            setStatus(`Player ${winningPlayer} wins!`);
            setPlayerScores(prev => {
                const newScores = [...prev];
                newScores[winningPlayer - 1]++;
                return newScores;
            });
            setActivePlayer(0);
            setWinningLine(result.line);
            setTimeout(() => setModalState(true), 1000);
        } else if (updatedBoard.every(cell => cell)) {
            setStatus("It's a draw!");
            setModalState(true);
        } else {
            setChance(chance + 1);
            setStatus(`Player ${(chance % numberOfPlayers + 1)}'s turn`);
        }
    };

    const resetGame = () => {
        const newBoard = Array(Math.pow(boardSize, 2)).fill(null);
        setBoard(newBoard);
        setChance(0);
        setStatus("Player 1's turn");
        setModalState(false);
        setWinningLine([]);


        localStorage.setItem("board", JSON.stringify(newBoard));
        localStorage.setItem("chance", "0");
        localStorage.setItem("status", "Player 1's turn");
        localStorage.setItem("modalState", "false");
        localStorage.setItem("winningLine", "[]");
    };

    const startOver = () => {
        resetGame();
        const resetScores = Array(5).fill(0);
        setPlayerScores(resetScores);
        localStorage.setItem("playerScores", JSON.stringify(resetScores));
    };

    return (
        <div className="container">
            <h1>Tic-Tac-Toe</h1>
            <div className="players">
                {Array.from({ length: numberOfPlayers }, (_, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <strong className="versus-text">VS</strong>}
                        <div className="playerNum">
                            <div className={`player ${activePlayer === i + 1 ? 'active' : ''}`}>
                                <img
                                    src="https://static-00.iconduck.com/assets.00/profile-circle-icon-1023x1024-ucnnjrj1.png"
                                    alt={`Player ${i + 1}`}
                                />
                                {`Player ${i + 1} ${activePlayer === i + 1 ? '★' : ''}`}
                            </div>
                            <div className="scoreDiv">Score: {playerScores[i]}</div>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            <div className={`board size-${boardSize}`}>
                {board.map((value, index) => (
                    <div
                        key={index}
                        className={`space ${winningLine.includes(index) ? 'winner' : ''}`}
                        onClick={() => handleDisplay(index)}
                    >
                        {value}
                    </div>
                ))}
            </div>

            <div>
                <button className="reset-button" onClick={resetGame}>Reset Game</button>
                <button className="reset-button" onClick={() => setPlayerModalState(true)}>Change Number Of Players</button>
            </div>

            {modalState && (
                <div className="modal">
                    <div className="modal-content">
                        <p>{status}</p>
                        <button className="reset-button" onClick={resetGame}>Play Again</button>
                        <button className="reset-button" onClick={startOver}>Start Over</button>
                    </div>
                </div>
            )}

            {playerModalState && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='changePLayer'>
                            <p>Change Players</p>
                            <button onClick={() => setPlayerModalState(false)}
                                className="delete-btn">
                                ✕
                            </button>
                        </div>
                        {[2, 3, 4, 5].map(num => (
                            <button
                                key={num}
                                className="reset-button"
                                onClick={() => handlePlayerChange(num)}
                            >
                                {num} Players
                            </button>
                        ))}
                        {/* <button 
                            className="reset-button" 
                            onClick={() => setPlayerModalState(false)}
                        >
                            Cancel
                        </button> */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoardComponent;