'use client'

import { useState, useEffect } from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import { Button, TextField, FormControl, FormControlLabel, Checkbox, InputLabel } from '@mui/material';
import Box from "@mui/material/Box";
import './calendarStyles.css'

const backendUrl = 'https://events-microservice.fly.dev'; // when running locally: 'http://localhost:8081' . when deployed: 'https://events-microservice.fly.dev'

export type Event = {
    event_id: number;
    event_name: string;
    start_date_time: string;
    end_date_time: string;
    is_meal_event: boolean;
}
function formatDate(input: string): string {
    const date = new Date(input);
    return date.toISOString().split('.')[0] + 'Z';
}

function EventForm() {
    const [eventName, setEventName] = useState('');
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [isMealtime, setIsMealtime] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let missingFields = [];

        if (!eventName) missingFields.push("event name");
        if (!startDateTime) missingFields.push("start date & time");
        if (!endDateTime) missingFields.push("end date & time");

        if (missingFields.length) {
            setErrorMessage(`Please fill the following fields: ${missingFields.join(", ")}.`);
            return;
        }

        const formattedStartDateTime = formatDate(startDateTime);
        const formattedEndDateTime = formatDate(endDateTime);

        // Check if start date is before the current date
        if (new Date(formattedStartDateTime) < new Date()) {
            setErrorMessage('Start date & time must be after the current date & time');
            return;
        }

        // Check if start date is after the end date
        if (new Date(formattedStartDateTime) > new Date(formattedEndDateTime)) {
            setErrorMessage('Start date & time must be before end date & time');
            return;
        }

        const eventData = {
            event_name: eventName,
            start_date_time: formattedStartDateTime,
            end_date_time: formattedEndDateTime,
            is_meal_event: isMealtime,
        };

        try {
            console.log(eventData);
            const response = await fetch(`${backendUrl}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                throw new Error(`${response.statusText}`);
            }

            setEventName('');
            setStartDateTime('');
            setEndDateTime('');
            setIsMealtime(false);
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage(`Error adding event: ${error}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <Box mb={2}>
                <FormControl fullWidth margin="normal" className="mui-form-control">
                    <InputLabel shrink>Event Name</InputLabel>
                    <TextField value={eventName} onChange={(e) => setEventName(e.target.value)} />
                </FormControl>
                <FormControl fullWidth margin="normal" className="mui-form-control">
                    <InputLabel shrink>Start Date & Time</InputLabel>
                    <TextField
                        type="datetime-local"
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        InputProps={{ inputProps: { placeholder: '' } }}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal" className="mui-form-control">
                    <InputLabel shrink>End Date & Time</InputLabel>
                    <TextField
                        type="datetime-local"
                        value={endDateTime}
                        onChange={(e) => setEndDateTime(e.target.value)}
                        InputProps={{ inputProps: { placeholder: '' } }}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal" className="mui-form-control">
                    <FormControlLabel className="mui-checkbox-label" control={<Checkbox checked={isMealtime} onChange={(e) => setIsMealtime(e.target.checked)} />} label="Is Mealtime?" />
                </FormControl>
            </Box>
            {errorMessage && <div style={{ color: 'red', marginBottom: '16px' }}>{errorMessage}</div>}
            <Button type="submit" variant="contained" color="primary" className="mui-btn-primary">Submit</Button>
        </form>
    );
}

export default function Calendar() {
    const [showForm, setShowForm] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [currentMonth, setCurrentMonth] = useState('');


    // Async function to fetch events for the current month
    const fetchEventsForMonth = async (date: Date) => {
        // Format the month in 'YYYY-MM' format
        const month = date.toISOString().substring(0, 7); // This will give you 'YYYY-MM' from the date

        try {
            const response = await fetch(`${backendUrl}/events/month/${month}`);
            if (!response.ok) {
                throw new Error('Error fetching events');
            }
            const eventsForMonth = await response.json();
            setEvents(eventsForMonth);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Effect to fetch events when the component mounts for the current month
    useEffect(() => {
        const currentDate = new Date();
        fetchEventsForMonth(currentDate);
    }, []);

    return (
        <div className="calendar-container">
            {!showForm && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowForm(true)}
                    style={{ backgroundColor: '#3f51b5', color: '#fff' }}
                >
                    Add Event
                </Button>
            )}

            {showForm && <EventForm />}

            <div className="calendar">
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next',  // Keep only the prev and next buttons
                        center: 'title',    // Keep the title at the center
                        right: '',          // Remove the right side buttons entirely
                    }}
                    events={events.map((event) => ({
                        title: event.event_name,
                        start: event.start_date_time,
                        end: event.end_date_time,
                        allDay: event.is_meal_event,
                    }))}
                    datesSet={({ view }) => {
                        // Fetch events for the new month
                        const year = view.currentStart.getUTCFullYear();
                        const month = view.currentStart.getUTCMonth();
                        const date = new Date(year, month);
                        fetchEventsForMonth(date);
                    }}
                />
            </div>
        </div>
    );
}
const CalendarComponent: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        // Fetch events from the backend (replace with your actual fetching logic)
        const fetchEvents = async () => {
            try {
                const response = await fetch(backendUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const fetchedEvents: Event[] = await response.json();
                setEvents(fetchedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []); // Run the effect only once on component mount

    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={events.map((event) => ({
                    title: event.event_name,
                    start: event.start_date_time,
                    end: event.end_date_time,
                    allDay: true, // Set to true if the event spans the entire day
                }))}
            />
        </div>
    );
};
