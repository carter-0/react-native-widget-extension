import { ConfigPlugin, IOSConfig, withPlugins } from "@expo/config-plugins";
import { withConfig } from "./withConfig";
import { withPodfile } from "./withPodfile";

import { withWidgetExtensionEntitlements } from "./withWidgetExtensionEntitlements";
import { withXcode } from "./withXcode";

const withWidgetsAndLiveActivities: ConfigPlugin<{
  frequentUpdates?: boolean;
  widgetsFolder?: string;
  deploymentTarget?: string;
  moduleFileName?: string;
  attributesFileName?: string;
  groupIdentifier?: string;
  appClipBundleId?: string;
}> = (
  config,
  {
    frequentUpdates = false,
    widgetsFolder = "widgets",
    deploymentTarget = "16.2",
    moduleFileName = "Module.swift",
    attributesFileName = "Attributes.swift",
    groupIdentifier,
    appClipBundleId,
  }
) => {
  const targetName = `${IOSConfig.XcodeUtils.sanitizedName(
    config.name
  )}ClipWidgets`;
  const bundleIdentifier = appClipBundleId ? `${appClipBundleId}.${targetName}` : `${config.ios?.bundleIdentifier}.${targetName}`;

  config.ios = {
    ...config.ios,
    infoPlist: {
      ...config.ios?.infoPlist,
      NSSupportsLiveActivities: true,
      NSSupportsLiveActivitiesFrequentUpdates: frequentUpdates,
    },
  };

  config = withPlugins(config, [
    [
      withXcode,
      {
        targetName,
        bundleIdentifier,
        deploymentTarget,
        widgetsFolder,
        moduleFileName,
        attributesFileName,
      },
    ],
    [withWidgetExtensionEntitlements, { targetName, groupIdentifier }],
    [withPodfile, { targetName }],
    [withConfig, { targetName, bundleIdentifier, groupIdentifier }],
  ]);

  return config;
};

export default withWidgetsAndLiveActivities;
