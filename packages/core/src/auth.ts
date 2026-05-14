/**
 * Auth primitives shared across the panel.
 *
 * The actual Supabase Auth integration lives in
 * @seed-panel/integrations/supabase. This file just defines the shapes that
 * propagate through the app — User, Role, permission checks.
 */

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface PanelUser {
  id: string;
  email: string;
  fullName?: string | null;
  role: UserRole;
  isActive: boolean;
}

/**
 * Permission checks. Keep this dumb for now — three roles, additive.
 * When we need finer-grained perms, replace with CASL or similar.
 */
export const permissions = {
  // Anyone signed in can view
  canView: (user: PanelUser) => user.isActive,
  // Operators and admins can write
  canEdit: (user: PanelUser) => user.isActive && user.role !== 'viewer',
  // Admin-only — billing, integrations, team management, brand config
  canAdminister: (user: PanelUser) => user.isActive && user.role === 'admin',
};
