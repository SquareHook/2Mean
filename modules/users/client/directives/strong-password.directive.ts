import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  Validator,
  ValidatorFn,
  Validators 
} from '@angular/forms';

/* factory for validator function
 * @param {RegExp} passwordRe - valid passwords should match
 * @returns {VaidatorFn}
 */
export function strongPasswordValidator(passwordRe : RegExp) : ValidatorFn {
  /*
   * validator function generator
   * @param {AbstractControl} control - the HTML input element being validated
   * @returns a function which returns an object with key value pairs
   *
   * example return object:
   *  { 'strongPassword': '123' }
   */
  return (control: AbstractControl) : {[key: string]: any} => {
    const password = control.value;
    // if the pattern is not matched then the password is invalid
    const yes = !passwordRe.test(password);
    return yes ? { 'strongPassword': {password}} : null;
  };
}

/*
 * strongPassword directive
 * used to validate password strength
 */
@Directive({
  selector: '[strongPassword]',
  providers: [
    { 
      provide: NG_VALIDATORS, 
      useExisting: StrongPasswordValidatorDirective, multi: true 
    }
  ]
})
export class StrongPasswordValidatorDirective implements Validator, OnChanges {
  @Input() strongPassword: string;
  private valFn = Validators.nullValidator;

  ngOnChanges(changes: SimpleChanges) : void {
    const change = changes['strongPassword'];
    if (change) {
      const val: string | RegExp = change.currentValue;
      const re = val instanceof RegExp ? val : new RegExp(val, 'i');
      this.valFn = strongPasswordValidator(re);
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  validate(control: AbstractControl) : { [key: string]: any } {
    return this.valFn(control);
  }
}
