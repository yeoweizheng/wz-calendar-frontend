import * as React from 'react';
import Container from '@mui/material/Container';
import { useGlobalData } from '../services/globalData';
import { useCalendar } from '../services/calendar';
import { format, isSameDay, add, sub, startOfMonth, isSameMonth, isBefore, startOfWeek, endOfWeek } from 'date-fns';
import { useHttp } from '../services/http';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import { useTheme } from "@mui/material/styles";
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useCustomDay } from '../services/customday';
import { useSwipeable } from 'react-swipeable';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import LinearProgress from '@mui/material/LinearProgress';

export default function MonthlyCalendar() {
  const [globalData, setGlobalData] = useGlobalData();
  const {getDateObjInMonth, getMonthStartEndDateObj, getDaysInWeek} = useCalendar();
  const [displayData, setDisplayData] = React.useState([]);
  const { get } = useHttp();
  const theme = useTheme();
  let today = React.useRef(new Date());
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const {renderMonthPickerDay, setCustomDayValue, setSelectedDateForAll} = useCustomDay();
  const [loading, setLoading] = React.useState(false);

  const handleRetrieveScheduleItems = React.useCallback((items) => {
    let data = [];
    let itemMapping = {};
    for (let item of items) {
      if (item.date in itemMapping) {
        itemMapping[item.date].push(item);
      } else {
        itemMapping[item.date] = [item];
      }
    }
    let col = 0;
    let row = 0;
    for (let date of getDateObjInMonth(globalData.selectedDate)) {
      if (col === 0) data.push([]);
      let dateStr = format(date, "yyyy-MM-dd");
      data[row].push({
        "date": date,
        "day": format(date, "d"),
        "items": dateStr in itemMapping? itemMapping[dateStr] : []
      })
      col += 1;
      if (col === 7) { col = 0; row += 1; }
    }
    setDisplayData(data);
    setLoading(false);
  }, [getDateObjInMonth, globalData.selectedDate]);

  const retrieveScheduleItems = React.useCallback((selectedDate) => {
    setLoading(true);
    const [startDateObj, endDateObj] = getMonthStartEndDateObj(selectedDate);
    let url = 'schedule_items/?start_date=' + format(startDateObj, 'yyyy-MM-dd') + '&end_date=' + format(endDateObj, 'yyyy-MM-dd');
    if (globalData.selectedTagId !== "a") {
      url += "&tag=" + globalData.selectedTagId
    }
    get(url, handleRetrieveScheduleItems);
  }, [get, getMonthStartEndDateObj, handleRetrieveScheduleItems, globalData.selectedTagId]);

  const gotoNextMonth = React.useCallback(() => {
    const newDate = add(startOfMonth(globalData.selectedDate), {"months": 1})
    setSelectedDateForAll(newDate);
  }, [setSelectedDateForAll, globalData.selectedDate])

  const gotoPrevMonth = React.useCallback(() => {
    const newDate = sub(startOfMonth(globalData.selectedDate), {"months": 1})
    setSelectedDateForAll(newDate);
  }, [setSelectedDateForAll, globalData.selectedDate])

  const handleKeyUp = React.useCallback((e) => {
    if (loading || globalData.tagModalOpen || datePickerOpen || globalData.sidebarOpen) return;
    if (e.keyCode === 37) {
      gotoPrevMonth();
    } else if (e.keyCode === 39) {
      gotoNextMonth();
    }
  }, [gotoPrevMonth, gotoNextMonth, loading, globalData.tagModalOpen, datePickerOpen, globalData.sidebarOpen])

  const gotoWeek = React.useCallback((date) => {
    if (!isSameMonth(globalData.selectedDate, date)) {
      if (isBefore(date, globalData.selectedDate)) {
        date = endOfWeek(date);
      } else {
        date = startOfWeek(date);
      }
    }
    setSelectedDateForAll(date);
    setGlobalData((prev) => ({...prev, calView: "weekly"}))
  }, [setSelectedDateForAll, setGlobalData, globalData.selectedDate]);

  const swipeHandler = useSwipeable({
    onSwiped: (e) => handleSwipe(e)
  })

  const handleSwipe = React.useCallback((e) => {
    if (loading || globalData.tagModalOpen || datePickerOpen || globalData.sidebarOpen) return;
    if (e.dir === "Left") {
      gotoNextMonth();
    } else if (e.dir === "Right") {
      gotoPrevMonth();
    }
  }, [gotoPrevMonth, gotoNextMonth, loading, globalData.tagModalOpen, datePickerOpen, globalData.sidebarOpen])

  const getItemStyle = React.useCallback((item) => {
    let baseCSS = {display: "block", lineHeight: "1.2em", color: "white", borderRadius: "3px", my: 0.2, px: 0.2, py: 0.1}
    if (item.done) {
      baseCSS["background"] = theme.palette.success.main;
    } else {
      baseCSS["background"] = theme.palette.primary.main;
    }
    return baseCSS;
  }, [theme.palette]);

  const getDayStyle = React.useCallback((date) => {
    return {flex: 1, border: 1, borderColor: "grey.300", px: 0.5, backgroundColor: isSameDay(date, today.current)? "LightYellow": isSameMonth(date, globalData.selectedDate)? "White":"grey.200"}
  }, [today, globalData.selectedDate]);

  React.useEffect(() => {
    retrieveScheduleItems(globalData.selectedDate);
  }, [retrieveScheduleItems, globalData.selectedDate, globalData.selectedTagId, globalData.tagModalOpen]);

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  return (
    <Container sx={{p: 0}} {...swipeHandler}>
      <Fade in={loading}><LinearProgress /></Fade>
      <Stack alignItems="center" sx={{mb: 1}}>
        <Stack direction="row" sx={{pt: 2}}>
          <IconButton color="primary" onClick={gotoPrevMonth}><ArrowBackIcon /></IconButton>
          <MobileDatePicker
            value={globalData.selectedDate}
            label="Select month"
            onChange={(value) => {setCustomDayValue(value)}}
            onAccept={(value) => {setSelectedDateForAll(value)}}
            onOpen={() => setDatePickerOpen(true)}
            onClose={() => setDatePickerOpen(false)}
            renderDay={renderMonthPickerDay}
            inputFormat="LLL yyyy"
            renderInput={(params) => {
              return <TextField size="small" {...params} />}
            }
            reduceAnimations={true}
            keepMounted
          />
          <IconButton color="primary" onClick={gotoNextMonth}><ArrowForwardIcon /></IconButton>
        </Stack>
      </Stack>
      <Grid container justifyContent="space-evenly">
        {getDaysInWeek().map((day) => (
          <Grid item sx={{flex: 1, border: 1, borderColor: "grey.300", py: 0.5}} key={day}>
            <Typography variant="body2" component="p" align="center" fontWeight="medium">{day}</Typography>
          </Grid>
        ))}
      </Grid>
      {displayData.map((weekData) => (
        <Grid container justifyContent="space-evenly" sx={{minHeight: "6.5em"}} key={weekData[0].day+"-week"}>
          {weekData.map((dayData) => (
            <Grid item zeroMinWidth sx={getDayStyle(dayData.date)} onClick={() => gotoWeek(dayData.date)} key={dayData.day}>
              <Typography variant="body2" component="p" align="center" fontWeight="medium">{dayData.day}</Typography>
              {dayData.items.map((item) => (
                <React.Fragment key={item.id}>
                  <Typography noWrap variant="caption" fontWeight="400" sx={getItemStyle(item)}>{item.name}</Typography>
                </React.Fragment>
              ))}
            </Grid>
          ))}
        </Grid>
      ))}
      { isSameMonth(globalData.selectedDate, today.current) ? null :
        <Stack alignItems="center">
          <Button variant="outlined" size="small" sx={{mt: 1}} onClick={() => setSelectedDateForAll(today.current)}>Current month</Button>
        </Stack>
      }
    </Container>
  )
}