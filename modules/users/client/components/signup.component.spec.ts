/* testing tools */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }                               from '@angular/platform-browser';
import { DebugElement }                     from '@angular/core';

/* Unit under test */
import { SignupComponent }                  from './signup.component.ts';

/* Dependencies */
//TODO
// AuthService
// Router

describe('SignupComponent', () => {
  let comp:     SignupComponent;
  let fixture:  ComponentFixture<SignupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SignupComponent
      ]
    });
  }));

  beforeEach(() => {

  });

  it('should have a username email password form', () => {
    expect('This should really be implemented').toMatch('but it doesnt');
  });

  it('should use the AuthService to register onSubmit', () => {
    expect('This should really be implemented').toMatch('but it doesnt');
  });

  it('should require a username, email, and password', () => {
    expect('This should really be implemented').toMatch('but it doesnt');
  });

  it('should present an error message for invalid input', () => {
    expect('This should really be implemented').toMatch('but it doesnt');
  });
});
