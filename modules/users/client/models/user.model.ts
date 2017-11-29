export class User {
  _id: string = null;
  firstName: string = null;
  lastName: string = null;
  displayName: string = null;
  email: string = null;
  username: string = null;
  password: string = null;
  profileImageURL: string = null;
  subroles: Array<string> = null;
  role:string = null;
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

      if (blob.subroles) {
        this.subroles = blob.subroles;
      }

      if (blob.role) {
        this.role = blob.role;
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
