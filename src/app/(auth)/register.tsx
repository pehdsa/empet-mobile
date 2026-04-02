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
import { useRegister } from "@/hooks/useAuth";
import { useToastStore } from "@/stores/toast";
import { mapApiErrors } from "@/utils/map-api-errors";
import {
  registerSchema,
  type RegisterFormData,
} from "@/features/auth/schemas/register.schema";

export default function Register() {
  const router = useRouter();
  const register = useRegister();
  const showToast = useToastStore((s) => s.show);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", password_confirmation: "" },
  });

  const onSubmit = (data: RegisterFormData) => {
    register.mutate(data, {
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
      <View className="flex-1 justify-center gap-4">
        <View className="items-center gap-2">
          <Text className="font-montserrat-bold text-2xl text-text-primary">
            Criar Conta
          </Text>
          <Text className="font-montserrat text-sm text-text-secondary">
            Preencha os dados para se cadastrar
          </Text>
        </View>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <TextInput
              ref={ref}
              label="Nome *"
              placeholder="Seu nome"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              autoCapitalize="words"
              textContentType="name"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <TextInput
              ref={ref}
              label="Email *"
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
              label="Senha *"
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
              label="Confirmar senha *"
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
          label="Criar conta"
          onPress={handleSubmit(onSubmit, () => showToast("Preencha os campos obrigatórios", "error"))}
          loading={register.isPending}
          disabled={register.isPending}
        />

        <View className="items-center">
          <TextLink
            label="Já tenho conta"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </View>
    </Screen>
  );
}
