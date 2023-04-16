import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  private colourPickerValue = new BehaviorSubject<string>('#FF0000');
  private tpCoords = new BehaviorSubject({x: 0, y: 0});
  private eyedropperActive = new BehaviorSubject<boolean>(false);

  constructor() { }

  setColourPickerValue(value: string) {
    this.colourPickerValue.next(value);
  }

  getColourPickerValue() {
    return this.colourPickerValue.asObservable();
  }

  setTeleport(value: {x: number, y: number}) {
    this.tpCoords.next(value);
  }

  getTeleport() {
    return this.tpCoords.asObservable();
  }

  toggleEyeDropper() {
    this.eyedropperActive.next(!this.eyedropperActive.value);
  }

  getEyeDropper() {
    return this.eyedropperActive.asObservable();
  }

}
