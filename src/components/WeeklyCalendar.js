import * as React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { useCalendar } from '../services/calendar';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import Stack from '@mui/material/Stack';
import { useHttp } from '../services/http';
import { useSwipeable } from 'react-swipeable';
import ScheduleItemModal from './ScheduleItemModal';
import IconButton from '@mui/material/IconButton';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useGlobalData } from '../services/globalData';
import { useCustomDay } from '../services/customday';
import { add, sub, format, isSameDay, isSameWeek, parse } from 'date-fns';
import { useSnackbar } from '../services/snackbar';

export default function WeeklyCalendar() {

  const { getDateObjInWeek, getDaysInWeek, getStartEndDateObj } = useCalendar();
  const { get } = useHttp();
  const [globalData, setGlobalData] = useGlobalData();
  const [displayData, setDisplayData] = React.useState([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  let today = React.useRef(new Date());
  const defaultModalItem = {"id": 0, "name": "", "type": "create", "date": today.current, "done": false, "tag": "u"}
  const [modalItem, setModalItem] = React.useState(defaultModalItem);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const {renderWeekPickerDay, setCustomDayValue} = useCustomDay();
  const {openSnackbar} = useSnackbar();
  let scheduleItems = React.useRef([]);
  let loading = React.useRef(true);

  const setSelectedDateForAll = React.useCallback((date) => {
    setGlobalData((prev) => ({...prev, selectedDate: date}))
    setCustomDayValue(date);
  }, [setGlobalData, setCustomDayValue])

  const gotoNextWeek = React.useCallback(() => {
    const newDate = add(globalData.selectedDate, {"weeks": 1})
    setSelectedDateForAll(newDate);
  }, [setSelectedDateForAll, globalData.selectedDate])

  const gotoPrevWeek = React.useCallback(() => {
    const newDate = sub(globalData.selectedDate, {"weeks": 1})
    setSelectedDateForAll(newDate);
  }, [setSelectedDateForAll, globalData.selectedDate])

  const handleSwipe = React.useCallback((e) => {
    if (loading.current || modalOpen || globalData.tagModalOpen || datePickerOpen) return;
    if (e.dir === "Left") {
      gotoNextWeek();
    } else if (e.dir === "Right") {
      gotoPrevWeek();
    }
  }, [gotoPrevWeek, gotoNextWeek, loading, modalOpen, globalData.tagModalOpen, datePickerOpen])

  const swipeHandler = useSwipeable({
    onSwiped: (e) => handleSwipe(e)
  })

  const handleKeyUp = React.useCallback((e) => {
    if (loading.current || modalOpen || globalData.tagModalOpen || datePickerOpen) return;
    if (e.keyCode === 37) {
      gotoPrevWeek();
    } else if (e.keyCode === 39) {
      gotoNextWeek();
    }
  }, [gotoPrevWeek, gotoNextWeek, loading, modalOpen, globalData.tagModalOpen, datePickerOpen])

  const handleRetrieveScheduleItems = React.useCallback((items) => {
    scheduleItems.current = items;
    const dates = getDateObjInWeek(globalData.selectedDate);
    const days = getDaysInWeek();
    let data = [];
    let itemMapping = {};
    for (let item of items) {
      if (item.date in itemMapping) {
        itemMapping[item.date].push(item);
      } else {
        itemMapping[item.date] = [item];
      }
    }
    for (let i = 0; i < 7; i++) {
      let dateStr = format(dates[i], "yyyy-MM-dd");
      data.push({
        "date": dates[i],
        "day": days[i], 
        "items": dateStr in itemMapping? itemMapping[dateStr] : []
      });
    }
    setDisplayData(data);
    loading.current = false;
  }, [getDateObjInWeek, getDaysInWeek, globalData.selectedDate])

  const retrieveScheduleItems = React.useCallback((selectedDate) => {
    loading.current = true;
    const [startDateObj, endDateObj] = getStartEndDateObj(selectedDate);
    let url = 'schedule_items/?start_date=' + format(startDateObj, 'yyyy-MM-dd') + '&end_date=' + format(endDateObj, 'yyyy-MM-dd');
    if (globalData.selectedTagId !== "a") {
      url += "&tag=" + globalData.selectedTagId
    }
    get(url, handleRetrieveScheduleItems);
  }, [get, getStartEndDateObj, handleRetrieveScheduleItems, globalData.selectedTagId]);

  const openModal = (id, date) => {
    if (date) {  // specify date for create modal
      let modalItem = {...defaultModalItem};
      modalItem.date = date;
      modalItem.tag = globalData.selectedTagId === "a"? "u" : globalData.selectedTagId;
      setModalItem(modalItem);
    } else {
      for (let item of scheduleItems.current) {
        if (id === item.id) {
          let modalItem = {...item};
          modalItem["type"] = "edit";
          modalItem["date"] = parse(item["date"], "yyyy-MM-dd", new Date());
          setModalItem(modalItem);
        }
      }
    }
    setModalOpen(true);
  }

  const handleModalClose = React.useCallback((alertMsg=null, severity=null) => {
    if (alertMsg !== null && severity !== null) {
      openSnackbar(alertMsg, severity);
    }
    setModalOpen(false);
  }, [openSnackbar, setModalOpen])

  const truncateIfTooLong = React.useCallback((text) => {
    const max_length = 33;
    if (text.length > 33) {
      return text.substr(0, max_length-3) + "...";
    } else {
      return text;
    }
  }, [])

  const getSameDayStyle = React.useCallback((date) => {
    return {border: 1, borderColor: "grey.300", backgroundColor: isSameDay(date, today.current)? "LightYellow":"White"}
  }, [today]);

  React.useEffect(() => {
    retrieveScheduleItems(globalData.selectedDate, true);
  }, [getDateObjInWeek, getDaysInWeek, retrieveScheduleItems, globalData.selectedDate, modalOpen, globalData.selectedTagId, globalData.tagModalOpen]);

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  return (
    <Container maxWidth="md" sx={{p: 0}} {...swipeHandler}>
      <Stack alignItems="center">
        <Stack direction="row" sx={{pt: 2}}>
          <IconButton color="primary" onClick={() => gotoPrevWeek()}><ArrowBackIcon /></IconButton>
          <MobileDatePicker
            value={globalData.selectedDate}
            label="Select week"
            onChange={(value) => {setCustomDayValue(value)}}
            onAccept={(value) => {setSelectedDateForAll(value)}}
            onOpen={() => setDatePickerOpen(true)}
            onClose={() => setDatePickerOpen(false)}
            renderDay={renderWeekPickerDay}
            inputFormat="'Week 'w' of 'yyyy"
            renderInput={(params) => {
              return <TextField size="small" {...params} />}
            }
            keepMounted
          />
          <IconButton color="primary" onClick={() => gotoNextWeek()}><ArrowForwardIcon /></IconButton>
        </Stack>
      </Stack>
      <Grid container sx={{mt: 1, border: 1, borderColor: "grey.300"}}>
        {displayData.map((data) => (
          <React.Fragment key={data.date}>
            <Grid item xs={3} sm={3} md={3} sx={getSameDayStyle(data.date)}>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" component="p" align="center" fontWeight="medium">{format(data.date, "d MMM")}</Typography>
                <Typography variant="body2" component="p" align="center" fontWeight="medium">{data.day}</Typography>
              </Box>
            </Grid>
            <Grid item xs={8} sm={8} md={8} sx={getSameDayStyle(data.date)}>
              <Box sx={{ p: 1 }}>
                {data.items.map((item) => (
                  <React.Fragment key={item.id}>
                    <Chip label={truncateIfTooLong(item.name)} size="small" color={item.done? "success": "primary"} onClick={() => openModal(item.id)} sx={{ fontWeight: "medium" }}></Chip>
                  </React.Fragment>
                ))}
              </Box>
            </Grid>
            <Grid item xs={1} sm={1} md={1} sx={getSameDayStyle(data.date)}>
              <Box sx={{ pt: 1, pb: 1 }} textAlign="center">
                <IconButton size="small" onClick={() => openModal(0, data.date)}><AddBoxIcon fontSize="small" /></IconButton>
              </Box>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
      { isSameWeek(globalData.selectedDate, today.current) ? null :
        <Stack alignItems="center">
          <Button variant="outlined" size="small" sx={{mt: 1}} onClick={() => setSelectedDateForAll(today.current)}>Current week</Button>
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