import type { MeridioProject } from '../types/project';
import { loadProjectsFromStorage, saveProjectsToStorage } from '../types/project';

export function getProjects(): MeridioProject[] {
  return loadProjectsFromStorage();
}

export function setProjects(projects: MeridioProject[]): void {
  saveProjectsToStorage(projects);
}

export function getProjectById(id: string): MeridioProject | undefined {
  return getProjects().find(p => p.id === id);
}

export function upsertProject(project: MeridioProject): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  setProjects(projects);
}

export function deleteProject(id: string): void {
  setProjects(getProjects().filter(p => p.id !== id));
}
