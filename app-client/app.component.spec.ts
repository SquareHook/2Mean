/* testing tools
 */
import { async, ComponentFixture, TestBed }   from '@angular/core/testing';
import { By }                                 from '@angular/platform-browser';
import { DebugElement }                       from '@angular/core';

/* UUT */
import { AppComponent }                       from './app.component';

/* Dependencies */
import { AuthService }                        from './auth/auth.service.client';


describe('AppComponent', () => {
  let comp:     AppComponent;
  let fixture:  ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    authServiceStub = {
    };

    TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      providers:    [ { provide: AuthService, useValue: authServiceStub } ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);

    comp = fixture.componentInstance;

    authService = TestBed.get(AuthService);
  });

  it('should display the menu', () => {
    expect('implemented').toMatch('This test is clearly not implemented');
  });

  it('should provide an outlet for the main view', () => {
    expect('implemented').toMatch('This test is clearly not implemented');
  });
});
