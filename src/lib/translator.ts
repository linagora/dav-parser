import { CalendarEventObject, Attendee, Dictionary, RRule } from '../types/dav-parser';
import { Component, Property, Time } from 'ical.js';

/**
 * Translates a CalendarEventObject into an ICS String.
 * 
 * @param event CalendarEventObject - the event object to convert to ICS
 * @returns String  -  the ICS string representing the event
 */
export function translate(event: CalendarEventObject): string {
  const calendarComponent: Component = new Component('vcalendar');
  const eventComponent: Component = buildEventComponent(event);

  calendarComponent.addPropertyWithValue('version', '2.0');
  calendarComponent.addPropertyWithValue('calscale', 'GREGORIAN');
  calendarComponent.addSubcomponent(eventComponent);

  event.exceptions?.forEach((eventException: CalendarEventObject) => {
    calendarComponent.addSubcomponent(buildEventComponent(eventException));
  });

  return calendarComponent.toString();
}

/**
 * Translates an event object into a ICAL component
 * 
 * @param event CalendarEventObject - the event object
 * @returns Component the ICAL component representing the event
 */
const buildEventComponent = (event: CalendarEventObject): Component => {
  const eventComponent = new Component('vevent');

  eventComponent.addPropertyWithValue('uid', event.id);
  eventComponent.addPropertyWithValue('summary', event.title);
  eventComponent.addPropertyWithValue('location', event.location || '');
  eventComponent.addPropertyWithValue('description', event.description || '');
  eventComponent.addPropertyWithValue('dtstart', translateDate(event.start));
  eventComponent.addPropertyWithValue('dtend', translateDate(event.end));

  if (event.recurrenceId) {
    eventComponent.addPropertyWithValue('recurrence-id', translateDate(event.recurrenceId));
  }

  (event.attendees || []).forEach((attendee) => {
    eventComponent.addProperty(translateAttendee(attendee));
  });

  if (event.rrule) {
    eventComponent.addProperty(translateRRule(event.rrule));
  }

  if (event.alarm?.trigger) {
    const alarmComponent: Component = translateAlarm(event.alarm);
    eventComponent.addSubcomponent(alarmComponent)
  }

  (Object.entries(event.extendedProps) || []).forEach(([key, value]) => {
    if (key === 'organizer') {
      eventComponent.addProperty(translateOrganizer(value));
    } else {
      eventComponent.addPropertyWithValue(key, value);
    }
  });

  return eventComponent;
};

/**
 * Translates a CalendarEventObject attendee to a JCAL property
 *
 * @param attendee Attendee
 * @returns ICAL.Property
 */
const translateAttendee = (attendee: Attendee): Property => {
  const { email, ...properties } = attendee;

  return new Property(['attendee', { ...properties }, 'cal-address', email]);
}

/**
 * Translates an ical address into an organizer ICAL property
 *
 * @param address string -  the organizer address (ie mailto:user@example.com)
 * @returns ICAL.property
 */
const translateOrganizer = (address: string): Property => {
  const cn: string = address.substring(7);

  return new Property(['organizer', { cn }, 'cal-address', address]);
};

/**
 * Translates an calendarEventObject alarm to a valarm ICAL.Component
 *
 * @param alarm Dictionnary the event alarm object
 * @returns ICAL.Component the event alarm component 
 */
const translateAlarm = (alarm: Dictionary): Component => {
  const alarmComponent = new Component('valarm');

  Object.entries(alarm).forEach(([key, value]) => {
    alarmComponent.addPropertyWithValue(key, value);
  });

  return alarmComponent;
}

/**
 * Translates an RRule object into a ICAL.Property
 *
 * @param rrule RRule
 * @returns ICAL.property
 */
const translateRRule = (rrule: RRule): Property => {
  return new Property(['rrule', {}, 'recur', { ...rrule }]);
}

/**
 * translates a date or date string into a ICAL date-time string
 *
 * @param date Date|string the date
 * @returns string
 */
const translateDate = (date: Date | string): string => {
  const timeComponent: Time = date instanceof Date ?
    Time.fromJSDate(date, false) :
    Time.fromString(date as string);

  return timeComponent.toString();
}
