import { translate } from '../src/lib/translator';
import { CalendarEventObject } from '../src/types/dav-parser';
import { testEventObject } from './const';

describe('the translate method', () => {
  it('should transform an event object into an ICS String', () => {
    const ics = 'BEGIN:VCALENDAR\r\n\
VERSION:2.0\r\n\
CALSCALE:GREGORIAN\r\n\
BEGIN:VEVENT\r\n\
UID:123456\r\n\
SUMMARY:test\r\n\
LOCATION:some location\r\n\
DESCRIPTION:simple description\r\n\
DTSTART:20210315T100000\r\n\
DTEND:20210315T110000\r\n\
END:VEVENT\r\n\
END:VCALENDAR';

    expect(translate(testEventObject)).toEqual(ics);
  });

  it('should transform an event object with custom properties into an ICS String', () => {
    const eventObjectWithCustomProps: CalendarEventObject = { ...testEventObject };

    eventObjectWithCustomProps.extendedProps = {
      'x-openpaas-videoconference': 'hello',
    };

    const ics = 'BEGIN:VCALENDAR\r\n\
VERSION:2.0\r\n\
CALSCALE:GREGORIAN\r\n\
BEGIN:VEVENT\r\n\
UID:123456\r\n\
SUMMARY:test\r\n\
LOCATION:some location\r\n\
DESCRIPTION:simple description\r\n\
DTSTART:20210315T100000\r\n\
DTEND:20210315T110000\r\n\
X-OPENPAAS-VIDEOCONFERENCE:hello\r\n\
END:VEVENT\r\n\
END:VCALENDAR';

    expect(translate(eventObjectWithCustomProps)).toEqual(ics);
  });

  it('should translate the attendees properly', () => {
    const eventObjectWithAttendees: CalendarEventObject = { ...testEventObject };

    eventObjectWithAttendees.attendees = [
      {
        cn: 'user1',
        email: 'user1@example.com',
        partstat: 'ACCEPTED',
        role: 'ROLE',
        cutype: 'type',
        rsvp: 'false',
      },
      {
        cn: 'user2',
        email: 'user2@example.com',
        partstat: 'DECLINED',
        role: 'ROLE2',
        cutype: 'type2',
        rsvp: 'true',
      },
    ];

    const ics = 'BEGIN:VCALENDAR\r\n\
VERSION:2.0\r\n\
CALSCALE:GREGORIAN\r\n\
BEGIN:VEVENT\r\n\
UID:123456\r\n\
SUMMARY:test\r\n\
LOCATION:some location\r\n\
DESCRIPTION:simple description\r\n\
DTSTART:20210315T100000\r\n\
DTEND:20210315T110000\r\n\
ATTENDEE;CN=user1;PARTSTAT=ACCEPTED;ROLE=ROLE;CUTYPE=type;RSVP=false:user1@\r\n\
 example.com\r\n\
ATTENDEE;CN=user2;PARTSTAT=DECLINED;ROLE=ROLE2;CUTYPE=type2;RSVP=true:user2\r\n\
 @example.com\r\n\
END:VEVENT\r\n\
END:VCALENDAR';

    expect(translate(eventObjectWithAttendees)).toEqual(ics);
  });

  it('should translate an alarm properly', () => {
    const eventObjectWithAlarm: CalendarEventObject = { ...testEventObject };

    eventObjectWithAlarm.alarm = {
      trigger: '-PT15M',
      action: 'EMAIL',
      attendee: 'mailto:kferjani@linagora.com',
      summary: 'Daily Meeting - Team Calendar/Contacts',
      description: 'This is an automatic alarm sent by OpenPaas',
    };

    const ics = 'BEGIN:VCALENDAR\r\n\
VERSION:2.0\r\n\
CALSCALE:GREGORIAN\r\n\
BEGIN:VEVENT\r\n\
UID:123456\r\n\
SUMMARY:test\r\n\
LOCATION:some location\r\n\
DESCRIPTION:simple description\r\n\
DTSTART:20210315T100000\r\n\
DTEND:20210315T110000\r\n\
BEGIN:VALARM\r\n\
TRIGGER:-PT15M\r\n\
ACTION:EMAIL\r\n\
ATTENDEE:mailto:kferjani@linagora.com\r\n\
SUMMARY:Daily Meeting - Team Calendar/Contacts\r\n\
DESCRIPTION:This is an automatic alarm sent by OpenPaas\r\n\
END:VALARM\r\n\
END:VEVENT\r\n\
END:VCALENDAR';

    expect(translate(eventObjectWithAlarm)).toEqual(ics);
  });

  it('should translate an event object with RRule properly', () => {
    const eventObjectWithRRule: CalendarEventObject = { ...testEventObject };

    eventObjectWithRRule.rrule = {
      freq: 'WEEKLY',
      byday: ['MO', 'TU', 'WE', 'TH', 'FR'],
    };

    const ics = 'BEGIN:VCALENDAR\r\n\
VERSION:2.0\r\n\
CALSCALE:GREGORIAN\r\n\
BEGIN:VEVENT\r\n\
UID:123456\r\n\
SUMMARY:test\r\n\
LOCATION:some location\r\n\
DESCRIPTION:simple description\r\n\
DTSTART:20210315T100000\r\n\
DTEND:20210315T110000\r\n\
RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR\r\n\
END:VEVENT\r\n\
END:VCALENDAR';

    expect(translate(eventObjectWithRRule)).toEqual(ics);
  });

  it('should properly translate events with exceptions', () => {
    const eventObjectWithExceptions: CalendarEventObject = { ...testEventObject };

    eventObjectWithExceptions.rrule = {
      freq: 'WEEKLY',
      byday: ['MO', 'TU', 'WE', 'TH', 'FR'],
    };

    eventObjectWithExceptions.exceptions = [
      { ...testEventObject, recurrenceId: '2020-11-06T08:30:00Z' }
    ];

    const ics = 'BEGIN:VCALENDAR\r\n\
VERSION:2.0\r\n\
CALSCALE:GREGORIAN\r\n\
BEGIN:VEVENT\r\n\
UID:123456\r\n\
SUMMARY:test\r\n\
LOCATION:some location\r\n\
DESCRIPTION:simple description\r\n\
DTSTART:20210315T100000\r\n\
DTEND:20210315T110000\r\n\
RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR\r\n\
END:VEVENT\r\n\
BEGIN:VEVENT\r\n\
UID:123456\r\n\
SUMMARY:test\r\n\
LOCATION:some location\r\n\
DESCRIPTION:simple description\r\n\
DTSTART:20210315T100000\r\n\
DTEND:20210315T110000\r\n\
RECURRENCE-ID:20201106T083000Z\r\n\
END:VEVENT\r\n\
END:VCALENDAR';

    expect(translate(eventObjectWithExceptions)).toEqual(ics);
  });
});
