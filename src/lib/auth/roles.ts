/**
 * Who an account is for. Parents and teachers (or tutors) both look after
 * students' practice, so they share the dashboard for linking students and
 * seeing their progress; only the wording differs. The one place that rule
 * lives, so a new role cannot be handled in some branches and missed in others.
 */
export function isGuardianRole(role: string | null | undefined): boolean {
  return role === 'parent' || role === 'teacher'
}

export function roleLabel(role: string | null | undefined): string {
  if (role === 'teacher') return 'Teacher or tutor'
  if (role === 'parent') return 'Parent'
  if (role === 'admin') return 'Admin'
  return 'Student'
}

export function dashboardLabel(role: string | null | undefined): string {
  return role === 'teacher' ? 'Teacher dashboard' : 'Parent dashboard'
}
