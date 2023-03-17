"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var moment_1 = require("moment");
var supabase_js_1 = require("@supabase/supabase-js");
var SUPABASE_URL = 'https://uzkphhitjjeooktrkyud.supabase.co';
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3BoaGl0amplb29rdHJreXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg1OTcxNTYsImV4cCI6MTk5NDE3MzE1Nn0.eoNOoKc10Z7WmiqVTpyHogh7e1HzeAipxNmIKX1n_rc');
supabase
    .channel('any')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'flights' }, function (payload) {
    console.log('Change received!', payload);
})
    .subscribe();
function getflights(option) {
    return __awaiter(this, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            url = 'https://www.mit.gl/wp-content/themes/mitgl/webservice.php?type=' + option + '&icao=BGJN';
            fetch(url)
                .then(function (res) { return res.json(); })
                .then(function (newdata) {
                var spreadflights = [];
                for (var i = 0; i < newdata.length; i++) {
                    var flight = newdata[i];
                    var spreadflight = __assign(__assign({}, flight), flight.Status);
                    delete spreadflight.Status;
                    spreadflight = toLowerCaseKeys(spreadflight);
                    spreadflight = fixTimestamps(spreadflight);
                    var _flight = spreadflight;
                    console.log(_flight.rute);
                }
            });
            return [2 /*return*/];
        });
    });
}
/**
 *
 * @param flight The flight to fix the timestamps for
 * @returns  The flight with the timestamps fixed
 *
 * This function fixes the timestamps for the flight
 */
function fixTimestamps(flight) {
    flight.Planned = moment_1.default.utc(flight.Planned).format('YYYY-MM-DDTHH:mm:ss');
    if (flight.Estimated != null) {
        flight.Estimated = moment_1.default.utc(flight.Estimated).format('YYYY-MM-DDTHH:mm:ss');
    }
    if (flight.Actual != null) {
        flight.Actual = moment_1.default.utc(flight.Actual).format('YYYY-MM-DDTHH:mm:ss');
    }
    return flight;
}
/**
 *
 * @param flight The flight to convert the keys to lowercase
 * @returns  The flight with the keys converted to lowercase
 *  This function converts the keys of the flight to lowercase
 */
function toLowerCaseKeys(flight) {
    var keys = Object.keys(flight);
    var n = keys.length;
    var newobj = {};
    for (var j = 0; j < n; j++) {
        newobj[keys[j].toLowerCase()] = flight[keys[j]];
    }
    return newobj;
}
getflights('Arrivals');
getflights('Departures');
setInterval(function () {
    console.log('Updating flights...');
    getflights('Arrivals');
    getflights('Departures');
}, 10000);
