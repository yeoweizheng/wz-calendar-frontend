import * as React from 'react';
import moment from 'moment';

export function useCalendar() {
  const getDateObjInWeek = React.useCallback((selectedDate) => {
    let dates = [];
    let currentDate;
    if (selectedDate == null) {
      currentDate = moment().startOf("week");
    } else {
      currentDate = selectedDate.clone().startOf("week");
    }
    for (let i = 0; i < 7; i++) {
      dates.push(currentDate.clone());
      currentDate.add(1, "days");
    }
    return dates
  }, [])
  const getDaysInWeek = React.useCallback(() => {
    return ["LD", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  }, [])
  const getStartEndDateObj = React.useCallback((selectedDate) => {
    let startDateObj = selectedDate.clone().startOf("week");
    let endDateObj = startDateObj.clone().add(6, "days");
    return [startDateObj, endDateObj];
  }, []);
  return { getDateObjInWeek, getDaysInWeek, getStartEndDateObj }
}