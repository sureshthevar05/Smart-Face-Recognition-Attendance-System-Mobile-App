import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { PROCESSING_STAGES, StageStatus } from "../../hooks/useProcessingAnimation";

function StageStatusIndicator({ status }: { status: StageStatus }) {
  if (status === "completed") {
    return (
      <View className="h-6 w-6 items-center justify-center rounded-full bg-success">
        <Ionicons name="checkmark" size={14} color="white" />
      </View>
    );
  }
  if (status === "in_progress") {
    return (
      <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-blue">
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }
  return (
    <View className="h-6 w-6 items-center justify-center rounded-full bg-surface">
      <View className="h-2 w-2 rounded-full bg-surface-muted" />
    </View>
  );
}

export function ProcessingTimeline({ progress, statuses }: { progress: number; statuses: StageStatus[] }) {
  return (
    <View>
      <View className="items-center">
        <View className="h-20 w-20 items-center justify-center rounded-2xl bg-brand-blue-light">
          <Ionicons name="scan-outline" size={36} color="#0B1E4D" />
        </View>

        <Text className="mt-4 text-lg font-bold text-navy">Processing in Progress</Text>
        <Text className="mt-1.5 text-center text-sm text-surface-muted px-4">
          Our AI is detecting and recognizing students. This may take a few moments.
        </Text>

        <View className="mt-4 h-2 w-full rounded-full bg-surface overflow-hidden">
          <View className="h-full rounded-full bg-brand-blue" style={{ width: `${progress}%` }} />
        </View>
        <Text className="mt-2 text-sm font-semibold text-brand-blue">
          {Math.round(progress)}% Complete
        </Text>
      </View>

      <View className="mt-5 border-t border-surface-border">
        {PROCESSING_STAGES.map((stage, i) => (
          <View key={stage} className={`flex-row items-center py-3.5 ${i < PROCESSING_STAGES.length - 1 ? 'border-b border-surface-border' : ''}`}>
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-blue-light mr-3">
              <Text className="text-brand-blue font-bold">{i + 1}</Text>
            </View>
            <Text className={`flex-1 text-sm font-semibold ${statuses[i] === 'pending' ? 'text-surface-muted' : 'text-navy'}`}>
              {stage}
            </Text>
            <StageStatusIndicator status={statuses[i]} />
          </View>
        ))}
      </View>
    </View>
  );
}

