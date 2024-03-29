import * as React from 'react';
import Container from '@mui/material/Container';
import { useGlobalData } from '../services/globalData';
import { useCalendar } from '../services/calendar';
import { format, isSameDay, add, sub, startOfMonth, isSameMonth, startOfWeek, endOfWeek, isWithinInterval, endOfMonth, parse } from 'date-fns';
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
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import LinearProgress from '@mui/material/LinearProgress';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useSlide } from '../services/slide';
import { useTouch } from '../services/touch';
import ScheduleItemModal from './ScheduleItemModal';
import { useSnackbar } from '../services/snackbar';

export default function MonthlyCalendar() {
  const [globalData] = useGlobalData();
  const {getDateObjIn3Months, get3MonthsStartEndDateObj, getDaysInWeek, getTimeStr} = useCalendar();
  const [displayData, setDisplayData] = React.useState([]);
  const { get } = useHttp();
  const theme = useTheme();
  const [modalOpen, setModalOpen] = React.useState(false);
  const today = React.useRef(new Date());
  const defaultModalItem = {"id": 0, "name": "", "type": "create", "date": today.current, "time": "", "done": false, "tag": "u"}
  const [modalItem, setModalItem] = React.useState(defaultModalItem);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const {renderMonthPickerDay, setCustomDayValue, setSelectedDateForAll} = useCustomDay();
  const {openSnackbar} = useSnackbar();
  const [loading, setLoading] = React.useState(false);
  const slideIndex = React.useRef(0);
  const { getPrevSlideIndex, getNextSlideIndex } = useSlide();
  const swiperDestroyed = React.useRef(false);
  const selectedDateRef = React.useRef(globalData.selectedDate);
  const scheduleItems = React.useRef([]);
  const { registerTouch, handleTouch, defaultTouchRef } = useTouch();
  const touchRef = React.useRef(defaultTouchRef());

  const handleRetrieveScheduleItems = React.useCallback((items=[], replace=false) => {
    scheduleItems.current = replace? items : scheduleItems.current;
    let data = [];
    let itemMapping = {};
    for (let item of scheduleItems.current) {
      if (item.date in itemMapping) {
        itemMapping[item.date].push(item);
      } else {
        itemMapping[item.date] = [item];
      }
    }
    let col = 0;
    let row = 0;
    for (let date of getDateObjIn3Months(selectedDateRef.current)) {
      let slideIndices = [];
      if (isWithinInterval(date, {start: startOfWeek(startOfMonth(sub(selectedDateRef.current, {months: 1}))), end: endOfWeek(endOfMonth(sub(selectedDateRef.current, {months: 1})))})){
        slideIndices.push(getPrevSlideIndex(slideIndex.current));
      }
      if (isWithinInterval(date, {start: startOfWeek(startOfMonth(selectedDateRef.current)), end: endOfWeek(endOfMonth(selectedDateRef.current))})){
        slideIndices.push(slideIndex.current);
      }
      if (isWithinInterval(date, {start: startOfWeek(startOfMonth(add(selectedDateRef.current, {months: 1}))), end: endOfWeek(endOfMonth(add(selectedDateRef.current, {months: 1})))})){
        slideIndices.push(getNextSlideIndex(slideIndex.current));
      }
      if (col === 0) data.push([]);
      let dateStr = format(date, "yyyy-MM-dd");
      data[row].push({
        "date": date,
        "day": format(date, "d"),
        "items": dateStr in itemMapping? itemMapping[dateStr] : [],
        "slideIndices": slideIndices,
      })
      col += 1;
      if (col === 7) { col = 0; row += 1; }
    }
    setDisplayData(data);
    setLoading(false);
  }, [getDateObjIn3Months, getPrevSlideIndex, getNextSlideIndex, scheduleItems]);

  const retrieveScheduleItems = React.useCallback((selectedDate) => {
    setLoading(true);
    const [startDateObj, endDateObj] = get3MonthsStartEndDateObj(selectedDate);
    let url = 'schedule_items/?start_date=' + format(startDateObj, 'yyyy-MM-dd') + '&end_date=' + format(endDateObj, 'yyyy-MM-dd');
    if (globalData.selectedTagId !== "a") {
      url += "&tag=" + globalData.selectedTagId
    }
    get(url, (data) => {handleRetrieveScheduleItems(data, true)});
  }, [get, get3MonthsStartEndDateObj, handleRetrieveScheduleItems, globalData.selectedTagId]);

  const gotoNextMonth = React.useCallback((delay=0) => {
    const newDate = add(startOfMonth(selectedDateRef.current), {"months": 1})
    setTimeout(() => {
      setSelectedDateForAll(newDate, selectedDateRef);
      handleRetrieveScheduleItems()
    }, delay);
  }, [setSelectedDateForAll, handleRetrieveScheduleItems])

  const gotoPrevMonth = React.useCallback((delay=0) => {
    const newDate = sub(startOfMonth(selectedDateRef.current), {"months": 1})
    setTimeout(() => {
      setSelectedDateForAll(newDate, selectedDateRef);
      handleRetrieveScheduleItems()
    }, delay);
  }, [setSelectedDateForAll, handleRetrieveScheduleItems])

  const handleSlideNext = React.useCallback((swiper) => {
    if (swiperDestroyed.current) return;
    slideIndex.current = swiper.realIndex;
    gotoNextMonth(50)
  }, [gotoNextMonth])

  const handleSlidePrev = React.useCallback((swiper) => {
    if (swiperDestroyed.current) return;
    slideIndex.current = swiper.realIndex;
    gotoPrevMonth(50);
  }, [gotoPrevMonth])

  const handleKeyUp = React.useCallback((e) => {
    if (loading || modalOpen || globalData.tagModalOpen || datePickerOpen || globalData.sidebarOpen) return;
    if (e.keyCode === 37) {
      gotoPrevMonth();
    } else if (e.keyCode === 39) {
      gotoNextMonth();
    }
  }, [gotoPrevMonth, gotoNextMonth, loading, modalOpen, globalData.tagModalOpen, datePickerOpen, globalData.sidebarOpen])

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

  const getItemStyle = React.useCallback((item) => {
    let baseCSS = {display: "block", lineHeight: "1.2em", color: "white", borderRadius: "3px", my: 0.2, px: 0.2, py: 0.1, cursor: "pointer"}
    if (item.done) {
      baseCSS["background"] = theme.palette.success.main;
    } else {
      baseCSS["background"] = theme.palette.primary.main;
    }
    return baseCSS;
  }, [theme.palette]);

  const getDayStyle = React.useCallback((date, slideIndices, currIndex) => {
    let style = {flex: 1, border: 0.5, borderColor: "grey.500", px: 0.5}
    if (isSameDay(date, today.current)){
      style.backgroundColor = "LightYellow";
    } else if (slideIndices.length === 1) {
      if (currIndex === getPrevSlideIndex(slideIndex.current) && !isSameMonth(startOfWeek(date), endOfWeek(date))) {  // start-of-month for prev slide
        style.backgroundColor = isSameMonth(date, endOfWeek(date)) ? "White":"grey.300";
      } else if (currIndex === getNextSlideIndex(slideIndex.current) && !isSameMonth(startOfWeek(date), endOfWeek(date))) {  // end-of-month for next slide
        style.backgroundColor = isSameMonth(date, startOfWeek(date)) ? "White":"grey.300";
      } else {
        style.backgroundColor = "White";
      }
    } else {
      if (slideIndices.indexOf(currIndex) === 0) {  // end-of-month
        style.backgroundColor = isSameMonth(date, startOfWeek(date)) ? "White":"grey.300";
      } else if (slideIndices.indexOf(currIndex) === 1) {  // start-of-month
        style.backgroundColor = isSameMonth(date, endOfWeek(date)) ? "White":"grey.300";
      }
    }
    return style;
  }, [today, getPrevSlideIndex, getNextSlideIndex]);

  const showCurrentMonthButton = React.useCallback((currIndex) => {
    if (displayData.length === 0) return false;
    let filteredData = displayData.filter(((weekData) => weekData[0].slideIndices.includes(currIndex)))
    if (isSameMonth(endOfWeek(filteredData[0][0].date), today.current)) return false;
    return true;
  }, [today, displayData]);

  React.useEffect(() => {
    if (!isSameDay(selectedDateRef.current, globalData.selectedDate)) selectedDateRef.current = globalData.selectedDate;
    if (!modalOpen) retrieveScheduleItems(globalData.selectedDate);
  }, [retrieveScheduleItems, globalData.selectedDate, globalData.selectedTagId, globalData.tagModalOpen, modalOpen]);

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  return (
    <Container sx={{p: 0}}>
      <Fade in={loading}><LinearProgress /></Fade>
      <Stack alignItems="center" sx={{mb: 1}}>
        <Stack direction="row" sx={{pt: 2}}>
          <IconButton color="primary" 
            onClick={gotoPrevMonth}
            onTouchStart={(e) => registerTouch(e, touchRef.current)} 
            onTouchEnd={(e) => handleTouch(e, touchRef.current, gotoPrevMonth)} 
            ><ArrowBackIcon /></IconButton>
          <MobileDatePicker
            value={selectedDateRef.current}
            label="Select month"
            onChange={(value) => {setCustomDayValue(value)}}
            onAccept={(value) => {setSelectedDateForAll(value, selectedDateRef); handleRetrieveScheduleItems();}}
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
          <IconButton color="primary" 
            onClick={gotoNextMonth}
            onTouchStart={(e) => registerTouch(e, touchRef.current)} 
            onTouchEnd={(e) => handleTouch(e, touchRef.current, gotoNextMonth)} 
            ><ArrowForwardIcon /></IconButton>
        </Stack>
      </Stack>
      <Swiper loop={true} preventClicks={false} preventClicksPropagation={false} speed={200}
        onSlideNextTransitionStart={handleSlideNext} onSlidePrevTransitionStart={handleSlidePrev} 
        onAfterInit={() => swiperDestroyed.current=false} onBeforeDestroy={() => {swiperDestroyed.current=true}}>
        {[0, 1, 2].map((slideIndex) => (
          <SwiperSlide key={"slide"+slideIndex}>
            <Grid container justifyContent="space-evenly">
              {getDaysInWeek().map((day) => (
                <Grid item sx={{flex: 1, border: 0.5, borderTop: 1, borderColor: "grey.500", py: 0.5}} key={slideIndex+"-header-"+day}>
                  <Typography variant="body2" component="p" align="center" fontWeight="medium">{day}</Typography>
                </Grid>
              ))}
            </Grid>
            {displayData.filter((weekData) => weekData[0].slideIndices.includes(slideIndex)).map((weekData) => (
              <Grid container justifyContent="space-evenly" sx={{minHeight: "6.5em"}} key={"week-"+weekData[0].date}>
                {weekData.map((dayData) => (
                  <Grid item zeroMinWidth sx={getDayStyle(dayData.date, dayData.slideIndices, slideIndex)} key={slideIndex+"-date-"+dayData.date}>
                    <Typography variant="body2" component="p" align="center" fontWeight="medium"
                      sx={{cursor: "pointer"}}
                      onClick={() => openModal(0, dayData.date)}
                        onTouchStart={(e) => registerTouch(e, touchRef.current)} 
                        onTouchEnd={(e) => handleTouch(e, touchRef.current, () => openModal(0, dayData.date))} 
                      >{dayData.day}</Typography>
                    {dayData.items.map((item) => (
                      <React.Fragment key={item.id}>
                        <Typography noWrap variant="caption" fontWeight="400" 
                          onClick={() => openModal(item.id)}
                          onTouchStart={(e) => registerTouch(e, touchRef.current)} 
                          onTouchEnd={(e) => handleTouch(e, touchRef.current, () => openModal(item.id))} 
                          sx={getItemStyle(item)}>{item.name+getTimeStr(item.time)}</Typography>
                      </React.Fragment>
                    ))}
                  </Grid>
                ))}
              </Grid>
            ))}
            { showCurrentMonthButton(slideIndex) ?
              <Stack alignItems="center">
                <Button variant="outlined" size="small" sx={{mt: 1}} 
                  onClick={() => {setSelectedDateForAll(today.current, selectedDateRef); handleRetrieveScheduleItems();}}
                  onTouchStart={(e) => registerTouch(e, touchRef.current)} 
                  onTouchEnd={(e) => handleTouch(e, touchRef.current, () => {setSelectedDateForAll(today.current, selectedDateRef); handleRetrieveScheduleItems();})} 
                  >Current month</Button>
              </Stack> : null
            }
          </SwiperSlide>
        ))}
      </Swiper>
      <ScheduleItemModal 
        open={modalOpen} 
        id={modalItem.id} 
        name={modalItem.name} 
        type={modalItem.type} 
        date={modalItem.date}
        time={modalItem.time}
        done={modalItem.done}
        tag={modalItem.tag}
        handleClose={(alertMsg, severity) => handleModalClose(alertMsg, severity)} />
    </Container>
  )
}