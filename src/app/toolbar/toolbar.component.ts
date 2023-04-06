import { Component, EventEmitter, Output } from '@angular/core';
import { ToolbarService } from '../services/ToolbarService';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

    colourPicker!: HTMLInputElement;

    constructor(private toolbarService: ToolbarService) { }

    ngOnInit() {
        this.colourPicker = document.querySelector('#colour-picker') as HTMLInputElement;

        const cachedColour = localStorage.getItem('selectedColour');
        if(cachedColour) this.colourPicker.value = cachedColour;    // restore cached colour
        else this.colourPicker.value = '#FF0000';                   // otherwise default red

        this.colourPicker.addEventListener('input', (event: Event) => {
           this.updateColour(); 
        });

        this.updateColour();
    }

    updateColour() {
        this.colourPicker.style.backgroundColor = this.colourPicker.value;
        this.toolbarService.setColourPickerValue(this.colourPicker.value);

        localStorage.setItem('selectedColour', this.colourPicker.value); // cache colour
    }

}