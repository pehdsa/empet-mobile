import { useState, useEffect } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Screen } from "@/components/ui/Screen";
import { NavHeader } from "@/components/ui/NavHeader";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
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
  const toast = useToastStore();
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormError(null);
    resetPassword.mutate(data, {
      onSuccess: () => {
        toast.show("Senha redefinida com sucesso", "success");
        router.replace("/(auth)/login");
      },
      onError: (error) => {
        if (!isAxiosError(error)) {
          setFormError("Ocorreu um erro, tente novamente");
          return;
        }
        const status = error.response?.status;
        if (status === 422) {
          mapApiErrors(setError, error);
        } else if (status === 429) {
          toast.show("Muitas tentativas, tente novamente", "error");
        } else {
          setFormError("Ocorreu um erro, tente novamente");
        }
      },
    });
  };

  if (!email || !resetToken) return null;

  return (
    <Screen>
      <NavHeader title="Nova senha" />

      <View className="flex-1 justify-center gap-4">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <PasswordInput
              ref={ref}
              label="Nova senha"
              placeholder="Minimo 8 caracteres"
              value={value}
              onChangeText={(text) => {
                setFormError(null);
                onChange(text);
              }}
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
              onChangeText={(text) => {
                setFormError(null);
                onChange(text);
              }}
              onBlur={onBlur}
              error={errors.password_confirmation?.message}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />
          )}
        />

        {formError && <ErrorMessage message={formError} />}

        <ButtonPrimary
          label="Redefinir senha"
          onPress={handleSubmit(onSubmit)}
          loading={resetPassword.isPending}
          disabled={resetPassword.isPending}
        />
      </View>
    </Screen>
  );
}
