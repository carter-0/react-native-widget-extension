import { XcodeProject } from "@expo/config-plugins";
import * as util from "util";

import { WidgetFiles } from "../lib/getWidgetFiles";

function hasFramework(xcodeProject: XcodeProject, frameworksGroup: string, frameworkName: string): boolean {
  const group = xcodeProject.pbxGroupByName(frameworksGroup);
  if (!group) return false;
  
  return group.children.some((child: any) => 
    child.comment && child.comment.includes(frameworkName)
  );
}

function addFrameworkIfNeeded(xcodeProject: XcodeProject, frameworksGroup: string, frameworkName: string) {
  if (!hasFramework(xcodeProject, frameworksGroup, frameworkName)) {
    return xcodeProject.addFile(`${frameworkName}.framework`, frameworksGroup);
  }
  return null;
}

export function addBuildPhases(
  xcodeProject: XcodeProject,
  {
    targetUuid,
    groupName,
    productFile,
    widgetFiles,
  }: {
    targetUuid: string;
    groupName: string;
    productFile: {
      uuid: string;
      target: string;
      basename: string;
      group: string;
    };
    widgetFiles: WidgetFiles;
  }
) {
  const buildPath = `""`;
  const folderType = "app_extension";
  const namespacedGroupName = `${groupName}_buildphase`;

  const {
    swiftFiles,
    intentFiles,
    assetDirectories,
    entitlementFiles,
    plistFiles,
  } = widgetFiles;

  // Check if build phases already exist for this target
  const buildPhases = xcodeProject.pbxBuildPhaseObj(targetUuid);
  if (buildPhases) {
    return;
  }

  // Sources build phase with namespaced group
  xcodeProject.addBuildPhase(
    [...swiftFiles, ...intentFiles],
    "PBXSourcesBuildPhase",
    namespacedGroupName,
    targetUuid,
    folderType,
    buildPath
  );

  // Copy files build phase with namespaced group
  const copyPhase = xcodeProject.addBuildPhase(
    [],
    "PBXCopyFilesBuildPhase",
    namespacedGroupName,
    xcodeProject.getFirstTarget().uuid,
    folderType,
    buildPath
  );

  // Only add product file if not already present
  const existingFiles = copyPhase.files || [];
  if (!existingFiles.some((file: any) => file.value === productFile.uuid)) {
    xcodeProject
      .buildPhaseObject("PBXCopyFilesBuildPhase", namespacedGroupName, productFile.target)
      .files.push({
        value: productFile.uuid,
        comment: util.format("%s in %s", productFile.basename, productFile.group),
      });
    xcodeProject.addToPbxBuildFileSection(productFile);
  }

  // Frameworks build phase with checks for duplicates
  const frameworksPhase = xcodeProject.addBuildPhase(
    [],
    "PBXFrameworksBuildPhase",
    namespacedGroupName,
    targetUuid,
    folderType,
    buildPath
  );

  const frameworksGroup = xcodeProject.findPBXGroupKey({ name: "Frameworks" });
  const widgetKitFile = addFrameworkIfNeeded(xcodeProject, frameworksGroup, "WidgetKit");
  const swiftUIFile = addFrameworkIfNeeded(xcodeProject, frameworksGroup, "SwiftUI");

  // Only add frameworks to build phase if they were newly added
  if (widgetKitFile) {
    frameworksPhase.files.push({
      value: widgetKitFile.uuid,
      comment: "WidgetKit.framework in Frameworks",
    });
  }
  if (swiftUIFile) {
    frameworksPhase.files.push({
      value: swiftUIFile.uuid,
      comment: "SwiftUI.framework in Frameworks",
    });
  }

  // Resources build phase with namespaced group
  xcodeProject.addBuildPhase(
    [...assetDirectories],
    "PBXResourcesBuildPhase",
    namespacedGroupName,
    targetUuid,
    folderType,
    buildPath
  );
}
