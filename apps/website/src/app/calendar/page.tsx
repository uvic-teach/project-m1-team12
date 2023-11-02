'use client'

import { ExampleFetch } from "../components/ExampleFetch";
import { useState } from "react";
import { Button, TextField, FormControl, FormControlLabel, Checkbox, InputLabel } from '@mui/material';
import Box from "@mui/material/Box";
import './calendarStyles.css'

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!eventName || !startDateTime || !endDateTime) {
            setErrorMessage('All fields (event name, start date & time, and end date & time) need to be filled before submitting an event.');
            return;
        }

        const formattedStartDateTime = formatDate(startDateTime);
        const formattedEndDateTime = formatDate(endDateTime);

        // Check if start date is after the end date
        if (new Date(formattedStartDateTime) > new Date(formattedEndDateTime)) {
            setErrorMessage('Start date must be before end date');
            return;
        }

        console.log({
            event_name: eventName,
            start_date_time: formattedStartDateTime,
            end_date_time: formattedEndDateTime,
            is_meal_event: isMealtime
        });

        setEventName('');
        setStartDateTime('');
        setEndDateTime('');
        setIsMealtime(false);

        // Reset the error message state
        setErrorMessage(null);
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

    return (
        <div className="w-screen min-h-screen text-xl flex flex-col items-center justify-center gap-8">
            {!showForm && <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#3f51b5', color: '#fff' }}>Add Event</Button>}

            {showForm && <EventForm />}

            <ExampleFetch url="https://events-microservice.fly.dev" />
        </div>
    );
}
