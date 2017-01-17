import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  Validator,
  ValidatorFn,
  Validators
} from '@angular/forms';

/* factory for validator function
 * @param {number} maxSize - maximum file size in bytes
 * @returns {VaidatorFn}
 */
export function maxSizeValidator(maxSize: number) : ValidatorFn {
  /*
   * validator function generator
   * @param {AbstractControl} control - the HTML input element being validated
   * @returns a function which returns an object with key value pairs
   *
   * example return object:
   *  { 'maxSize': '10000' }
   */
  return (control: AbstractControl) : {[key: string]: any} => {
    let val = control.value;
    return val <= Number(maxSize) ? null : { 'maxSize': {val} };
  };
}

/*
 * maxSize directive
 * used to validate file size
 * NOTE:
 *  file inputs do not update their value property like other inputs instead
 *  its file property is set on file change. Angular2 does not capture this
 *  event so the programmer will need to do this themselves.
 *  One way to get around this is to apply this directive to a hidden input 
 *  element which has its value set when the file input is changed.
 *  That change WILL trigger angular2's reactive form event listener
 * tl;dr
 *  files don't play nice, watch for events on the file input, update hidden
 *  elements to trigger angular2 validation
 */
@Directive({
  selector: '[maxSize]',
  providers: [
    {
      provide: NG_VALIDATORS, 
      useExisting: MaxSizeValidatorDirective, 
      multi: true 
    }
  ]
})
export class MaxSizeValidatorDirective implements Validator, OnChanges {
  @Input() maxSize: string;
  private valFn = Validators.nullValidator;

  /*
   * changes to allowed types triggers a change of validator function
   */
  ngOnChanges(changes: SimpleChanges) : void {
    const change = changes['maxSize'];
    if (change) {
      const val: number = change.currentValue;
      this.valFn = maxSizeValidator(val);
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  /*
   * called by angular2 reactive forms
   */
  validate(control: AbstractControl) : { [key: string]: any } {
    return this.valFn(control);
  }
}
