import { Injectable }   from '@angular/core';
import { 
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
}  from '@angular/router';

/* Angular2 services */
import { AuthService } from '../../../auth/client/services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor (
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : boolean {
    let url: string = state.url;
    return this.checkLogin(url);
  }

  checkLogin(url: string) {
    if (this.authService.isLogged()) { 
      return true;
    }
    this.authService.redirect = url;
    this.router.navigate(['/signin']);
    return false;
  }
}
