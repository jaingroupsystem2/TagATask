import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enGB } from 'date-fns/locale/en-GB'

import "./CalendarPage.css"


const locales = {
  'en-IN': enGB,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const rawEvents = [
  { start: "2025-04-14T07:00:00.000Z", end: "2025-04-17T16:00:00.000Z", title: "Business of Software Conference", color: "#ff6d42" },
  { start: "2025-04-12T11:00:00.000Z", end: "2025-04-13T19:00:00.000Z", title: "Friends binge marathon", color: "#7bde83" },
  { start: "2025-04-19T11:00:00.000Z", end: "2025-04-20T19:00:00.000Z", title: "Friends binge marathon", color: "#7bde83" },
  { start: "2025-04-12T07:00:00.000Z", end: "2025-04-12T08:00:00.000Z", title: "Product team mtg.", color: "#913aa7" },
  { start: "2025-04-12T09:00:00.000Z", end: "2025-04-12T10:00:00.000Z", title: "Green box to post office", color: "#6e7f29" },
  { start: "2025-04-12T12:00:00.000Z", end: "2025-04-12T13:00:00.000Z", title: "Lunch @ Butcher's", color: "#bb0000" },
  { start: "2025-04-12T14:00:00.000Z", end: "2025-04-12T15:00:00.000Z", title: "Status Update Meeting", color: "#00aabb" },
  { start: "2025-04-12T08:00:00.000Z", end: "2025-04-12T09:00:00.000Z", title: "Board meeting", color: "#cfc014" },
  { start: "2025-04-12T18:00:00.000Z", end: "2025-04-12T20:00:00.000Z", title: "Pizza Night hehebehee he ehe h", color: "#d7be0d" },
  { start: "2025-04-12T16:00:00.000Z", end: "2025-04-12T17:00:00.000Z", title: "Clever Conference", color: "#a71111" },
  { start: "2025-04-11T06:45:00.000Z", end: "2025-04-11T08:00:00.000Z", title: "Quick mtg. with Martin", color: "#de3d83" },
  { start: "2025-04-08T07:30:00.000Z", end: "2025-04-08T08:30:00.000Z", title: "Product team mtg.", color: "#f67944" },
  { start: "2025-04-08T09:00:00.000Z", end: "2025-04-08T09:45:00.000Z", title: "Stakeholder mtg.", color: "#a144f6" },
  { start: "2025-04-09T22:00:00.000Z", end: "2025-04-14T22:00:00.000Z", allDay: true, title: "Sam OFF", color: "#ca4747" },
  { start: "2025-04-17T22:00:00.000Z", end: "2025-04-28T22:00:00.000Z", allDay: true, title: "Europe tour", color: "#56ca70" },
  { start: "2025-02-06T23:00:00.000Z", end: "2025-02-24T23:00:00.000Z", allDay: true, title: "Dean OFF", color: "#99ff33" },
  { start: "2025-03-04T23:00:00.000Z", end: "2025-03-13T23:00:00.000Z", allDay: true, title: "Mike OFF", color: "#e7b300" },
  { start: "2025-05-06T22:00:00.000Z", end: "2025-05-15T22:00:00.000Z", allDay: true, title: "John OFF", color: "#669900" },
  { start: "2025-05-31T22:00:00.000Z", end: "2025-06-10T22:00:00.000Z", allDay: true, title: "Carol OFF", color: "#6699ff" },
  { start: "2025-07-01T22:00:00.000Z", end: "2025-07-16T22:00:00.000Z", allDay: true, title: "Jason OFF", color: "#cc9900" },
  { start: "2025-08-05T22:00:00.000Z", end: "2025-08-13T22:00:00.000Z", allDay: true, title: "Ashley OFF", color: "#339966" },
  { start: "2025-09-09T22:00:00.000Z", end: "2025-09-19T22:00:00.000Z", allDay: true, title: "Marisol OFF", color: "#8701a9" },
  { start: "2025-09-30T22:00:00.000Z", end: "2025-10-11T22:00:00.000Z", allDay: true, title: "Sharon OFF", color: "#cc6699" }
];

// Convert all ISO date strings to Date objects
const parsedEvents = rawEvents.map(event => ({
  ...event,
  start: new Date(event.start),
  end: new Date(event.end),
}));

console.log("parsedEvents",parsedEvents);


const CalendarPage = () => {
  const myView = useMemo(() => ({ calendar: { labels: true } }), []);

  return (
    <div style={{ height: '90vh', padding: '20px 60px 20px' }}>
      <Calendar
        localizer={localizer}
        events={parsedEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        style={{ height: '100%' }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color || '#3174ad',
            borderRadius: '5px',
            color: '#fff',
            border: 'none',
            padding: '2px 4px',
          },
        })}
      />
    </div>
  );
};

export default CalendarPage;
