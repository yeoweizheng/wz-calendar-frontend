import * as React from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, add, isEqual, isAfter } from 'date-fns';

export function useCalendar() {
  const getDateObjInWeek = React.useCallback((selectedDate) => {
    let dates = [];
    let currentDate = startOfWeek(selectedDate);
    for (let i = 0; i < 7; i++) {
      dates.push(currentDate);
      currentDate = add(currentDate, {"days": 1})
    }
    return dates
  }, [])
  const getDateObjInMonth = React.useCallback((selectedDate) => {
    let dates = [];
    let currentDate = startOfWeek(startOfMonth(selectedDate));
    let endDate = endOfWeek(endOfMonth(selectedDate));
    while (!isEqual(currentDate, endDate) && !isAfter(currentDate, endDate)) {
      dates.push(currentDate);
      currentDate = add(currentDate, {"days": 1});
    }
    return dates;
  }, []);
  const getStartEndDateObj = React.useCallback((selectedDate) => {
    let startDateObj = startOfWeek(selectedDate);
    let endDateObj = endOfWeek(selectedDate);
    return [startDateObj, endDateObj];
  }, []);
  const getMonthStartEndDateObj = React.useCallback((selectedDate) => {
    let startDateObj = startOfWeek(startOfMonth(selectedDate));
    let endDateObj = endOfWeek(endOfMonth(selectedDate));
    return [startDateObj, endDateObj];
  }, []);
  return { getDateObjInWeek, getStartEndDateObj, getDateObjInMonth, getMonthStartEndDateObj }
}