export class User {
  _id: string = null;
  firstName: string = null;
  lastName: string = null;
  displayName: string = null;
  email: string = null;
  username: string = null;
  password: string = null;
  profileImageURL: string = null;
  cachedRoles: Array<string> = null;
  roles:Array<string> = null;
  updated: string = null;
  verified: boolean;

  constructor();
  constructor(blob: any);
  constructor(blob?: any) {
    if (blob) {
      if (blob._id) {
        this._id = blob._id;
      }

      if (blob.firstName) {
        this.firstName = blob.firstName;
      }

      if (blob.lastName) {
        this.lastName = blob.lastName;
      }

      if (blob.displayName) {
        this.displayName = blob.displayName;
      }

      if (blob.email) {
        this.email = blob.email;
      }

      if (blob.password) {
        this.password = blob.password;
      }

      if (blob.profileImageURL) {
        this.profileImageURL = blob.profileImageURL;
      }

      if (blob.cachedRoles) {
        this.cachedRoles = blob.cachedRoles;
      }

      if (blob.roles) {
        this.roles = blob.roles;
      }

      if (blob.updated) {
        this.updated = blob.updated;
      }

      if (blob.username) {
        this.username = blob.username;
      }

      if (blob.verified) {
        this.verified = blob.verified;
      }
    }
  }

  compareToUser = (user: User) : boolean => {
    return this._id === user._id;
  }
}
