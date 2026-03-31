import { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Screen } from "@/components/ui/Screen";
import { NavHeader } from "@/components/ui/NavHeader";
import { TextInput } from "@/components/ui/TextInput";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useForgotPassword } from "@/hooks/useAuth";
import { useToastStore } from "@/stores/toast";
import { mapApiErrors } from "@/utils/map-api-errors";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/features/auth/schemas/forgot-password.schema";

export default function ForgotPassword() {
  const router = useRouter();
  const forgotPassword = useForgotPassword();
  const toast = useToastStore();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setFormError(null);
    forgotPassword.mutate(data, {
      onSuccess: () => {
        router.push({
          pathname: "/(auth)/verify-code",
          params: { email: data.email },
        });
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

  return (
    <Screen>
      <NavHeader title="Esqueci minha senha" />

      <View className="flex-1 justify-center gap-4">
        <Text className="font-montserrat text-sm text-text-secondary">
          Informe seu email para receber um código de verificação.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <TextInput
              ref={ref}
              label="Email"
              placeholder="seu@email.com"
              value={value}
              onChangeText={(text) => {
                setFormError(null);
                onChange(text);
              }}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
          )}
        />

        {formError && <ErrorMessage message={formError} />}

        <ButtonPrimary
          label="Enviar código"
          onPress={handleSubmit(onSubmit)}
          loading={forgotPassword.isPending}
          disabled={forgotPassword.isPending}
        />
      </View>
    </Screen>
  );
}
