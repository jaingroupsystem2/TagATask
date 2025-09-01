import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enGB } from 'date-fns/locale/en-GB';

import "./CalendarPage.css";

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

const sanitize_html = (html = '') => {
  // bare-minimum sanitize: remove <script>...</script> and on* handlers
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');
};

const EventRenderer = ({ event }) => {
  // Allow simple HTML (e.g., <b>, <a>) coming from backend titles
  const safe_html = sanitize_html(event.title || '');
  return <div dangerouslySetInnerHTML={{ __html: safe_html }} />;
};

const CalendarPage = () => {
  const my_view = useMemo(() => ({ calendar: { labels: true } }), []);
  const Base_URL = "https://prioritease2-c953f12d76f1.herokuapp.com";
  const current_user_id = localStorage.getItem("tagatask_user_id");

  const [events, set_events] = useState([]);
  const [is_loading, set_is_loading] = useState(false);
  const [error, set_error] = useState(null);

  const normalize_to_date = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const adapt_to_calendar_events = (items = []) => {
    return items
      .map((item) => {
        const start = normalize_to_date(item.start);
        const end = normalize_to_date(item.end);
        if (!start || !end) return null;

        // Keep title as-is (may contain HTML like <b> and <a>)
        const title = typeof item.title === 'string' ? item.title : 'Untitled';

        // Optional color support in future; default RbC blue otherwise
        const color = item.color || '#3174ad';

        // Treat multi-day ranges as timed, unless you want allDay true:
        // const allDay = true; // <- switch if your data are full-day tasks
        const allDay = !!item.allDay;

        return { start, end, title, color, allDay };
      })
      .filter(Boolean);
  };

  const fetch_calender_data = async () => {
    set_is_loading(true);
    set_error(null);
    try {
      const response = await axios.get(`${Base_URL}/api_list/calender_view`, {
        params: { current_personnel_id: current_user_id },
        headers: {
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'any',
        },
      });

      const api_items = response?.data?.all_target_tasks || [];
      const mapped = adapt_to_calendar_events(api_items);
      set_events(mapped);
    } catch (err) {
      console.error('calendar fetch failed', err);
      set_error('Failed to load calendar data.');
      set_events([]);
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    if (current_user_id) fetch_calender_data();
  }, [current_user_id]);

  return (
    <div style={{ height: '90vh', padding: '20px 60px 20px' }}>
      {error && (
        <div style={{ marginBottom: 12, color: '#b00020' }}>
          {error}
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        components={{ event: EventRenderer }}
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
        messages={{
          noEventsInRange: is_loading ? 'Loading…' : 'No events in range',
        }}
      />
    </div>
  );
};

export default CalendarPage;
