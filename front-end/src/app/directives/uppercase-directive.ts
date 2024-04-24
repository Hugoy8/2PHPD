import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[forceUppercase]'
})
export class UppercaseDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event : any): void {
    const initalValue = this.el.nativeElement.value;
    this.el.nativeElement.value = initalValue.toUpperCase();
    if ( initalValue !== this.el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
