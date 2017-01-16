import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators } from '@angular/forms';

export function allowedTypesValidator(allowedTypes: Array<string>) : ValidatorFn {
  return (control: AbstractControl) : {[key: string]: any} => {
    let val = control.value;
    return allowedTypes.includes(val) ? null : { 'allowedTypes': {val} };
  };
}

@Directive({
  selector: '[allowedType]',
  providers: [{ provide: NG_VALIDATORS, useExisting: AllowedTypesValidatorDirective, multi: true }]
})
export class AllowedTypesValidatorDirective implements Validator, OnChanges {
  @Input() strongPassword: string;
  private valFn = Validators.nullValidator;

  ngOnChanges(changes: SimpleChanges) : void {
    const change = changes['allowedType'];
    if (change) {
      const val: Array<string> = change.currentValue;
      this.valFn = allowedTypesValidator(val);
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  validate(control: AbstractControl) : { [key: string]: any } {
    return this.valFn(control);
  }
}
