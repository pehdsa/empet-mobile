import { View, Platform, KeyboardAvoidingView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";

import { useChangePassword } from "@/hooks/useAuth";
import { useToastStore } from "@/stores/toast";
import { mapApiErrors } from "@/utils/map-api-errors";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/features/auth/schemas/change-password.schema";

import { NavHeader } from "@/components/ui/NavHeader";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import type { ValidationError } from "@/types/api";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = (values: ChangePasswordFormData) => {
    changePassword.mutate(values, {
      onSuccess: () => {
        showToast("Senha alterada com sucesso", "success");
        router.back();
      },
      onError: (err) => {
        if (err instanceof AxiosError && err.response?.status === 422) {
          const unhandled = mapApiErrors(
            setError,
            err as AxiosError<ValidationError>,
            {},
          );
          if (unhandled.length > 0) showToast(unhandled[0], "error");
        } else {
          showToast("Erro ao alterar senha", "error");
        }
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <NavHeader title="Alterar senha" className="px-6" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center gap-4">
            <Controller
              control={control}
              name="current_password"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <PasswordInput
                  label="Senha atual *"
                  placeholder="Digite sua senha atual"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <PasswordInput
                  label="Nova senha *"
                  placeholder="Mínimo 8 caracteres"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password_confirmation"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <PasswordInput
                  label="Confirmar nova senha *"
                  placeholder="Repita a nova senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                />
              )}
            />
          </View>
        </ScrollView>

        <View
          className="border-t border-border bg-surface px-6 py-4"
          style={{ paddingBottom: 16 + insets.bottom }}
        >
          <ButtonPrimary
            label="Alterar senha"
            loading={changePassword.isPending}
            onPress={handleSubmit(onSubmit, () =>
              showToast("Preencha os campos obrigatórios", "error"),
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
