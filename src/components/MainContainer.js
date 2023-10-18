import * as React from 'react';
import Sidebar from './Sidebar';
import WeeklyCalendar from './WeeklyCalendar';
import MonthlyCalendar from './MonthlyCalendar';
import Settings from './Settings';
import SearchModal from './SearchModal';
import { useGlobalData } from '../services/globalData';
import { isMobile } from 'react-device-detect';

export default function MainContainer() {
  const [globalData, setGlobalData] = useGlobalData();

  React.useEffect(() => {
    if (!isMobile) setGlobalData((prev) => ({ ...prev, calView: "monthly"}))
  }, [setGlobalData]);

  return (
    <React.Fragment>
      <Sidebar />
      { globalData.calView === "weekly" ?
        <WeeklyCalendar /> :
        globalData.calView === "monthly" ?
        <MonthlyCalendar /> :
        <Settings />
      }
      <SearchModal
        open={globalData.searchModalOpen}
      />
    </React.Fragment>
  )
}