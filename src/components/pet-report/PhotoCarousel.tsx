import { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Image,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { Dog, Cat } from "lucide-react-native";
import { colors } from "@/lib/colors";
import type { PetPhoto, PetSpecies } from "@/types/pet";

interface PhotoCarouselProps {
  photos: PetPhoto[];
  species: PetSpecies;
}

function Placeholder({ species, width }: { species: PetSpecies; width?: number }) {
  return (
    <View
      className="items-center justify-center bg-border/30"
      style={{ width: width ?? "100%", height: 280 }}
    >
      {species === "DOG" ? (
        <Dog size={48} color={colors.textTertiary} />
      ) : (
        <Cat size={48} color={colors.textTertiary} />
      )}
    </View>
  );
}

function PhotoItem({
  photo,
  width,
  species,
}: {
  photo: PetPhoto;
  width: number;
  species: PetSpecies;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return <Placeholder species={species} width={width} />;
  }

  return (
    <Image
      source={{ uri: photo.url }}
      style={{ width, height: 280 }}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
}

export function PhotoCarousel({ photos, species }: PhotoCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
    },
    [width],
  );

  if (photos.length === 0) {
    return <Placeholder species={species} />;
  }

  return (
    <View className="h-[280px]">
      <FlatList
        data={photos}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item }) => (
          <PhotoItem photo={item} width={width} species={species} />
        )}
      />
      {photos.length > 1 && (
        <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-2">
          {photos.map((photo, index) => (
            <View
              key={photo.id}
              className={`rounded-full ${
                index === activeIndex
                  ? "h-2 w-2 bg-primary"
                  : "h-1.5 w-1.5 bg-border"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
