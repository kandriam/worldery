import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {WorldCharacterInfo} from '../../worldcharacter';
import {WorldStoryInfo} from '../../worldstory';
import {WorldLocationInfo} from '../../worldlocation';

export interface FilterConfig {
  showCharacters?: boolean;
  showStories?: boolean;
  showLocations?: boolean;
  showDateRange?: boolean;
}

export interface FilterState {
  searchText: string;
  searchTerms: string[];
  selectedCharacters: string[];
  selectedStories: string[];
  selectedLocations: string[];
  startDate: string;
  endDate: string;
  isStartDateEnabled: boolean;
  isEndDateEnabled: boolean;
}

// Helper function for multi-term text matching
export function matchesSearchTerms(searchTerms: string[], ...textFields: string[]): boolean {
  if (searchTerms.length === 0) return true;
  
  const combinedText = textFields
    .filter(field => field) // Remove null/undefined fields
    .join(' ')
    .toLowerCase();
  
  return searchTerms.every(term => combinedText.includes(term));
}

@Component({
  selector: 'app-search-filter',
  templateUrl: 'search-filter.html',
  styleUrls: ['./search-filter.css'],
})
export class SearchFilter {
  @Input() searchPlaceholder: string = 'Search (comma-separated for multiple terms)';
  @Input() searchLabel: string = 'Search';
  @Input() filterConfig: FilterConfig = {
    showCharacters: true,
    showStories: true,
    showLocations: true,
    showDateRange: true
  };
  @Input() allCharacters: WorldCharacterInfo[] = [];
  @Input() allStories: WorldStoryInfo[] = [];
  @Input() allLocations: WorldLocationInfo[] = [];

  @Output() filterChange = new EventEmitter<FilterState>();

  // Filter state
  selectedCharacters: string[] = [];
  selectedStories: string[] = [];
  selectedLocations: string[] = [];
  isStartDateEnabled: boolean = false;
  isEndDateEnabled: boolean = false;
  isFiltersExpanded: boolean = false;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('startDateFilter') startDateFilter!: ElementRef<HTMLInputElement>;
  @ViewChild('endDateFilter') endDateFilter!: ElementRef<HTMLInputElement>;
  @ViewChild('startDateEnabled') startDateEnabledCheckbox!: ElementRef<HTMLInputElement>;
  @ViewChild('endDateEnabled') endDateEnabledCheckbox!: ElementRef<HTMLInputElement>;

  onSearchChange() {
    this.emitFilterState();
  }

  onCharacterFilterChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    if (target.checked) {
      this.selectedCharacters.push(value);
    } else {
      this.selectedCharacters = this.selectedCharacters.filter(char => char !== value);
    }
    this.emitFilterState();
  }
  
  onStoryFilterChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    if (target.checked) {
      this.selectedStories.push(value);
    } else {
      this.selectedStories = this.selectedStories.filter(story => story !== value);
    }
    this.emitFilterState();
  }
  
  onLocationFilterChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    if (target.checked) {
      this.selectedLocations.push(value);
    } else {
      this.selectedLocations = this.selectedLocations.filter(loc => loc !== value);
    }
    this.emitFilterState();
  }
  
  onStartDateToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.isStartDateEnabled = target.checked;
    if (!this.isStartDateEnabled && this.startDateFilter) {
      this.startDateFilter.nativeElement.value = '';
    }
    this.emitFilterState();
  }
  
  onEndDateToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.isEndDateEnabled = target.checked;
    if (!this.isEndDateEnabled && this.endDateFilter) {
      this.endDateFilter.nativeElement.value = '';
    }
    this.emitFilterState();
  }

  onDateChange() {
    this.emitFilterState();
  }
  
  toggleFilters() {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  clearAllFilters() {
    // Clear text search
    if (this.searchInput) this.searchInput.nativeElement.value = '';
    
    // Clear date filters and disable them
    if (this.startDateFilter) this.startDateFilter.nativeElement.value = '';
    if (this.endDateFilter) this.endDateFilter.nativeElement.value = '';
    if (this.startDateEnabledCheckbox) this.startDateEnabledCheckbox.nativeElement.checked = false;
    if (this.endDateEnabledCheckbox) this.endDateEnabledCheckbox.nativeElement.checked = false;
    this.isStartDateEnabled = false;
    this.isEndDateEnabled = false;
    
    // Clear checkbox arrays
    this.selectedCharacters = [];
    this.selectedStories = [];
    this.selectedLocations = [];
    
    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll('.filter-checkbox') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(checkbox => checkbox.checked = false);
    
    this.emitFilterState();
  }

  addSearchTerm(term: string) {
    if (!this.searchInput) return;
    
    const currentValue = this.searchInput.nativeElement.value;
    const currentTerms = currentValue
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    // Don't add if term already exists
    if (!currentTerms.includes(term)) {
      const newValue = currentTerms.length > 0 ? `${currentValue}, ${term}` : term;
      this.searchInput.nativeElement.value = newValue;
      this.emitFilterState();
    }
  }

  clearSearchBar() {
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
      this.emitFilterState();
    }
  }

  private emitFilterState() {
    const searchText = this.searchInput?.nativeElement.value || '';
    const searchTerms = searchText
      .split(',')
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);
    
    const filterState: FilterState = {
      searchText: searchText,
      searchTerms: searchTerms,
      selectedCharacters: this.selectedCharacters,
      selectedStories: this.selectedStories,
      selectedLocations: this.selectedLocations,
      startDate: this.isStartDateEnabled ? (this.startDateFilter?.nativeElement.value || '') : '',
      endDate: this.isEndDateEnabled ? (this.endDateFilter?.nativeElement.value || '') : '',
      isStartDateEnabled: this.isStartDateEnabled,
      isEndDateEnabled: this.isEndDateEnabled
    };
    this.filterChange.emit(filterState);
  }
}