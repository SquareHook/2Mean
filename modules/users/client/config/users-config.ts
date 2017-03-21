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
  emailValidatorRe: RegExp
}

export const USERS_DI_CONFIG: UsersConfig = {
	uploads: {
		profilePicture: {
      url: '/api/users/picture',
      // 1 MB should be large enough
      maxSize: 1024 * 1024, // Bytes
      // generally accepted browser renderable image formats
      allowedTypes: ['image/png', 'image/gif', 'image/jpeg', 'image/svg+xml']
    }
	},
  // match at least one UPPER, lower, digit, symbol, and length must be >= 8
  // ?= is a lookahead
  passwordValidatorRe: /((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!-/:-@{-~~"^_`\\\]\[])(?=.{8,}))/,
  // TODO either write a full regex for emails (RFC3696 would help) or
  // implement confirmation email sender
  emailValidatorRe: /.+@.+/
};

export let USERS_CONFIG = new OpaqueToken('users.config');
