import { Injectable } from '@angular/core';
import { AuthService, User } from './auth';

export interface Permission {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageFormations: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private permissionMap: {
    [key: string]: Permission;
  } = {
    admin: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false, // Admin cannot delete
      canManageUsers: true,
      canManageFormations: true,
    },
    superadmin: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true, // SuperAdmin can delete
      canManageUsers: true,
      canManageFormations: true,
    },
    formateur: {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageUsers: false,
      canManageFormations: false,
    },
    apprenant: {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageUsers: false,
      canManageFormations: false,
    },
  };

  constructor(private authService: AuthService) {}

  /**
   * Get permissions for current user
   */
  getCurrentUserPermissions(): Permission {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return this.getEmptyPermissions();
    }
    return this.getPermissionsForRole(user.role);
  }

  /**
   * Get permissions for specific role
   */
  getPermissionsForRole(role: string): Permission {
    return this.permissionMap[role] || this.getEmptyPermissions();
  }

  /**
   * Check if user can perform action
   */
  canPerform(action: string): boolean {
    const permissions = this.getCurrentUserPermissions();
    const actionKey = `can${action.charAt(0).toUpperCase() + action.slice(1)}`;
    return (permissions as any)[actionKey] || false;
  }

  /**
   * Check if user is admin or superadmin
   */
  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'superadmin';
  }

  /**
   * Check if user is superadmin
   */
  isSuperAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'superadmin';
  }

  /**
   * Get empty permissions
   */
  private getEmptyPermissions(): Permission {
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canManageUsers: false,
      canManageFormations: false,
    };
  }
}
