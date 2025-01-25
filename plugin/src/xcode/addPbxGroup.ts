import { XcodeProject } from "@expo/config-plugins";

import { WidgetFiles } from "../lib/getWidgetFiles";

export function addPbxGroup(
  xcodeProject: XcodeProject,
  {
    targetName,
    widgetFiles,
  }: {
    targetName: string;
    widgetFiles: WidgetFiles;
  }
) {
  const {
    swiftFiles,
    intentFiles,
    otherFiles,
    assetDirectories,
    entitlementFiles,
    plistFiles,
  } = widgetFiles;

  // Check if group already exists
  const groups = xcodeProject.hash.project.objects["PBXGroup"];
  const existingGroup = Object.keys(groups).find(key => groups[key].name === targetName);
  if (existingGroup) {
    return { uuid: existingGroup };
  }

  // Create namespaced paths for files
  const namespacedFiles = [
    ...swiftFiles,
    ...intentFiles,
    ...otherFiles,
    ...entitlementFiles,
    ...plistFiles,
    ...assetDirectories,
    `${targetName}.entitlements`,
  ].map(file => ({
    path: file,
    sourceTree: "<group>",
    name: `${targetName}_${file.split('/').pop()}`
  }));

  // Add PBX group with namespaced path
  const { uuid: pbxGroupUuid } = xcodeProject.addPbxGroup(
    namespacedFiles,
    targetName,
    `${targetName}_group`
  );

  // Add PBXGroup to top level group if not already present
  if (pbxGroupUuid) {
    let mainGroupFound = false;
    Object.keys(groups).forEach(function (key) {
      if (groups[key].name === undefined && groups[key].path === undefined) {
        const groupChildren = groups[key].children || [];
        if (!groupChildren.some((child: any) => child.value === pbxGroupUuid)) {
          xcodeProject.addToPbxGroup(pbxGroupUuid, key);
        }
        mainGroupFound = true;
      }
    });

    // Create main group if it doesn't exist
    if (!mainGroupFound) {
      const mainGroup = xcodeProject.addPbxGroup([], 'Resources', 'Resources');
      xcodeProject.addToPbxGroup(pbxGroupUuid, mainGroup.uuid);
    }
  }

  return { uuid: pbxGroupUuid };
}
