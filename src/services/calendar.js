import * as React from 'react';
import { startOfWeek, endOfWeek, add } from 'date-fns';
import { USE_LD } from '../config';

export function useCalendar() {
  const getDateObjInWeek = React.useCallback((selectedDate) => {
    let dates = [];
    let currentDate;
    if (selectedDate == null) {
      currentDate = startOfWeek(new Date());
    } else {
      currentDate = startOfWeek(selectedDate);
    }
    for (let i = 0; i < 7; i++) {
      dates.push(currentDate);
      currentDate = add(currentDate, {"days": 1})
    }
    return dates
  }, [])
  const getDaysInWeek = React.useCallback(() => {
    if (USE_LD) {
      return ["LD", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    } else {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    }
  }, [])
  const getStartEndDateObj = React.useCallback((selectedDate) => {
    let startDateObj = startOfWeek(selectedDate);
    let endDateObj = endOfWeek(selectedDate);
    return [startDateObj, endDateObj];
  }, []);
  return { getDateObjInWeek, getDaysInWeek, getStartEndDateObj }
}