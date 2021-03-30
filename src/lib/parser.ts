import * as ICAL from 'ical.js';
import { Attendee, CalendarEventObject, Dictionary, JcalProperty, RRule } from '../types/dav-parser';
import { icalProperties } from './const';

/**
 * Parse an ICS string
 *
 * @param ics String
 * @returns CalendarEventObject[]   an array of parsed events
 */
export function parse(ics: string): CalendarEventObject[] {
  const jcal = ICAL.parse(ics);
  const component: ICAL.Component = new ICAL.Component(jcal);
  const subComponents: ICAL.Component[] = component.getAllSubcomponents();

  return subComponents.map(componentToEvent);
}

/**
 * Parse an ICAL.Component into a CalendarEventObject
 *
 * @param component ICAL.Component the ical.js component to convert into an event object.
 * @returns CalendarEventObject the parsed event object
 */
const componentToEvent = (component: ICAL.Component): CalendarEventObject => {
  const event: ICAL.Event = new ICAL.Event(component);

  return parseEvent(event) as CalendarEventObject;
}

/**
 * Parse an ICAL.event attendee property
 *
 * @param attendees ICAL.property the attendee list in jcal format
 * @returns Attendee[]
 */
const parseAttendees = (attendees: ICAL.Property[]): Attendee[] => {
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
const parseEvent = (event: ICAL.Event): CalendarEventObject => {
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
  const eventComponent: ICAL.Component = event.component;
  const jcalJson = eventComponent.toJSON();
  const jcalProps = parseJcalProperties(jcalJson);
  const alarm = parseJcalAlarm(jcalJson);

  if (Object.keys(alarm)) {
    eventObject.alarm = alarm;
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
 * Parse the ICAL.component jcal alarm into a Dictionary
 *
 * @param component any[][][] a jcal array representation of the ICAL.component
 * @returns Dictionary
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseJcalAlarm = (component: any[][][]): Dictionary => {
  const alarm: string[][] = component[2][0];
  const alarmValue: Dictionary = {};

  if (alarm?.length && alarm[1]?.length) {
    alarm[1].forEach(property => {
      alarmValue[property[0]] =  property[3];
    });
  }

  return alarmValue;
}
