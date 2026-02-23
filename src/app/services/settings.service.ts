import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, forkJoin, switchMap } from 'rxjs';

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
  timeMeasurement?: 'gregorian' | 'custom' | 'none';
  dateFormat?: string; // e.g. 'YYYY-MM-DD', 'MMMM D, YYYY', etc.
  weekDay?: boolean; // Show weekday in formatted date
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly API_URL = 'http://localhost:3000';
  private readonly SETTINGS_ENDPOINT = `${this.API_URL}/settings`;
  
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
    showAdvancedFilters: false,
    timeMeasurement: 'gregorian',
    dateFormat: 'MMMM D, YYYY',
    weekDay: false
  };

  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  weekDays: string[] = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  // Format a date string using settings
  formatDate(date: string, settings?: SettingsData): string {
    const opts = settings || this.getCurrentSettings();
    if (!date) return '';
    const [year, month, day] = date.split('-');
    if (!year) return '';
    let formatted = '';
    let dateObj: Date | undefined = undefined;
    if (year && month && day) {
      dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    }
    // Use custom format if provided
    switch (opts.dateFormat) {
      case 'YYYY-MM-DD':
        formatted = `${year}-${month || '01'}-${day || '01'}`;
        break;
      case 'MM/DD/YYYY':
        formatted = `${month?.padStart(2, '0') || '01'}/${day?.padStart(2, '0') || '01'}/${year}`;
        break;
      case 'DD/MM/YYYY':
        formatted = `${day?.padStart(2, '0') || '01'}/${month?.padStart(2, '0') || '01'}/${year}`;
        break;
      case 'D MMMM YYYY':
        {
          const m = month ? this.months[parseInt(month, 10) - 1] : '';
          formatted = m && day ? `${parseInt(day, 10)} ${m} ${year}` : m ? `${m} ${year}` : year;
        }
        break;
      case 'MMMM D, YYYY':
      default:
        const m = month ? this.months[parseInt(month, 10) - 1] : '';
        formatted = m && day ? `${m} ${parseInt(day, 10)}, ${year}` : m ? `${m} ${year}` : year;
        break;
    }
    if (opts.weekDay && dateObj && !isNaN(dateObj.getTime())) {
      const weekDayStr = this.weekDays[dateObj.getDay()];
      formatted = `${weekDayStr}, ${formatted}`;
    }
    return formatted;
  }

  // BehaviorSubject to emit settings changes
  private settingsSubject = new BehaviorSubject<SettingsData>(this.defaultSettings);
  
  // Observable for components to subscribe to settings changes
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {
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
    this.http.put(this.SETTINGS_ENDPOINT, settings)
      .pipe(
        catchError(error => {
          console.error('Error saving settings:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.settingsSubject.next(settings);
            console.log('Settings saved successfully');
          }
        },
        error: (error) => {
          console.error('Error saving settings:', error);
        }
      });
  }

  // Load settings from JSON server
  private loadSettings(): void {
    this.http.get<SettingsData>(this.SETTINGS_ENDPOINT)
      .pipe(
        catchError(error => {
          console.error('Error loading settings:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (settings) => {
          if (settings) {
            const mergedSettings = { ...this.defaultSettings, ...settings };
            this.settingsSubject.next(mergedSettings);
          } else {
            // If no settings found, save and use defaults
            this.settingsSubject.next(this.defaultSettings);
            this.saveSettings(this.defaultSettings);
          }
        },
        error: (error) => {
          console.error('Error loading settings:', error);
          this.settingsSubject.next(this.defaultSettings);
        }
      });
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

  // Export data functionality
  // Export all characters, locations, events, and stories to a JSON file
  exportData(fileName: string): void {
    let data: any = {
      worldinfo: null,
      worldcharacters: null,
      worldlocations: null,
      worldevents: null,
      worldstories: null
    };

    for (let key of ['worldinfo', 'worldcharacters', 'worldlocations', 'worldevents', 'worldstories', 'settings']) {
      this.http.get(`${this.API_URL}/${key}`)
      .pipe(
        catchError(error => {
          console.error(`Error exporting ${key} data:`, error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          data[key] = response;
          // Check if all data has been fetched
          if (data.worldcharacters !== null && data.worldlocations !== null && data.worldevents !== null && data.worldstories !== null) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'worldery_export.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log('Data exported successfully');
          }
        }
      });
    }
  }

  importData(file: File): Observable<void> {
    console.log('Importing data from file:', file.name);
    return new Observable<void>((observer) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          const requests: Observable<any>[] = [];

          // Helper to POST each item in an array
          const postItems = (endpoint: string, items: any[]) => {
            return items.map(item =>
              this.http.post(`${this.API_URL}/${endpoint}`, item).pipe(
                catchError(err => {
                  console.error(`Error importing ${endpoint} item:`, err);
                  return of(null);
                })
              )
            );
          };
          if (Array.isArray(json.worldinfo)) {
            requests.push(...postItems('worldinfo', json.worldinfo));
          }
          if (Array.isArray(json.worldcharacters)) {
            requests.push(...postItems('worldcharacters', json.worldcharacters));
          }
          if (Array.isArray(json.worldlocations)) {
            requests.push(...postItems('worldlocations', json.worldlocations));
          }
          if (Array.isArray(json.worldevents)) {
            requests.push(...postItems('worldevents', json.worldevents));
          }
          if (Array.isArray(json.worldstories)) {
            requests.push(...postItems('worldstories', json.worldstories));
          }
          if (json.settings) {
            requests.push(
              this.http.put(this.SETTINGS_ENDPOINT, json.settings).pipe(
                catchError(err => {
                  console.error('Error importing settings:', err);
                  return of(null);
                })
              )
            );
          }

          if (requests.length === 0) {
            observer.complete();
            return;
          }

          forkJoin(requests).subscribe({
            next: () => {
              console.log('Import complete');
              observer.next();
              observer.complete();
            },
            error: (err) => {
              console.error('Error during import:', err);
              observer.error(err);
            }
          });
        } catch (e) {
          console.error('Invalid JSON in import file:', e);
          observer.error(e);
        }
      };
      reader.onerror = (e) => {
        console.error('File read error:', e);
        observer.error(e);
      };
      reader.readAsText(file);
    });
  }

  getAllData(): Observable<void> {
    console.log('Fetching world data...');
    for (let key of ['worldcharacters', 'worldlocations', 'worldevents', 'worldstories']) {
      this.http.get(`${this.API_URL}/${key}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching ${key} data:`, error);
          return of([]);
        })
      )
      .subscribe({
        next: (response) => {
          console.log(`Fetched ${key} data:`, response);
        }
      });
    }
    return of(undefined);
  }  

async deleteData(): Promise<void> {
  console.log('Deleting world data...');
  const keys = ['worldinfo', 'worldcharacters', 'worldlocations', 'worldevents', 'worldstories'];

  for (const key of keys) {
    try {
      const items = await this.http.get<any[]>(`${this.API_URL}/${key}`)
        .pipe(catchError(error => {
          console.error(`Error fetching ${key} data for deletion:`, error);
          return of([]);
        }))
        .toPromise();

      const safeItems = items ?? [];
      for (const item of safeItems) {
        if (item && item.id) {
          await this.http.delete(`${this.API_URL}/${key}/${item.id}`)
            .pipe(catchError(error => {
              console.error(`Error deleting ${key} item with id ${item.id}:`, error);
              return of(null);
            }))
            .toPromise();
        }
      }
    } catch (error) {
      console.error(`Error during deletion for ${key}:`, error);
    }
  }

  console.log('DELETION COMPLETE.');
  this.getAllData();
}
}