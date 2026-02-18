import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.component.scss'],
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si déjà connecté, rediriger vers le dashboard approprié
    if (this.authService.isAuthenticated()) {
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

      return;
    }
    
    this.initializeForm();
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      role: ['apprenant', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { role, email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password, role, rememberMe).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success && response.token) {
          this.authService.saveToken(response.token, rememberMe);
          
          // Sauvegarder les infos utilisateur
          if (response.user) {
            this.authService.saveUserInfo(response.user);
          }

          this.successMessage = `Connexion réussie! Bienvenue ${response.user?.email || ''}`;
          
          console.log('✅ Connexion réussie, redirection...');
          
          // Rediriger après un court délai
          setTimeout(() => {
            this.navigateByRole(response.user?.role || role);
          }, 1000);
        } else {
          this.errorMessage = 'Erreur de connexion. Réponse invalide du serveur.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erreur de connexion:', error);
        
        this.errorMessage = 
          error?.error?.message || 
          'Erreur de connexion. Veuillez vérifier vos identifiants.';
      },
    });
  }

  private navigateByRole(role: string): void {
    console.log('Navigation vers le dashboard pour le rôle:', role);
    
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
        // Par défaut, rediriger vers le dashboard général
        this.router.navigate(['/dashboard']);
        break;
    }
  }
}