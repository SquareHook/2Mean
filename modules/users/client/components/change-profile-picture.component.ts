/* Vendor */
import { 
  Component,
  Inject,
  Input,
  OnInit 
} from '@angular/core';
import { BrowserModule }          from '@angular/platform-browser';
import { Router, NavigationExtras }                 from '@angular/router';
import { 
  FormGroup,
  FormBuilder,
  Validators 
} from '@angular/forms';
import { NotificationsService } from 'angular2-notifications';

/* Config */
import { 
  USERS_CONFIG,
  USERS_DI_CONFIG,
  UsersConfig 
} from '../config/users-config';

/* Angular2 Models */
import { User }                   from '../models/user.model.client';

/* Angular2 Services */
import { AuthService }            from '../../../auth/client/auth.service.client';
import { UserService }            from '../services/user.service';

/* Angular2 Directives */
import { maxSizeValidator }       from '../directives/max-size.directive';
import { allowedTypesValidator }  from '../directives/allowed-types.directive';

@Component({
  templateUrl: './../views/change-profile-picture.view.html'
})
export class ChangeProfilePictureComponent {
  @Input() user: User;
  userForm: FormGroup;  
  formValid: boolean;

  private formErrors: any;
  private validationMessages: any;
  private allowedTypes: Array<string>;
  private maxSize: number;
  private fileSize: number;
  private fileType: string;
  private profilePicture: any;

  constructor (
    private authService: AuthService,
    private userService: UserService,
    @Inject(USERS_CONFIG) config : UsersConfig,
    private fb: FormBuilder,
    private router: Router,
    private notificationsService: NotificationsService
  ) { 
    this.user = authService.user;
    this.formValid = false;

    // get config for validation
    this.allowedTypes = config.uploads.profilePicture.allowedTypes;
    this.maxSize = config.uploads.profilePicture.maxSize;
  }

  /**
   * initialize component
   */
  ngOnInit() : void {
    this.buildForm();

    //initialize error messages
    this.formErrors = {
      'profilePictureSize': '',
      'profilePictureType': ''
    };

    this.validationMessages = {
      'profilePictureSize': {
        'maxSize': 'Max picture size is ' + this.maxSize + 'B'
      },
      'profilePictureType': {
        'allowedTypes': 'Picture must be one of the following types ' + this.allowedTypes
      }
    };
  }

  /**
   * called on form submission
   *  uploads the file and on success changes the URL of the file locally
   *  to update the view
   */
  upload () {
    this.userService.uploadProfilePicture((item: any, response: any, status: number, headers: any) => {
      if (status === 200) {
        let userRes = JSON.parse(response);

        // update the local data
        this.authService.setUser(userRes);
        this.user.profileImageURL = userRes.profileImageURL;

        // clear the queue so next files will not accumulate
        this.userService.clearUploaderQueue();
        this.notificationsService.success('File uploaded', '');
      } else if (status === 401) {
        let navigationExtras: NavigationExtras = {
          queryParams: {
            'redirect': this.router.url,
            'reauthenticate': true
          }
        };
        
        this.notificationsService.alert('Unauthenticated', 'You need to log back in');
        this.router.navigate([ '/signin' ], navigationExtras);
      }
    });
  }

  /**
   * called when the file input changes
   *  can not rely on FormGroup change listener for file inputs because file
   *  inputs use event.target.file instead of event.target.value. (angular
   *  form control relies on value so would miss file changes normally)
   *
   *  when file is changed the hidden inputs are given values from the new
   *  file. These hidden value changes trigger the validators and update the
   *  validation messages
   *
   *  @params {any} fileInput: an event fired on change to the file input
   */
  fileChange(fileInput: any) {
    // only if there is a file selected
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];

      // these are bound to the form controls and must be updated to trigger
      // validation
      this.fileType = file.type;
      this.fileSize = file.size;

      // get the form controls
      let profilePictureSize = this.userForm.get('profilePictureSize');
      let profilePictureType = this.userForm.get('profilePictureType');

      // must be marked as dirty to display validation messages
      profilePictureSize.markAsDirty();
      profilePictureType.markAsDirty();

      // set the value to trigger the validation
      profilePictureSize.setValue(this.fileSize);
      profilePictureType.setValue(this.fileType);
    }
  }

  /**
   * called in initialization process
   *  builds the form group and binds the inputs to component properties
   *  subscribes to changes and does a first pass on validation
   *  (if the form is built with an existing invalid object then they will
   *  be displayed, otherwise by default a pristine form will not have 
   *  error messages)
   */
  buildForm() : void {
    // build form group. Then hidden inputs are bound to the validators
    this.userForm = this.fb.group({
      'profilePicture': [ this.profilePicture, [ ] ],
      'profilePictureType': [ this.fileType, [
          allowedTypesValidator(this.allowedTypes)
        ]
      ],
      'profilePictureSize': [ this.fileSize, [
          maxSizeValidator(this.maxSize)
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
   *  updates validation errors messages as needed
   *  pristine forms will not have errors 
   */
  onValueChanged(data?: any) {
    // only continue if the form has been created (duh)
    if(!this.userForm) {
      return;
    }

    const form = this.userForm;

    // assume form is valide
    this.formValid = true;

    // only check form-controls which have error messages defined
    // (done in ngOnInit)
    for (const field in this.formErrors) {
      // clear previous errors
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        // if a non profilePicture field is invalid the form is invalid
        if (field !== 'profilePicture') {
          this.formValid = false;
        }

        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          // concat errors together
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  /**
   * does what its named
   */
  getImageUrl() {
    return this.user.profileImageURL;
  }
}
