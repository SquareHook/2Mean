/* Vendor */
import { HttpModule, Http, BaseRequestOptions, Response, ResponseOptions, ResponseType } from '@angular/http';
import { async, inject, TestBed } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import * as sinon from 'sinon';
import * as chai from 'chai';
let should = chai.should();
chai.config.includeStack = true;

/* UUT */
import { AuthHttpService } from './auth-http.service';

describe('AuthHttpService', () => {
  let mockRouter: any;
  let mockNotificationsService: any;

  beforeEach(() => {
    mockRouter = {
      navigate: sinon.spy(),
      url: 'url'
    };

    mockNotificationsService = {
      alert: sinon.spy()
    };

    TestBed.configureTestingModule({
      providers: [
        MockBackend,
        BaseRequestOptions,
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService
        },
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

  });

  it('should catch 401 status code requests', async(inject(
    [ Http, MockBackend ],
    (http: Http, mockBackend: MockBackend) => {
      mockBackend.connections.subscribe((conn: MockConnection) => {
        let status = 401;
        let response = new Response(new ResponseOptions({
          url: 'api',
          type: ResponseType.Error,
          status: status
        }));

        conn.mockError(response as any as Error);
      });

      http.get('api').subscribe((data) => {
        
      }, (error) => {
        mockNotificationsService.alert.args.should.deep.equal([[ 'Unauthenticated', 'You need to log back in' ]]);
        mockRouter.navigate.args.should.deep.equal([[
          [ '/signin' ],
          {
            queryParams: {
              'redirect': mockRouter.url,
              'reauthenticate': true 
            } 
          } 
        ]]);
      });
    }
  )));

  it('should not catch other status code requests', async(inject(
    [ Http, MockBackend ],
    (http: Http, mockBackend: MockBackend) => {
      mockBackend.connections.subscribe((conn: MockConnection) => {
        let status = 200;

        conn.mockRespond(new Response(new ResponseOptions({
          status: status
        })));
      });

      http.get('api').subscribe((data) => {
        mockNotificationsService.alert.args.should.deep.equal([]);
        mockRouter.navigate.args.should.deep.equal([]);
      })
    }
  )));
});
