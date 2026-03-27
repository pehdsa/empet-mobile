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
  const toast = useToastStore();
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormError(null);
    register.mutate(data, {
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
      <NavHeader title="Criar conta" />

      <View className="flex-1 justify-center gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <TextInput
              ref={ref}
              label="Nome"
              placeholder="Seu nome"
              value={value}
              onChangeText={(text) => {
                setFormError(null);
                onChange(text);
              }}
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
          label="Criar conta"
          onPress={handleSubmit(onSubmit)}
          loading={register.isPending}
          disabled={register.isPending}
        />

        <View className="items-center">
          <TextLink
            label="Ja tenho conta"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </View>
    </Screen>
  );
}
