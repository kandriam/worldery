import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldEventInfo } from '../../services/world-event.service';
import { Router } from '@angular/router';

type CalendarView = 'month' | 'year';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: WorldEventInfo[];
}

interface CalendarRow {
  days: CalendarDay[];
  monthBannerLabel?: string;
  monthLabelRowSpan?: number; // how many week-rows this month label spans
}

interface MiniDay {
  day: number;
  hasEvents: boolean;
}

interface YearViewCell {
  year: number;
  month: number;
  monthAbbr: string;
  weeks: (MiniDay | null)[][];
  hasEvents: boolean;
}

interface YearViewRow {
  year: number;
  months: YearViewCell[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
})
export class Calendar implements OnChanges {
  @Input() events: WorldEventInfo[] = [];
  @Input() worldId?: string | null;
  @Output() addEventOnDate = new EventEmitter<Date>();

  view: CalendarView = 'month';

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth(); // 0-based

  yearViewStartYear = new Date().getFullYear();
  readonly yearViewCount = 3;

  readonly MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  readonly MONTH_ABBRS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  readonly DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['events'] && this.events.length > 0) {
      this.goToEarliestEvent();
    }
  }

  private goToEarliestEvent() {
    const dated = this.events.filter(e => e.date);
    if (dated.length === 0) return;
    const earliest = dated.reduce((a, b) => (a.date < b.date ? a : b));
    const d = new Date(earliest.date + 'T00:00:00');
    this.currentYear = d.getFullYear();
    this.currentMonth = d.getMonth();
    this.yearViewStartYear = d.getFullYear();
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

  // ── Year view (mini calendar grid) ───────────────────────────────────────

  get yearViewLabel(): string {
    return `${this.yearViewStartYear} – ${this.yearViewStartYear + this.yearViewCount - 1}`;
  }

  get yearViewRows(): YearViewRow[] {
    const rows: YearViewRow[] = [];
    for (let y = this.yearViewStartYear; y < this.yearViewStartYear + this.yearViewCount; y++) {
      rows.push({
        year: y,
        months: this.MONTH_ABBRS.map((abbr, i) => this.buildYearViewCell(y, i, abbr)),
      });
    }
    return rows;
  }

  private buildYearViewCell(year: number, month: number, monthAbbr: string): YearViewCell {
    const weeks = this.getMiniCalendarWeeks(year, month);
    const hasEvents = this.events.some(e => {
      if (!e.date) return false;
      const d = new Date(e.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    });
    return { year, month, monthAbbr, weeks, hasEvents };
  }

  private getMiniCalendarWeeks(year: number, month: number): (MiniDay | null)[][] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const cells: (MiniDay | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      cells.push({ day: d, hasEvents: this.eventsOnDate(date).length > 0 });
    }

    while (cells.length < 42) cells.push(null);

    const weeks: (MiniDay | null)[][] = [];
    for (let i = 0; i < 42; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }

  prevYears() {
    this.yearViewStartYear -= this.yearViewCount;
  }

  nextYears() {
    this.yearViewStartYear += this.yearViewCount;
  }

  selectMonth(year: number, month: number) {
    this.currentYear = year;
    this.currentMonth = month;
    this.view = 'month';
  }

  // ── Navigation & Misc ────────────────────────────────────────────────────

  setView(v: CalendarView) {
    this.view = v;
  }

  navigateToEvent(event: WorldEventInfo) {
    this.router.navigate(['/event', event.id]);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
}
