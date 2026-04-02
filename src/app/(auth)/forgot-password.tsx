import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Screen } from "@/components/ui/Screen";
import { NavHeader } from "@/components/ui/NavHeader";
import { TextInput } from "@/components/ui/TextInput";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
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
  const showToast = useToastStore((s) => s.show);

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
    forgotPassword.mutate(data, {
      onSuccess: () => {
        router.push({
          pathname: "/(auth)/verify-code",
          params: { email: data.email },
        });
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
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />
          )}
        />

        <ButtonPrimary
          label="Enviar código"
          onPress={handleSubmit(onSubmit, () => showToast("Preencha os campos obrigatórios", "error"))}
          loading={forgotPassword.isPending}
          disabled={forgotPassword.isPending}
        />
      </View>
    </Screen>
  );
}
