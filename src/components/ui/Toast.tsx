import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";
import { CircleAlert, CircleCheck } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { useToastStore } from "@/stores/toast";

const TOAST_DURATION = 3000;

export function Toast() {
  const { message, variant, visible, hide } = useToastStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => hide());
      }, TOAST_DURATION);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, hide, opacity]);

  if (!visible || !message) return null;

  const isError = variant === "error";
  const Icon = isError ? CircleAlert : CircleCheck;
  const iconColor = isError ? colors.error : colors.success;
  const bgClass = isError ? "bg-[#FDEDED]" : "bg-[#E8F5E9]";
  const textClass = isError ? "text-error" : "text-success";

  return (
    <Animated.View
      className={`absolute left-6 right-6 top-14 z-50 flex-row items-center gap-2 rounded-xl px-4 py-3 ${bgClass}`}
      style={{ opacity }}
    >
      <Icon size={18} color={iconColor} />
      <Text className={`flex-1 font-montserrat text-[13px] ${textClass}`}>{message}</Text>
    </Animated.View>
  );
}
