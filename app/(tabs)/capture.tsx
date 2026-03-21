import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { FieldLabel } from "@/components/FieldLabel";
import { Screen } from "@/components/Screen";
import { SectionCard } from "@/components/SectionCard";
import { REQUIRED_COPY } from "@/constants/foundproof";
import { theme } from "@/constants/theme";
import { categories } from "@/data/categories";
import { handoffOptions } from "@/data/handoff-types";
import { createDraftRecord, fetchCurrentLocation } from "@/services/records";
import { refineDescription, suggestFromImage } from "@/services/ai";
import { HandoffType } from "@/types/found-record";

export default function CaptureScreen() {
  const [imageUri, setImageUri] = useState<string>();
  const [capturedAt] = useState(new Date().toISOString());
  const [category, setCategory] = useState("wireless_earbuds");
  const [aiCategory, setAiCategory] = useState<string>();
  const [description, setDescription] = useState("");
  const [aiDescription, setAiDescription] = useState<string>();
  const [handoffType, setHandoffType] = useState<HandoffType>("station_counter");
  const [handoffNote, setHandoffNote] = useState("");
  const [locationLabel, setLocationLabel] = useState<string>();
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [locationHash, setLocationHash] = useState<string>();
  const [savedRecordId, setSavedRecordId] = useState<string>();
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssisting, setIsAssisting] = useState(false);

  async function selectImage(mode: "camera" | "library") {
    const result =
      mode === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.85
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.85
          });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri);
      setSavedRecordId(undefined);
    }
  }

  async function handleAssist() {
    if (!imageUri) {
      Alert.alert("Image required", "Add a photo before using AI assist.");
      return;
    }

    setIsAssisting(true);
    try {
      const suggestion = await suggestFromImage(imageUri);
      const nextDescription = await refineDescription(suggestion.category, description);
      setAiCategory(suggestion.category);
      setCategory(suggestion.category);
      setAiDescription(suggestion.description);
      setDescription(nextDescription);
    } catch (error) {
      Alert.alert("AI assist failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsAssisting(false);
    }
  }

  async function handleLocation() {
    setIsLocating(true);
    try {
      const current = await fetchCurrentLocation();
      setLatitude(current.latitude);
      setLongitude(current.longitude);
      setLocationLabel(current.locationLabel);
      setLocationHash(current.locationHash);
    } catch (error) {
      Alert.alert("Location unavailable", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLocating(false);
    }
  }

  async function handleSave() {
    if (!imageUri) {
      Alert.alert("Image required", "Capture or select an image first.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Description required", "Add a short neutral description.");
      return;
    }

    setIsSaving(true);
    try {
      const record = await createDraftRecord({
        imageUri,
        capturedAt,
        latitude,
        longitude,
        locationLabel,
        locationHash,
        category,
        aiCategory,
        description,
        aiDescription,
        handoffType,
        handoffNote
      });

      setSavedRecordId(record.id);
      Alert.alert("Record saved", "The finding event was stored off-chain.");
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen
      eyebrow="Capture"
      title="Document the finding event"
      description="Record the image, time, place, and institutional handoff path. FoundProof documents the event; it does not connect people directly."
    >
      <SectionCard>
        <FieldLabel
          label="Image evidence"
          supportingText="Capture the item as found. Images stay off-chain and are stored as discovery data."
        />
        <View style={styles.buttonRow}>
          <Pressable onPress={() => selectImage("camera")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Open camera</Text>
          </Pressable>
          <Pressable onPress={() => selectImage("library")} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Choose photo</Text>
          </Pressable>
        </View>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : null}
      </SectionCard>

      <SectionCard>
        <FieldLabel
          label="Time and location"
          supportingText="Time is captured immediately. Location is coarse-labeled for safer display and proof anchoring."
        />
        <Text style={styles.infoText}>Captured at: {new Date(capturedAt).toLocaleString()}</Text>
        <Text style={styles.infoText}>Area: {locationLabel ?? "Not captured yet"}</Text>
        <Pressable onPress={handleLocation} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>
            {isLocating ? "Locating..." : "Capture location"}
          </Text>
        </Pressable>
      </SectionCard>

      <SectionCard>
        <FieldLabel
          label="AI assist"
          supportingText="AI only suggests categories and short descriptions. It does not determine ownership or legality."
        />
        <Pressable onPress={handleAssist} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>
            {isAssisting ? "Generating..." : "Suggest category and description"}
          </Text>
        </Pressable>
        {aiCategory ? <Text style={styles.aiText}>AI category: {aiCategory}</Text> : null}
        {aiDescription ? <Text style={styles.aiText}>AI description: {aiDescription}</Text> : null}
      </SectionCard>

      <SectionCard>
        <FieldLabel label="Category" />
        <View style={styles.chipRow}>
          {categories.map((option) => {
            const isSelected = option === category;
            return (
              <Pressable
                key={option}
                onPress={() => setCategory(option)}
                style={[styles.chip, isSelected ? styles.chipSelected : null]}
              >
                <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                  {option.replaceAll("_", " ")}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard>
        <FieldLabel label="Description" />
        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="Describe the item and its condition in neutral terms."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.textArea}
          value={description}
        />
      </SectionCard>

      <SectionCard>
        <FieldLabel
          label="Handoff destination"
          supportingText="Select the institution expected to receive the item. FoundProof is not a direct handoff or marketplace flow."
        />
        <View style={styles.chipRow}>
          {handoffOptions.map((option) => {
            const isSelected = option.value === handoffType;
            return (
              <Pressable
                key={option.value}
                onPress={() => setHandoffType(option.value)}
                style={[styles.chip, isSelected ? styles.chipSelected : null]}
              >
                <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          onChangeText={setHandoffNote}
          placeholder="Optional operational note"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          value={handoffNote}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.policyHeadline}>{REQUIRED_COPY.en.noPeer}</Text>
        <Text style={styles.policyText}>{REQUIRED_COPY.en.institution}</Text>
        <Text style={styles.policyText}>{REQUIRED_COPY.ja.institution}</Text>
      </SectionCard>

      <View style={styles.footerActions}>
        <Pressable onPress={handleSave} style={styles.primaryButton}>
          {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Save record</Text>}
        </Pressable>
        <Pressable
          disabled={!savedRecordId}
          onPress={() => savedRecordId && router.push(`/proof/${savedRecordId}`)}
          style={[styles.secondaryButton, !savedRecordId ? styles.disabledButton : null]}
        >
          <Text style={styles.secondaryButtonText}>Open proof flow</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accentStrong,
    borderRadius: theme.radius.sm,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.sm,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  disabledButton: {
    opacity: 0.45
  },
  previewImage: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    height: 240,
    width: "100%"
  },
  infoText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  aiText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  chip: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  chipSelected: {
    backgroundColor: "#d9efe7"
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  chipTextSelected: {
    color: theme.colors.accentStrong
  },
  textArea: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    color: theme.colors.text,
    minHeight: 112,
    padding: 14,
    textAlignVertical: "top"
  },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    color: theme.colors.text,
    minHeight: 50,
    paddingHorizontal: 14
  },
  policyHeadline: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  policyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  },
  footerActions: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl
  }
});
