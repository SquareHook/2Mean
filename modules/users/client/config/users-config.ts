import { OpaqueToken } from '@angular/core';

export interface UsersConfig {
	uploads : { 
    profilePicture: {
      url: string,
      maxSize: number,
      allowedTypes: Array<string>
    }
  },
  passwordValidatorRe: RegExp,
}

export const USERS_DI_CONFIG: UsersConfig = {
	uploads: {
		profilePicture: {
      url: '/api/users/picture',
      maxSize: 1024 * 1024 * 8,
      allowedTypes: ['image/png', 'image/gif', 'image/jpeg', 'image/svg+xml']
    }
	},
  passwordValidatorRe: /((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$-/:-?{-~~"^_`\]\[])(?=.{8,}))/,
};

export let USERS_CONFIG = new OpaqueToken('users.config');
