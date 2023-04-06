import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
    private colourPickerValue = new BehaviorSubject<string>('#FF0000');

  constructor() { }

  setColourPickerValue(value: string) {
    this.colourPickerValue.next(value);
  }

  getColourPickerValue() {
    return this.colourPickerValue.asObservable();
  }

}
