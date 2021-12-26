import * as React from 'react';
import moment from 'moment';

export function useCalendar() {
  const getDatesInWeek = React.useCallback((startDate) => {
    let dates = [];
    let currentDate;
    if (startDate == null) {
      currentDate = moment().startOf("week");
    } else {
      currentDate = startDate;
    }
    for (let i = 0; i < 7; i++) {
      dates.push(currentDate.format("D MMM"));
      currentDate.add(1, "days");
    }
    return dates
  }, [])
  const getDaysInWeek = React.useCallback(() => {
    return ["LD", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  }, [])
  return { getDatesInWeek, getDaysInWeek }
}