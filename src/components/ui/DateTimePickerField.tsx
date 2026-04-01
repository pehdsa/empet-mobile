import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { colors } from "@/lib/colors";
import { ErrorMessage } from "./ErrorMessage";
import { formatDateTime } from "@/utils/format-date";

interface DateTimePickerFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  error?: string;
}

export function DateTimePickerField({
  label,
  value,
  onChange,
  maximumDate,
  error,
}: DateTimePickerFieldProps) {
  const [show, setShow] = useState(false);
  const [androidMode, setAndroidMode] = useState<"date" | "time">("date");
  const [tempDate, setTempDate] = useState<Date>(value);

  const handlePress = () => {
    if (Platform.OS === "android") {
      setAndroidMode("date");
      setTempDate(value);
    }
    setShow(true);
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setShow(false);
        return;
      }

      if (androidMode === "date" && selectedDate) {
        setTempDate(selectedDate);
        setShow(false);
        setTimeout(() => {
          setAndroidMode("time");
          setShow(true);
        }, 100);
        return;
      }

      if (androidMode === "time" && selectedDate) {
        onChange(selectedDate);
        setShow(false);
        return;
      }
    }

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View className="gap-1.5">
      <Text className="font-montserrat-medium text-[13px] text-text-secondary">
        {label}
      </Text>

      <Pressable
        onPress={handlePress}
        className={`h-12 flex-row items-center justify-between rounded-xl border bg-surface px-4 ${
          error ? "border-error" : "border-border"
        }`}
      >
        <Text className="font-montserrat text-[15px] text-text-primary">
          {formatDateTime(value.toISOString())}
        </Text>
        <Calendar size={20} color={colors.textTertiary} />
      </Pressable>

      {error && <ErrorMessage message={error} />}

      {show && Platform.OS === "ios" && (
        <DateTimePicker
          value={value}
          mode="datetime"
          display="default"
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      )}

      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={androidMode === "time" ? tempDate : value}
          mode={androidMode}
          display="default"
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
