import { useGameStore } from '../store/gameStore';
import { Fighter } from './Fighter';
import { InputHandler } from './InputHandler';
import { rectangularCollision } from './utils';

export default class GameEngine {
  private canvas: HTMLCanvasElement;
  private c: CanvasRenderingContext2D;
  private animationId: number = 0;
  private player1: Fighter;
  private player2: Fighter;
  private inputHandler: InputHandler;
  private lastTime: number = 0;
  private timerInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not found');
    this.c = ctx;

    this.inputHandler = new InputHandler();

    this.player1 = new Fighter({
      position: { x: 150, y: 0 },
      velocity: { x: 0, y: 0 },
      color: '#3b82f6', // blue-500
      offset: { x: 0, y: 50 },
      facingRight: true
    });

    this.player2 = new Fighter({
      position: { x: 800, y: 0 },
      velocity: { x: 0, y: 0 },
      color: '#ef4444', // red-500
      offset: { x: 0, y: 50 },
      facingRight: false
    });
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Reset Store state
    const store = useGameStore.getState();
    store.resetGame();

    this.timerInterval = setInterval(() => {
      const currentTimer = useGameStore.getState().timer;
      if (currentTimer > 0) {
        useGameStore.getState().setTimer(currentTimer - 1);
      } else {
        this.determineWinner();
      }
    }, 1000);

    this.animate(0);
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.inputHandler.destroy();
  }

  private determineWinner() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const p1Hp = this.player1.hp;
    const p2Hp = this.player2.hp;
    
    let winnerText = 'Tie';
    if (p1Hp > p2Hp) winnerText = 'PLAYER 1';
    else if (p2Hp > p1Hp) winnerText = 'PLAYER 2';

    useGameStore.getState().setWinner(winnerText);
    useGameStore.getState().setStatus('gameover');
    this.isRunning = false;
  }

  private animate = (time: number) => {
    if (!this.isRunning) return;
    
    this.animationId = requestAnimationFrame(this.animate);
    
    // Background gradient
    const bgGradient = this.c.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGradient.addColorStop(0, '#0f172a'); // slate-900
    bgGradient.addColorStop(1, '#312e81'); // indigo-900
    this.c.fillStyle = bgGradient;
    this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw distant pixel city
    this.c.fillStyle = '#1e1b4b';
    const cityHeights = [200, 150, 250, 100, 180, 220, 130, 280, 160, 210, 190];
    for(let i=0; i<cityHeights.length; i++) {
      this.c.fillRect(i * 100, this.canvas.height - 96 - cityHeights[i], 100, cityHeights[i]);
      // draw windows
      this.c.fillStyle = '#fef08a'; // yellow-200 for window lights
      for(let w=0; w<5; w++) {
        if(Math.random() > 0.5) continue; // random lights
        this.c.fillRect(i * 100 + 20 + (w%2)*40, this.canvas.height - 96 - cityHeights[i] + 30 + Math.floor(w/2)*50, 10, 15);
      }
      this.c.fillStyle = '#1e1b4b'; // reset to building color
    }
    
    // Floor
    this.c.fillStyle = '#374151'; // gray-700
    this.c.fillRect(0, this.canvas.height - 96, this.canvas.width, 96);
    
    // Grid lines for floor to look cyber
    this.c.strokeStyle = '#4b5563';
    this.c.lineWidth = 2;
    for(let i=-100; i<this.canvas.width + 100; i+=64) {
      this.c.beginPath();
      this.c.moveTo(i + (time * 0.05) % 64, this.canvas.height - 96);
      this.c.lineTo(i - 40 + (time * 0.05) % 64, this.canvas.height);
      this.c.stroke();
    }
    
    // Draw horizon line
    this.c.strokeStyle = '#22d3ee';
    this.c.lineWidth = 4;
    this.c.beginPath();
    this.c.moveTo(0, this.canvas.height - 96);
    this.c.lineTo(this.canvas.width, this.canvas.height - 96);
    this.c.stroke();

    this.player1.update(this.c);
    this.player2.update(this.c);

    this.handleInput();
    this.handleCollisions();

    // Check death
    if (this.player1.hp <= 0 || this.player2.hp <= 0) {
      this.determineWinner();
    }
  }

  private handleInput() {
    // Player 1 Movement
    this.player1.velocity.x = 0;
    this.player1.isDefending = false;

    if (this.inputHandler.isKeyPressed('k')) {
      this.player1.isDefending = true;
    } else {
      if (this.inputHandler.isKeyPressed('a') && this.player1.position.x > 0) {
        this.player1.velocity.x = -5;
        this.player1.facingRight = false;
      } else if (this.inputHandler.isKeyPressed('d') && this.player1.position.x + this.player1.width < this.canvas.width) {
        this.player1.velocity.x = 5;
        this.player1.facingRight = true;
      }

      if (this.inputHandler.isKeyPressed('w') && this.player1.position.y >= this.canvas.height - 96 - this.player1.height) {
        this.player1.velocity.y = -15; // jump
      }
      
      // Player 1 Attack
      if (this.inputHandler.isKeyPressed('j')) {
        this.player1.attack();
      }
    }

    // Player 2 Movement
    this.player2.velocity.x = 0;
    this.player2.isDefending = false;

    if (this.inputHandler.isKeyPressed('2')) { // Num 2
      this.player2.isDefending = true;
    } else {
      if (this.inputHandler.isKeyPressed('ArrowLeft') && this.player2.position.x > 0) {
        this.player2.velocity.x = -5;
        this.player2.facingRight = false;
      } else if (this.inputHandler.isKeyPressed('ArrowRight') && this.player2.position.x + this.player2.width < this.canvas.width) {
        this.player2.velocity.x = 5;
        this.player2.facingRight = true;
      }

      if (this.inputHandler.isKeyPressed('ArrowUp') && this.player2.position.y >= this.canvas.height - 96 - this.player2.height) {
        this.player2.velocity.y = -15;
      }

      // Player 2 Attack
      if (this.inputHandler.isKeyPressed('1')) { // Num 1
        this.player2.attack();
      }
    }
  }

  private handleCollisions() {
    // Player 1 attacking Player 2
    if (
      this.player1.isAttacking &&
      rectangularCollision({
        rectangle1: this.player1.attackBox,
        rectangle2: this.player2
      })
    ) {
      this.player1.isAttacking = false; // hit only once per attack
      this.player2.takeHit(10);
      useGameStore.getState().setHP(2, this.player2.hp);
    }

    // Player 2 attacking Player 1
    if (
      this.player2.isAttacking &&
      rectangularCollision({
        rectangle1: this.player2.attackBox,
        rectangle2: this.player1
      })
    ) {
      this.player2.isAttacking = false;
      this.player1.takeHit(10);
      useGameStore.getState().setHP(1, this.player1.hp);
    }
  }
}
