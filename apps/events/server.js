"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyEvent = exports.getWeekEvents = exports.getMonthEvents = exports.getDayEvents = exports.deleteEvent = exports.addEvent = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8081;
const cors = require('cors');
app.use(cors());
app.use(cors({
    origin: ["http://localhost:3000", process.env.ORIGIN],
}));
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
app.use(express.json());
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL || 'API_URL';
const supabaseKey = process.env.SUPABASE_PASSWORD || 'API_KEY';
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Adds an event to the database
function addEvent(eventData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Adding event!!!");
        const { data, error } = yield supabase
            .from('Events')
            .insert([eventData]);
        if (error) {
            console.log('Error inserting event: ', error.message);
        }
        console.log('Event inserted successfully:', data);
    });
}
exports.addEvent = addEvent;
function deleteEvent(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase
            .from('Events')
            .delete()
            .eq('event_id', event.event_id);
        if (error)
            throw new Error(`Error deleting event: ${error.message}`);
        console.log('Event deleted successfully:', data);
    });
}
exports.deleteEvent = deleteEvent;
function getDayEvents(day) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase
            .from('Events')
            .select()
            .gte('start_date_time', new Date(`${day}T00:00:00.000Z`).toISOString())
            .lt('start_date_time', new Date(`${day}T23:59:59.999Z`).toISOString());
        if (error)
            throw new Error(`Error fetching events for day ${day}: ${error.message}`);
        return data || [];
    });
}
exports.getDayEvents = getDayEvents;
// Gets all events in month from database
function getMonthEvents(month) {
    return __awaiter(this, void 0, void 0, function* () {
        const startDate = new Date(`${month}-01T00:00:00.000Z`);
        const endDate = new Date(`${month}-31T23:59:59.999Z`);
        const { data, error } = yield supabase
            .from('Events')
            .select()
            .gte('start_date_time', startDate.toISOString())
            .lt('start_date_time', endDate.toISOString());
        if (error)
            throw new Error(`Error fetching events for month ${month}: ${error.message}`);
        return data || [];
    });
}
exports.getMonthEvents = getMonthEvents;
// Gets all events in week from database
function getWeekEvents(week) {
    return __awaiter(this, void 0, void 0, function* () {
        const startDate = new Date(week);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        const { data, error } = yield supabase
            .from('Events')
            .select()
            .gte('start_date_time', startDate.toISOString())
            .lt('start_date_time', new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());
        if (error)
            throw new Error(`Error fetching events for week ${week}: ${error.message}`);
        return data || [];
    });
}
exports.getWeekEvents = getWeekEvents;
// Modifies an event in the database
function modifyEvent(oldEvent, updatedEvent) {
    return __awaiter(this, void 0, void 0, function* () {
        const { error } = yield supabase
            .from('Events')
            .upsert([updatedEvent])
            .eq('event_id', oldEvent.event_id);
        if (error)
            throw new Error(`Error modifying event: ${error.message}`);
    });
}
exports.modifyEvent = modifyEvent;
// Routes
app.post('/events', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Received data, ${req.body}`);
    const eventData = req.body; // Assuming the client sends event data in the request body
    try {
        yield addEvent(eventData);
        res.json({ message: 'Event added successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
