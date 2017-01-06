/* Vendor */
import { BaseRequestOptions, Http, HttpModule, Response, ResponseOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { async, inject, TestBed } from '@angular/core/testing';

/* Dependencies */
import { User } from '../../users/client/models/user.model.client';

/* Unit under test */
import { AuthService } from './auth.service.client';

describe('AuthService', () => {
  // Must set up testing environment
  // main task is using the MockBackend in place of default Http
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend : MockBackend, options : BaseRequestOptions) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        }
      ],
      imports: [
        HttpModule
      ]
    });
  });
  
  // Test service can be injected
  it('should construct', async(inject(
    [ AuthService, MockBackend], 
    (authService : AuthService, mockBackend : MockBackend) => {
      expect(authService).toBeDefined();
    }
  )));

  describe('#login', () => {
    // Form with two inputs
    interface signinFormInterface {
      password: string,
      username: string
    };
    
    const mockSigninFormData : signinFormInterface = {
      password: 'guest',
      username: 'user'
    };

    it('should process login requests', async(inject(
      [ MockBackend, AuthService ], 
      (mockBackend: MockBackend, authService: AuthService) => {
        // TODO find out what api sends and mock it
        const mockResponse = { data: 'idk yet' };
      
        mockBackend.connections.subscribe((conn : MockConnection) => {
          conn.mockRespond(new Response(new ResponseOptions(
            { body: { data: JSON.stringify(mockResponse) } }
          )));
        });

        authService.login(
          mockSigninFormData.username, 
          mockSigninFormData.password, 
          (err, user) => {
            // This call should succeed
            expect(err).toBe(null);
            expect(user).not.toBe(null);

            // Should get a user back
            expect(authService.getUser).toEqual(user);

            // Should be issued an apikey
            //TODO check cookie
            //expect(document.cookies).toContain('apikey');
          }
        );
      }
    )));

    it('should reject bad requests', async(inject(
      [ MockBackend, AuthService ], 
      (mockBackend: MockBackend, authService: AuthService) => {

        // TODO find out what api sends and mock it
        const mockResponse = { data: 'idk yet' };

        mockBackend.connections.subscribe((conn : MockConnection) => {
          conn.mockRespond(new Response(new ResponseOptions(
            { body: { data: JSON.stringify(mockResponse) } }
          )));
        });

        authService.login(
          mockSigninFormData.username, 
          mockSigninFormData.password, 
          (err, user) => {
            // This call should fail
            expect(err).not.toBe(null);
            expect(user).toBe(null);
          }
        );
      }
    )));
  });

  describe('#register', () => {
    // Form with three inputs
    interface signupFormInterface {
      email: string,
      password: string,
      username: string
    };

    const mockSignupFormData : signupFormInterface = {
      email: 'user@example.com',
      password: 'guest',
      username: 'user'
    };

    it('should create new users', async(inject(
      [ MockBackend, AuthService ], 
      (mockBackend: MockBackend, authService: AuthService) => {
        // TODO find out what api sends and mock it
        const mockResponse = { data: 'idk yet' };

        mockBackend.connections.subscribe((conn: MockConnection) => {
          conn.mockRespond(new Response(new ResponseOptions(
            { body: { data: JSON.stringify(mockResponse) } }
          )));
        });

        authService.register(
          mockSignupFormData.username, 
          mockSignupFormData.password, 
          mockSignupFormData.email,
          (err, user) => {
            // This call should succeed
            expect(err).toBe(null);
            expect(user).not.toBe(null);

            // User should have been returned
            expect(user).toEqual(authService.getUser());

            // Api key should be returned as cookie
            // TODO check in more robust way
            //expect(document.cookies).toContain('apikey');
          }
        );
        expect('not').toEqual('implemented');
      }
    )));

    it('should reject creating users which are invalid', async(inject(
      [ MockBackend, AuthService],
      (mockBackend: MockBackend, authService: AuthService) => {
        // TODO find out what the api send and mock it
        const mockResponse = { data: 'idk yet' };

        mockBackend.connections.subscribe((conn: MockConnection) => {
          conn.mockRespond(new Response(new ResponseOptions(
            { body: { data: JSON.stringify(mockResponse) } }
          )));
        });

        authService.register(
          mockSignupFormData.username,
          mockSignupFormData.password,
          mockSignupFormData.email,
          (err, user) => {
            // This call should fail
            expect(err).not.toBe(null);
            expect(user).toBe(null);
          }
        );
      }
    )));
  });
});
