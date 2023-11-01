'use client'

import { ExampleFetch } from "../components/ExampleFetch";
import { useState } from "react";
import { Button, TextField, FormControl, FormControlLabel, Checkbox, InputLabel } from '@mui/material';
import Box from "@mui/material/Box";

function EventForm() {
    const [eventName, setEventName] = useState('');
    const [day, setDay] = useState('');
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [isMealtime, setIsMealtime] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log({
            eventName,
            day,
            startDateTime,
            endDateTime,
            isMealtime
        });

        setEventName('');
        setDay('');
        setStartDateTime('');
        setEndDateTime('');
        setIsMealtime(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box mb={2}>
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>Event Name</InputLabel>
                    <TextField value={eventName} onChange={(e) => setEventName(e.target.value)} />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>Day</InputLabel>
                    <TextField
                        type="date"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        InputProps={{ inputProps: { placeholder: '' } }}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>Start Date & Time</InputLabel>
                    <TextField
                        type="datetime-local"
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        InputProps={{ inputProps: { placeholder: '' } }}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel shrink>End Date & Time</InputLabel>
                    <TextField
                        type="datetime-local"
                        value={endDateTime}
                        onChange={(e) => setEndDateTime(e.target.value)}
                        InputProps={{ inputProps: { placeholder: '' } }}
                    />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <FormControlLabel control={<Checkbox checked={isMealtime} onChange={(e) => setIsMealtime(e.target.checked)} />} label="Is Mealtime?" />
                </FormControl>
            </Box>
            <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px' }}>Submit</Button>
        </form>
    );
}

export default function Calendar() {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="w-screen min-h-screen text-xl flex flex-col items-center justify-center gap-8">
            <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)}>
                Add Event
            </Button>

            {showForm && <EventForm />}

            <ExampleFetch url="https://events-microservice.fly.dev" />
        </div>
    );
}
