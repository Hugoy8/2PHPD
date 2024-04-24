import {Component, Input} from '@angular/core';
import {HexColor} from "../../models/type.model";

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  /**
   * Couleur du loader en hexadécimal.
   */
  @Input() public color: HexColor = "#FFF";

  /**
   * Taille du loader en pixels.
   */
  @Input({required: true}) public size!: number;

  /**
   * Taille du trait du loader en pixels.
   */
  @Input({required: true}) public sizeStroke!: number;
}
