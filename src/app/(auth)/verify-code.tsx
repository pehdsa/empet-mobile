import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { OTPInput, type SlotProps } from "input-otp-native";
import { Screen } from "@/components/ui/Screen";
import { NavHeader } from "@/components/ui/NavHeader";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { useVerifyResetCode } from "@/hooks/useAuth";
import { useToastStore } from "@/stores/toast";
import { mapApiErrors } from "@/utils/map-api-errors";
import {
  verifyCodeSchema,
  type VerifyCodeFormData,
} from "@/features/auth/schemas/verify-code.schema";

function OTPSlot({ char, isActive }: SlotProps) {
  return (
    <View
      className={`h-14 w-11 items-center justify-center rounded-xl border ${
        isActive ? "border-primary" : "border-border"
      } bg-surface`}
    >
      <Text className="font-montserrat-semibold text-xl text-text-primary">
        {char ?? ""}
      </Text>
    </View>
  );
}

export default function VerifyCode() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const verifyCode = useVerifyResetCode();
  const showToast = useToastStore((s) => s.show);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { email: email ?? "", code: "" },
  });

  // Guarda de params: se email ausente, volta para forgot-password
  useEffect(() => {
    if (!email) {
      router.replace("/(auth)/forgot-password");
    }
  }, [email, router]);

  const onSubmit = (data: VerifyCodeFormData) => {
    verifyCode.mutate(data, {
      onSuccess: (response) => {
        const { resetToken } = response.data;
        router.push({
          pathname: "/(auth)/reset-password",
          params: { email: data.email, resetToken },
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
          showToast("Código inválido ou expirado", "error");
        }
      },
    });
  };

  if (!email) return null;

  return (
    <Screen>
      <NavHeader title="Verificar código" />

      <View className="flex-1 justify-center gap-4">
        <View className="items-center gap-2">
          <Text className="font-montserrat-bold text-2xl text-text-primary">
            Verificar código
          </Text>
          <Text className="text-center font-montserrat text-sm text-text-secondary">
            Digite o código de 6 dígitos enviado ao seu e-mail.
          </Text>
        </View>

        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, value } }) => (
            <View className="items-center gap-1.5">
              <OTPInput
                maxLength={6}
                value={value}
                onChange={onChange}
                textContentType="oneTimeCode"
                render={({ slots }) => (
                  <View className="flex-row gap-2">
                    {slots.map((slot, i) => (
                      <OTPSlot key={i} {...slot} />
                    ))}
                  </View>
                )}
              />
              {errors.code && (
                <Text className="font-montserrat text-xs text-error">
                  {errors.code.message}
                </Text>
              )}
            </View>
          )}
        />

        <ButtonPrimary
          label="Verificar"
          onPress={handleSubmit(onSubmit, () => showToast("Preencha os campos obrigatórios", "error"))}
          loading={verifyCode.isPending}
          disabled={verifyCode.isPending}
        />
      </View>
    </Screen>
  );
}
