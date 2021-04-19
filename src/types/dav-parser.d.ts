export interface CalendarEventObject {
  id: string;
  allDay: boolean;
  alarm?: Dictionary;
  attendees?: Attendee[];
  description: string | null;
  location: string | null;
  start: string | Date;
  end: string | Date;
  exceptions?: CalendarEventObject[];
  daysOfWeek?: ByWeekday | ByWeekday[];
  startTime?: Duration;
  endTime?: Duration;
  startRecur?: string | Date;
  endRecur?: string | Date;
  recurrenceId?: string | null;
  title: string;
  rrule?: RRule;
  duration: Duration;
  extendedProps: Dictionary;
}

export declare function parse(ics: string): CalendarEventObject[];

export declare function translate(event: CalendarEventObject): string;

export declare const icalProperties: string[];

export type Duration = DurationObject | string | number

export interface DurationObject {
  years?: number
  year?: number
  months?: number
  month?: number
  weeks?: number
  week?: number
  days?: number
  day?: number
  hours?: number
  hour?: number
  minutes?: number
  minute?: number
  seconds?: number
  second?: number
  milliseconds?: number
  millisecond?: number
  ms?: number
}

export type Dictionary = Record<string, any>

export interface Attendee {
  partstat: string,
  cn: string,
  cutype?: string,
  role?: string,
  rsvp?: string,
  email: string
}

export interface JcalProperty {
  name: string
  value: unknown;
}

export interface RRule {
  freq: string;
  dtstart?: Date | null;
  interval?: number;
  wkst?: number | null;
  count?: number | null;
  until?: Date | null;
  tzid?: string | null;
  bysetpos?: number | number[] | null;
  byday?: ByWeekday | ByWeekday[] | null;
  bymonth?: number | number[] | null;
  bymonthday?: number | number[] | null;
  bynmonthday?: number[] | null;
  byyearday?: number | number[] | null;
  byweekno?: number | number[] | null;
  byweekday?: ByWeekday | ByWeekday[] | null;
  bynweekday?: number[][] | null;
  byhour?: number | number[] | null;
  byminute?: number | number[] | null;
  bysecond?: number | number[] | null;
  byeaster?: number | null;
}

export type WeekdayStr = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export type ByWeekday = WeekdayStr | number;
