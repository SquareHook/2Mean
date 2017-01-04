/* testing tools */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }                               from '@angular/platform-browser';
import { DebugElement }                     from '@angular/core';

/* Unit under test */
import { SigninComponent }                  from './signin.component.ts';

/* Dependencies */
//TODO
// AutherService
// Router

describe('SigninComponent', () => {
  let comp:     SigninComponent;
  let fixture:  ComponentFixture<SigninComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SigninComponent
      ]
    });
  }));

  beforeEach(() => {

  });

  it('should have a username password form', () => {
    expect('This should really be implemented').toMatch('but it doesnt');
  });

  it('should use the AuthService to login onSubmit', () => {
    expect('This should really be implemented').toMatch('but it doesnt');
  });

  it('should require a username and a password', () => {
    expect('This should really be implemented').toMatch('but it doesnt');
  });

  it('should present an error message for unknown user/password', () => {
    expect('This should really be implemented').toMatch('but it doesnt');
  });
});
