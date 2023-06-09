import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Pixel } from '../models/pixel';
import { PixelService } from '../services/PixelService';
import { ToolbarService } from '../services/ToolbarService';

@Component({
  selector: 'app-virtual-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class VirtualCanvasComponent {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @Input() cellSize = 10;

  pixels: Record<string, Pixel> = {};
  selectedColour: string = '#FF0000';
  offset = { x: 0, y: 0 };
  eyedropper: boolean = false;

  private eventSource = new EventSource('http://192.168.2.17:3000/sse'); // will likely move this & relevant code to service

  constructor(
    private pixelService: PixelService,
    private toolbarService: ToolbarService
  ) {
    this.eventSource.addEventListener("update", e => {
      const pixel: Pixel = JSON.parse(e.data);
      this.drawPixel(pixel, pixel.x, pixel.y);
    });
  }

  ngOnInit() {
    const canvas = this.canvas.nativeElement;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    this.createPixels();
    this.loadPixels();

    this.toolbarService.getColourPickerValue().subscribe(value => {
      this.selectedColour = value;
    });
    this.toolbarService.getTeleport().subscribe(value => {
      this.teleport(value);
    });
    this.toolbarService.getEyeDropper().subscribe(value => {
      this.eyedropper = value;
    });
  }

  teleport(coords: {x: number, y: number}) {
    this.offset = coords;
    this.loadPixels();
  } // next steps: probably just teleport to -y to avoid all the flipping y axis problems
    // next: load pixels when dragging (will need to create new pixels in the blank space and unload old pixels out of view)

  createPixels() {
    const width = this.canvas.nativeElement.width;
    const height = this.canvas.nativeElement.height;
    const cols = Math.floor(width / this.cellSize);
    const rows = Math.floor(height / this.cellSize);

    for (let x = this.offset.x; x < this.offset.x+cols; x++) {
      for (let y = this.offset.y; y < this.offset.y+rows; y++) {
        const key = `${x}_${y}`;
        this.pixels[key] = new Pixel(key, 'white');
      }
    }
  }

  loadPixels() {
    const canvas = this.canvas.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    this.pixelService.getPixels(this.offset.x, this.offset.y, width, height)
      .subscribe(response => {
        this.pixels = response.pixels;
        this.redraw();
        canvas.style.left = '0px';
        canvas.style.top = '0px';
      });
  }

  redraw() {
    if (this.canvas) {
      const canvas = this.canvas.nativeElement;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate the number of cells that fit in the canvas
      const numCellsWidth = Math.ceil(canvas.width / this.cellSize);
      const numCellsHeight = Math.ceil(canvas.height / this.cellSize);

      // Draw the pixels
      for (let x = 0; x < numCellsWidth; x++) {
        for (let y = 0; y < numCellsHeight; y++) {
          const pixel = this.pixels[`${this.offset.x+x}_${this.offset.y+y}`];
          ctx.fillStyle = (pixel && pixel.colour) ? pixel.colour : 'white';
          ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }

      // Draw the grid
      for (let x = 0; x < numCellsWidth; x++) {
        for (let y = 0; y < numCellsHeight; y++) {
          ctx.strokeStyle = 'lightgray';
          ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }
  }

  private drawPixel(pixel: Pixel, x: number, y: number) {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.fillStyle = pixel.colour;
    ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
  }

  onMouseDown(event: MouseEvent) {
    const canvas = this.canvas?.nativeElement;
    if (canvas) {
      if (event.button == 0) {
        const rect = canvas.getBoundingClientRect();
        const screenX = Math.floor((event.clientX - rect.left) / this.cellSize);
        const screenY = Math.floor((event.clientY - rect.top) / this.cellSize);
        const x = this.offset.x + screenX;
        const y = this.offset.y + screenY

        // Check if the x and y values are within the bounds of the pixels array
        const key = `${x}_${y}`;
        if (key in this.pixels) {
          const pixel = this.pixels[key];
          if(this.eyedropper) {
            this.toolbarService.setColourPickerValue(pixel.colour);
            this.toolbarService.toggleEyeDropper();
          }else {
            pixel.colour = this.selectedColour;
            pixel.owner = '';
            this.drawPixel(pixel, screenX, screenY);
            this.pixelService.updatePixel(x, y, pixel.colour).subscribe();
          }
        }
      } else if (event.button == 2) {
        // right click to drag canvas
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        var startX = event.clientX;
        var startY = event.clientY;
        var moveX = 0;
        var moveY = 0;
        const onMouseMove = (moveEvent: MouseEvent) => {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          moveX = canvas.offsetLeft + deltaX;
          moveY = canvas.offsetTop + deltaY;
          canvas.style.left = moveX + 'px';
          canvas.style.top = moveY + 'px';
          startX = moveEvent.clientX;
          startY = moveEvent.clientY;
        };
        const onMouseUp = () => {
          this.offset.x += -Math.ceil(moveX/this.cellSize);
          this.offset.y += -Math.ceil(moveY/this.cellSize);
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          
          this.loadPixels();
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    }
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

}
