import { parse, parseFreeBusy } from '../src/lib/parser';
import { CalendarEventObject, Attendee, FreeBusy } from '../src/types/dav-parser';
import { simpleIcs, customPropertiesIcs, recurringEventIcs, sabreIcs, freeBusyIcs } from './const';

describe('the parse function', () => {
  const assertAttendeeParsing = (attendee: Attendee, partstat: string, email: string, cn: string) => {
    expect(attendee.partstat).toEqual(partstat);
    expect(attendee.email).toEqual(email);
    expect(attendee.cn).toEqual(cn);
  }

  it('should parse an ics string and return an array of event objects', () => {
    const result: CalendarEventObject[] = parse(simpleIcs);

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Access-A-Ride Pickup');
  });

  it('should include custom properties into the event object', () => {
    const events: CalendarEventObject[] = parse(customPropertiesIcs);

    expect(events).toHaveLength(1);
    expect(events[0].extendedProps['x-openpaas-videoconference']).toEqual('https://jitsi.linagora.com/calendar');
  });

  it('should parse the event attendees if any', () => {
    const events: CalendarEventObject[] = parse(customPropertiesIcs);
    const [first, second, third]: Attendee[] = events[0]?.attendees as Attendee[];

    expect(events[0].attendees).toHaveLength(3);
    assertAttendeeParsing(first, 'NEEDS-ACTION', 'mailto:htquoc@linagora.com', 'Huy TA QUOC');
    assertAttendeeParsing(second, 'ACCEPTED', 'mailto:kferjani@linagora.com', 'Khaled FERJANI');
    assertAttendeeParsing(third, 'ACCEPTED', 'mailto:rboyer@linagora.com', 'Renaud BOYER');
  });

  it('should parse recurring events', () => {
    const events: CalendarEventObject[] = parse(recurringEventIcs);

    expect(events[0].rrule?.freq).toEqual('WEEKLY');
    expect(events[0].rrule?.byday).toEqual(['MO', 'TU', 'WE', 'TH', 'FR']);
  });

  it('should include the alarm if present in the ICS', () => {
    const events: CalendarEventObject[] = parse(recurringEventIcs);

    expect(events[0].alarm).not.toBeUndefined;
    expect(events[0].alarm?.action).toEqual('EMAIL');
    expect(events[0].alarm?.attendee).toEqual('mailto:kferjani@linagora.com');
    expect(events[0].alarm?.trigger).toEqual('-PT15M');
  });

  it('should work with non event components present in the ics', () => {
    const events: CalendarEventObject[] = parse(sabreIcs);

    expect(events).toHaveLength(1);
  });
});

describe('the parseFreeBusy function', () => {
  it('should parse free time information', () => {
    const [fbObject]: FreeBusy[] = parseFreeBusy(freeBusyIcs);

    expect(fbObject.uid).toEqual('4FD3AD926350');
    // testing attendee objects
    expect(fbObject.organizer).toMatchObject({
      cn: 'Cyrus Daboo',
      email: 'mailto:cyrus@example.com'
    });
    expect(fbObject.attendee).toMatchObject({
      cn: 'Wilfredo Sanchez Vega',
      email: 'mailto:wilfredo@example.com'
    });
    // testing dates
    expect(fbObject.start.getTime()).toEqual(1243900800000);
    expect(fbObject.end.getTime()).toEqual(1244073600000);
    expect(fbObject.timestamp.getTime()).toEqual(1243973253000);
    // testing the freebusy property
    expect(fbObject.freeBusy.start.getTime()).toEqual(1244052000000);
    expect(fbObject.freeBusy.end.getTime()).toEqual(1244055600000);
  });
});
