export class Pixel {
    x: number = -1;
    y: number = -1;
    colour: string;
    owner?: string;

    constructor(colour: string, owner?: string, x?: number, y?: number) {
        this.colour = colour;
        this.owner = owner;
        if(x) this.x = x;
        if(y) this.y = y;
    }
}