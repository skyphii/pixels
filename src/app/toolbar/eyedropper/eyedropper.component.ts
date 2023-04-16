import { Component, EventEmitter, Output } from '@angular/core';
import { ToolbarService } from '../../services/ToolbarService';

@Component({
    selector: 'app-eyedropper',
    templateUrl: './eyedropper.component.html',
    styleUrls: ['./eyedropper.component.scss']
})
export class EyeDropperComponent {

    active: boolean = false;

    constructor(private toolbarService: ToolbarService) { }

    ngOnInit() {
        this.toolbarService.getEyeDropper().subscribe(value => {
            this.active = value;
        });
    }

    toggle() : void {
        this.toolbarService.toggleEyeDropper();
    }

}