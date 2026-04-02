import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Screen } from "@/components/ui/Screen";
import { TextInput } from "@/components/ui/TextInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { TextLink } from "@/components/ui/TextLink";
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
  const showToast = useToastStore((s) => s.show);

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
    login.mutate(data, {
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
          showToast("Credenciais inválidas", "error");
        }
      },
    });
  };

  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <View className="items-center gap-2">
          <Text className="font-montserrat-bold text-2xl text-text-primary">
            Bem-vindo de volta
          </Text>
          <Text className="font-montserrat text-sm text-text-secondary">
            Faça login para continuar
          </Text>
        </View>
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <PasswordInput
              ref={ref}
              label="Senha"
              placeholder="Sua senha"
              value={value}
              onChangeText={onChange}
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

        <ButtonPrimary
          label="Entrar"
          onPress={handleSubmit(onSubmit, () => showToast("Preencha os campos obrigatórios", "error"))}
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
