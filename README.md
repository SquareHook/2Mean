# TooMean
### Too Mean fo Life

An angular2 MEAN stack. Using webpack

## Install
To install clone the repo and npm install it. Wow that is simple.

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

# AWS Access Keys

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

# Too Mean


## Add Menu item:
inside of app-client/module-name/config create a file called menu.json 
//TODO: ADD FORMATTING OPTIONS
