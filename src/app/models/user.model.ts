export class User {
  id: number;
  email: string;
  name: string;
  roles: string[];
  avatar?: string;
  userPhone?: string;
  status?: string;
  createdDate?: Date;
  
  constructor(
    id: number = 0,
    email: string = '',
    name: string = '',
    roles: string[] = [],
    avatar: string = '',
    userPhone: string = '',
    status: string = 'Active'
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.roles = roles;
    this.avatar = avatar;
    this.userPhone = userPhone;
    this.status = status;
  }
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  username: string;
  roles: Array<{ authority: string }>; // Updated to match API
  email: string;
}

export interface LoginResponse {
  code: number; // Added from API response
  message: string; // Added from API response
  data: LoginResponseData; // Changed to match API response structure
}

export interface RegistrationRequest {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  email: string;
  name: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
