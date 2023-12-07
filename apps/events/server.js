"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyEvent = exports.getWeekEvents = exports.getMonthEvents = exports.getDayEvents = exports.deleteEvent = exports.addEvent = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv = require("dotenv");
var express = require('express');
var app = express();
var PORT = process.env.PORT || 8081;
var cors = require('cors');
app.use(cors());
app.use(cors({
    origin: ["http://localhost:3000", process.env.ORIGIN],
}));
app.get('/', function (req, res) {
    res.send('Hello, World!');
});
app.listen(PORT, '0.0.0.0', function () {
    console.log("Server is running on http://localhost:".concat(PORT));
});
app.use(express.json());
dotenv.config();
var supabaseUrl = process.env.SUPABASE_URL || 'API_URL';
var supabaseKey = process.env.SUPABASE_PASSWORD || 'API_KEY';
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Adds an event to the database
function addEvent(eventData) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Adding event!!!");
                    return [4 /*yield*/, supabase
                            .from('Events')
                            .insert([eventData])];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.log('Error inserting event: ', error.message);
                    }
                    console.log('Event inserted successfully:', data);
                    return [2 /*return*/];
            }
        });
    });
}
exports.addEvent = addEvent;
function deleteEvent(event) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('Events')
                        .delete()
                        .eq('event_id', event.event_id)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.log('Error deleting event: ', error.message);
                    }
                    console.log('Event deleted successfully:', data);
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteEvent = deleteEvent;
function getDayEvents(day) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('Events')
                        .select()
                        .gte('start_date_time', new Date("".concat(day, "T00:00:00.000Z")).toISOString())
                        .lt('start_date_time', new Date("".concat(day, "T23:59:59.999Z")).toISOString())];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.log("Error fetching events for day: ".concat(day, " ").concat(error.message));
                    }
                    console.log("Events fetched successfully for day: ".concat(day, " ").concat(data));
                    return [2 /*return*/, data || []];
            }
        });
    });
}
exports.getDayEvents = getDayEvents;
// Gets all events in month from database
function getMonthEvents(month) {
    return __awaiter(this, void 0, void 0, function () {
        var startDate, endDate, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startDate = new Date("".concat(month, "-01T00:00:00.000Z"));
                    endDate = new Date("".concat(month, "-31T23:59:59.999Z"));
                    return [4 /*yield*/, supabase
                            .from('Events')
                            .select()
                            .gte('start_date_time', startDate.toISOString())
                            .lt('start_date_time', endDate.toISOString())];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.log("Error fetching events for month: ".concat(month, " ").concat(error.message));
                    }
                    console.log("Events fetched successfully for month: ".concat(month, " ").concat(data));
                    return [2 /*return*/, data || []];
            }
        });
    });
}
exports.getMonthEvents = getMonthEvents;
// Gets all events in week from database
function getWeekEvents(week) {
    return __awaiter(this, void 0, void 0, function () {
        var startDate, endDate, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startDate = new Date(week);
                    startDate.setDate(startDate.getDate() - startDate.getDay());
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 6);
                    return [4 /*yield*/, supabase
                            .from('Events')
                            .select()
                            .gte('start_date_time', startDate.toISOString())
                            .lt('start_date_time', new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString())];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.log("Error fetching events for week: ".concat(week, " ").concat(error.message));
                    }
                    console.log("Events fetched successfully for week: ".concat(week, " ").concat(data));
                    return [2 /*return*/, data || []];
            }
        });
    });
}
exports.getWeekEvents = getWeekEvents;
// Modifies an event in the database
function modifyEvent(oldEvent, updatedEvent) {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('Events')
                        .upsert([updatedEvent])
                        .eq('event_id', oldEvent.event_id)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.log('Error modifying event: ', error.message);
                    }
                    console.log("Event modified successfully, old event: ".concat(oldEvent, ", updated event: ").concat(updatedEvent));
                    return [2 /*return*/];
            }
        });
    });
}
exports.modifyEvent = modifyEvent;
// Routes
app.get('/events/day/2023-12-06', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var day, events, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                day = '2023-12-06';
                console.log('received day!!!: ', day);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getDayEvents(day)];
            case 2:
                events = _a.sent();
                res.json(events);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                res.status(500).json({ error: error_1 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/events', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var eventData, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Received data, ".concat(req.body));
                eventData = req.body;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, addEvent(eventData)];
            case 2:
                _a.sent();
                res.json({ message: 'Event added successfully' });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                res.status(500).json({ error: error_2 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/events/month/:month', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var month, events, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                month = req.params.month;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getMonthEvents(month)];
            case 2:
                events = _a.sent();
                res.json(events);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                res.status(500).json({ error: error_3 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/events/week/:week', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var week, events, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                week = req.params.week;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getWeekEvents(week)];
            case 2:
                events = _a.sent();
                res.json(events);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                res.status(500).json({ error: error_4 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
