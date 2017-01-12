import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators } from '@angular/forms';

export function maxSizeValidator(maxSize: number) : ValidatorFn {
  return (control: AbstractControl) : {[key: string]: any} => {
    let val = control.value;
    return val <= Number(maxSize) ? null : { 'maxSize': {val} };
  };
}

@Directive({
  selector: '[maxSize]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MaxSizeValidatorDirective, multi: true }]
})
export class MaxSizeValidatorDirective implements Validator, OnChanges {
  @Input() maxSize: string;
  private valFn = Validators.nullValidator;

  ngOnChanges(changes: SimpleChanges) : void {
    const change = changes['maxSize'];
    if (change) {
      const val: number = change.currentValue;
      this.valFn = maxSizeValidator(val);
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  validate(control: AbstractControl) : { [key: string]: any } {
    return this.valFn(control);
  }
}
