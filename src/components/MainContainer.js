import * as React from 'react';
import Sidebar from './Sidebar';
import WeeklyCalendar from './WeeklyCalendar';

export default function MainContainer(props) {
    return (
        <React.Fragment>
            <Sidebar />
            <WeeklyCalendar />
        </React.Fragment>
    )
}