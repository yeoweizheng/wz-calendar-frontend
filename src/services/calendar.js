import * as React from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, add, sub, isEqual, isAfter } from 'date-fns';

export function useCalendar() {
  const getDateObjIn3Weeks = React.useCallback((selectedDate) => {
    let dates = [];
    let currentDate = sub(startOfWeek(selectedDate), {weeks: 1});
    for (let i = 0; i < 21; i++) {
      dates.push(currentDate);
      currentDate = add(currentDate, {"days": 1})
    }
    return dates
  }, [])
  const getDateObjIn3Months = React.useCallback((selectedDate) => {
    let dates = [];
    let currentDate = startOfWeek(startOfMonth(sub(selectedDate, {months: 1})));
    let endDate = endOfWeek(endOfMonth(add(selectedDate, {months: 1})));
    while (!isEqual(currentDate, endDate) && !isAfter(currentDate, endDate)) {
      dates.push(currentDate);
      currentDate = add(currentDate, {"days": 1});
    }
    return dates;
  }, []);
  const getWeekStartEndDateObj = React.useCallback((selectedDate) => {
    let startDateObj = startOfWeek(selectedDate);
    let endDateObj = endOfWeek(selectedDate);
    return [startDateObj, endDateObj];
  }, []);
  const get3WeeksStartEndDateObj = React.useCallback((selectedDate) => {
    let startDateObj = sub(startOfWeek(selectedDate), {weeks: 1});
    let endDateObj = add(endOfWeek(selectedDate), {weeks: 1});
    return [startDateObj, endDateObj];
  }, []);
  const get3MonthsStartEndDateObj = React.useCallback((selectedDate) => {
    let startDateObj = startOfWeek(startOfMonth(sub(selectedDate, {months: 1})));
    let endDateObj = endOfWeek(endOfMonth(add(selectedDate, {months: 1})));
    return [startDateObj, endDateObj];
  }, []);
  const getDaysInWeek = React.useCallback(() => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  }, [])
  return { getWeekStartEndDateObj, getDateObjIn3Weeks, get3WeeksStartEndDateObj, getDateObjIn3Months, get3MonthsStartEndDateObj, getDaysInWeek }
}