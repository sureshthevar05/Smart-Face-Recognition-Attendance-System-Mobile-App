import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../../src/components/layout/AppHeader';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { API_BASE_URL } from '../../src/services/apiClient';

export default function EnrollStudent() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  // Dropdowns
  const [deptOpen, setDeptOpen] = useState(false);
  const [department, setDepartment] = useState<string | null>(null);
  const [departments] = useState([
    { label: 'CSE', value: 'CSE' },
    { label: 'IT', value: 'IT' },
    { label: 'ECE', value: 'ECE' },
    { label: 'MECH', value: 'MECH' },
    { label: 'CIVIL', value: 'CIVIL' },
    { label: 'EEE', value: 'EEE' },
    { label: 'AERO', value: 'AERO' },
  ]);

  const [yearOpen, setYearOpen] = useState(false);
  const [year, setYear] = useState<string | null>(null);
  const [years] = useState([
    { label: '1st Year', value: '1' },
    { label: '2nd Year', value: '2' },
    { label: '3rd Year', value: '3' },
    { label: '4th Year', value: '4' },
  ]);

  const [secOpen, setSecOpen] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const [sections] = useState([
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'D', value: 'D' },
    { label: 'E', value: 'E' },
  ]);

  const [images, setImages] = useState<{ uri: string }[]>([]);

  const pickImage = async (useCamera = false) => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only select up to 5 images.');
      return;
    }

    try {
      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Camera permission is required.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Gallery permission is required.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          selectionLimit: 5 - images.length,
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        const newImages = result.assets.map(asset => ({ uri: asset.uri }));
        setImages(prev => [...prev, ...newImages].slice(0, 5));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!fullName || !rollNumber || !department || !year || !section) {
      Alert.alert('Missing Fields', 'Please fill out all student details.');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Missing Images', 'Please add at least 1 image for enrollment.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('roll_number', rollNumber.toUpperCase());
      formData.append('department', department);
      formData.append('year', year);
      formData.append('section', section);

      images.forEach((img, idx) => {
        const ext = img.uri.split('.').pop() || 'jpg';
        formData.append('images', {
          uri: img.uri,
          name: `img_${idx + 1}.${ext}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        } as any);
      });

      const response = await fetch(`${API_BASE_URL}/api/enrollments/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to enroll student');
      }

      Alert.alert('Success', 'Student successfully enrolled!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Enrollment Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <AppHeader
        title="Enroll Student"
        subtitle="Register biometrics for new student"
        onBack={() => router.back()}
      />
      
      <ScrollView 
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <Card className="p-5 mb-6 z-50">
          <Text className="text-sm font-bold text-navy mb-4 uppercase tracking-wider">Student Details</Text>
          
          <View className="gap-4">
            <Input
              label="Full Name"
              placeholder="Enter full name"
              value={fullName}
              onChangeText={setFullName}
            />

            <Input
              label="Roll Number"
              placeholder="e.g. 21102045"
              value={rollNumber}
              onChangeText={setRollNumber}
              autoCapitalize="characters"
            />

            <View style={{ zIndex: 3000 }}>
              <Text className="text-xs font-semibold text-navy mb-1.5 ml-1">Department</Text>
              <DropDownPicker
                open={deptOpen}
                value={department}
                items={departments}
                setOpen={setDeptOpen}
                setValue={setDepartment}
                placeholder="Select Department"
                listMode="SCROLLVIEW"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', minHeight: 48, borderRadius: 12 }}
                textStyle={{ fontSize: 15, color: '#0B1E4D' }}
                dropDownContainerStyle={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', borderRadius: 12 }}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <View style={{ zIndex: 2000, flexDirection: 'row', gap: 12 }}>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-navy mb-1.5 ml-1">Year</Text>
                <DropDownPicker
                  open={yearOpen}
                  value={year}
                  items={years}
                  setOpen={setYearOpen}
                  setValue={setYear}
                  placeholder="Year"
                  listMode="SCROLLVIEW"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', minHeight: 48, borderRadius: 12 }}
                  textStyle={{ fontSize: 15, color: '#0B1E4D' }}
                  dropDownContainerStyle={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', borderRadius: 12 }}
                  zIndex={2000}
                  zIndexInverse={2000}
                />
              </View>
              
              <View className="flex-1">
                <Text className="text-xs font-semibold text-navy mb-1.5 ml-1">Section</Text>
                <DropDownPicker
                  open={secOpen}
                  value={section}
                  items={sections}
                  setOpen={setSecOpen}
                  setValue={setSection}
                  placeholder="Section"
                  listMode="SCROLLVIEW"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', minHeight: 48, borderRadius: 12 }}
                  textStyle={{ fontSize: 15, color: '#0B1E4D' }}
                  dropDownContainerStyle={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', borderRadius: 12 }}
                  zIndex={2000}
                  zIndexInverse={2000}
                />
              </View>
            </View>
          </View>
        </Card>

        <Card className="p-5 mb-8 z-10">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-bold text-navy uppercase tracking-wider">Face Images</Text>
            <Text className="text-xs font-medium text-surface-muted">{images.length}/5 Added</Text>
          </View>

          <View className="flex-row flex-wrap gap-3 mb-4">
            {images.map((img, idx) => (
              <View key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-surface-border">
                <Image source={{ uri: img.uri }} className="h-full w-full" />
                <TouchableOpacity 
                  onPress={() => removeImage(idx)}
                  className="absolute top-1 right-1 h-6 w-6 bg-black/50 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 5 && (
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={() => pickImage(true)}
                  className="h-20 w-20 rounded-xl border-2 border-dashed border-brand-blue/30 bg-brand-blue/5 items-center justify-center"
                >
                  <Ionicons name="camera" size={24} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => pickImage(false)}
                  className="h-20 w-20 rounded-xl border-2 border-dashed border-brand-blue/30 bg-brand-blue/5 items-center justify-center"
                >
                  <Ionicons name="images" size={24} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Button
            onPress={handleSubmit}
            isLoading={isLoading}
            disabled={images.length === 0 || !fullName || !rollNumber || !department || !year || !section}
          >
            Enroll Student
          </Button>
        </Card>
      </ScrollView>
    </View>
  );
}
