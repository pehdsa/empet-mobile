import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PawPrint,
  Phone,
  Lock,
  Bell,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/hooks/useAuth";
import { colors } from "@/lib/colors";
import { Dialog } from "@/components/ui/Dialog";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingsItem({
  icon,
  label,
  onPress,
  rightElement,
  danger,
}: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 flex-row items-center gap-3 px-4 active:opacity-80"
    >
      {icon}
      <Text
        className={`flex-1 font-montserrat-medium text-[15px] ${danger ? "text-error" : "text-text-primary"}`}
      >
        {label}
      </Text>
      {rightElement}
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-background" />;
}

export default function Settings() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const showComingSoon = () => {
    Alert.alert("Em breve", "Esta funcionalidade estará disponível em breve.");
  };

  const handleLogout = () => {
    setLogoutModalVisible(false);
    logout.mutate();
  };

  const initials = user ? getInitials(user.name) : "??";

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Title */}
      <View className="px-6 pb-2 pt-4">
        <Text className="font-montserrat-bold text-2xl text-text-primary">
          Configurações
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View className="flex-row items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Text className="font-montserrat-bold text-xl text-white">
              {initials}
            </Text>
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-montserrat-bold text-lg text-text-primary">
              {user?.name ?? "—"}
            </Text>
            <Text className="font-montserrat text-sm text-text-secondary">
              {user?.email ?? "—"}
            </Text>
          </View>
        </View>

        {/* Meus Dados */}
        <View className="gap-1">
          <Text className="font-montserrat-medium text-xs text-text-tertiary">
            MEUS DADOS
          </Text>
          <View className="overflow-hidden rounded-xl bg-white">
            <SettingsItem
              icon={<PawPrint size={24} color={colors.primary} />}
              label="Meus Pets"
              onPress={showComingSoon}
              rightElement={
                <ChevronRight size={16} color={colors.border} />
              }
            />
            <Divider />
            <SettingsItem
              icon={<Phone size={24} color={colors.primary} />}
              label="Telefones"
              onPress={showComingSoon}
              rightElement={
                <ChevronRight size={16} color={colors.border} />
              }
            />
            <Divider />
            <SettingsItem
              icon={<Lock size={24} color={colors.primary} />}
              label="Alterar senha"
              onPress={showComingSoon}
              rightElement={
                <ChevronRight size={16} color={colors.border} />
              }
            />
          </View>
        </View>

        {/* Notificações */}
        <View className="gap-1">
          <Text className="font-montserrat-medium text-xs text-text-tertiary">
            NOTIFICAÇÕES
          </Text>
          <View className="overflow-hidden rounded-xl bg-white">
            <SettingsItem
              icon={<Bell size={24} color={colors.primary} />}
              label="Configurar notificações"
              onPress={showComingSoon}
              rightElement={
                <ChevronRight size={16} color={colors.border} />
              }
            />
          </View>
        </View>

        {/* Sobre */}
        <View className="gap-1">
          <Text className="font-montserrat-medium text-xs text-text-tertiary">
            SOBRE
          </Text>
          <View className="overflow-hidden rounded-xl bg-white">
            <SettingsItem
              icon={<Info size={24} color={colors.textTertiary} />}
              label="Versão do app"
              onPress={() => {}}
              rightElement={
                <Text className="font-montserrat text-sm text-text-tertiary">
                  1.0.0
                </Text>
              }
            />
          </View>
        </View>

        {/* Sair */}
        <View className="gap-1">
          <View className="overflow-hidden rounded-xl bg-white">
            <SettingsItem
              icon={<LogOut size={24} color={colors.error} />}
              label="Sair"
              onPress={() => setLogoutModalVisible(true)}
              danger
            />
          </View>
        </View>
      </ScrollView>

      {/* Logout Dialog */}
      <Dialog
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
      >
        <View className="items-center gap-4">
          {/* Icon */}
          <View className="h-14 w-14 items-center justify-center rounded-full bg-error/10">
            <LogOut size={28} color={colors.error} />
          </View>

          {/* Title */}
          <Text className="font-montserrat-bold text-lg text-text-primary">
            Sair do app?
          </Text>

          {/* Description */}
          <Text className="text-center font-montserrat text-sm leading-5 text-text-secondary">
            Você precisará fazer login novamente para acessar o app.
          </Text>

          {/* Buttons */}
          <View className="w-full flex-row gap-3">
            <Pressable
              onPress={() => setLogoutModalVisible(false)}
              className="h-11 flex-1 items-center justify-center rounded-[10px] border border-border bg-white active:opacity-80"
            >
              <Text className="font-montserrat-semibold text-sm text-text-primary">
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleLogout}
              className="h-11 flex-1 items-center justify-center rounded-[10px] bg-error active:opacity-80"
            >
              <Text className="font-montserrat-semibold text-sm text-white">
                Sair
              </Text>
            </Pressable>
          </View>
        </View>
      </Dialog>
    </View>
  );
}
