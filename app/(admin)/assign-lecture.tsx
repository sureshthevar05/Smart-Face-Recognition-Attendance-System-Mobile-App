import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { API_BASE_URL } from '../../src/services/apiClient';

export default function AssignLecture() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data from Backend
  const [faculties, setFaculties] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);

  // Dropdown states
  const [facOpen, setFacOpen] = useState(false);
  const [facultyId, setFacultyId] = useState<string | null>(null);
  
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseCode, setCourseCode] = useState<string | null>(null);

  const [dayOpen, setDayOpen] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<string | null>(null);
  const days = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
  ];

  const [periodOpen, setPeriodOpen] = useState(false);
  const [periodId, setPeriodId] = useState<number | null>(null);

  // Target class states
  const [deptOpen, setDeptOpen] = useState(false);
  const [targetDept, setTargetDept] = useState<string | null>(null);
  const departments = [
    { label: 'CSE', value: 'CSE' },
    { label: 'IT', value: 'IT' },
    { label: 'ECE', value: 'ECE' },
    { label: 'MECH', value: 'MECH' },
    { label: 'CIVIL', value: 'CIVIL' },
  ];

  const [yearOpen, setYearOpen] = useState(false);
  const [targetYear, setTargetYear] = useState<string | null>(null);
  const years = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
  ];

  const [secOpen, setSecOpen] = useState(false);
  const [targetSec, setTargetSec] = useState<string | null>(null);
  const sections = [
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'D', value: 'D' },
  ];

  useEffect(() => {
    async function fetchMetadata() {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/metadata/`);
        const data = await res.json();
        
        setFaculties(data.faculties.map((f: any) => ({
          label: `${f.full_name} (${f.department})`,
          value: f.employee_id
        })));
        
        setCourses(data.courses.map((c: any) => ({
          label: `${c.course_code} - ${c.course_name}`,
          value: c.course_code
        })));
        
        setPeriods(data.periods.map((p: any) => ({
          label: `Period ${p.period_number} (${p.start_time.substring(0,5)} - ${p.end_time.substring(0,5)})`,
          value: p.period_number
        })));
      } catch (error) {
        Alert.alert('Error', 'Failed to load metadata from server');
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetadata();
  }, []);

  const handleSubmit = async () => {
    if (!facultyId || !courseCode || !dayOfWeek || !periodId || !targetDept || !targetYear || !targetSec) {
      Alert.alert('Missing Fields', 'Please complete all selections to assign the lecture.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/timetable/assign/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_id: facultyId,
          course_code: courseCode,
          day_of_week: dayOfWeek,
          period_number: periodId,
          target_department: targetDept,
          target_year: targetYear,
          target_section: targetSec,
          semester: "Odd 2026"
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Assignment failed');

      Alert.alert('Success', 'Lecture successfully assigned!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <AppHeader title="Assign Lecture" subtitle="Map faculty to a timetable slot" onBack={() => router.back()} />
      
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
          <Card className="p-5 mb-6 z-50">
            <Text className="text-sm font-bold text-navy mb-4 uppercase tracking-wider">Assignment Details</Text>
            
            <View className="gap-4">
              <View style={{ zIndex: 5000 }}>
                <Text className="text-xs font-semibold text-navy mb-1.5 ml-1">Faculty Member</Text>
                <DropDownPicker
                  open={facOpen} value={facultyId} items={faculties} setOpen={setFacOpen} setValue={setFacultyId}
                  placeholder="Select Faculty" listMode="SCROLLVIEW"
                  style={{ borderColor: '#E2E8F0', minHeight: 48, borderRadius: 12 }}
                  zIndex={5000} zIndexInverse={1000}
                />
              </View>

              <View style={{ zIndex: 4000 }}>
                <Text className="text-xs font-semibold text-navy mb-1.5 ml-1">Course</Text>
                <DropDownPicker
                  open={courseOpen} value={courseCode} items={courses} setOpen={setCourseOpen} setValue={setCourseCode}
                  placeholder="Select Course" listMode="SCROLLVIEW"
                  style={{ borderColor: '#E2E8F0', minHeight: 48, borderRadius: 12 }}
                  zIndex={4000} zIndexInverse={2000}
                />
              </View>

              <View style={{ zIndex: 3000, flexDirection: 'row', gap: 12 }}>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-navy mb-1.5 ml-1">Day</Text>
                  <DropDownPicker
                    open={dayOpen} value={dayOfWeek} items={days} setOpen={setDayOpen} setValue={setDayOfWeek}
                    placeholder="Day" listMode="SCROLLVIEW"
                    style={{ borderColor: '#E2E8F0', minHeight: 48, borderRadius: 12 }}
                    zIndex={3000} zIndexInverse={3000}
                  />
                </View>
                <View className="flex-[1.2]">
                  <Text className="text-xs font-semibold text-navy mb-1.5 ml-1">Period</Text>
                  <DropDownPicker
                    open={periodOpen} value={periodId} items={periods} setOpen={setPeriodOpen} setValue={setPeriodId}
                    placeholder="Period" listMode="SCROLLVIEW"
                    style={{ borderColor: '#E2E8F0', minHeight: 48, borderRadius: 12 }}
                    zIndex={3000} zIndexInverse={3000}
                  />
                </View>
              </View>

              <View style={{ zIndex: 2000 }}>
                <Text className="text-sm font-bold text-navy mt-4 mb-2 uppercase tracking-wider">Target Class</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View className="flex-[1.5]">
                    <DropDownPicker
                      open={deptOpen} value={targetDept} items={departments} setOpen={setDeptOpen} setValue={setTargetDept}
                      placeholder="Dept" listMode="SCROLLVIEW"
                      style={{ borderColor: '#E2E8F0', minHeight: 48, borderRadius: 12 }}
                      zIndex={2000} zIndexInverse={4000}
                    />
                  </View>
                  <View className="flex-1">
                    <DropDownPicker
                      open={yearOpen} value={targetYear} items={years} setOpen={setYearOpen} setValue={setTargetYear}
                      placeholder="Year" listMode="SCROLLVIEW"
                      style={{ borderColor: '#E2E8F0', minHeight: 48, borderRadius: 12 }}
                      zIndex={2000} zIndexInverse={4000}
                    />
                  </View>
                  <View className="flex-1">
                    <DropDownPicker
                      open={secOpen} value={targetSec} items={sections} setOpen={setSecOpen} setValue={setTargetSec}
                      placeholder="Sec" listMode="SCROLLVIEW"
                      style={{ borderColor: '#E2E8F0', minHeight: 48, borderRadius: 12 }}
                      zIndex={2000} zIndexInverse={4000}
                    />
                  </View>
                </View>
              </View>
            </View>
          </Card>

          <Button onPress={handleSubmit} isLoading={isSubmitting}>
            Assign Lecture
          </Button>
        </ScrollView>
      )}
    </View>
  );
}
