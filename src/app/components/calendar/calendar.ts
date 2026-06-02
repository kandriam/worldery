import { Component, Input, Output, EventEmitter, OnChanges, OnInit, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldEventInfo } from '../../services/world-event.service';
import { Router } from '@angular/router';
import { CurrentWorldDateService } from '../../services/current-world-date.service';
import { Subscription } from 'rxjs';

type CalendarView = 'month' | 'year';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: WorldEventInfo[];
}

interface CalendarRow {
  days: CalendarDay[];
  monthBannerLabel?: string;
  monthLabelRowSpan?: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
})
export class Calendar implements OnInit, OnChanges, OnDestroy {
  @Input() events: WorldEventInfo[] = [];
  @Input() worldId?: string | null;
  @Input() initialDate?: string | null;
  @Output() addEventOnDate = new EventEmitter<Date>();

  private currentWorldDateService = inject(CurrentWorldDateService);
  private dateSub?: Subscription;

  view: CalendarView = 'month';

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth(); // 0-based

  readonly MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  readonly DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private router: Router) {}

  ngOnInit() {
    // Jump to current world date when it changes (unless an explicit initialDate is set)
    this.dateSub = this.currentWorldDateService.date$.subscribe(() => {
      if (!this.initialDate) this.goToCurrentWorldDate();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['events'] && this.events.length > 0) {
      this.initialDate ? this.goToInitialDate() : this.goToCurrentWorldDate();
    }
  }

  ngOnDestroy() {
    this.dateSub?.unsubscribe();
  }

  private goToCurrentWorldDate() {
    const d = this.currentWorldDateService.getDate();
    this.currentYear = d.getFullYear();
    this.currentMonth = d.getMonth();
  }

  private goToInitialDate() {
    if (!this.initialDate) return;
    const d = new Date(this.initialDate + 'T00:00:00');
    this.currentYear = d.getFullYear();
    this.currentMonth = d.getMonth();
  }

  // ── Month view ────────────────────────────────────────────────────────────

  private get calendarDays(): CalendarDay[] {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    const days: CalendarDay[] = [];

    // Leading: align to Sunday + 2 extra weeks of previous month
    const leadingDays = firstDay.getDay() + 14;
    for (let i = leadingDays; i > 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth, 1 - i);
      days.push({ date, isCurrentMonth: false, events: this.eventsOnDate(date) });
    }

    // Days of current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.currentYear, this.currentMonth, d);
      days.push({ date, isCurrentMonth: true, events: this.eventsOnDate(date) });
    }

    // Trailing: complete the last partial week + 2 extra weeks of next month
    const trailingPartial = (7 - (days.length % 7)) % 7;
    const trailingDays = trailingPartial + 14;
    for (let d = 1; d <= trailingDays; d++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, d);
      days.push({ date, isCurrentMonth: false, events: this.eventsOnDate(date) });
    }

    return days;
  }

  get calendarRows(): CalendarRow[] {
    const allDays = this.calendarDays;
    const rows: CalendarRow[] = [];

    for (let i = 0; i < allDays.length; i += 7) {
      const rowDays = allDays.slice(i, i + 7);
      const row: CalendarRow = { days: rowDays };

      if (i === 0) {
        // Always label the first row with its starting month
        const d = rowDays[0].date;
        row.monthBannerLabel = `${this.MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      } else {
        // Label this row if it contains the 1st of any month
        const firstOfMonth = rowDays.find(d => d.date.getDate() === 1);
        if (firstOfMonth) {
          const d = firstOfMonth.date;
          row.monthBannerLabel = `${this.MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
        }
      }

      rows.push(row);
    }

    // Compute row span for each labelled row (spans until the next label or end)
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].monthBannerLabel) {
        let span = 1;
        while (i + span < rows.length && !rows[i + span].monthBannerLabel) span++;
        rows[i].monthLabelRowSpan = span;
      }
    }

    return rows;
  }

  private eventsOnDate(date: Date): WorldEventInfo[] {
    return this.events.filter(e => {
      if (!e.date) return false;
      const start = new Date(e.date + 'T00:00:00');
      if (e.end_date) {
        const end = new Date(e.end_date + 'T00:00:00');
        return date >= start && date <= end;
      }
      return start.toDateString() === date.toDateString();
    });
  }

  get monthLabel(): string {
    return `${this.MONTH_NAMES[this.currentMonth]} ${this.currentYear}`;
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  onMonthChange(event: Event) {
    this.currentMonth = +(event.target as HTMLSelectElement).value;
  }

  onYearChange(event: Event) {
    const val = +(event.target as HTMLInputElement).value;
    if (!isNaN(val) && val > 0) this.currentYear = val;
  }

  // ── Year view (same grid as month, full year) ─────────────────────────────

  get yearCalendarRows(): CalendarRow[] {
    const days: CalendarDay[] = [];

    // Leading: complete the first week back to Sunday if Jan 1 isn't one
    const jan1 = new Date(this.currentYear, 0, 1);
    const leadingDays = jan1.getDay();
    for (let i = leadingDays; i > 0; i--) {
      const date = new Date(this.currentYear, 0, 1 - i);
      days.push({ date, isCurrentMonth: false, events: this.eventsOnDate(date) });
    }

    // All days of the current year
    const dec31 = new Date(this.currentYear, 11, 31);
    const totalDays = Math.round((dec31.getTime() - jan1.getTime()) / 86_400_000) + 1;
    for (let d = 0; d < totalDays; d++) {
      const date = new Date(this.currentYear, 0, 1 + d);
      days.push({ date, isCurrentMonth: true, events: this.eventsOnDate(date) });
    }

    // Trailing: complete the last week to Saturday
    const trailingDays = dec31.getDay() < 6 ? 6 - dec31.getDay() : 0;
    for (let d = 1; d <= trailingDays; d++) {
      const date = new Date(this.currentYear + 1, 0, d);
      days.push({ date, isCurrentMonth: false, events: this.eventsOnDate(date) });
    }

    // Group into rows of 7 and label each row when a new month starts
    const rows: CalendarRow[] = [];
    for (let i = 0; i < days.length; i += 7) {
      const rowDays = days.slice(i, i + 7);
      const row: CalendarRow = { days: rowDays };

      if (i === 0) {
        const d = rowDays[0].date;
        row.monthBannerLabel = `${this.MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      } else {
        const firstOfMonth = rowDays.find(d => d.date.getDate() === 1);
        if (firstOfMonth) {
          const d = firstOfMonth.date;
          row.monthBannerLabel = `${this.MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
        }
      }

      rows.push(row);
    }

    // Compute spanning for side month labels
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].monthBannerLabel) {
        let span = 1;
        while (i + span < rows.length && !rows[i + span].monthBannerLabel) span++;
        rows[i].monthLabelRowSpan = span;
      }
    }

    return rows;
  }

  prevYear() { this.currentYear--; }
  nextYear() { this.currentYear++; }

  // ── Navigation & Misc ────────────────────────────────────────────────────

  setView(v: CalendarView) {
    this.view = v;
  }

  navigateToEvent(event: WorldEventInfo) {
    if (!event.isGhost) {
      this.router.navigate(['/event', event.id]);
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
}
