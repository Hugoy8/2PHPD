import {Component} from '@angular/core';
import {InformationPopupService} from "../../../services/popups/information-popup/information-popup.service";
import {NgClass, TitleCasePipe} from "@angular/common";

@Component({
  selector: 'app-information-popup',
  standalone: true,
  imports: [
    NgClass,
    TitleCasePipe
  ],
  templateUrl: './information-popup.component.html',
  styleUrl: './information-popup.component.css'
})
export class InformationPopupComponent{
  constructor(
    public readonly informationPopupService: InformationPopupService
  ) { }
}
