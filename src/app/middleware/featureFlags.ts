export const featureFlags = {
  boardView: true,
  listView: true,
  timelineView: true,
  settingsView: true
} as const;

export type FeatureFlag = keyof typeof featureFlags;