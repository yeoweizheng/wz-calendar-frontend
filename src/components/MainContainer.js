import * as React from 'react';
import Sidebar from './Sidebar';
import WeeklyCalendar from './WeeklyCalendar';
import MonthlyCalendar from './MonthlyCalendar';
import Settings from './Settings';
import SearchModal from './SearchModal';
import { useGlobalData } from '../services/globalData';
import { useNav } from '../services/nav';

export default function MainContainer() {
  const [globalData,] = useGlobalData();
  const { switchToCalView } = useNav();

  React.useEffect(() => {
    switchToCalView();
  }, [switchToCalView]);

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