import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { AppHeader } from "../src/components/layout/AppHeader";
import { AppFooter } from "../src/components/layout/AppFooter";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { ImageGrid } from "../src/components/image-preview/ImageGrid";
import { useAttendanceFlow } from "../src/context/AttendanceFlowContext";

const CHECKLIST = [
  "All students' faces are visible",
  "Images are clear and well-lit",
  "No faces are blurred or cut off",
  "You are ready to mark attendance",
];

export default function ImagePreviewScreen() {
  const router = useRouter();
  const { images, removeImage, clearImages, submitForProcessing } = useAttendanceFlow();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (images.length === 0) {
      router.replace("/start-attendance");
    }
  }, [images.length, router]);

  function handleRetake() {
    clearImages();
    router.push("/start-attendance");
  }

  function handleProcess() {
    if (images.length === 0) {
      setFormError("Select at least one classroom image to continue.");
      return;
    }
    setFormError(null);
    submitForProcessing();
    router.push("/processing");
  }

  if (images.length === 0) return null;

  return (
    <View className="flex-1 bg-surface">
      <AppHeader
        title="Image Preview"
        subtitle="Review your images before processing"
        onBack={() => router.push("/start-attendance")}
      />

      <ScrollView className="flex-1 px-5 py-5">
        <Card className="px-4 py-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-blue-light">
                <Ionicons name="images" size={20} color="#2563EB" />
              </View>
              <View>
                <Text className="text-[15px] font-bold text-navy">Class Photos</Text>
                <Text className="text-xs text-surface-muted">
                  {images.length} image{images.length === 1 ? "" : "s"}
                </Text>
              </View>
            </View>
            <View className="rounded-full bg-brand-blue-light px-3 py-1">
              <Text className="text-xs font-semibold text-brand-blue">
                {images.length} of {images.length}
              </Text>
            </View>
          </View>

          <View className="mt-3.5 flex-row items-start gap-2.5 rounded-xl bg-brand-blue-light px-3.5 py-3">
            <View className="mt-0.5 h-4 w-4 items-center justify-center rounded-full bg-brand-blue">
              <Ionicons name="information" size={12} color="white" />
            </View>
            <Text className="flex-1 text-[13px] leading-snug text-navy">
              Please review all images carefully. Ensure all students' faces are clearly visible in each photo.
            </Text>
          </View>

          <View className="mt-3.5">
            <ImageGrid images={images} onRemove={removeImage} />
          </View>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1">
              <Button variant="outline" onPress={handleRetake}>Retake</Button>
            </View>
            <View className="flex-1">
              <Button onPress={handleProcess}>Process</Button>
            </View>
          </View>
        </Card>

        {formError && (
          <Text className="text-sm text-danger mb-4 text-center">{formError}</Text>
        )}

        <View className="rounded-2xl bg-brand-blue-light px-4 py-4 mb-10">
          <Text className="text-[15px] font-bold text-navy">Before Processing</Text>
          <Text className="mt-0.5 text-sm text-surface-muted">Please make sure:</Text>
          <View className="mt-2.5 space-y-2">
            {CHECKLIST.map((line, i) => (
              <View key={i} className="flex-row items-center gap-2.5 mb-2">
                <View className="h-5 w-5 items-center justify-center rounded-full bg-success">
                  <Ionicons name="checkmark" size={14} color="white" />
                </View>
                <Text className="text-sm text-navy flex-1">{line}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <AppFooter />
    </View>
  );
}
