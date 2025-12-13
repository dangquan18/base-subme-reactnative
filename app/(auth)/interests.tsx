import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { INTERESTS } from "@/constants/categories";

export default function InterestsScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    // TODO: Save interests to user profile
    router.replace("/(tabs)");
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bạn quan tâm đến?</Text>
          <Text style={styles.subtitle}>
            Chúng tôi sẽ gợi ý các gói phù hợp với sở thích của bạn
          </Text>
        </View>

        {/* Interests Grid */}
        <View style={styles.interestsGrid}>
          {INTERESTS.map((interest) => (
            <Pressable
              key={interest.id}
              style={[
                styles.interestCard,
                selectedInterests.includes(interest.id) &&
                  styles.interestCardSelected,
              ]}
              onPress={() => toggleInterest(interest.id)}
            >
              <Text style={styles.interestEmoji}>{interest.emoji}</Text>
              <Text
                style={[
                  styles.interestLabel,
                  selectedInterests.includes(interest.id) &&
                    styles.interestLabelSelected,
                ]}
              >
                {interest.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Bỏ qua</Text>
        </Pressable>

        <Pressable
          style={[
            styles.continueButton,
            selectedInterests.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedInterests.length === 0}
        >
          <Text style={styles.continueButtonText}>
            Tiếp tục ({selectedInterests.length})
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  interestCard: {
    width: "48%",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  interestCardSelected: {
    backgroundColor: "#EEF2FF",
    borderColor: "#667eea",
  },
  interestEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  interestLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  interestLabelSelected: {
    color: "#667eea",
  },
  footer: {
    flexDirection: "row",
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  continueButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#667eea",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
