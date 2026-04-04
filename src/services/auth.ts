import api from './api'

export type AuthUser = {
  id: number
  full_name: string
  email: string
  phone_number: string
}

export type MeUser = {
  id: number
  email: string
  full_name: string
  is_admin: boolean
  is_staff?: boolean
}

export type SignupRequest = {
  full_name: string
  email: string
  phone_number: string
  password: string
}

export type SignupResponse = {
  message: string
  user: AuthUser
  email_sent: boolean
  error?: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  access: string
  refresh: string
  user: AuthUser
}

export type VerifyEmailRequest = {
  email: string
  code: string
}

export type VerifyEmailResponse = {
  message: string
  user: AuthUser
}

export type ResendVerificationRequest = {
  email: string
}

export type MessageResponse = {
  message: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type VerifyResetCodeRequest = {
  email: string
  code: string
}

export type VerifyResetCodeResponse = {
  message: string
  reset_token: string
  expires_in_minutes: number
}

export type ResetPasswordRequest = {
  reset_token: string
  new_password: string
}

export type RefreshRequest = {
  refresh: string
}

export type RefreshResponse = {
  access: string
  refresh: string
}

export type LogoutRequest = {
  refresh_token?: string
  fcm_token?: string
}

export const signup = async (payload: SignupRequest): Promise<SignupResponse> => {
  const response = await api.post<SignupResponse>('auth/signup/', payload, { skipAuth: true } as never)
  return response.data
}

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('auth/login/', payload, { skipAuth: true } as never)
  return response.data
}

export const verifyEmail = async (payload: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  const response = await api.post<VerifyEmailResponse>('auth/verify-email/', payload, { skipAuth: true } as never)
  return response.data
}

export const resendVerification = async (payload: ResendVerificationRequest): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('auth/resend-verification/', payload, { skipAuth: true } as never)
  return response.data
}

export const forgotPassword = async (payload: ForgotPasswordRequest): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('auth/forgot-password/', payload, { skipAuth: true } as never)
  return response.data
}

export const verifyResetCode = async (payload: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> => {
  const response = await api.post<VerifyResetCodeResponse>('auth/verify-reset-code/', payload, { skipAuth: true } as never)
  return response.data
}

export const resetPassword = async (payload: ResetPasswordRequest): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('auth/reset-password/', payload, { skipAuth: true } as never)
  return response.data
}

export const refresh = async (payload: RefreshRequest): Promise<RefreshResponse> => {
  const response = await api.post<RefreshResponse>('auth/refresh/', payload, { skipAuth: true } as never)
  return response.data
}

export const logout = async (payload?: LogoutRequest): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('auth/logout/', payload ?? {})
  return response.data
}

export const me = async (): Promise<MeUser> => {
  const response = await api.get<MeUser>('auth/me/')
  return response.data
}

export const deleteAccount = async (): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>('user/delete-account/')
  return response.data
}

