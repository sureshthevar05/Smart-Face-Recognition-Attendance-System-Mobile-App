import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform } from "react-native";
import { AppHeader } from "../src/components/layout/AppHeader";
import { BottomNav } from "../src/components/layout/BottomNav";
import { Card } from "../src/components/ui/Card";
import { HistoryRecordCard } from "../src/components/history/HistoryRecordCard";
import { useAuth } from "../src/context/AuthContext";
import { getAttendanceHistory } from "../src/services/historyService";
import { ApiError } from "../src/services/apiClient";
import type { AttendanceHistoryRecord } from "../src/types/history";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";

function toYYYYMMDD(d: Date | null): number {
  if (!d) return 0;
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return (y * 10000) + (m * 100) + day;
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

function parseHistoryDateToYYYYMMDD(value: string): number {
  if (!value) return 0;
  
  const clean = String(value).trim();
  
  // Try "DD MMM YYYY" (e.g., "22 Aug 2026" or "17 August 2026")
  const strMatch = clean.match(/^(\d{1,2})\s+([a-zA-Z]{3,})\s+(\d{4})/i);
  if (strMatch) {
    const d = parseInt(strMatch[1], 10);
    const mStr = strMatch[2].toLowerCase().substring(0, 3);
    const m = MONTHS[mStr] || 1;
    const y = parseInt(strMatch[3], 10);
    return (y * 10000) + (m * 100) + d;
  }
  
  // Try YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    return (parseInt(ymdMatch[1], 10) * 10000) + (parseInt(ymdMatch[2], 10) * 100) + parseInt(ymdMatch[3], 10);
  }
  
  // Try DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return (parseInt(dmyMatch[3], 10) * 10000) + (parseInt(dmyMatch[2], 10) * 100) + parseInt(dmyMatch[1], 10);
  }
  
  // Fallback
  const t = Date.parse(clean);
  if (!Number.isNaN(t)) {
    const dt = new Date(t);
    return (dt.getFullYear() * 10000) + ((dt.getMonth() + 1) * 100) + dt.getDate();
  }

  // Unparseable
  return 99999999;
}

function formatDate(d: Date | null) {
  if (!d) return "Select date";
  return d.toISOString().split("T")[0];
}

export default function HistoryScreen() {
  const { user, logout } = useAuth();
  const facultyId = user?.facultyId ?? "";

  const [records, setRecords] = useState<AttendanceHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showToPicker, setShowToPicker] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const [courseOpen, setCourseOpen] = useState(false);
  const [courseFilter, setCourseFilter] = useState("All");

  const [query, setQuery] = useState("");

  const fetchHistory = useCallback(async () => {
    if (!facultyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAttendanceHistory(facultyId);
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load history.");
    } finally {
      setIsLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const statusOptions = useMemo(() => {
    const opts = Array.from(new Set(records.map((r) => r.status)));
    return [{ label: "All", value: "All" }, ...opts.map(o => ({ label: o, value: o }))];
  }, [records]);
  
  const courseOptions = useMemo(() => {
    const opts = Array.from(new Set(records.map((r) => r.course_code)));
    return [{ label: "All", value: "All" }, ...opts.map(o => ({ label: o, value: o }))];
  }, [records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    const fromInt = toYYYYMMDD(dateFrom);
    const toInt = toYYYYMMDD(dateTo);

    return records.filter((r) => {
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (courseFilter !== "All" && r.course_code !== courseFilter) return false;

      if (fromInt !== 0 || toInt !== 0) {
        const recordInt = parseHistoryDateToYYYYMMDD(r.date);
        
        // Exclude if record date is strictly less than 'from' date
        if (fromInt !== 0 && recordInt < fromInt) return false;
        
        // Exclude if record date is strictly greater than 'to' date
        if (toInt !== 0 && recordInt > toInt) return false;
      }

      if (q) {
        const haystack = `${r.course_code} ${r.course_name} ${r.class_group} ${r.date}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [records, statusFilter, courseFilter, dateFrom, dateTo, query]);

  return (
    <View className="flex-1 bg-surface">
      <AppHeader
        title="Attendance History"
        subtitle="View past attendance records"
        showMenu

      />
      
      <ScrollView className="flex-1 px-5 py-5" keyboardShouldPersistTaps="handled">
        {isLoading && (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#0B1E4D" />
          </View>
        )}

        {error && (
          <View className="items-center py-10">
            <Text className="text-danger mb-4 text-center">{error}</Text>
            <TouchableOpacity onPress={fetchHistory} className="bg-navy px-4 py-2 rounded-xl">
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && (
          <>
            <Card className="px-4 py-4 mb-4 z-50">
              <Text className="text-xs font-semibold uppercase tracking-wide text-surface-muted mb-2">
                Date Range
              </Text>
              
              <View className="flex-row items-center gap-2 mb-3">
                <View className="flex-1 border border-surface-border rounded-lg bg-white px-3 py-3 flex-row items-center">
                  <TouchableOpacity onPress={() => setShowFromPicker(true)} className="flex-1">
                    <Text className={`text-sm ${dateFrom ? "text-navy" : "text-surface-muted"}`}>
                      {formatDate(dateFrom)}
                    </Text>
                  </TouchableOpacity>
                  {dateFrom && (
                    <TouchableOpacity onPress={() => setDateFrom(null)}>
                      <Ionicons name="close-circle" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
                {showFromPicker && (
                  <DateTimePicker
                    value={dateFrom || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowFromPicker(false);
                      if (event.type === "set" && selectedDate) setDateFrom(selectedDate);
                    }}
                  />
                )}

                <Text className="text-sm text-surface-muted">to</Text>
                
                <View className="flex-1 border border-surface-border rounded-lg bg-white px-3 py-3 flex-row items-center">
                  <TouchableOpacity onPress={() => setShowToPicker(true)} className="flex-1">
                    <Text className={`text-sm ${dateTo ? "text-navy" : "text-surface-muted"}`}>
                      {formatDate(dateTo)}
                    </Text>
                  </TouchableOpacity>
                  {dateTo && (
                    <TouchableOpacity onPress={() => setDateTo(null)}>
                      <Ionicons name="close-circle" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
                {showToPicker && (
                  <DateTimePicker
                    value={dateTo || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowToPicker(false);
                      if (event.type === "set" && selectedDate) setDateTo(selectedDate);
                    }}
                  />
                )}
              </View>

              <View className="flex-row gap-2 mb-3" style={{ zIndex: 10 }}>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-surface-muted mb-1">Status</Text>
                  <DropDownPicker
                    open={statusOpen}
                    value={statusFilter}
                    items={statusOptions}
                    setOpen={setStatusOpen}
                    setValue={setStatusFilter}
                    listMode="SCROLLVIEW"
                    zIndex={2000}
                    zIndexInverse={1000}
                    style={{
                      borderColor: "#E5E9F2",
                      minHeight: 40,
                    }}
                    textStyle={{
                      fontSize: 14,
                      color: "#0B1E4D"
                    }}
                    dropDownContainerStyle={{
                      borderColor: "#E5E9F2",
                    }}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-surface-muted mb-1">Course</Text>
                  <DropDownPicker
                    open={courseOpen}
                    value={courseFilter}
                    items={courseOptions}
                    setOpen={setCourseOpen}
                    setValue={setCourseFilter}
                    listMode="SCROLLVIEW"
                    zIndex={1000}
                    zIndexInverse={2000}
                    style={{
                      borderColor: "#E5E9F2",
                      minHeight: 40,
                    }}
                    textStyle={{
                      fontSize: 14,
                      color: "#0B1E4D"
                    }}
                    dropDownContainerStyle={{
                      borderColor: "#E5E9F2",
                    }}
                  />
                </View>
              </View>

              <View className="flex-row gap-2 mt-1 z-0">
                <View className="flex-1 border border-surface-border rounded-lg bg-white px-3 h-[42px] flex-row items-center">
                  <Ionicons name="search" size={16} color="#6B7280" />
                  <TextInput
                    className="flex-1 ml-2 text-navy text-sm"
                    placeholder="Search class, faculty..."
                    value={query}
                    onChangeText={setQuery}
                  />
                </View>
              </View>
            </Card>

            <View className="z-0">
              {filtered.length === 0 ? (
                <Text className="py-8 text-center text-sm text-surface-muted">
                  No attendance records match your filters.
                </Text>
              ) : (
                <View className="space-y-3 pb-8">
                  {filtered.map((record, i) => (
                    <HistoryRecordCard key={`${record.date}-${record.time}-${record.course_code}-${i}`} record={record} />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
