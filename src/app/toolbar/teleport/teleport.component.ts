import { Component, EventEmitter, Output } from '@angular/core';
import { ToolbarService } from '../../services/ToolbarService';

@Component({
    selector: 'app-teleport',
    templateUrl: './teleport.component.html',
    styleUrls: ['./teleport.component.scss']
})
export class TeleportComponent {

    x?: number;
    y?: number;

    constructor(private toolbarService: ToolbarService) { }

    teleport() {
        const xx: number = this.x ? this.x : 0;
        const yy: number = this.y ? this.y : 0;
        this.toolbarService.setTeleport({x: xx, y: yy});
    }

}