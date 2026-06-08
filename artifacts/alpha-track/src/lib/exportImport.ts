import type { MeridioProject } from '../types/project';
import { loadProjectsFromStorage, saveProjectsToStorage } from '../types/project';

export function exportProjects(): string {
  const projects = loadProjectsFromStorage();
  return JSON.stringify(projects, null, 2);
}

export function importProjects(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) return { success: false, count: 0, error: 'Invalid format' };
    saveProjectsToStorage(data as MeridioProject[]);
    return { success: true, count: data.length };
  } catch (e) {
    return { success: false, count: 0, error: String(e) };
  }
}
