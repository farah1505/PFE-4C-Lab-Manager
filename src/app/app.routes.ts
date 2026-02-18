import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Page d'accueil - redirige vers login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  // Page de connexion - accessible sans authentification
  {
    path: 'login',
    component: Login,
    data: { title: 'Connexion - 4C Lab Manager' },
  },

  // Routes publiques
  {
    path: 'forgot-password',
    // component: ForgotPasswordComponent, // À créer
    redirectTo: '/login', // Temporaire
    pathMatch: 'full',
  },
  {
    path: 'reset-password/:token',
    // component: ResetPasswordComponent, // À créer
    redirectTo: '/login', // Temporaire
    pathMatch: 'full',
  },
  {
    path: 'contact',
    // component: ContactComponent, // À créer
    redirectTo: '/login', // Temporaire
    pathMatch: 'full',
  },

  // Routes protégées - nécessitent authentification
  {
    path: 'dashboard',
    // component: DashboardComponent, // À créer
    canActivate: [AuthGuard],
    redirectTo: '/login', // Temporaire
    pathMatch: 'full',
  },

  // Routes pour Super Admin
  {
    path: 'superadmin',
    // component: SuperAdminDashboardComponent, // À créer
    canActivate: [AuthGuard],
    redirectTo: '/login', // Temporaire
    pathMatch: 'full',
  },

  // Routes pour Admin
  {
    path: 'admin',
    // component: AdminDashboardComponent, // À créer
    canActivate: [AuthGuard],
    redirectTo: '/login', // Temporaire
    pathMatch: 'full',
  },

  // Routes pour Formateur
  {
    path: 'formateur',
    // component: FormateurDashboardComponent, // À créer
    canActivate: [AuthGuard],
    redirectTo: '/login', // Temporaire
    pathMatch: 'full',
  },

  // Routes pour Apprenant
  {
    path: 'apprenant',
    // component: ApprenantDashboardComponent, // À créer
    canActivate: [AuthGuard],
    redirectTo: '/login', // Temporaire
    pathMatch: 'full',
  },

  // Page d'erreur 403
  {
    path: 'forbidden',
    // component: ForbiddenComponent, // À créer
    redirectTo: '/login', // Temporaire
    pathMatch: 'full',
  },

  // Wildcard route - doit être en dernier
  {
    path: '**',
    redirectTo: '/login',
  },
];