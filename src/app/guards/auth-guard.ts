import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const url = state.url;

    console.log('AuthGuard - URL:', url, 'Authentifié:', isAuthenticated);

    // Si l'utilisateur est authentifié
    if (isAuthenticated) {
      // Si on essaie d'accéder à /login alors qu'on est déjà connecté
      if (url === '/login' || url === '/') {
        const role = this.authService.getUserRole();
        if (role === 'admin' || role === 'superadmin') {
  this.router.navigate(['/admin']);
} else if (role === 'formateur') {
  this.router.navigate(['/formateur']);
} else if (role === 'apprenant') {
  this.router.navigate(['/apprenant']);
} else {
  this.router.navigate(['/dashboard']);
}

        return false;
      }
      // Autoriser l'accès aux autres routes
      return true;
    }

    // Si l'utilisateur n'est pas authentifié
    // Autoriser l'accès aux pages publiques (login, forgot-password, etc.)
    const publicRoutes = ['/login', '/forgot-password', '/contact'];
    if (publicRoutes.some(route => url.startsWith(route)) || url === '/') {
      return true;
    }

    // Rediriger vers login pour les routes protégées
    console.log('Accès refusé, redirection vers /login');
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: url } 
    });
    return false;
  }

  private redirectToDashboard(role: string): void {
    switch(role) {
      case 'superadmin':
        this.router.navigate(['/superadmin']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'formateur':
        this.router.navigate(['/formateur']);
        break;
      case 'apprenant':
        this.router.navigate(['/apprenant']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }
}