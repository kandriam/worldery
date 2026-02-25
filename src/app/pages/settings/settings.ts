import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, SettingsData } from '../../services/settings.service';
import { WorldInfo, WorldInfoService } from '../../services/world.service';
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

  // Date format
  dateFormat: string = 'MMMM D, YYYY';
  weekDay: boolean = false;
  
  // Filter settings
  rememberFilters: boolean = true;
  showAdvancedFilters: boolean = false;

  // Export file name
  exportFileName: string = 'worldery_export.json';
  
  private settingsSubscription?: Subscription;
  private worldInfoService: WorldInfoService;
  
  constructor(private settingsService: SettingsService, worldInfoService: WorldInfoService) {
    this.worldInfoService = worldInfoService;
  }
  
  ngOnInit(): void {
    // Subscribe to settings changes
    this.settingsSubscription = this.settingsService.getSettings().subscribe(settings => {
      this.updateComponentFromSettings(settings);
    });

    this.worldInfoService 
    
    // Apply colors on init
    this.settingsService.applyColors();
    let worldName = 'worldery';
    this.worldInfoService.getWorld('0').subscribe(world => {
      if (world?.title) {
        const sanitizedWorldName = world.title.replace(/\s+/g, '_').toLowerCase();
        this.exportFileName = `${sanitizedWorldName}_export.json`;
        worldName = sanitizedWorldName ? sanitizedWorldName : 'worldery';
      }

      this.exportFileName = world ? `${worldName}_export.json` : 'worldery_export.json';
    });
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
    this.dateFormat = settings.dateFormat || 'MMMM D, YYYY';
    this.weekDay = settings.weekDay ?? false;
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
      showAdvancedFilters: this.showAdvancedFilters,
      dateFormat: this.dateFormat,
      weekDay: this.weekDay
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
      showAdvancedFilters: this.showAdvancedFilters,
      dateFormat: this.dateFormat,
      weekDay: this.weekDay
    };
    this.settingsService.applyColors(currentSettings);
  }
  
  exportData() {
    console.log('Exporting data in ts:', { exportFileName: this.exportFileName });
    this.settingsService.exportData(this.exportFileName);
  }
  
  importData(event: Event) {
    // Placeholder for import functionality
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      console.log('Import data in ts:', file.name);
      this.settingsService.importData(file).subscribe({
        next: () => {
          console.log('Data imported successfully');
        },
        error: (error) => {
          console.error('Error importing data:', error);
        }
      });
    }
  }

  deleteData() {
    if (confirm('Are you sure you want to delete all world data? This action cannot be undone. Please make sure you have exported any data you want to keep.')) {
      this.settingsService.deleteData();
      } else {
        console.log('World data deletion cancelled by user');
      }
  }

  getAllData() {
    this.settingsService.getAllData().subscribe({
      next: () => {
        console.log('All data fetched successfully');
      },
      error: (error) => {
        console.error('Error fetching all data:', error);
        }
      });
  }
}