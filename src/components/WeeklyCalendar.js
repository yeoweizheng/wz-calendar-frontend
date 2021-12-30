import * as React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { useCalendar } from '../services/calendar';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import moment from 'moment';
import Stack from '@mui/material/Stack';
import { useHttp } from '../services/http';
import { useSwipeable } from 'react-swipeable';
import ScheduleItemModal from './ScheduleItemModal';
import IconButton from '@mui/material/IconButton';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Box from '@mui/material/Box';

export default function WeeklyCalendar() {

  const { getDateObjInWeek, getDaysInWeek, getStartEndDateObj } = useCalendar();
  const { get } = useHttp();
  const today = moment();
  const [scheduleItems, setScheduleItems] = React.useState([]);
  const [displayData, setDisplayData] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [modalOpen, setModalOpen] = React.useState(false);
  const defaultModalItem = {"id": 0, "name": "", "type": "create", "date": today, "done": false}
  const [modalItem, setModalItem] = React.useState(defaultModalItem);

  const gotoNextWeek = React.useCallback(() => {
    const newDate = selectedDate.clone().add(7, "days");
    setSelectedDate(newDate);
  }, [selectedDate])

  const gotoPrevWeek = React.useCallback(() => {
    const newDate = selectedDate.clone().subtract(7, "days");
    setSelectedDate(newDate);
  }, [selectedDate])

  const handleSwipe = React.useCallback((e) => {
    if (e.dir === "Left") {
      gotoNextWeek();
    } else if (e.dir === "Right") {
      gotoPrevWeek();
    }
  }, [gotoPrevWeek, gotoNextWeek])

  const swipeHandler = useSwipeable({
    onSwiped: (e) => handleSwipe(e)
  })

  const handleKeyUp = React.useCallback((e) => {
    if (e.keyCode === 37) {
      gotoPrevWeek();
    } else if (e.keyCode === 39) {
      gotoNextWeek();
    }
  }, [gotoPrevWeek, gotoNextWeek])

  const getScheduleItemsForDate = React.useCallback((scheduleItems, dateObj) => {
    let items = [];
    const searchDate = dateObj.format('YYYY-MM-DD');
    for (let item of scheduleItems) {
      if (item.date === searchDate) items.push(item);
    }
    return items;
  }, []);

  const generateDisplayData = React.useCallback((scheduleItems) => {
    const dates = getDateObjInWeek(selectedDate);
    const days = getDaysInWeek();
    let data = [];
    for (let i = 0; i < 7; i++) {
      data.push({
        "date": dates[i],
        "day": days[i], 
        "items": getScheduleItemsForDate(scheduleItems, dates[i])})
    }
    setDisplayData(data);
  }, [getDateObjInWeek, getDaysInWeek, selectedDate, getScheduleItemsForDate])

  const handleRetrieveScheduleItems = React.useCallback((data) => {
    setScheduleItems(data);
    generateDisplayData(data);
  }, [setScheduleItems, generateDisplayData]);

  const retrieveScheduleItems = React.useCallback((selectedDate) => {
    const [startDateObj, endDateObj] = getStartEndDateObj(selectedDate);
    const url = 'schedule_items/?start_date=' + startDateObj.format('YYYY-MM-DD') + '&end_date=' +endDateObj.format('YYYY-MM-DD');
    get(url, handleRetrieveScheduleItems);
  }, [get, getStartEndDateObj, handleRetrieveScheduleItems]);

  const openModal = (id, date) => {
    if (date) {  // specify date for create modal
      defaultModalItem.date = date;
      setModalItem(defaultModalItem);
    } else {
      for (let item of scheduleItems) {
        if (id === item.id) {
          let modalItem = {...item};
          modalItem["type"] = "edit";
          setModalItem(modalItem);
        }
      }
    }
    setModalOpen(true);
  }
  
  React.useEffect(() => {
    retrieveScheduleItems(selectedDate, true);
  }, [getDateObjInWeek, getDaysInWeek, generateDisplayData, retrieveScheduleItems, selectedDate, modalOpen]);

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  return (
    <Container maxWidth="md" sx={{p: 0}} {...swipeHandler}>
      <Stack alignItems="center">
      <MobileDatePicker
        value={selectedDate}
        label="Select week"
        onChange={(value) => {setSelectedDate(value);}}
        renderInput={(params) => {
          const [startDateObj, endDateObj] = getStartEndDateObj(selectedDate);
          params['inputProps']['value'] = startDateObj.format('D MMM YY') + ' - ' + endDateObj.format('D MMM YY');
          return <TextField size="small" sx={{ mt: 2 }} {...params} />}
        }
        keepMounted
      />
      </Stack>
      <Grid container sx={{mt: 2, border: 1, borderColor: "grey.300"}}>
        {displayData.map((data) => (
          <React.Fragment key={data.date}>
            <Grid item xs={3} sm={3} md={3} sx={{border: 1, borderColor: "grey.300", backgroundColor: data.date.isSame(today, "day")? "LightYellow":"White" }}>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" component="p" align="center">{data.date.format('D MMM')}</Typography>
                <Typography variant="body2" component="p" align="center">{data.day}</Typography>
              </Box>
            </Grid>
            <Grid item xs={8} sm={8} md={8} sx={{border: 1, borderColor: "grey.300", backgroundColor: data.date.isSame(today, "day")? "LightYellow":"White" }}>
              <Box sx={{ p: 1 }}>
                {data.items.map((item) => (
                  <React.Fragment key={item.id}>
                    <Chip label={item.name} size="small" color={item.done? "success": "warning"} onClick={() => openModal(item.id)}></Chip>
                  </React.Fragment>
                ))}
              </Box>
            </Grid>
            <Grid item xs={1} sm={1} md={1} sx={{border: 1, borderColor: "grey.300", backgroundColor: data.date.isSame(today, "day")? "LightYellow":"White" }}>
              <Box sx={{ pt: 1, pb: 1 }} textAlign="center">
                <IconButton size="small" onClick={() => openModal(0, data.date)}><AddBoxIcon fontSize="small" /></IconButton>
              </Box>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
      <ScheduleItemModal 
        open={modalOpen} 
        id={modalItem.id} 
        name={modalItem.name} 
        type={modalItem.type} 
        date={modalItem.date}
        done={modalItem.done}
        handleClose={() => setModalOpen(false)} />
    </Container>
  )
}