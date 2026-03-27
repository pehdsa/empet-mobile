import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { OTPInput, type SlotProps } from "input-otp-native";
import { Screen } from "@/components/ui/Screen";
import { NavHeader } from "@/components/ui/NavHeader";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
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
  const toast = useToastStore();
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormError(null);
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
          setFormError("Ocorreu um erro, tente novamente");
          return;
        }
        const status = error.response?.status;
        if (status === 422) {
          mapApiErrors(setError, error);
        } else if (status === 429) {
          toast.show("Muitas tentativas, tente novamente", "error");
        } else {
          setFormError("Codigo invalido ou expirado");
        }
      },
    });
  };

  if (!email) return null;

  return (
    <Screen>
      <NavHeader title="Verificar codigo" />

      <View className="flex-1 justify-center gap-4">
        <Text className="font-montserrat text-sm text-text-secondary">
          Insira o codigo de 6 digitos enviado para {email}.
        </Text>

        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, value } }) => (
            <View className="items-center gap-1.5">
              <OTPInput
                maxLength={6}
                value={value}
                onChange={(text) => {
                  setFormError(null);
                  onChange(text);
                }}
                textContentType="oneTimeCode"
                render={({ slots }) => (
                  <View className="flex-row gap-2">
                    {slots.map((slot, i) => (
                      <OTPSlot key={i} {...slot} />
                    ))}
                  </View>
                )}
              />
              {errors.code && <ErrorMessage message={errors.code.message!} />}
            </View>
          )}
        />

        {formError && <ErrorMessage message={formError} />}

        <ButtonPrimary
          label="Verificar"
          onPress={handleSubmit(onSubmit)}
          loading={verifyCode.isPending}
          disabled={verifyCode.isPending}
        />
      </View>
    </Screen>
  );
}
