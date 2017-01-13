import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators } from '@angular/forms';

export function emailValidator(emailRe : RegExp) : ValidatorFn {
  return (control: AbstractControl) : {[key: string]: any} => {
    const email = control.value;
    // if the pattern is not matched then the password is invalid
    const yes = !emailRe.test(email);
    return yes ? { 'validEmail': {email}} : null;
  };
}

@Directive({
  selector: '[validEmail]',
  providers: [
    { 
      provide: NG_VALIDATORS, 
      useExisting: ValidEmailValidatorDirective, multi: true 
    }
  ]
})
export class ValidEmailValidatorDirective implements Validator, OnChanges {
  @Input() validEmail: string;
  private valFn = Validators.nullValidator;

  ngOnChanges(changes: SimpleChanges) : void {
    const change = changes['validEmail'];
    if (change) {
      const val: string | RegExp = change.currentValue;
      const re = val instanceof RegExp ? val : new RegExp(val, 'i');
      this.valFn = emailValidator(re);
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  validate(control: AbstractControl) : { [key: string]: any } {
    return this.valFn(control);
  }
}
