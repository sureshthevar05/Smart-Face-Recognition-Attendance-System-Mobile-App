export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  facultyId: string;
  fullName: string;
  department: string;
  gender?: string | null;
  isAdmin: boolean;
}

export interface LoginResponse {
  success: true;
  faculty_id: string;
  full_name: string;
  department: string;
  gender?: string | null;
  is_admin?: boolean;
}
