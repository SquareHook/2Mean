import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';

describe('App', function () {
  beforeEach(function () {
    TestBed.configureTestingModule({ declarations: [ AppComponent ] });
  });

  it('should work', function () {
    let fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance instanceof AppComponent).toBe(true, 'should create AppComponent');
  });
});
