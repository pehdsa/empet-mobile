import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Screen } from "@/components/ui/Screen";
import { NavHeader } from "@/components/ui/NavHeader";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { useResetPassword } from "@/hooks/useAuth";
import { useToastStore } from "@/stores/toast";
import { mapApiErrors } from "@/utils/map-api-errors";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/features/auth/schemas/reset-password.schema";

export default function ResetPassword() {
  const router = useRouter();
  const { email, resetToken } = useLocalSearchParams<{
    email: string;
    resetToken: string;
  }>();
  const resetPassword = useResetPassword();
  const showToast = useToastStore((s) => s.show);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email ?? "",
      resetToken: resetToken ?? "",
      password: "",
      password_confirmation: "",
    },
  });

  // Guarda de params: se email ou resetToken ausentes, volta para forgot-password
  useEffect(() => {
    if (!email || !resetToken) {
      router.replace("/(auth)/forgot-password");
    }
  }, [email, resetToken, router]);

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword.mutate(data, {
      onSuccess: () => {
        showToast("Senha redefinida com sucesso");
        router.replace("/(auth)/login");
      },
      onError: (error) => {
        if (!isAxiosError(error)) {
          showToast("Ocorreu um erro, tente novamente", "error");
          return;
        }
        const status = error.response?.status;
        if (status === 422) {
          const unhandled = mapApiErrors(setError, error);
          if (unhandled.length > 0) showToast(unhandled[0], "error");
        } else if (status === 429) {
          showToast("Muitas tentativas, tente novamente", "error");
        } else {
          showToast("Ocorreu um erro, tente novamente", "error");
        }
      },
    });
  };

  if (!email || !resetToken) return null;

  return (
    <Screen>
      <NavHeader title="Nova senha" />

      <View className="flex-1 justify-center gap-4">
        <View className="items-center gap-2">
          <Text className="font-montserrat-bold text-2xl text-text-primary">
            Redefinir senha
          </Text>
          <Text className="text-center font-montserrat text-sm text-text-secondary">
            Crie uma nova senha com pelo menos 8 caracteres.
          </Text>
        </View>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <PasswordInput
              ref={ref}
              label="Nova senha"
              placeholder="Mínimo 8 caracteres"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />
          )}
        />

        <Controller
          control={control}
          name="password_confirmation"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <PasswordInput
              ref={ref}
              label="Confirmar senha"
              placeholder="Repita a senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password_confirmation?.message}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />
          )}
        />

        <ButtonPrimary
          label="Redefinir senha"
          onPress={handleSubmit(onSubmit, () => showToast("Preencha os campos obrigatórios", "error"))}
          loading={resetPassword.isPending}
          disabled={resetPassword.isPending}
        />
      </View>
    </Screen>
  );
}
