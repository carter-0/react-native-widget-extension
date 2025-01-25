import { XcodeProject } from "@expo/config-plugins";

export function addTargetDependency(
  xcodeProject: XcodeProject,
  target: { uuid: string }
) {
  // Check if dependency already exists by looking directly at the project objects
  const targetDependencies = xcodeProject.hash.project.objects["PBXTargetDependency"] || {};
  const hasExistingDependency = Object.values(targetDependencies).some(
    (dep: any) => dep.target === target.uuid
  );
  
  if (!hasExistingDependency) {
    if (!xcodeProject.hash.project.objects["PBXTargetDependency"]) {
      xcodeProject.hash.project.objects["PBXTargetDependency"] = {};
    }
    if (!xcodeProject.hash.project.objects["PBXContainerItemProxy"]) {
      xcodeProject.hash.project.objects["PBXContainerItemProxy"] = {};
    }

    xcodeProject.addTargetDependency(xcodeProject.getFirstTarget().uuid, [
      target.uuid,
    ]);
  }
}
