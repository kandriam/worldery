import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CurrentWorldDateService {
  private readonly KEY = 'currentWorldDate';
  private subject = new BehaviorSubject<string | null>(localStorage.getItem(this.KEY));

  /** Emits the raw date string (YYYY-MM-DD) whenever the world date changes. Null = use system date. */
  readonly date$ = this.subject.asObservable();

  /** Returns the current world date, or today if none is set. */
  getDate(): Date {
    const v = this.subject.value;
    return v ? new Date(v + 'T00:00:00') : new Date();
  }

  /** Returns the raw stored date string, or null if not set. */
  getRaw(): string | null {
    return this.subject.value;
  }

  /** Returns the date formatted for display, or empty string if not set. */
  getFormatted(): string {
    const raw = this.subject.value;
    if (!raw) return '';
    const d = new Date(raw + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  isSet(): boolean {
    return !!this.subject.value;
  }

  /** Set the current world date from an event's date string (YYYY-MM-DD). */
  set(dateStr: string) {
    localStorage.setItem(this.KEY, dateStr);
    this.subject.next(dateStr);
  }

  /** Reset to use the system date. */
  clear() {
    localStorage.removeItem(this.KEY);
    this.subject.next(null);
  }

  /**
   * Returns a human-readable relative label for an event date vs. a reference date.
   * @param eventDateStr  The event whose date you want labelled (YYYY-MM-DD).
   * @param fromDateStr   Optional reference point. Defaults to the current world date.
   * e.g. "3 years before", "2 months later", "Current date"
   */
  relativeLabel(eventDateStr: string, fromDateStr?: string): string {
    if (!eventDateStr) return '';
    const current = fromDateStr ? new Date(fromDateStr + 'T00:00:00') : this.getDate();
    current.setHours(0, 0, 0, 0);
    const event = new Date(eventDateStr + 'T00:00:00');
    const diffDays = Math.round((event.getTime() - current.getTime()) / 86_400_000);
    if (diffDays === 0) return 'Current date';

    const abs = Math.abs(diffDays);
    const dir = diffDays < 0 ? 'before' : 'later';

    if (abs < 14) {
      return `${abs} day${abs !== 1 ? 's' : ''} ${dir}`;
    }
    if (abs < 60) {
      const w = Math.round(abs / 7);
      return `${w} week${w !== 1 ? 's' : ''} ${dir}`;
    }
    if (abs < 730) {
      const m = Math.round(abs / 30.44);
      return `${m} month${m !== 1 ? 's' : ''} ${dir}`;
    }
    const y = Math.round(abs / 365.25);
    return `${y} year${y !== 1 ? 's' : ''} ${dir}`;
  }
}
