/* testing tools
 */
import { async, ComponentFixture, TestBed }   from '@angular/core/testing';
import { By }                                 from '@angular/platform-browser';
import { DebugElement }                       from '@angular/core';

/* UUT */
import { AppComponent }                       from './app.component';

/* Dependencies */
import { AuthService }                        from '../../auth/client/auth.service.client';

describe('AppComponent', () => {
  let comp:     AppComponent;
  let fixture:  ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        AppComponent
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);

    comp = fixture.componentInstance;
  });

  it('should display the menu', () => {
    expect('implemented').toMatch('This test is clearly not implemented');
  });

  it('should provide an outlet for the main view', () => {
    expect('implemented').toMatch('This test is clearly not implemented');
  });
});
