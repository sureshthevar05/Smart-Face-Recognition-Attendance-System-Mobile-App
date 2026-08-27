import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image, Dimensions, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppHeader } from "../../src/components/layout/AppHeader";
import { useAuth } from "../../src/context/AuthContext";
import { getAttendanceHistory } from "../../src/services/historyService";
import type { AttendanceHistoryRecord } from "../../src/types/history";
import type { AttendanceRecord } from "../../src/types/attendance";
import { Ionicons } from "@expo/vector-icons";
import ImageView from "react-native-image-viewing";
import { resolveMediaUrl } from "../../src/services/attendanceService";
import { Card } from "../../src/components/ui/Card";

const screenWidth = Dimensions.get('window').width;

function AnnotatedImage({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;
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

function AttendanceRow({ record }: { record: AttendanceRecord }) {
  const isPresent = record.status === 'present';
  
  return (
    <View className="flex-row items-center justify-between border-b border-surface-border py-3 px-4 bg-white">
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
    </View>
  );
}

export default function HistoryDetailScreen() {
  const { session_id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin === true;
  const facultyId = user?.facultyId ?? "";

  const [record, setRecord] = useState<AttendanceHistoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [showAllAbsent, setShowAllAbsent] = useState(false);

  const fetchRecord = useCallback(async () => {
    if ((!facultyId && !isAdmin) || !session_id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAttendanceHistory(isAdmin ? undefined : facultyId);
      const found = data.find((r) => String(r.session_id) === String(session_id));
      if (found) {
        setRecord(found);
      } else {
        setError("Session not found.");
      }
    } catch (err) {
      setError("Failed to load details.");
    } finally {
      setIsLoading(false);
    }
  }, [facultyId, session_id, isAdmin]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleExport = () => {
    Alert.alert("Export", "CSV export is mocked for React Native in this demo.");
  };

  const filteredAttendance = record?.attendance?.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.display_name.toLowerCase().includes(q) || r.roll_number.toLowerCase().includes(q);
  }) || [];

  const present = filteredAttendance.filter((r) => r.status === "present");
  const absent = filteredAttendance.filter((r) => r.status === "absent");

  return (
    <View className="flex-1 bg-surface">
      <AppHeader
        title={record ? `${record.course_code} - ${record.date}` : "Session Details"}
        subtitle={record ? record.time : ""}
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1 px-5 py-5 pb-16">
        {isLoading && (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#0B1E4D" />
          </View>
        )}

        {error && (
          <View className="items-center py-10">
            <Text className="text-danger mb-4 text-center">{error}</Text>
          </View>
        )}

        {record && (
          <View className="space-y-6 pb-10">
            <View className="rounded-2xl border border-surface-border bg-white px-4 py-4 mb-4 shadow-sm">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-bold text-navy">{record.course_name}</Text>
                  <Text className="text-xs text-surface-muted mt-0.5">{record.class_group}</Text>
                  <Text className="text-xs text-surface-muted mt-1">{record.time}</Text>
                </View>
                {record.attendance && (
                  <TouchableOpacity
                    onPress={handleExport}
                    className="flex-row items-center gap-1 rounded-full border border-brand-blue/30 bg-white px-3 py-1.5 shadow-sm"
                  >
                    <Ionicons name="download-outline" size={14} color="#2563EB" />
                    <Text className="text-xs font-bold text-brand-blue">Export</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Annotated Images */}
            {record.annotated_images && <AnnotatedImage images={record.annotated_images} />}

            {/* Attendance Lists */}
            {record.attendance && (
              <View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-[15px] font-extrabold text-navy">Attendance List</Text>
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
                  <Text className="font-extrabold text-navy text-[13px]">ABSENT ({absent.length})</Text>
                </View>
                <Card className="p-0 overflow-hidden mb-2 shadow-sm border border-surface-border">
                  {absent.slice(0, showAllAbsent ? undefined : 4).map((record, idx) => (
                    <AttendanceRow key={record.student_id} record={record} />
                  ))}
                  {absent.length === 0 && (
                    <View className="p-4 items-center">
                      <Text className="text-surface-muted text-sm">No absent students</Text>
                    </View>
                  )}
                </Card>
                {!showAllAbsent && absent.length > 4 && (
                  <TouchableOpacity onPress={() => setShowAllAbsent(true)} className="mb-4 pl-1">
                    <Text className="text-brand-blue text-[13px] font-semibold">View all {absent.length} absentees v</Text>
                  </TouchableOpacity>
                )}

                {/* PRESENT LIST */}
                <View className="flex-row items-center mb-3 mt-4">
                  <View className="h-2 w-2 rounded-full bg-success mr-2" />
                  <Text className="font-extrabold text-navy text-[13px]">PRESENT ({present.length})</Text>
                </View>
                <Card className="p-0 overflow-hidden mb-6 shadow-sm border border-surface-border">
                  {present.map((record, idx) => (
                    <AttendanceRow key={record.student_id} record={record} />
                  ))}
                  {present.length === 0 && (
                    <View className="p-4 items-center">
                      <Text className="text-surface-muted text-sm">No present students</Text>
                    </View>
                  )}
                </Card>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
