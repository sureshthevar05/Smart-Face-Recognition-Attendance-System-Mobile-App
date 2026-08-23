import ImageView from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { AppHeader } from "../src/components/layout/AppHeader";
import { AppFooter } from "../src/components/layout/AppFooter";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { useAttendanceFlow } from "../src/context/AttendanceFlowContext";
import { resolveMediaUrl } from "../src/services/attendanceService";
import type { AttendanceRecord, PendingReviewItem } from "../src/types/attendance";

const screenWidth = Dimensions.get('window').width;

function SummaryCards({ present, absent }: { present: number; absent: number }) {
  return (
    <View className="flex-row gap-4 mb-6">
      <View className="flex-1 rounded-2xl bg-white border border-surface-border p-4 shadow-sm items-center justify-center">
        <View className="h-8 w-8 rounded-full bg-success/20 items-center justify-center mb-2">
          <Ionicons name="checkmark" size={18} color="#16A34A" />
        </View>
        <Text className="text-xs text-navy font-semibold mb-1">Present</Text>
        <Text className="text-3xl font-extrabold text-success">{present}</Text>
      </View>
      
      <View className="flex-1 rounded-2xl bg-white border border-surface-border p-4 shadow-sm items-center justify-center">
        <View className="h-8 w-8 rounded-full bg-danger/10 items-center justify-center mb-2">
          <Ionicons name="person-outline" size={16} color="#DC2626" />
        </View>
        <Text className="text-xs text-navy font-semibold mb-1">Absent</Text>
        <Text className="text-3xl font-extrabold text-danger">{absent}</Text>
      </View>
    </View>
  );
}

function AnnotatedImage({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  const formattedImages = images.map(img => ({ uri: resolveMediaUrl(img) }));

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[15px] font-bold text-navy">Annotated Image</Text>
        <Text className="text-xs font-semibold text-brand-blue">{currentIndex + 1} of {images.length}</Text>
      </View>
      <View className="rounded-xl overflow-hidden bg-black/5 relative">
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / (screenWidth - 40));
            setCurrentIndex(index);
          }}
        >
          {images.map((img, i) => (
            <TouchableOpacity key={i} activeOpacity={0.9} onPress={() => setIsViewerVisible(true)}>
              <Image
                source={{ uri: resolveMediaUrl(img) }}
                style={{ width: screenWidth - 40, height: 200 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View className="flex-row items-center mt-2.5 gap-4">
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-success" />
          <Text className="text-[11px] text-surface-muted font-semibold">Present</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-danger" />
          <Text className="text-[11px] text-surface-muted font-semibold">Absent</Text>
        </View>
      </View>
      
      <ImageView
        images={formattedImages}
        imageIndex={currentIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    </View>
  );
}

function PendingReviewList({ items, onResolve }: { items: PendingReviewItem[]; onResolve: (item: PendingReviewItem, accept: boolean) => void }) {
  if (!items || items.length === 0) return null;
  return (
    <View className="rounded-2xl border border-brand-blue/20 bg-[#F4F7FB] p-5 mb-8">
      <Text className="text-[13px] font-bold text-navy uppercase tracking-wider mb-2">PENDING REVIEW ({items.length})</Text>
      <Text className="text-[13px] text-navy leading-relaxed mb-4">
        The following faces were detected but not confidently matched. Please confirm or reject the suggestions.
      </Text>
      
      {items.map((item) => (
        <View key={item.id} className="flex-row items-center bg-white rounded-2xl p-3 shadow-sm border border-surface-border mb-2">
          <Image source={{ uri: resolveMediaUrl(item.image_url) }} className="h-12 w-12 rounded-lg mr-3 bg-surface" />
          <View className="flex-1">
            <Text className="text-sm font-bold text-navy">{item.display_name}</Text>
            <Text className="text-xs text-brand-blue mt-0.5">Similarity: {item.similarity.toFixed(1)}%</Text>
          </View>
          <View className="flex-row gap-3 mr-1">
            <TouchableOpacity onPress={() => onResolve(item, false)} className="h-8 w-8 items-center justify-center">
              <Ionicons name="close" size={20} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onResolve(item, true)} className="h-8 w-8 items-center justify-center rounded-full bg-success/20">
              <Ionicons name="checkmark" size={18} color="#16A34A" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

function AttendanceRow({ record, isEditing, onToggle }: { record: AttendanceRecord; isEditing: boolean; onToggle: () => void }) {
  const isPresent = record.status === 'present';
  
  return (
    <TouchableOpacity 
      disabled={!isEditing}
      onPress={onToggle}
      className="flex-row items-center justify-between border-b border-surface-border py-3 px-4 bg-white"
    >
      <View className="flex-row items-center flex-1">
        <Ionicons 
          name={isPresent ? "checkbox" : "square-outline"} 
          size={22} 
          color={isPresent ? "#2563EB" : "#E5E7EB"} 
          style={{ marginRight: 12 }}
        />
        <View className="flex-1">
          <Text className="font-semibold text-navy text-[13px]">{record.roll_number}</Text>
          <Text className="text-[11px] text-surface-muted uppercase mt-0.5">{record.display_name}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-end flex-1 max-w-[120px]">
        <Text className="text-xs text-surface-muted flex-1 text-center">{record.department || 'CSE'}</Text>
        <Text className="text-xs text-brand-blue flex-1 text-center">{record.year || '4th'}</Text>
        <Text className="text-xs text-navy flex-1 text-center">{record.section || 'C'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const {
    result,
    effectiveAttendance,
    isEditing,
    setIsEditing,
    pendingCorrections,
    toggleStatus,
    cancelChanges,
    hasPendingChanges,
    saveAttendance,
    saveStatus,
    saveError,
    resetFlow,
  } = useAttendanceFlow();

  const [search, setSearch] = useState("");
  const [showAllAbsent, setShowAllAbsent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Local state to hide resolved pending reviews
  const [resolvedReviews, setResolvedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!result) {
      router.replace("/start-attendance");
    }
  }, [result, router]);

  if (!result) return null;

  const filteredAttendance = effectiveAttendance.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.display_name.toLowerCase().includes(q) || r.roll_number.toLowerCase().includes(q);
  });

  const presentStudents = filteredAttendance.filter((r) => r.status === "present");
  const absentStudents = filteredAttendance.filter((r) => r.status === "absent");
  const presentCount = effectiveAttendance.filter((r) => r.status === "present").length;
  const absentCount = effectiveAttendance.filter((r) => r.status === "absent").length;

  const pendingItems = (result.pending_review || []).filter(item => !resolvedReviews.has(item.id));

  function handleStartNewSession() {
    resetFlow();
    router.push("/start-attendance");
  }

  function handleResolvePending(item: PendingReviewItem, accept: boolean) {
    setResolvedReviews(prev => new Set(prev).add(item.id));
    if (accept) {
      const record = effectiveAttendance.find(r => r.student_id === item.student_id);
      if (record && record.status !== 'present') {
        toggleStatus(item.student_id);
        setToastMessage(`${item.display_name} has been marked present.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  }

  function handleToggle(record: AttendanceRecord) {
    toggleStatus(record.student_id);
    const newStatus = record.status === 'present' ? 'absent' : 'present';
    if (newStatus === 'present') {
      setToastMessage(`${record.display_name} has been marked present.`);
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage(null); // Just hide if any
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <AppHeader
        title="Attendance Result & Verification"
        subtitle="Review, verify and save the attendance"
        onBack={handleStartNewSession}
      />

      <ScrollView className="flex-1 px-5 py-5 pb-32">
        
        <SummaryCards present={presentCount} absent={absentCount} />
        
        <AnnotatedImage images={result.annotated_images} />

        <PendingReviewList items={pendingItems} onResolve={handleResolvePending} />

        <View className="flex-row items-center justify-between mb-4 mt-2">
          <Text className="text-[15px] font-extrabold text-navy">Attendance List</Text>
          <TouchableOpacity 
            onPress={() => setIsEditing(!isEditing)} 
            className="flex-row items-center gap-1.5 rounded-full border border-brand-blue/30 px-3 py-1.5 bg-white shadow-sm"
          >
            <Ionicons name={isEditing ? "checkmark" : "pencil"} size={14} color="#2563EB" />
            <Text className="text-xs font-bold text-brand-blue">{isEditing ? "Done Editing" : "Edit Attendance"}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center gap-2 mb-6 z-10">
          <View className="flex-1 flex-row items-center bg-white border border-surface-border rounded-xl px-3 h-11">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput 
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or roll number..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-[13px] text-navy h-full"
            />
          </View>
          <TouchableOpacity className="h-11 px-4 items-center justify-center bg-white border border-surface-border rounded-xl shadow-sm">
            <Text className="text-sm font-semibold text-navy">All</Text>
          </TouchableOpacity>
        </View>

        {/* ABSENT LIST */}
        <View className="flex-row items-center mb-3">
          <View className="h-2 w-2 rounded-full bg-danger mr-2" />
          <Text className="font-extrabold text-navy text-[13px]">ABSENT ({absentStudents.length})</Text>
        </View>
        <Card className="p-0 overflow-hidden mb-2 shadow-sm border border-surface-border">
          {absentStudents.slice(0, showAllAbsent ? undefined : 4).map((record, idx) => (
            <AttendanceRow
              key={record.student_id}
              record={record}
              isEditing={isEditing}
              onToggle={() => handleToggle(record)}
            />
          ))}
          {absentStudents.length === 0 && (
            <View className="p-4 items-center">
              <Text className="text-surface-muted text-sm">No absent students</Text>
            </View>
          )}
        </Card>
        {!showAllAbsent && absentStudents.length > 4 && (
          <TouchableOpacity onPress={() => setShowAllAbsent(true)} className="mb-4 pl-1">
            <Text className="text-brand-blue text-[13px] font-semibold">View all {absentStudents.length} absentees v</Text>
          </TouchableOpacity>
        )}

        {/* PRESENT LIST */}
        <View className="flex-row items-center mb-3 mt-4">
          <View className="h-2 w-2 rounded-full bg-success mr-2" />
          <Text className="font-extrabold text-navy text-[13px]">PRESENT ({presentStudents.length})</Text>
        </View>
        <Card className="p-0 overflow-hidden mb-6 shadow-sm border border-surface-border">
          {presentStudents.map((record, idx) => (
            <AttendanceRow
              key={record.student_id}
              record={record}
              isEditing={isEditing}
              onToggle={() => handleToggle(record)}
            />
          ))}
          {presentStudents.length === 0 && (
            <View className="p-4 items-center">
              <Text className="text-surface-muted text-sm">No present students</Text>
            </View>
          )}
        </Card>

      </ScrollView>

      {/* Floating Toaster */}
      {toastMessage && (
        <View className="absolute bottom-24 left-5 right-5 rounded-xl border border-success/30 bg-[#E8F5E9] px-4 py-3 flex-row items-center shadow-md">
          <View className="h-6 w-6 rounded-full bg-success items-center justify-center mr-3">
            <Ionicons name="checkmark" size={14} color="white" />
          </View>
          <Text className="flex-1 text-[13px] font-bold text-navy">{toastMessage}</Text>
          <TouchableOpacity onPress={() => setToastMessage(null)}>
            <Ionicons name="close" size={18} color="#16A34A" />
          </TouchableOpacity>
        </View>
      )}

      {/* Footer Buttons */}
      <View className="flex-row gap-3 px-5 pb-8 pt-4 bg-white border-t border-surface-border">
        {hasPendingChanges && (
          <View className="flex-1">
            <Button variant="outline" onPress={cancelChanges}>Cancel</Button>
          </View>
        )}
        <View className="flex-1">
          <Button isLoading={saveStatus === "pending"} onPress={() => {
            if (hasPendingChanges) saveAttendance();
            else handleStartNewSession();
          }}>
            {hasPendingChanges ? "Save Changes" : "Confirm"}
          </Button>
        </View>
      </View>
    </View>
  );
}
