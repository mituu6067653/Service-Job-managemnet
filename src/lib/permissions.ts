import { JWTPayload } from './auth';

export type Role = 'ADMIN' | 'MANAGER' | 'TECHNICIAN';

export function isRoleAllowed(userRole: string, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole as Role);
}

export function enforceBusinessScope(session: JWTPayload, targetBusinessId: string): void {
  if (session.businessId !== targetBusinessId) {
    throw new Error('UNAUTHORIZED_MULTI_TENANT_ACCESS: Data belongs to another business domain.');
  }
}
