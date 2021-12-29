import * as React from 'react';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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

export default function WeeklyCalendar() {

  const { getDateObjInWeek, getDaysInWeek, getStartEndDateObj } = useCalendar();
  const { get } = useHttp();
  const [displayData, setDisplayData] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState(moment());
  const [modalOpen, setModalOpen] = React.useState({});

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

  const initModalOpen = React.useCallback((scheduleItems) => {
    let modalOpen = {};
    for (let item of scheduleItems) {
      modalOpen[item.id] = false;
    }
    setModalOpen(modalOpen);
  }, []);

  const getScheduleItemsForDate = (scheduleItems, dateObj) => {
    let items = [];
    const searchDate = dateObj.format('YYYY-MM-DD');
    for (let item of scheduleItems) {
      if (item.date === searchDate) items.push(item);
    }
    return items;
  }

  const generateDisplayData = React.useCallback((scheduleItems) => {
    const dates = getDateObjInWeek(selectedDate);
    const days = getDaysInWeek();
    let data = [];
    for (let i = 0; i < 7; i++) {
      data.push({
        "date": dates[i].format('DD MMM'), 
        "day": days[i], 
        "items": getScheduleItemsForDate(scheduleItems, dates[i])})
    }
    initModalOpen(scheduleItems);
    setDisplayData(data);
  }, [getDateObjInWeek, getDaysInWeek, initModalOpen, selectedDate])

  const handleRetrieveScheduleItems = React.useCallback((data) => {
    generateDisplayData(data);
  }, [generateDisplayData]);

  const retrieveScheduleItems = React.useCallback((selectedDate) => {
    const [startDateObj, endDateObj] = getStartEndDateObj(selectedDate);
    const url = 'schedule_items/?start_date=' + startDateObj.format('YYYY-MM-DD') + '&end_date=' +endDateObj.format('YYYY-MM-DD');
    get(url, handleRetrieveScheduleItems);
  }, [get, getStartEndDateObj, handleRetrieveScheduleItems]);

  const openModal = (id) => {
    modalOpen[id] = true;
    setModalOpen({...modalOpen});
  }
  
  const closeModal = (id) => {
    modalOpen[id] = false;
    setModalOpen({...modalOpen});
  }

  React.useEffect(() => {
    retrieveScheduleItems(selectedDate);
  }, [getDateObjInWeek, getDaysInWeek, generateDisplayData, retrieveScheduleItems, selectedDate]);

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  return (
    <Container maxWidth="md" sx={{p: 0}} {...swipeHandler}>
      <Stack alignItems="center">
      <Typography component="h6" variant="h6" align="center" color="text.primary" sx={{ m: 2 }} gutterBottom >Weekly Calendar</Typography>
      <MobileDatePicker
        value={selectedDate}
        label="Select week"
        onChange={(value) => {setSelectedDate(value);}}
        renderInput={(params) => {
          const [startDateObj, endDateObj] = getStartEndDateObj(selectedDate);
          params['inputProps']['value'] = startDateObj.format('D MMM YY') + ' - ' + endDateObj.format('D MMM YY');
          return <TextField {...params} />}
        }
      />
      </Stack>
      <Grid container sx={{mt: 2}}>
        {displayData.map((data) => (
          <React.Fragment key={data.date}>
            <Grid item xs={2} sm={2} md={2}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" component="p" align="center">{data.date}</Typography>
                  <Typography variant="body1" component="p" align="center">{data.day}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={10} sm={10} md={10}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} >
                <CardContent sx={{ flexGrow: 1 }}>
                  {data.items.map((item) => (
                    <React.Fragment key={item.id}>
                      <Chip label={item.name} onClick={() => openModal(item.id)}></Chip>
                      <ScheduleItemModal open={modalOpen[item.id]} name={item.name} handleClose={() => closeModal(item.id)}/>
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </Container>
  )
}