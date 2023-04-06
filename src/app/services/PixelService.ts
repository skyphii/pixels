import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Pixel } from '../models/pixel';

@Injectable({
  providedIn: 'root'
})
export class PixelService {
  private baseUrl = 'http://192.168.2.17:3000';

  constructor(private http: HttpClient) { }

  getPixel(x: number, y: number): Observable<Pixel> {
    return this.http.get<Pixel>(`${this.baseUrl}/pixel?x=${x}&y=${y}`);
  }

  getPixels(x: number, y: number, width: number, height: number): Observable<{ pixels: Pixel[][] }> {
    return this.http.get<{ pixels: Pixel[] }>(`${this.baseUrl}/pixels?x=${x}&y=${y}&width=${width}&height=${height}`).pipe(
      map(response => {
        var pixels: Pixel[][] = [];

        for (let x = 0; x < width; x++) {
          if(!pixels[x]) pixels[x] = [];
          for (let y = 0; y < height; y++) {
            pixels[x][y] = new Pixel('#FFFFFF');
          }
        }

        if(response.pixels) {
          response.pixels.forEach(p => {
            if(!pixels[p.x]) pixels[p.x] = [];
            pixels[p.x][p.y] = new Pixel(p.colour, p.owner);
          });
        }
        // if (!response.pixels) response.pixels = [];
        // var pixels = response.pixels;
  
        // for (let x = 0; x < pixels.length; x++) {
        //   if(!pixels[x]) pixels[x] = [];
        //   for (let y = 0; y < pixels[x].length; y++) {
        //     if (!pixels[x]) pixels[x] = [];
        //     if (!pixels[x][y]) pixels[x][y] = new Pixel("#ffffff");
        //   }
        // }
  
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
