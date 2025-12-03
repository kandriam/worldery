import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SettingsData {
  theme: string;
  autoSave: boolean;
  showThumbnails: boolean;
  itemsPerPage: number;
  defaultSort: string;
  fontSize: string;
  eventColor: string;
  locationColor: string;
  characterColor: string;
  storyColor: string;
  exportFormat: string;
  includeImages: boolean;
  rememberFilters: boolean;
  showAdvancedFilters: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'worldery-settings';
  
  private defaultSettings: SettingsData = {
    theme: 'default',
    autoSave: true,
    showThumbnails: true,
    itemsPerPage: 12,
    defaultSort: 'name',
    fontSize: 'medium',
    eventColor: 'blue',
    locationColor: 'green',
    characterColor: 'orange',
    storyColor: 'purple',
    exportFormat: 'json',
    includeImages: false,
    rememberFilters: true,
    showAdvancedFilters: false
  };

  // BehaviorSubject to emit settings changes
  private settingsSubject = new BehaviorSubject<SettingsData>(this.defaultSettings);
  
  // Observable for components to subscribe to settings changes
  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.loadSettings();
  }

  // Get current settings synchronously
  getCurrentSettings(): SettingsData {
    return this.settingsSubject.value;
  }

  // Get settings as observable
  getSettings(): Observable<SettingsData> {
    return this.settings$;
  }

  // Save settings
  saveSettings(settings: SettingsData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      this.settingsSubject.next(settings);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Load settings from localStorage
  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem(this.STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        const mergedSettings = { ...this.defaultSettings, ...parsedSettings };
        this.settingsSubject.next(mergedSettings);
      } else {
        this.settingsSubject.next(this.defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settingsSubject.next(this.defaultSettings);
    }
  }

  // Reset to default settings
  resetSettings(): void {
    this.saveSettings(this.defaultSettings);
  }

  // Update specific setting
  updateSetting<K extends keyof SettingsData>(key: K, value: SettingsData[K]): void {
    const currentSettings = this.getCurrentSettings();
    const updatedSettings = { ...currentSettings, [key]: value };
    this.saveSettings(updatedSettings);
  }

  // Get specific setting value
  getSetting<K extends keyof SettingsData>(key: K): SettingsData[K] {
    return this.getCurrentSettings()[key];
  }

  // Color mapping methods
  getColorValue(colorName: string): string {
    const colorMap: {[key: string]: string} = {
      'red': '#e37b7a',
      'orange': '#f1b75f', 
      'yellow': '#faea77',
      'green': '#9dc870',
      'blue': '#67bfce',
      'purple': '#9c83b7'
    };
    return colorMap[colorName] || colorMap['blue'];
  }

  getHighlightColorValue(colorName: string): string {
    const highlightColorMap: {[key: string]: string} = {
      'red': '#ebaec7',
      'orange': '#f4c790',
      'yellow': '#fff1b3', 
      'green': '#9ccca4',
      'blue': '#b4dce7',
      'purple': '#d9c2db'
    };
    return highlightColorMap[colorName] || highlightColorMap['blue'];
  }

  // Apply colors to CSS custom properties
  applyColors(settings?: SettingsData): void {
    const currentSettings = settings || this.getCurrentSettings();
    const root = document.documentElement;
    
    // Apply event colors
    root.style.setProperty('--event-color', this.getColorValue(currentSettings.eventColor));
    root.style.setProperty('--event-highlight-color', this.getHighlightColorValue(currentSettings.eventColor));
    
    // Apply location colors
    root.style.setProperty('--location-color', this.getColorValue(currentSettings.locationColor));
    root.style.setProperty('--location-highlight-color', this.getHighlightColorValue(currentSettings.locationColor));
    
    // Apply character colors
    root.style.setProperty('--character-color', this.getColorValue(currentSettings.characterColor));
    root.style.setProperty('--character-highlight-color', this.getHighlightColorValue(currentSettings.characterColor));
    
    // Apply story colors
    root.style.setProperty('--story-color', this.getColorValue(currentSettings.storyColor));
    root.style.setProperty('--story-highlight-color', this.getHighlightColorValue(currentSettings.storyColor));
  }
}