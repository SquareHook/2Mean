/* Vendor */
import { 
  Component,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { BrowserModule }          from '@angular/platform-browser';
import { Router }                 from '@angular/router';
import { 
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';

/* Config */
import { 
  USERS_CONFIG, 
  USERS_DI_CONFIG, 
  UsersConfig 
} from '../config/users-config';

/* Angular2 Models */
import { User }                   from '../models/user.model';

/* Angular2 Services */
import { AuthService }            from '../../../auth/client/services/auth.service';
import { UserService }            from '../services/user.service';

/* Angular2 Directives */
import { maxSizeValidator }       from '../directives/max-size.directive';
import { allowedTypesValidator }  from '../directives/allowed-types.directive';
import { emailValidator }         from '../directives/valid-email.directive';

import { ImageFileDropComponent } from '../../../shared/client/components/image-file-drop.component';

@Component({
  templateUrl: './../views/edit-profile.view.html'
})
export class EditProfileComponent implements OnInit {
  // TODO prune some of these propoerties that are not needed
  errorMessage: string;
  user: User;
  loading = false;
  sizeGood: boolean;
  typeGood: boolean;
  userForm: FormGroup;
  profilePicture: any;
  fileType: string;
  fileSize: number;
  // this is a bit of a hack because file inputs are not updated like
  // other inputs
  // formValid is used to control the button disabled attribute
  formValid: boolean;

  endpoint: string;

  private allowedTypes: Array<string>;
  private maxSize: number;
  private formErrors: any;
  private validationMessages: any;
  private emailRe: RegExp;

  @ViewChild(ImageFileDropComponent)
  private imageFileDropComponent: ImageFileDropComponent;

  constructor (
    private authService: AuthService,
    private userService: UserService,
    @Inject(USERS_CONFIG) config : UsersConfig,
    private fb: FormBuilder
  ) {
      this.user = authService.user;
      this.formValid = false;

      // get config for validation
      this.allowedTypes = config.uploads.profilePicture.allowedTypes;
      this.maxSize = config.uploads.profilePicture.maxSize;
      this.emailRe = config.emailValidatorRe;

      this.endpoint = config.uploads.profilePicture.url;
  }

  /**
   * initialize component
   */
  ngOnInit() : void {
    this.buildForm();

    //initialize error messages
    this.formErrors = {
      'firstName': '',
      'lastName': '',
      'email': '',
      'profilePictureSize': '',
      'profilePictureType': ''
    };

    this.validationMessages = {
      'firstName': {

      },
      'lastName': {

      },
      'email': {
        'validEmail': 'That is not a valid email',
        'required': 'Email is required'
      },
      //TODO KB/MB
      'profilePictureSize': {
        'maxSize': 'Max picture size is ' + this.maxSize + 'B',
      },
      'profilePictureType': {
        'allowedTypes': 'Picture must one of the following types ' + this.allowedTypes
      }
    };
  }


  /*
   * called on button click. user userservice to update the model
   *  uses service to send a request to update the user then sends a request
   *  to update the profile picture if that request succeeds and updates
   *  the user to update the view
   */
  submit () : void {
    this.loading = true;
    
    this.userService.update(this.user).subscribe((user) => {
      this.authService.setUser(user);
      this.imageFileDropComponent.uploadFile();
    }, error => {
      this.errorMessage = error._body;
      this.loading = false;
    });
  }

  /*
   * called in initialization process
   *  builds the form group and binds the inputs to component properties
   *  subscribes to changes and does a first pass on validation
   */
  buildForm(): void {
    // build form group. the hidden inputs are bound to the validators
    this.userForm = this.fb.group({
      'firstName': [ this.user.firstName, [ ] ],
      'lastName': [ this.user.lastName, [ ] ],
      'email': [ this.user.email, [
          Validators.required,
          emailValidator(this.emailRe)
        ]
      ],
      'profilePicture': [ this.profilePicture, [ ] ],
      'profilePictureType': [ this.fileType, [
          allowedTypesValidator(this.allowedTypes)
        ]
      ],
      'profilePictureSize': [ this.fileSize, [
          maxSizeValidator(this.maxSize),
        ] 
      ]
    });

    // when the form is modified check if validation errors need to be
    // updated
    this.userForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    // first error messages may need to be generated
    this.onValueChanged();
  }

  /**
   * called when the form is modified
   *  updates validation error messages as needed
   *  pristine forms will not have errors
   */
  onValueChanged(data?: any) {
    // only continue if the form has been created (duh)
    if (!this.userForm) {
      return;
    }

    const form = this.userForm;

    // assume the form is valid
    this.formValid = true;

    for (const field in this.formErrors) {
      // clear previous errors
      this.formErrors[field] = '';
      const control = form.get(field);

      // only check form-controls which have error messages defined
      // (done in ngOnInit)
      if (control && control.dirty && !control.valid) {
        // if a non profilePicture field is invalid the form is invalid
        if (field !== 'profilePicture') {
          this.formValid = false;
        }

        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  /**
   * uriChange
   * @param {string} uri - new uri sent by file input
   */
  uriChange(uri: string) {
    let user = this.authService.getUser();
    user.profileImageURL = uri;
    this.authService.setUser(user);
  }
}

