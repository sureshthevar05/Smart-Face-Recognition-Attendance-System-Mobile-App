import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { AppHeader } from "../src/components/layout/AppHeader";
import { AppFooter } from "../src/components/layout/AppFooter";
import { MethodCard } from "../src/components/start-attendance/MethodCard";
import { Card } from "../src/components/ui/Card";
import { useAttendanceFlow } from "../src/context/AttendanceFlowContext";
import { Ionicons } from "@expo/vector-icons";

const MAX_IMAGES = 5;
const INSTRUCTIONS = [
  "Capture clear images with proper lighting",
  "Make sure all students' faces are visible",
  "Avoid blur or dark images",
  'Click "Process Attendance" after preview',
];

export default function StartAttendanceScreen() {
  const router = useRouter();
  const { addImages, images, selectedSlot } = useAttendanceFlow();
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSlot) {
      router.replace("/timetable");
    }
  }, [selectedSlot, router]);

  const handleAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
    if (!assets || assets.length === 0) return;
    
    // Check max images logic
    const availableSlots = MAX_IMAGES - images.length;
    const toAdd = assets.slice(0, availableSlots);
    const rejected = assets.length - toAdd.length;

    addImages(toAdd.map(a => ({
      uri: a.uri,
      name: a.fileName || a.uri.split('/').pop() || "image.jpg",
      type: a.mimeType || "image/jpeg"
    })));

    if (rejected > 0) {
      setWarning(`Only ${MAX_IMAGES} images allowed. ${rejected} were omitted.`);
    } else {
      setWarning(null);
    }

    if (toAdd.length > 0 || images.length > 0) {
      router.push("/image-preview");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      handleAssets(result.assets);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      handleAssets(result.assets);
    }
  };

  if (!selectedSlot) return null;

  return (
    <View className="flex-1 bg-surface">
      <AppHeader
        title="Start Attendance"
        subtitle="Choose a method to capture images"
        onBack={() => router.push("/timetable")}
      />

      <ScrollView className="flex-1 px-5 py-5 space-y-4">
        <View className="rounded-xl border border-brand-blue/30 bg-brand-blue-light px-4 py-3 mb-4">
          <Text className="font-semibold text-navy">
            {selectedSlot.courseCode ?? "Selected class"}
            {selectedSlot.courseName ? ` — ${selectedSlot.courseName}` : ""}
          </Text>
          {selectedSlot.time && (
            <Text className="text-xs text-navy/70 mt-1">{selectedSlot.time}</Text>
          )}
        </View>

        {warning && (
          <View className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 mb-4">
            <Text className="text-sm text-navy">{warning}</Text>
          </View>
        )}

        <View className="mb-4">
          <MethodCard
            title="Upload Images"
            description="Upload class photos from your device"
            buttonLabel="Choose Images"
            variant="upload"
            icon={<Ionicons name="images" size={36} color="white" />}
            onTrigger={pickImage}
          />
        </View>

        <View className="mb-4">
          <MethodCard
            title="Use Camera"
            description="Capture photos using your device camera"
            buttonLabel="Open Camera"
            variant="camera"
            icon={<Ionicons name="camera" size={36} color="white" />}
            onTrigger={takePhoto}
          />
        </View>

        <Card className="px-5 py-4 mb-10">
          <Text className="text-sm font-bold text-navy mb-2">Instructions</Text>
          {INSTRUCTIONS.map((line, i) => (
            <View key={i} className="flex-row items-start gap-2 mb-1.5">
              <View className="mt-1.5 h-1 w-1 rounded-full bg-surface-muted" />
              <Text className="text-sm text-surface-muted flex-1">{line}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      <AppFooter />
    </View>
  );
}
