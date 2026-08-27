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

function parseExifDate(exifString: string): Date | null {
  if (!exifString) return null;
  const parts = exifString.split(" ");
  if (parts.length !== 2) return null;
  const [y, m, d] = parts[0].split(":");
  const [H, M, S] = parts[1].split(":");
  if (!y || !m || !d || !H || !M || !S) return null;
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(H), parseInt(M), parseInt(S));
}

function parseSlotTimeBounds(timeString: string): { start: Date, end: Date } | null {
  if (!timeString) return null;
  const parts = timeString.split("-").map(s => s.trim());
  if (parts.length !== 2) return null;
  
  const parseTime = (tStr: string) => {
    const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let [_, h, m, ampm] = match;
    let hours = parseInt(h, 10);
    const mins = parseInt(m, 10);
    if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
    
    const d = new Date();
    d.setHours(hours, mins, 0, 0);
    return d;
  };
  
  const start = parseTime(parts[0]);
  const end = parseTime(parts[1]);
  if (!start || !end) return null;
  return { start, end };
}

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
    
    // Front-end EXIF validation
    const validAssets: ImagePicker.ImagePickerAsset[] = [];
    const bounds = selectedSlot?.time ? parseSlotTimeBounds(selectedSlot.time) : null;
    let rejectedByTime = 0;
    let rejectedByMissingExif = 0;

    for (const asset of assets) {
      if (!asset.exif || !asset.exif.DateTimeOriginal) {
        rejectedByMissingExif++;
        continue;
      }
      if (bounds) {
        const captureTime = parseExifDate(asset.exif.DateTimeOriginal);
        if (!captureTime) {
          rejectedByMissingExif++;
          continue;
        }
        
        // 15 minute tolerance
        const minTime = new Date(bounds.start.getTime() - 15 * 60000);
        const maxTime = new Date(bounds.end.getTime() + 15 * 60000);
        
        if (captureTime < minTime || captureTime > maxTime) {
          rejectedByTime++;
          continue;
        }
      }
      validAssets.push(asset);
    }

    if (rejectedByMissingExif > 0) {
      Alert.alert("Invalid Photo", "One or more photos were rejected because they lack original timestamp data (e.g. screenshots or WhatsApp downloads). Please use the original photo.");
    } else if (rejectedByTime > 0) {
      Alert.alert("Invalid Timestamp", "One or more photos were rejected because they were not taken during the scheduled class period.");
    }

    if (validAssets.length === 0) return;

    // Check max images logic
    const availableSlots = MAX_IMAGES - images.length;
    const toAdd = validAssets.slice(0, availableSlots);
    const rejectedByLimit = validAssets.length - toAdd.length;

    addImages(toAdd.map(a => ({
      uri: a.uri,
      name: a.fileName || a.uri.split('/').pop() || "image.jpg",
      type: a.mimeType || "image/jpeg",
      captureTime: a.exif?.DateTimeOriginal
    })));

    if (rejectedByLimit > 0) {
      setWarning(`Only ${MAX_IMAGES} images allowed. ${rejectedByLimit} were omitted.`);
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
      exif: true,
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
      exif: true,
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
