import * as React from 'react';
import Sidebar from './Sidebar';
import WeeklyCalendar from './WeeklyCalendar';
import MonthlyCalendar from './MonthlyCalendar';
import { useGlobalData } from '../services/globalData';

export default function MainContainer(props) {
  const [globalData,] = useGlobalData();
  return (
    <React.Fragment>
      <Sidebar />
      {globalData.calView === "weekly" ?
        <WeeklyCalendar /> :
        <MonthlyCalendar />
      }
    </React.Fragment>
  )
}