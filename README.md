# TooMean
### Too Mean fo Life

An angular2 MEAN stack. Using webpack

## Install
Make sure you are using node ~7 to install.

To install clone the repo and npm install it. 

```bash
$ git clone <repo addr>
$ npm install
```

The first time installed, the package will generate a self signed
cert for TLS. If you want to generate a new one you can use
```bash npm run gen-cert```

## Running
To run use npm start. Wow that too is simple.

```bash
$ npm start
```

This command will run webpack and the server concurrently. Webpack will
watch for changes and compile typescript when a change is detected.

## Configure

### App Name
set `TOOMEAN_APP_NAME` to define a name for the app in logs.

### Registration
Don't want people to be able to register? Don't worry bro we won't judge, just
set `TOOMEAN_APP_ALLOW_REGISTRATION` to `false`

### Hostname
If you are developing locally then you should be fine without this step.
Otherwise you must set the `TOOMEAN_APP_HOST` environment variable to the
hostname you use in your browser. Otherwise you will be unable to authenticate
users.

### Mongo
Mongo can be configured with several environment variables. By default 2Mean
will attempt to connect to a local mongo on port 27017 using 2Mean_development.
These variables can be set to change this behavior:

- `TOOMEAN_MONGO_HOST`, `TOOMEAN_MONGO_PORT`, and `TOOMEAN_MONGO_DB` can be
  set to modify the default config.
- `TOOMEAN_MONGO_CONNECTION_STRING` can be set to a full connection string.
  this configuration is useful when connecting to a replica set or if the other
  options are restrictive.

### AWS Access Keys
To use aws-s3 file upload functionality, a valid access key must be installed
on your local system at (by default):

- Mac/Linux: ~/.aws/credentials
- Windows: C:\\Users\\USERNAME\\.aws\\config

This file should contain your AWS Access key ID and secret, like so:

```
[default]
aws_access_key_id = <id>
aws_secret_accessKey = <key>
```

To enable s3 file storage you must edit your config/config.js in the following
ways:

- the `use` field must be set to `s3` for each upload type
- the `bucket` field in the `s3` object must be set
- the `dest` field in the `s3` object must be set

These can be hardcoded (don't do that) or set using environment variables.
Access keys can also be passed in as environment variables.
For more information or to use different configuration refer to 
[Configuring the AWS Command Line Interface] (http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

### Elasticsearch Logging
To enable elasticsearch logging you must define the following environment
variables:

- `TOOMEAN_ES_HOST`
- `TOOMEAN_ES_PORT`

Optionally you can also enable the following environment variables:

- `TOOMEAN_ES_APIVERSION`
- `TOOMEAN_ES_CONSISTENCY`
- `TOOMEAN_LOG_LEVEL`

To enable aws es service integration (signed requests) in addition to the above
set:

- `TOOMEAN_ES_AWS` to `true`
- `AWS_ACCESS_KEY_ID` (see s3 section)
- `AWS_SECRET_KEY`

# Too Mean

## Static Assets
To include static assets (like images) in an Angular 2 component, you can
do the following:

```
@Component({
  template: '<img [src]="imageSource">'
})
export SomeComponent {
  let imageSource = require('<image path>');
}
```

Webpack will replace the required image with its path in the `dist` directory.

## Shared Module Components
There are several components in the shared module that can be used for common
functionality. To be used, the shared module must be in the imports list of
the module that will use them.

### Spinner
To use, use the `spinner` selector. Be sure to bind the `srMessage` property
to set a message to be presented to screen readers. Below is an example usage:

```
@Component({
  template: '<spinner *ngIf="loading" [srMessage]="'loading resource'"></spinner>
})
export class SampleComponent {
  loading: boolean;

  constructor() {
    this.loading = true;
    service.loadResource().subscribe(
      (data) => { /* use resource */ },
      (error) => {},
      () => { this.loading = false; });
  }
}
```
### File Uploader
:warning: This feature is in development. It might break :warning:

To use the included file uploader (built around 
[ng2-file-upload](http://valor-software.com/ng2-file-upload/), 
the `file-upload` and `image-file-upload` selectors can be used. Examples can
be seen in the Users module `change-profile-picture` component. On the backend,
the shared module exposes `uploader.upload`. This function can be used
to store uploaded files to either the local file system or S3. It expects
a config object. See the profile picture upload controller for how to use
it. 

#### Sample configs:

```
{
  strategy: 'local',
  oldFileURL: '/api/blah/file.png',
  local: {
    dest: './uploads/blah/',
    limits: {
      maxSize: 1024
    }
  }
}
```

```
{
  strategy: 's3',
  oldFileURL: 'https://s3-us-west-2..../file.png',
  s3: {
    dest: 'https://...',
    limits: {
      maxSize: 1024
    },
    acl: 'public-read',
    bucket: 'bucket_name'
  }
}
```

There is also a file drop component that can be used similarly to the
file select. This component is demoed on the edit user page.

### Email
If you are going to send email for any reason, it is recommended that you
verify users email. This can be done by setting `TOOMEAN_APP_EMAIL_VERIFICATION_REQUIRED=true`.
This will prevent users with un verified emails from accessing secure endpoints.
Additionally it will try to send a verification email when the user registers
and enable password reset emails. This requires an email provider to be
configured:

Set the `TOOMEAN_EMAIL_PROVIDER` environment variable to one of the following

#### `ses`
Use the aws-ses service. Set `TOOMEAN_AWS_SES_ENABLED=true` and
`TOOMEAN_AWS_SES_FROM=<from email>`. The from email must be verified in SES.

#### `sendmail`
TODO

## Add Menu item:
inside of app-client/module-name/config create a file called menu.json 
below is an example menu object for the articles module
```
[{
  "template": "Articles",
  "state": "/articles",
  "position": 2,
  "roles": [],
  "subitems": [
  {
    "template": "New",
    "state": "/articles/new",
    "roles": ["user"]
  },
  {
    "template": "List",
    "state": "/articles",
    "roles": ["user"]
  }]
}]

```
* template is the name of the menu item
* state is the routerLink
* roles is an array of user roles who the menu item will render for
* subitems will appear in a dropdown below the main menu item

## Role Manager
Admin users can configure roles in a tree structure to simplify
granting permissions to certain resources. For example, creating a
role called 'roleA' with parent 'user' would mean that the user role
has access to everything roleA can access as well. 

Users have one main role and an array of subroles depending on their
main role's position in the role tree. 

TODO: continue documentation once endpoints are dynamic and we have a 
UI for managing what roles a user is in.
