import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import GameEngine from '../game/GameEngine';

const GamePage: React.FC = () => {
  const { status, player1HP, player2HP, timer, winner, setStatus, resetGame } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (status === 'playing' && canvasRef.current && !gameEngineRef.current) {
      // Initialize GameEngine when playing starts
      gameEngineRef.current = new GameEngine(canvasRef.current);
      gameEngineRef.current.start();
    }

    if (status === 'menu' || status === 'gameover') {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
        gameEngineRef.current = null;
      }
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
        gameEngineRef.current = null;
      }
    };
  }, [status]);

  const handleStart = () => {
    resetGame();
  };

  return (
    <div className="relative w-[1024px] h-[576px] bg-black border-4 border-gray-700 shadow-2xl rounded-lg overflow-hidden">
      
      {/* UI Layer */}
      {status === 'playing' && (
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
          {/* Player 1 HP */}
          <div className="flex flex-col gap-2 w-[40%]">
            <div className="text-xl text-blue-400 font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">PLAYER 1</div>
            <div className="w-full h-8 bg-gray-800 border-2 border-white relative overflow-hidden">
              <div 
                className="absolute top-0 right-0 h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${player1HP}%` }}
              ></div>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center bg-gray-800 border-4 border-yellow-600 px-4 py-3 rounded">
            <span className="text-3xl text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]">
              {timer}
            </span>
          </div>

          {/* Player 2 HP */}
          <div className="flex flex-col gap-2 w-[40%] items-end">
            <div className="text-xl text-red-400 font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">PLAYER 2</div>
            <div className="w-full h-8 bg-gray-800 border-2 border-white relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-200"
                style={{ width: `${player2HP}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas 
        ref={canvasRef}
        width={1024}
        height={576}
        className="block w-full h-full"
      />

      {/* Main Menu Overlay */}
      {status === 'menu' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
          <h1 className="text-5xl text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600 font-bold mb-12 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] text-center leading-tight">
            CYBER MECHA<br/>BRAWL
          </h1>
          
          <div className="flex flex-col gap-6 text-sm text-gray-300 mb-12">
            <div className="flex justify-between w-96 bg-gray-900/50 p-4 border border-gray-700 rounded">
              <div>
                <h3 className="text-blue-400 mb-2 font-bold">PLAYER 1</h3>
                <p className="mb-1">W A S D - Move</p>
                <p className="mb-1">J - Attack</p>
                <p>K - Defend</p>
              </div>
              <div className="text-right">
                <h3 className="text-red-400 mb-2 font-bold">PLAYER 2</h3>
                <p className="mb-1">Arrows - Move</p>
                <p className="mb-1">Num 1 - Attack</p>
                <p>Num 2 - Defend</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleStart}
            className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xl border-4 border-yellow-800 hover:border-yellow-200 transition-all hover:scale-105 active:scale-95"
          >
            INSERT COIN (START)
          </button>
        </div>
      )}

      {/* Game Over Overlay */}
      {status === 'gameover' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
          <h2 className="text-6xl text-white font-bold mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
            {winner === 'Tie' ? 'DRAW' : `${winner} WINS`}
          </h2>
          <button 
            onClick={handleStart}
            className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xl border-4 border-yellow-800 hover:border-yellow-200 transition-all hover:scale-105 active:scale-95"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
