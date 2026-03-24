import { Position, Box } from './utils';

interface FighterProps {
  position: Position;
  velocity: Position;
  color: string;
  offset: Position; // For attack box offset
  facingRight: boolean;
}

export class Fighter {
  public position: Position;
  public velocity: Position;
  public width: number;
  public height: number;
  public color: string;
  public isAttacking: boolean;
  public isDefending: boolean;
  public isTakingHit: boolean;
  public attackBox: Box & { offset: Position };
  public hp: number;
  public dead: boolean;
  public facingRight: boolean;

  private gravity = 0.7;
  private canvasHeight = 576;

  constructor({ position, velocity, color, offset, facingRight }: FighterProps) {
    this.position = position;
    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.color = color;
    this.isAttacking = false;
    this.isDefending = false;
    this.isTakingHit = false;
    this.hp = 100;
    this.dead = false;
    this.facingRight = facingRight;
    
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      offset,
      width: 100,
      height: 50
    };
  }

  public draw(c: CanvasRenderingContext2D) {
    this.drawMecha(c);

    // Draw Attack Box if attacking
    if (this.isAttacking) {
      c.fillStyle = 'rgba(255, 255, 255, 0.5)';
      c.fillRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height
      );
    }
  }

  private drawMecha(c: CanvasRenderingContext2D) {
    // A simple 10x15 pixel grid representing a mecha
    // 0 = transparent, 1 = primary color, 2 = dark color (accent), 3 = eye color (cyan/yellow), 4 = weapon color
    const mechaDesign = [
      "0001111000",
      "0011221100",
      "0111331110",
      "0111111110",
      "0012222100",
      "0411111140",
      "4411111144",
      "0421111240",
      "0421111240",
      "0011221100",
      "0011001100",
      "0022002200",
      "0022002200",
      "0111001110",
      "1111001111"
    ];

    const pixelWidth = 5;
    const pixelHeight = 10;
    
    let isFlipped = !this.facingRight;
    const primaryColor = this.color;
    const darkColor = this.color === '#3b82f6' ? '#1e3a8a' : '#7f1d1d';
    const eyeColor = this.color === '#3b82f6' ? '#22d3ee' : '#fde047'; // cyan for blue, yellow for red
    const weaponColor = '#9ca3af';
    const attackColor = '#facc15';

    const colorMap: Record<string, string> = {
      '1': primaryColor,
      '2': darkColor,
      '3': eyeColor,
      '4': this.isAttacking ? attackColor : weaponColor
    };

    // If taking hit, flash white
    if (this.isTakingHit) {
      colorMap['1'] = 'white';
      colorMap['2'] = 'white';
    }

    for (let r = 0; r < mechaDesign.length; r++) {
      for (let col = 0; col < mechaDesign[r].length; col++) {
        let actualCol = isFlipped ? mechaDesign[r].length - 1 - col : col;
        let char = mechaDesign[r][actualCol];
        
        if (char !== '0') {
          c.fillStyle = colorMap[char];
          // shift weapon pixels forward if attacking
          let xOffset = 0;
          if (this.isAttacking && char === '4') {
            xOffset = this.facingRight ? 15 : -15;
          }

          c.fillRect(
            this.position.x + col * pixelWidth + xOffset,
            this.position.y + r * pixelHeight,
            pixelWidth,
            pixelHeight
          );
        }
      }
    }
    // Draw shield if defending
    if (this.isDefending) {
      c.strokeStyle = '#38bdf8'; // cyan-400
      c.lineWidth = 4;
      c.beginPath();
      const shieldX = this.facingRight ? this.position.x + this.width + 10 : this.position.x - 10;
      c.arc(shieldX, this.position.y + this.height / 2, this.height / 2, 
        this.facingRight ? -Math.PI/2 : Math.PI/2, 
        this.facingRight ? Math.PI/2 : -Math.PI/2
      );
      c.stroke();
    }
  }

  public update(c: CanvasRenderingContext2D) {
    this.draw(c);

    if (!this.dead) {
      // Update Attack Box position
      this.attackBox.position.x = this.facingRight 
        ? this.position.x + this.attackBox.offset.x
        : this.position.x - this.attackBox.offset.x - this.attackBox.width + this.width;
      
      this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      // Gravity function
      if (this.position.y + this.height + this.velocity.y >= this.canvasHeight - 96) {
        this.velocity.y = 0;
        this.position.y = this.canvasHeight - 96 - this.height; // ground level
      } else {
        this.velocity.y += this.gravity;
      }
    }
  }

  public attack() {
    if (!this.isAttacking && !this.dead) {
      this.isAttacking = true;
      setTimeout(() => {
        this.isAttacking = false;
      }, 100);
    }
  }

  public takeHit(damage: number) {
    if (this.isDefending) {
      this.hp -= damage * 0.2; // 80% damage reduction when blocking
    } else {
      this.hp -= damage;
    }
    
    this.isTakingHit = true;
    setTimeout(() => {
      this.isTakingHit = false;
    }, 150);

    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }
  }
}
