import { View, Text, Image, Pressable } from "react-native";
import { Plus, X, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/lib/colors";
import { useToastStore } from "@/stores/toast";
import type { PhotoFormItem } from "@/types/pet";
import { MAX_PHOTOS, MAX_PHOTO_SIZE_BYTES } from "@/features/pets/schemas/pet.schema";

interface PhotoUploaderProps {
  photos: PhotoFormItem[];
  onChange: (photos: PhotoFormItem[]) => void;
}

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  const showToast = useToastStore((s) => s.show);
  const canAdd = photos.length < MAX_PHOTOS;

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast("Permita acesso a galeria para adicionar fotos", "error");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
    });

    if (result.canceled) return;

    const newPhotos: PhotoFormItem[] = [];

    for (const asset of result.assets) {
      const mimeType = asset.mimeType ?? "image/jpeg";

      if (!VALID_TYPES.includes(mimeType)) {
        showToast("Foto deve ser JPEG, PNG ou WebP", "error");
        continue;
      }

      if (asset.fileSize && asset.fileSize > MAX_PHOTO_SIZE_BYTES) {
        showToast("Foto deve ter no maximo 2MB", "error");
        continue;
      }

      newPhotos.push({
        id: `local-${asset.uri}`,
        local: {
          uri: asset.uri,
          mimeType,
          fileName: asset.fileName ?? `photo-${Date.now()}.jpg`,
        },
      });
    }

    if (newPhotos.length > 0) {
      const total = photos.length + newPhotos.length;
      const allowed = newPhotos.slice(0, MAX_PHOTOS - photos.length);

      if (total > MAX_PHOTOS) {
        showToast(`Maximo ${MAX_PHOTOS} fotos`, "error");
      }

      onChange([...photos, ...allowed]);
    }
  };

  const handleRemove = (photoId: string) => {
    onChange(photos.filter((p) => p.id !== photoId));
  };

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-3">
        {photos.map((photo) => (
          <View key={photo.id} className="relative">
            <Image
              source={{ uri: photo.existing?.url ?? photo.local?.uri }}
              className="h-20 w-20 rounded-xl"
              resizeMode="cover"
            />
            <Pressable
              onPress={() => handleRemove(photo.id)}
              className="absolute -right-1.5 -top-1.5 h-6 w-6 items-center justify-center rounded-full bg-error active:opacity-80"
            >
              <X size={12} color="#FFFFFF" />
            </Pressable>
          </View>
        ))}

        {canAdd && (
          <Pressable
            onPress={handlePickImage}
            className="h-20 w-20 items-center justify-center rounded-xl border border-dashed border-border bg-background active:opacity-80"
          >
            <Plus size={24} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <Text className="font-montserrat text-xs text-text-tertiary">
        Adicione ate {MAX_PHOTOS} fotos do pet
      </Text>
    </View>
  );
}
