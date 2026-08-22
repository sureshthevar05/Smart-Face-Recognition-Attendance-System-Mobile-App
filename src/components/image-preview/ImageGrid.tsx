import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import type { ImageAsset } from "../../types/attendance";
import ImageView from "react-native-image-viewing";

export function ImageGrid({
  images,
  onRemove,
}: {
  images: ImageAsset[];
  onRemove: (index: number) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const formattedImages = images.map(img => ({ uri: img.uri }));

  return (
    <View>
      <View className="flex-row flex-wrap justify-between">
        {images.map((img, index) => (
          <View key={img.uri + index} className="w-[48%] mb-3 rounded-xl border border-surface-border bg-white overflow-hidden">
            <TouchableOpacity activeOpacity={0.8} onPress={() => setOpenIndex(index)} className="aspect-[4/3] w-full bg-surface relative">
              <Image source={{ uri: img.uri }} className="h-full w-full" resizeMode="cover" />
              
              <TouchableOpacity
                onPress={() => onRemove(index)}
                className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-navy/80"
              >
                <Text className="text-white font-bold text-xs">X</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <View className="border-t border-surface-border py-2 items-center">
              <Text className="text-sm font-semibold text-navy">Image {index + 1}</Text>
            </View>
          </View>
        ))}
      </View>

      <ImageView
        images={formattedImages}
        imageIndex={openIndex ?? 0}
        visible={openIndex !== null}
        onRequestClose={() => setOpenIndex(null)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    </View>
  );
}
