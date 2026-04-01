import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Plus, X, ImageOff } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { colors } from "@/lib/colors";
import { useToastStore } from "@/stores/toast";
import type { PhotoFormItem } from "@/types/pet";
import { MAX_PHOTOS as DEFAULT_MAX_PHOTOS, MAX_PHOTO_SIZE_BYTES } from "@/features/pets/schemas/pet.schema";

const HEIC_TYPES = ["image/heic", "image/heif"];

interface PhotoUploaderProps {
  photos: PhotoFormItem[];
  onChange: (photos: PhotoFormItem[]) => void;
  maxPhotos?: number;
}

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

function PhotoThumb({
  uri,
  onRemove,
}: {
  uri: string | undefined;
  onRemove: () => void;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <View className="relative">
      {!failed && uri ? (
        <Image
          source={{ uri }}
          style={{ width: 80, height: 80, borderRadius: 12 }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <View
          style={{ width: 80, height: 80, borderRadius: 12 }}
          className="items-center justify-center bg-error/10"
        >
          <ImageOff size={20} color={colors.error} />
          <Text className="mt-0.5 font-montserrat text-[9px] text-error">
            Erro
          </Text>
        </View>
      )}
      <Pressable
        onPress={onRemove}
        className="absolute -right-1.5 -top-1.5 h-6 w-6 items-center justify-center rounded-full bg-error active:opacity-80"
      >
        <X size={12} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

export function PhotoUploader({ photos, onChange, maxPhotos = DEFAULT_MAX_PHOTOS }: PhotoUploaderProps) {
  const showToast = useToastStore((s) => s.show);
  const canAdd = photos.length < maxPhotos;
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
      selectionLimit: maxPhotos - photos.length,
      exif: true,
    });

    if (result.canceled) return;

    const newPhotos: PhotoFormItem[] = [];
    let skippedType = 0;
    let skippedSize = 0;

    for (const asset of result.assets) {
      const mimeType = asset.mimeType ?? "image/jpeg";

      if (!VALID_TYPES.includes(mimeType)) {
        skippedType++;
        continue;
      }

      if (asset.fileSize != null && asset.fileSize > MAX_PHOTO_SIZE_BYTES) {
        skippedSize++;
        continue;
      }

      const longest = Math.max(asset.width, asset.height);
      const maxDim = 1600;
      const needsResize = longest > maxDim;
      const needsConvert = HEIC_TYPES.includes(mimeType);

      let finalUri = asset.uri;
      let finalMimeType = mimeType;
      let finalFileName = asset.fileName ?? `photo-${Date.now()}.jpg`;

      if (needsConvert || needsResize) {
        const targetWidth = needsResize
          ? (asset.width >= asset.height ? maxDim : undefined)
          : asset.width;
        const targetHeight = needsResize
          ? (asset.height > asset.width ? maxDim : undefined)
          : asset.height;

        // EXIF orientation → rotation degrees
        const exifOrientation = asset.exif?.Orientation ?? asset.exif?.orientation ?? 1;
        const rotationMap: Record<number, number> = {
          1: 0, 2: 0, 3: 180, 4: 180, 5: 90, 6: 90, 7: -90, 8: -90,
        };
        const rotation = rotationMap[exifOrientation as number] ?? 0;

        const context = ImageManipulator.manipulate(asset.uri);
        if (rotation !== 0) context.rotate(rotation);
        context.resize({ width: targetWidth, height: targetHeight });
        const imageRef = await context.renderAsync();
        const result = await imageRef.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.7,
        });
        finalUri = result.uri;
        finalMimeType = "image/jpeg";
        if (needsConvert) {
          finalFileName = finalFileName.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
        }
      }

      const uniqueId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      newPhotos.push({
        id: uniqueId,
        local: {
          uri: finalUri,
          mimeType: finalMimeType,
          fileName: finalFileName,
        },
      });
    }

    const allowed = newPhotos.slice(0, maxPhotos - photos.length);
    const skippedLimit = newPhotos.length - allowed.length;

    if (skippedSize > 0 || skippedType > 0 || skippedLimit > 0) {
      const parts: string[] = [];
      if (skippedSize > 0)
        parts.push(`${skippedSize} ${skippedSize === 1 ? "excede" : "excedem"} ${MAX_PHOTO_SIZE_BYTES / 1024 / 1024}MB`);
      if (skippedType > 0)
        parts.push(`${skippedType} com formato inválido`);
      if (skippedLimit > 0)
        parts.push(`limite de ${maxPhotos} fotos atingido`);
      showToast(
        `${parts.join(", ").replace(/^./, (c) => c.toUpperCase())}. ${skippedSize + skippedType + skippedLimit} ${skippedSize + skippedType + skippedLimit === 1 ? "foto ignorada" : "fotos ignoradas"}.`,
        "error",
      );
    }

    if (allowed.length > 0) {
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
          <PhotoThumb
            key={photo.id}
            uri={photo.existing?.url ?? photo.local?.uri}
            onRemove={() => handleRemove(photo.id)}
          />
        ))}

        {canAdd && (
          <Pressable
            onPress={handlePickImage}
            style={{ width: 80, height: 80 }}
            className="items-center justify-center rounded-xl border border-dashed border-border bg-background active:opacity-80"
          >
            <Plus size={24} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <Text className="font-montserrat text-xs text-text-tertiary">
        Adicione até {maxPhotos} fotos do pet
      </Text>

    </View>
  );
}
