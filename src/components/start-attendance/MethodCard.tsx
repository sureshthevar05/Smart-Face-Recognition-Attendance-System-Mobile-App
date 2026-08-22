import React, { ReactNode } from "react";
import { View, Text } from "react-native";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export function MethodCard({
  icon,
  title,
  description,
  buttonLabel,
  onTrigger,
  variant = "upload",
}: {
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onTrigger: () => void;
  variant?: "upload" | "camera";
}) {
  const iconBg = variant === "upload" ? "bg-brand-blue" : "bg-navy";

  return (
    <Card className="items-center px-6 py-7">
      <View className={`h-20 w-20 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </View>
      <Text className="mt-4 text-lg font-bold text-navy text-center">{title}</Text>
      <Text className="mt-1 text-sm text-surface-muted text-center max-w-[230px]">
        {description}
      </Text>
      <Button className="mt-5 px-10" fullWidth={false} onPress={onTrigger}>
        {buttonLabel}
      </Button>
    </Card>
  );
}
