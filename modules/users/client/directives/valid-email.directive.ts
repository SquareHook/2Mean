import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  Validator,
  ValidatorFn,
  Validators
} from '@angular/forms';

/* factory for validator function
 * @param {RegExp} emailRe - valid emails should match
 * @returns {VaidatorFn}
 */
export function emailValidator(emailRe : RegExp) : ValidatorFn {
  /*
   * validator function generator
   * @param {AbstractControl} control - the HTML input element being validated
   * @returns a function which returns an object with key value pairs
   *
   * example return object:
   *  { 'validEmail': 'guest@abc.xyz' }
   */
  return (control: AbstractControl) : {[key: string]: any} => {
    const email = control.value;
    // if the pattern is not matched then the password is invalid
    const yes = !emailRe.test(email);
    return yes ? { 'validEmail': {email}} : null;
  };
}

/*
 * validEmail directive
 * used to validate password strength
 */
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
