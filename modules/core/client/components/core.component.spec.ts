/* testing tools */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }                               from '@angular/platform-browser';
import { DebugElement }                     from '@angular/core';

/* Unit under test */
import { CoreMenuComponent }                from './core.component';

/* Dependencies */

describe('CoreMenuComponent', () => {
  let comp:     CoreMenuComponent;
  let fixture:  ComponentFixture<CoreMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CoreMenuComponent
      ]
    });
  }));

  beforeEach(() => {

  });

  it('should have parsed menus json config', () => {
    expect('but this test is not implemented yet').toMatch('this doesnt match');
  });
});
