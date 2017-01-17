/* Vendor */
import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  Validator,
  ValidatorFn,
  Validators
} from '@angular/forms';

/* factory for validator function
 * @param {string[]} allowedTypes - mime types that are to be accepted
 * @returns {VaidatorFn}
 */
export function allowedTypesValidator(allowedTypes: Array<string>) : ValidatorFn {
  /*
   * validator function generator
   * @param {AbstractControl} control - the HTML input element being validated
   * @returns a function which returns an object with key value pairs
   *
   * example return object:
   *  { 'allowedTypes': 'text/xml' }
   */
  return (control: AbstractControl) : {[key: string]: any} => {
    let val = control.value;
    return allowedTypes.includes(val) ? null : { 'allowedTypes': {val} };
  };
}

/*
 * allowedType directive
 * used to validate file input types
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
  selector: '[allowedType]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: AllowedTypesValidatorDirective,
      multi: true
    }
  ]
})
export class AllowedTypesValidatorDirective implements Validator, OnChanges {
  @Input() strongPassword: string;
  private valFn = Validators.nullValidator;

  /*
   * changes to allowed types triggers a change of validator function
   */
  ngOnChanges(changes: SimpleChanges) : void {
    const change = changes['allowedType'];
    if (change) {
      const val: Array<string> = change.currentValue;
      this.valFn = allowedTypesValidator(val);
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
