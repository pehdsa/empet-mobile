import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/services/api/auth";
import { useAuthStore } from "@/stores/auth";
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyResetCodePayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from "@/types/auth";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: async (response) => {
      const { token, user } = response.data.data;
      await setAuth(token, user);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),
    onSuccess: async (response) => {
      const { token, user } = response.data.data;
      await setAuth(token, user);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordPayload) => authApi.forgotPassword(data),
  });
}

export function useVerifyResetCode() {
  return useMutation({
    mutationFn: (data: VerifyResetCodePayload) => authApi.verifyResetCode(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => authApi.resetPassword(data),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => authApi.changePassword(data),
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await clearAuth();
    },
  });
}
