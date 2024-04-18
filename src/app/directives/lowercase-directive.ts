import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[forceLowercase]'
})
export class LowercaseDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event : any): void {
    const initalValue = this.el.nativeElement.value;
    this.el.nativeElement.value = initalValue.toLowerCase();
    if ( initalValue !== this.el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
