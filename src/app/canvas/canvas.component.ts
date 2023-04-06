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

  pixels: Pixel[][] = [];
  selectedColour: string = '#FF0000';

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
    })
  }

  createPixels() {
    const width = this.canvas.nativeElement.width;
    const height = this.canvas.nativeElement.height;
    const cols = Math.floor(width / this.cellSize);
    const rows = Math.floor(height / this.cellSize);

    this.pixels = new Array(rows).fill(null)
      .map(() => new Array(cols).fill(null)
        .map(() => new Pixel('', 'white')));
  }

  loadPixels() {
    const width = this.canvas.nativeElement.width;
    const height = this.canvas.nativeElement.height;

    this.pixelService.getPixels(0, 0, width, height)
      .subscribe(response => {
        this.pixels = response.pixels;
        this.redraw();
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
      for (let x = 0; x < this.pixels.length; x++) {
        for (let y = 0; y < this.pixels[x].length; y++) {
          const pixel = this.pixels[x][y];
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
        const x = Math.floor((event.clientX - rect.left) / this.cellSize);
        const y = Math.floor((event.clientY - rect.top) / this.cellSize);

        // Check if the x and y values are within the bounds of the pixels array
        if (x >= 0 && x < this.pixels.length && y >= 0 && y < this.pixels[x].length) {
          const pixel = this.pixels[x][y];
          pixel.colour = this.selectedColour;
          pixel.owner = '';
          this.drawPixel(pixel, x, y);
          this.pixelService.updatePixel(x, y, pixel.colour).subscribe();
        }
      } else if (event.button == 2) {
        // right click to drag canvas
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        var startX = event.clientX;
        var startY = event.clientY;
        const onMouseMove = (moveEvent: MouseEvent) => {
          if (moveEvent.buttons !== 2) {
            // stop dragging if right mouse button is released
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            return;
          }
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          const newLeft = canvas.offsetLeft + deltaX;
          const newTop = canvas.offsetTop + deltaY;
          canvas.style.left = newLeft + 'px';
          canvas.style.top = newTop + 'px';
          startX = moveEvent.clientX;
          startY = moveEvent.clientY;
        };
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
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
