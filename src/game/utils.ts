export interface Position {
  x: number;
  y: number;
}

export interface Box {
  position: Position;
  width: number;
  height: number;
}

// AABB Collision Detection
export function rectangularCollision({ rectangle1, rectangle2 }: { rectangle1: Box, rectangle2: Box }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height
  );
}
