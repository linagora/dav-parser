import { Component, parse as parseIcs, Event, Property } from 'ical.js';
import { Attendee, CalendarEventObject, Dictionary, JcalProperty, RRule } from '../types/dav-parser';
import { icalProperties } from './const';

/**
 * Parse an ICS string
 *
 * @param ics String
 * @returns CalendarEventObject[]   an array of parsed events
 */
export function parse(ics: string): CalendarEventObject[] {
  const jcal = parseIcs(ics);
  const component: Component = new Component(jcal);
  const subComponents: Component[] = component.getAllSubcomponents();

  return subComponents
    .filter((subComponent: Component) => subComponent.name === 'vevent')
    .map(componentToEvent);
}

/**
 * Parse an ICAL.Component into a CalendarEventObject
 *
 * @param component ICAL.Component the ical.js component to convert into an event object.
 * @returns CalendarEventObject the parsed event object
 */
const componentToEvent = (component: Component): CalendarEventObject => {
  const event: Event = new Event(component);

  return parseEvent(event) as CalendarEventObject;
}

/**
 * Parse an ICAL.event attendee property
 *
 * @param attendees ICAL.property the attendee list in jcal format
 * @returns Attendee[]
 */
const parseAttendees = (attendees: Property[]): Attendee[] => {
  return attendees.map(attendee => {
    const attendeeJson = attendee.toJSON();

    return { ...attendeeJson['1'], email: attendeeJson['3'] } as Attendee
  })
}

/**
 * Parses an ICAL.Event into a CalendarEventObject
 *
 * @param event ICAL.Event
 * @returns CalendarEventObject
 */
const parseEvent = (event: Event): CalendarEventObject => {
  const eventObject: CalendarEventObject = {
    id: event.uid,
    allDay: event.startDate.isDate,
    start: event.startDate.toString(),
    end: event.endDate.toString(),
    title: event.summary,
    duration: event.duration,
    attendees: parseAttendees(event.attendees),
    exceptions: Object.values(event.exceptions).map(parseEvent),
    recurrenceId: event.recurrenceId?.toString(),
    description: event.description,
    location: event.location,
    extendedProps: {},
  };

  // Handle the properties that are exposed in the event jcal
  const eventComponent: Component = event.component;
  const alarmComponent: Component | null = eventComponent.getFirstSubcomponent('valarm');
  const jcalProps = parseJcalProperties(eventComponent.toJSON());

  if (alarmComponent) {
    eventObject.alarm = parseJcalAlarm(alarmComponent);
  }

  jcalProps.forEach((prop: JcalProperty) => {
    if (prop.name === 'rrule') {
      eventObject.rrule = prop.value as RRule
    } else {
      eventObject.extendedProps[prop.name] = prop.value;
    }
  });

  return eventObject;
}

/**
 * Parses a generic/custom property of an ICAL.component
 *
 * @param component any[][][] a jcal array representation of the ICAL.component
 * @returns JcalProperty[]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseJcalProperties = (component: any[][][]): JcalProperty[] => {
  const properties: string[][] = component[1];

  return properties
    .map((property): JcalProperty => ({ name: property[0], value: property[3] }))
    // filter the properties that were previously exposed by the ICAL.Event
    .filter(({name}) => !icalProperties.includes(name));
}

/**
 * Parse the varalam ICAL.component into a Dictionary
 *
 * @param component ICAL.Component the ICAL.component representation of the valarm
 * @returns Dictionary
 */
const parseJcalAlarm = (component: Component): Dictionary => {
  const alarm: string[][] = component.toJSON();
  const alarmValue: Dictionary = {};

  alarm[1].forEach(prop => {
    alarmValue[prop[0]] = prop[3]
  });

  return alarmValue;
}
