/**
 * Simple Quadtree implementation for spatial indexing of 2D geometry.
 * Optimized for hit-testing drawings on a chart.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Bounds extends Rect {
  id: string;
  type: string;
}

export class Quadtree {
  private bounds: Rect;
  private capacity: number;
  private objects: Bounds[] = [];
  private divided: boolean = false;
  
  private northwest: Quadtree | null = null;
  private northeast: Quadtree | null = null;
  private southwest: Quadtree | null = null;
  private southeast: Quadtree | null = null;

  constructor(bounds: Rect, capacity: number = 4) {
    this.bounds = bounds;
    this.capacity = capacity;
  }

  private subdivide(): void {
    const { x, y, width, height } = this.bounds;
    const w = width / 2;
    const h = height / 2;

    this.northwest = new Quadtree({ x, y, width: w, height: h }, this.capacity);
    this.northeast = new Quadtree({ x: x + w, y, width: w, height: h }, this.capacity);
    this.southwest = new Quadtree({ x, y: y + h, width: w, height: h }, this.capacity);
    this.southeast = new Quadtree({ x: x + w, y: y + h, width: w, height: h }, this.capacity);

    this.divided = true;
  }

  insert(obj: Bounds): boolean {
    if (!this.contains(obj)) {
      return false;
    }

    if (this.objects.length < this.capacity) {
      this.objects.push(obj);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      (this.northwest?.insert(obj) ?? false) ||
      (this.northeast?.insert(obj) ?? false) ||
      (this.southwest?.insert(obj) ?? false) ||
      (this.southeast?.insert(obj) ?? false)
    );
  }

  private contains(obj: Rect): boolean {
    return (
      obj.x >= this.bounds.x &&
      obj.x + obj.width <= this.bounds.x + this.bounds.width &&
      obj.y >= this.bounds.y &&
      obj.y + obj.height <= this.bounds.y + this.bounds.height
    );
  }

  private intersects(range: Rect): boolean {
    return !(
      range.x > this.bounds.x + this.bounds.width ||
      range.x + range.width < this.bounds.x ||
      range.y > this.bounds.y + this.bounds.height ||
      range.y + range.height < this.bounds.y
    );
  }

  query(range: Rect, found: Bounds[] = []): Bounds[] {
    if (!this.intersects(range)) {
      return found;
    }

    for (const obj of this.objects) {
      if (
        obj.x < range.x + range.width &&
        obj.x + obj.width > range.x &&
        obj.y < range.y + range.height &&
        obj.y + obj.height > range.y
      ) {
        found.push(obj);
      }
    }

    if (this.divided) {
      this.northwest?.query(range, found);
      this.northeast?.query(range, found);
      this.southwest?.query(range, found);
      this.southeast?.query(range, found);
    }

    return found;
  }

  clear(): void {
    this.objects = [];
    this.divided = false;
    this.northwest = null;
    this.northeast = null;
    this.southwest = null;
    this.southeast = null;
  }
}
