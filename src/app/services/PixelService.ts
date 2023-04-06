import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Pixel } from '../models/pixel';

@Injectable({
  providedIn: 'root'
})
export class PixelService {
  private baseUrl = 'http://192.168.2.17:3000'; // temp local ip (for testing on multiple PCs within same network)

  constructor(private http: HttpClient) { }

  getPixel(x: number, y: number): Observable<Pixel> {
    return this.http.get<Pixel>(`${this.baseUrl}/pixel?x=${x}&y=${y}`);
  }

  getPixels(x: number, y: number, width: number, height: number): Observable<{ pixels: { [key: string]: Pixel } }> {
    return this.http.get<{ pixels: Pixel[] }>(`${this.baseUrl}/pixels?x=${x}&y=${y}&width=${width}&height=${height}`).pipe(
      map(response => {
        const pixels: { [key: string]: Pixel } = {};

        for (let i = x; i < x + width; i++) {
          for (let j = y; j < y + height; j++) {
            const key = `${i}_${j}`;
            pixels[key] = new Pixel('#FFFFFF');
          }
        }
  
        if(response.pixels) {
          response.pixels.forEach(p => {
            const key = `${p.x}_${p.y}`;
            pixels[key] = new Pixel(p.colour, p.owner);
          });
        }
  
        return { pixels };
      })
    );
  }

  updatePixel(x: number, y: number, colour: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('x', x.toString());
    body.set('y', y.toString());
    body.set('colour', colour);

    return this.http.post(`${this.baseUrl}/pixels/update`, body.toString(), { headers: headers, responseType: 'text' }).pipe(
      map(response => {
        return response;
      })
    );
  }

}
