/* Vendor */
import { HttpModule, Http, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { async, inject, TestBed } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import * as chai from 'chai';
import * as sinon from 'sinon';
let should = chai.should();
chai.config.includeStack = true;

/* UUT */
import { AuthHttpService } from './auth-http.service';

describe('AuthHttpService', () => {
  let routerNavigateStub: any, notificationsServiceStub: any;

  beforeEach(() => {
    routerNavigateStub = sinon.stub(ro
    TestBed.configureTestingModule({
      providers: [
        MockBackend,
        BaseRequestOptions,
        Router,
        NotificationsService,
        {
          provide: Http, 
          useFactory: (
            backend: MockBackend,
            options: BaseRequestOptions,
            router: Router,
            notificationsService: NotificationsService
          ) => new AuthHttpService(backend, options, router, notificationsService),
          deps: [ MockBackend, BaseRequestOptions, Router, NotificationsService ]
        }
      ],
      imports: [
        HttpModule
      ]
    });
  });

  afterEach(() => {
    routerNavigateStub.restore();
    notificationsServiceStub.restore();
  });

  it('should catch unauthenticated status codes', async(inject(
    [ Http, MockBackend ],
    (http: Http, mockBackend: MockBackend) => {
      mockBackend.connections.subscribe((conn: MockConnection) => {
        let body = 'Not Authorized'
        let status = 401;

        conn.mockRespond(new Response(new ResponseOptions({
          body: body,
          status: status
        })));
      });

      http.get('api').subscribe((data) => {
        console.log(JSON.stringify(data, null, 2));
      }, (error) => {
        console.log(error);
      });
    }
  )));
});
