/* Vendor */
import { 
  BaseRequestOptions, 
  Http, 
  HttpModule, 
  Response, 
  ResponseOptions 
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { async, inject, TestBed } from '@angular/core/testing';

/* Dependencies */
import { User } from '../models/user.model.client';

/* Unit under test */
import { UserService} from './user.service';

describe('UserService', () => {
  // shared mockUser used by most tests
  // TODO 
  const mockUser : User = {
    displayName: 'Squarehook',
    email: 'support@squarehook.com',
    firstName: 'Admin',
    _id: '5866b8c0f5b5613933d30a21',
    lastName: 'User',
    password: 'null',
    profileImageURL: 'modules/users/client/img/profile/default.png',
    role: 'admin',
    subroles: [ 'admin', 'user' ],
    username: 'squarehook'
  };

  // TODO invalid data?
  const mockInvalidUser : User = {
    displayName: 'Squarehook',
    email: 'support@squarehook.com',
    firstName: 'Admin',
    _id: '5866b8c0f5b5613933d30a21',
    lastName: 'User',
    password: 'null',
    profileImageURL: 'modules/users/client/img/profile/default.png',
    role: 'admin',
    subroles: [ 'admin', 'user' ],
    username: 'squarehook'
  };

  // Must set up testing environment
  // main task is using the MockBackend in place of default Http
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
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
    [ UserService, MockBackend], 
    (userService : UserService, mockBackend : MockBackend) => {
      expect(userService).toBeDefined();
    }
  )));

  // Test CRUD methods
  describe('#create', () => {
    it('should create a user and get that user back', async(inject(
      [ MockBackend, UserService ], 
      (mockBackend : MockBackend, userService : UserService) => {
        expect('not').toEqual('implemented');
      }
    )));

    it('should not create an invalid user', async(inject(
      [ MockBackend, UserService ], 
      (mockBackend : MockBackend, userService : UserService) => {
        expect('not').toEqual('implemented');
      }
    )));
  });

  describe('#read', () => {

    it('should get a user', async(inject(
      [ MockBackend, UserService ], 
      (mockBackend : MockBackend, userService : UserService) => {
        mockBackend.connections.subscribe((conn : MockConnection) => {
          conn.mockRespond(new Response(new ResponseOptions(
            { body: { data: JSON.stringify(mockUser) } }
          )));
        });

        userService.read('5866b8c0f5b5613933d30a21').subscribe((user: User) => {
          expect(user).toEqual(mockUser);
        });
      }
    )));

    it('should fail to get a user that doesnt exist', async(inject(
      [ MockBackend, UserService ], 
      (mockBackend: MockBackend, userService : UserService) => {
        const correct = "Not sure";

        mockBackend.connections.subscribe((conn: MockConnection) => {
          conn.mockRespond(new Response(new ResponseOptions(
            { body: { data: 'not sure what this is supposed to be yet. Need to check api' } }
          )));
        });

        userService.read('a').subscribe((user: User) => {
          expect(user).toEqual(correct);
        });
    })));
  });

  describe('#update', () => {
    it('should update a user and get that user back', async(inject(
      [ MockBackend, UserService ], 
      (mockBackend : MockBackend, userService : UserService) => {
        expect('not').toEqual('implemented');
      }
    )));

    it('should not update a user with invalid info', async(inject(
      [ MockBackend, UserService ], 
      (mockBackend : MockBackend, userService : UserService) => {
        expect('not').toEqual('implemented');
      }
    )));
  });

  describe('#delete', () => {
    it('should delete a user and get that user back', async(inject(
      [ MockBackend, UserService ], 
      (mockBackend : MockBackend, userService : UserService) => {
        expect('not').toEqual('implemented');
      }
    )));

    it('should not delete a user which doesnt exist', async(inject(
      [ MockBackend, UserService ], 
      (mockBackend : MockBackend, userService : UserService) => {
        expect('not').toEqual('implemented');
      }
    )));
  });
});
