import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { VirtualCanvasComponent } from './canvas/canvas.component';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { TeleportComponent } from './toolbar/teleport/teleport.component';
import { FormsModule } from '@angular/forms';
import { EyeDropperComponent } from './toolbar/eyedropper/eyedropper.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    AppComponent,
    VirtualCanvasComponent,
    ToolbarComponent,
    TeleportComponent,
    EyeDropperComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
