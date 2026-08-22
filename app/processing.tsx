import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { AppHeader } from "../src/components/layout/AppHeader";
import { AppFooter } from "../src/components/layout/AppFooter";
import { Card } from "../src/components/ui/Card";
import { Button } from "../src/components/ui/Button";
import { ProcessingTimeline } from "../src/components/processing/ProcessingTimeline";
import { useProcessingAnimation } from "../src/hooks/useProcessingAnimation";
import { useAttendanceFlow } from "../src/context/AttendanceFlowContext";

export default function ProcessingScreen() {
  const router = useRouter();
  const { processStatus, processError, retryProcessing, images } = useAttendanceFlow();

  useEffect(() => {
    if (processStatus === "idle" && images.length === 0) {
      router.replace("/start-attendance");
    }
  }, [processStatus, images.length, router]);

  const { progress, stageStatuses, hasReachedFinalStage } = useProcessingAnimation(
    processStatus === "pending" || processStatus === "success",
    processStatus === "success"
  );

  useEffect(() => {
    if (hasReachedFinalStage && processStatus === "success") {
      router.replace("/result");
    }
  }, [hasReachedFinalStage, processStatus, router]);

  const showError = processStatus === "error";

  return (
    <View className="flex-1 bg-surface">
      <AppHeader title="Processing Attendance" subtitle="Please wait while we process the images" />

      <ScrollView className="flex-1 px-5 py-5">
        <Card className="px-5 py-6">
          <ProcessingTimeline progress={progress} statuses={stageStatuses} />
        </Card>

        {showError ? (
          <View className="mt-4 p-4 rounded-xl border border-danger/40 bg-white items-center">
            <Text className="text-danger font-bold text-lg">Processing failed</Text>
            <Text className="text-surface-muted text-sm mt-1 mb-4 text-center">
              {processError ?? "We couldn't process this attendance session. Please try again."}
            </Text>
            <Button variant="danger" onPress={retryProcessing} className="mb-2 w-full">Retry Processing</Button>
            <Button variant="outline" onPress={() => router.push("/image-preview")} fullWidth>Back to Preview</Button>
          </View>
        ) : (
          <View className="mt-4 flex-row items-start gap-2.5 rounded-2xl bg-brand-blue-light px-4 py-3.5 mb-10">
            <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-brand-blue">
              <Text className="text-white text-[11px] font-bold">i</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-navy">Please don't close the app</Text>
              <Text className="mt-0.5 text-[13px] leading-snug text-navy/80">
                Keep this screen open while we process your attendance. You will be redirected automatically once complete.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <AppFooter />
    </View>
  );
}
