import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, SettingsData } from '../../services/settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css', '../pages.css']
})
export class Settings implements OnInit, OnDestroy {
  // Application settings - these will be populated from the service
  theme: string = 'default';
  autoSave: boolean = true;
  showThumbnails: boolean = true;
  itemsPerPage: number = 12;
  defaultSort: string = 'name';
  fontSize: string = 'medium';
  
  // Color assignments
  eventColor: string = 'blue';
  locationColor: string = 'green';
  characterColor: string = 'orange';
  storyColor: string = 'purple';
  
  // Export/Import settings
  exportFormat: string = 'json';
  includeImages: boolean = false;
  
  // Filter settings
  rememberFilters: boolean = true;
  showAdvancedFilters: boolean = false;
  
  private settingsSubscription?: Subscription;
  
  constructor(private settingsService: SettingsService) {}
  
  ngOnInit(): void {
    // Subscribe to settings changes
    this.settingsSubscription = this.settingsService.getSettings().subscribe(settings => {
      this.updateComponentFromSettings(settings);
    });
    
    // Apply colors on init
    this.settingsService.applyColors();
  }
  
  ngOnDestroy(): void {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
  
  private updateComponentFromSettings(settings: SettingsData): void {
    this.theme = settings.theme;
    this.autoSave = settings.autoSave;
    this.showThumbnails = settings.showThumbnails;
    this.itemsPerPage = settings.itemsPerPage;
    this.defaultSort = settings.defaultSort;
    this.fontSize = settings.fontSize;
    this.eventColor = settings.eventColor;
    this.locationColor = settings.locationColor;
    this.characterColor = settings.characterColor;
    this.storyColor = settings.storyColor;
    this.exportFormat = settings.exportFormat;
    this.includeImages = settings.includeImages;
    this.rememberFilters = settings.rememberFilters;
    this.showAdvancedFilters = settings.showAdvancedFilters;
  }
  
  saveSettings() {
    const settings: SettingsData = {
      theme: this.theme,
      autoSave: this.autoSave,
      showThumbnails: this.showThumbnails,
      itemsPerPage: this.itemsPerPage,
      defaultSort: this.defaultSort,
      fontSize: this.fontSize,
      eventColor: this.eventColor,
      locationColor: this.locationColor,
      characterColor: this.characterColor,
      storyColor: this.storyColor,
      exportFormat: this.exportFormat,
      includeImages: this.includeImages,
      rememberFilters: this.rememberFilters,
      showAdvancedFilters: this.showAdvancedFilters
    };
    
    this.settingsService.saveSettings(settings);
    this.settingsService.applyColors(settings);
  }
  
  resetSettings() {
    this.settingsService.resetSettings();
    this.settingsService.applyColors();
  }
  
  onColorChange() {
    // Create current settings and apply colors immediately for preview
    const currentSettings: SettingsData = {
      theme: this.theme,
      autoSave: this.autoSave,
      showThumbnails: this.showThumbnails,
      itemsPerPage: this.itemsPerPage,
      defaultSort: this.defaultSort,
      fontSize: this.fontSize,
      eventColor: this.eventColor,
      locationColor: this.locationColor,
      characterColor: this.characterColor,
      storyColor: this.storyColor,
      exportFormat: this.exportFormat,
      includeImages: this.includeImages,
      rememberFilters: this.rememberFilters,
      showAdvancedFilters: this.showAdvancedFilters
    };
    
    this.settingsService.applyColors(currentSettings);
  }
  
  exportData() {
    // Placeholder for export functionality
    console.log('Export data functionality would be implemented here');
  }
  
  importData(event: Event) {
    // Placeholder for import functionality
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      console.log('Import data functionality would be implemented here for file:', file.name);
    }
  }
}