import { ConfigPlugin } from "@expo/config-plugins";

import { addApplicationGroupsEntitlement, getWidgetExtensionEntitlements } from "./lib/getWidgetExtensionEntitlements";

export const withConfig: ConfigPlugin<{
  bundleIdentifier: string;
  targetName: string;
  groupIdentifier?: string;
}> = (config, { bundleIdentifier, targetName, groupIdentifier }) => {
  // Store all matching extension indices
  const configIndices: number[] = [];
  config.extra?.eas?.build?.experimental?.ios?.appExtensions?.forEach((ext: any, index: number) => {
    if (ext.targetName === targetName) {
      configIndices.push(index);
    }
  });

  // Handle each matching extension
  configIndices.forEach(index => {
    const widgetsExtensionConfig = config.extra?.eas?.build?.experimental?.ios?.appExtensions?.[index];

    if (!widgetsExtensionConfig) {
      return config;
    }

    widgetsExtensionConfig.entitlements = {
      ...widgetsExtensionConfig.entitlements,
      ...getWidgetExtensionEntitlements(config.ios, {
        groupIdentifier,
      }),
    };

    config.ios = {
      ...config.ios,
      entitlements: {
        ...addApplicationGroupsEntitlement(config.ios?.entitlements ?? {}, groupIdentifier),
      },
    };
  });

  return config;
};
