# 4C Lab Manager - Documentation Authentification

## Vue d'ensemble

Le système d'authentification du **4C Lab Manager** supporte quatre rôles utilisateur distincts, chacun avec des droits d'accès spécifiques:

- **Apprenant** (Learner)
- **Formateur** (Trainer/Educator)
- **Administrateur** (Administrator)
- **Super Administrateur** (Super Administrator)

## Structure de l'Authentification

### 1. Service d'Authentification (`auth.ts`)

Le service `AuthService` gère tous les aspects de l'authentification:

```typescript
// Connexion
authService.login(email, password, role, rememberMe)

// Vérification de l'authentification
authService.isAuthenticated()

// Récupération de l'utilisateur actuel
authService.getCurrentUser()

// Vérification du rôle
authService.hasRole('admin')
authService.hasAnyRole(['admin', 'superadmin'])

// Déconnexion
authService.logout()

// Gestion du mot de passe
authService.requestPasswordReset(email)
authService.resetPassword(token, newPassword)

// Inscription
authService.register(email, password, name, role)
```

### 2. Composant Login (`login/`)

Le composant de connexion fournit une interface utilisateur moderne et réactive avec:

- 🎯 **Sélection de rôle** - Dropdown pour choisir le rôle utilisateur
- 📧 **Email/Username** - Champ d'entrée validé
- 🔒 **Mot de passe** - Avec bouton show/hide
- ☑️ **Se souvenir de moi** - Stockage persistant du token (localStorage)
- 📱 **Design responsive** - Optimisé pour mobile, tablette et desktop
- ✨ **Animations fluides** - Transitions et feedback utilisateur

#### Validation

- Role: Obligatoire
- Email: Obligatoire, minimum 3 caractères
- Password: Obligatoire, minimum 6 caractères

### 3. Intercepteur HTTP (`auth-interceptor.ts`)

L'intercepteur gère automatiquement:

- ✅ Ajout du token JWT aux requêtes authentifiées
- ❌ Gestion des erreurs 401 (Unauthorized) - Redirection vers login
- 🚫 Gestion des erreurs 403 (Forbidden) - Redirection vers forbidden

### 4. Guards de Route (`auth-guard.ts`)

Deux guards protègent les routes:

#### `authGuard`
- Vérifie que l'utilisateur est authentifié
- Valide les rôles requis pour accéder à une route
- Redirige vers login si non authentifié
- Support des `returnUrl` pour redirection après connexion

#### `noAuthGuard`
- Empêche les utilisateurs authentifiés d'accéder à la page login
- Redirige vers le dashboard si déjà connecté

## Configuration des Routes

### Sans protection
```typescript
{
  path: 'login',
  component: Login,
  canActivate: [noAuthGuard]
}
```

### Protégées - Tous les utilisateurs authentifiés
```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  // ... route children
}
```

### Protégées - Rôles spécifiques
```typescript
{
  path: 'admin',
  canActivate: [authGuard],
  data: { roles: ['admin', 'superadmin'] }
}
```

## Flux d'authentification

### 1. Connexion
```
Utilisateur → Page Login → Service Auth → API Backend
                                             ↓
                                     Validation credentials
                                             ↓
                                  JWT Token + User Data
                                             ↓
         Storage (localStorage/sessionStorage)
                                             ↓
                          Navigation basée sur le rôle
```

### 2. Requêtes sécurisées
```
Requête HTTP → Interceptor ajoute JWT → Backend valide
                                            ↓
                                     Réponse/Erreur
                                            ↓
                        Gestion 401/403 si nécessaire
```

### 3. Stockage des données

#### Avec "Se souvenir de moi" ✓
- **localStorage** - Persiste après fermeture du navigateur
- Durée de vie: Jusqu'à suppression manuelle

#### Sans "Se souvenir de moi"
- **sessionStorage** - Supprimé à la fermeture du navigateur
- Durée de vie: Durée de la session

## Utilisateurs de test (À adapter avec votre backend)

```javascript
// Apprenant
email: apprenant@example.com
password: Password123
role: apprenant

// Formateur
email: formateur@example.com
password: Password123
role: formateur

// Admin
email: admin@example.com
password: Password123
role: admin

// Super Admin
email: superadmin@example.com
password: Password123
role: superadmin
```

## API Backend Requise

### POST `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "admin",
    "name": "Admin User"
  },
  "message": "Connexion réussie"
}
```

**Response (401):**
```json
{
  "message": "Email ou mot de passe invalide"
}
```

### POST `/api/auth/register`

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "apprenant"
}
```

**Response:** Même format que login

### POST `/api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Email de réinitialisation envoyé"
}
```

### POST `/api/auth/reset-password`

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

## Points d'extension - TODO

Pages à créer:
- ✅ Login
- ⏳ Dashboard (rôles spécifiques)
- ⏳ Signup/Register
- ⏳ Forgot Password
- ⏳ Reset Password
- ⏳ Forbidden (403 page)
- ⏳ Contact

## Sécurité - Bonnes pratiques

✅ **Implémenté:**
- JWT tokens dans les headers Authorization
- Validation côté client des formulaires
- Gestion des erreurs 401/403
- Stockage sécurisé des tokens (localStorage/sessionStorage)
- Separation des données sensibles

⏳ **À implémenter côté Backend:**
- Hachage des mots de passe (bcrypt/argon2)
- Validation JWT stricte
- HTTPS obligatoire
- CORS configuré
- Rate limiting
- Refresh tokens (JWT long-lived)
- Logs d'authentification

## Debugging

### Vérifier le token actuel
```typescript
// Dans la console
const token = localStorage.getItem('4c-lab-token') || sessionStorage.getItem('4c-lab-token');
console.log(token);
```

### Vérifier l'utilisateur actuel
```typescript
// Dans un composant
constructor(private auth: AuthService) {}
ngOnInit() {
  console.log(this.auth.getCurrentUser());
}
```

### Vérifier les états d'authentification
```typescript
console.log(this.auth.isAuthenticated());
console.log(this.auth.hasRole('admin'));
```

## Changements récents

### Version actuelle
- ✨ Interface login moderne avec gradient
- 🎨 Design responsive et optimisé
- 🔐 Gestion complète des rôles
- 📱 Support mobile complet
- ⌨️ Validation reactive forms
- 🎯 Navigation basée sur les rôles
- 💾 Support "Se souvenir de moi"

## Support

Pour les problèmes d'authentification, vérifiez:

1. L'URL de l'API backend (voir `auth.ts` - `apiUrl`)
2. Les en-têtes CORS sur le backend
3. La structure de la réponse de l'API
4. Les tokens dans les storage (localStorage/sessionStorage)
5. Les routes et guards configurés correctement

---

**Dernière mise à jour:** 7 Février 2026
