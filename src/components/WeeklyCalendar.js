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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useSidebar } from '../services/sidebar';
import Sidebar from './Sidebar';

export default function WeeklyCalendar() {

  const { getDateObjInWeek, getDaysInWeek, getStartEndDateObj } = useCalendar();
  const { get } = useHttp();
  const today = moment();
  const [scheduleItems, setScheduleItems] = React.useState([]);
  const [displayData, setDisplayData] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [modalOpen, setModalOpen] = React.useState(false);
  const defaultModalItem = {"id": 0, "name": "", "type": "create", "date": today, "done": false, "tag": "u"}
  const [modalItem, setModalItem] = React.useState(defaultModalItem);
  const [loading, setLoading] = React.useState(true);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState("")
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("success")
  const {selectedTagId, tagModalOpen} = useSidebar();

  const gotoNextWeek = React.useCallback(() => {
    if (loading || modalOpen || tagModalOpen) return;
    const newDate = selectedDate.clone().add(7, "days");
    setSelectedDate(newDate);
  }, [selectedDate, loading, modalOpen, tagModalOpen])

  const gotoPrevWeek = React.useCallback(() => {
    if (loading || modalOpen || tagModalOpen) return;
    const newDate = selectedDate.clone().subtract(7, "days");
    setSelectedDate(newDate);
  }, [selectedDate, loading, modalOpen, tagModalOpen])

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
    setLoading(false);
  }, [getDateObjInWeek, getDaysInWeek, selectedDate, getScheduleItemsForDate])

  const handleRetrieveScheduleItems = React.useCallback((data) => {
    setScheduleItems(data);
    generateDisplayData(data);
  }, [setScheduleItems, generateDisplayData]);

  const retrieveScheduleItems = React.useCallback((selectedDate) => {
    setLoading(true);
    const [startDateObj, endDateObj] = getStartEndDateObj(selectedDate);
    let url = 'schedule_items/?start_date=' + startDateObj.format('YYYY-MM-DD') + '&end_date=' +endDateObj.format('YYYY-MM-DD');
    if (selectedTagId !== "a") {
      url += "&tag=" + selectedTagId
    }
    get(url, handleRetrieveScheduleItems);
  }, [get, getStartEndDateObj, handleRetrieveScheduleItems, selectedTagId]);

  const openModal = (id, date) => {
    if (date) {  // specify date for create modal
      let modalItem = {...defaultModalItem};
      modalItem.date = date;
      modalItem.tag = selectedTagId === "a"? "u" : selectedTagId;
      setModalItem(modalItem);
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

  const handleModalClose = React.useCallback((alertMsg=null, severity=null) => {
    if (alertMsg !== null && severity !== null) {
      setSnackbarOpen(true);
      setSnackbarMessage(alertMsg);
      setSnackbarSeverity(severity);
    }
    setModalOpen(false);
  }, [setSnackbarOpen, setSnackbarMessage, setSnackbarSeverity])

  const truncateIfTooLong = React.useCallback((text) => {
    const max_length = 33;
    if (text.length > 33) {
      return text.substr(0, max_length-3) + "...";
    } else {
      return text;
    }
  }, [])
  
  React.useEffect(() => {
    retrieveScheduleItems(selectedDate, true);
  }, [getDateObjInWeek, getDaysInWeek, generateDisplayData, retrieveScheduleItems, selectedDate, modalOpen, selectedTagId, tagModalOpen]);

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  return (
    <Container maxWidth="md" sx={{p: 0}} {...swipeHandler}>
      <Sidebar />
      <Snackbar anchorOrigin={{"vertical": "top", "horizontal": "center"}} 
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={3000}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
      </Snackbar>
      <Stack alignItems="center">
        <Stack direction="row">
          <IconButton color="primary" sx={{mt: 2}} onClick={() => gotoPrevWeek()}><ArrowBackIcon /></IconButton>
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
          <IconButton color="primary" sx={{mt: 2}} onClick={() => gotoNextWeek()}><ArrowForwardIcon /></IconButton>
        </Stack>
      </Stack>
      <Grid container sx={{mt: 1, border: 1, borderColor: "grey.300"}}>
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
                    <Chip label={truncateIfTooLong(item.name)} size="small" color={item.done? "success": "warning"} onClick={() => openModal(item.id)}></Chip>
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
      { selectedDate.startOf("week").isSame(today.startOf("week")) ? null :
        <Stack alignItems="center">
          <Button variant="outlined" size="small" sx={{mt: 1}} onClick={() => setSelectedDate(today)}>Current week</Button>
        </Stack>
      }
      <ScheduleItemModal 
        open={modalOpen} 
        id={modalItem.id} 
        name={modalItem.name} 
        type={modalItem.type} 
        date={modalItem.date}
        done={modalItem.done}
        tag={modalItem.tag}
        handleClose={(alertMsg, severity) => handleModalClose(alertMsg, severity)} />
    </Container>
  )
}