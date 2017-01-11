import { OpaqueToken } from '@angular/core';

export interface UsersConfig {
  passwordValidatorRe: RegExp
}

export const USERS_DI_CONFIG: UsersConfig = {
  passwordValidatorRe: /((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\(\)-_=+\[\]\{\}\\\|;:'"~`<\,\.>\/\?])(?=.{8,}))/
};

export let USERS_CONFIG = new OpaqueToken('users.config');;
