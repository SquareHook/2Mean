/* testing tools
 */
import { async, ComponentFixture, TestBed }   from '@angular/core/testing';
import { By }                                 from '@angular/platform-browser';
import { DebugElement }                       from '@angular/core';
import { RouterTestingModule }                from '@angular/router/testing';

/* UUT */
import { AppComponent }                       from './app.component';

/* Dependencies */
import { AuthService }                        from '../../auth/client/auth.service.client';
import { CoreModule }                         from '../../core/client/core.module';
import { AppRoutingModule }                   from './app-routing.module';
import { UserService }                        from '../../users/client/services/user.service';

describe('AppComponent', () => {
  let comp:     AppComponent;
  let fixture:  ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppRoutingModule,
        CoreModule,
        RouterTestingModule
      ],
      declarations: [ 
        AppComponent
      ],
      providers: [
        UserService,
        AuthService
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
