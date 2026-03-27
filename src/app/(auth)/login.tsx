import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Screen } from "@/components/ui/Screen";
import { NavHeader } from "@/components/ui/NavHeader";
import { TextInput } from "@/components/ui/TextInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { TextLink } from "@/components/ui/TextLink";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useLogin } from "@/hooks/useAuth";
import { useToastStore } from "@/stores/toast";
import { mapApiErrors } from "@/utils/map-api-errors";
import {
  loginSchema,
  type LoginFormData,
} from "@/features/auth/schemas/login.schema";

export default function Login() {
  const router = useRouter();
  const login = useLogin();
  const toast = useToastStore();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    setFormError(null);
    login.mutate(data, {
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
          setFormError("Credenciais invalidas");
        }
      },
    });
  };

  return (
    <Screen>
      <NavHeader title="Entrar" />

      <View className="flex-1 justify-center gap-4">
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <PasswordInput
              ref={ref}
              label="Senha"
              placeholder="Sua senha"
              value={value}
              onChangeText={(text) => {
                setFormError(null);
                onChange(text);
              }}
              onBlur={onBlur}
              error={errors.password?.message}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />
          )}
        />

        <View className="items-end">
          <TextLink
            label="Esqueci minha senha"
            onPress={() => router.push("/(auth)/forgot-password")}
          />
        </View>

        {formError && <ErrorMessage message={formError} />}

        <ButtonPrimary
          label="Entrar"
          onPress={handleSubmit(onSubmit)}
          loading={login.isPending}
          disabled={login.isPending}
        />

        <View className="items-center">
          <TextLink
            label="Criar conta"
            onPress={() => router.push("/(auth)/register")}
          />
        </View>
      </View>
    </Screen>
  );
}
