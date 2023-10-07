import * as React from 'react';
import Container from '@mui/material/Container';
import { useGlobalData } from '../services/globalData';
import { useCalendar } from '../services/calendar';
import { format, isSameDay, add, sub, startOfMonth, isSameMonth, isBefore, startOfWeek, endOfWeek, isWithinInterval, endOfMonth } from 'date-fns';
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


export default function MonthlyCalendar() {
  const [globalData, setGlobalData] = useGlobalData();
  const {getDateObjIn3Months, get3MonthsStartEndDateObj, getDaysInWeek} = useCalendar();
  const [displayData, setDisplayData] = React.useState([]);
  const { get } = useHttp();
  const theme = useTheme();
  let today = React.useRef(new Date());
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const {renderMonthPickerDay, setCustomDayValue, setSelectedDateForAll} = useCustomDay();
  const [loading, setLoading] = React.useState(false);
  const [slideIndex, setSlideIndex] = React.useState(0);
  const { getPrevSlideIndex, getNextSlideIndex } = useSlide();
  const swiperDestroyed = React.useRef(false);

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
    for (let date of getDateObjIn3Months(globalData.selectedDate)) {
      let slideIndices = [];
      if (isWithinInterval(date, {start: startOfWeek(startOfMonth(sub(globalData.selectedDate, {months: 1}))), end: endOfWeek(endOfMonth(sub(globalData.selectedDate, {months: 1})))})){
        slideIndices.push(getPrevSlideIndex(slideIndex));
      }
      if (isWithinInterval(date, {start: startOfWeek(startOfMonth(globalData.selectedDate)), end: endOfWeek(endOfMonth(globalData.selectedDate))})){
        slideIndices.push(slideIndex);
      }
      if (isWithinInterval(date, {start: startOfWeek(startOfMonth(add(globalData.selectedDate, {months: 1}))), end: endOfWeek(endOfMonth(add(globalData.selectedDate, {months: 1})))})){
        slideIndices.push(getNextSlideIndex(slideIndex));
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
  }, [getDateObjIn3Months, globalData.selectedDate, slideIndex, getPrevSlideIndex, getNextSlideIndex]);

  const retrieveScheduleItems = React.useCallback((selectedDate) => {
    setLoading(true);
    const [startDateObj, endDateObj] = get3MonthsStartEndDateObj(selectedDate);
    let url = 'schedule_items/?start_date=' + format(startDateObj, 'yyyy-MM-dd') + '&end_date=' + format(endDateObj, 'yyyy-MM-dd');
    if (globalData.selectedTagId !== "a") {
      url += "&tag=" + globalData.selectedTagId
    }
    get(url, handleRetrieveScheduleItems);
  }, [get, get3MonthsStartEndDateObj, handleRetrieveScheduleItems, globalData.selectedTagId]);

  const gotoNextMonth = React.useCallback(() => {
    const newDate = add(startOfMonth(globalData.selectedDate), {"months": 1})
    setTimeout(() =>setSelectedDateForAll(newDate), 0);
  }, [setSelectedDateForAll, globalData.selectedDate])

  const gotoPrevMonth = React.useCallback(() => {
    const newDate = sub(startOfMonth(globalData.selectedDate), {"months": 1})
    setTimeout(() => setSelectedDateForAll(newDate), 0);
  }, [setSelectedDateForAll, globalData.selectedDate])

  const handleSlideNext = React.useCallback((swiper) => {
    if (swiperDestroyed.current) return;
    gotoNextMonth()
    setSlideIndex(swiper.realIndex);
  }, [setSlideIndex, gotoNextMonth, swiperDestroyed])

  const handleSlidePrev = React.useCallback((swiper) => {
    if (swiperDestroyed.current) return;
    gotoPrevMonth();
    setSlideIndex(swiper.realIndex);
  }, [setSlideIndex, gotoPrevMonth, swiperDestroyed])

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

  const getItemStyle = React.useCallback((item) => {
    let baseCSS = {display: "block", lineHeight: "1.2em", color: "white", borderRadius: "3px", my: 0.2, px: 0.2, py: 0.1}
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
      if (currIndex === getPrevSlideIndex(slideIndex) && !isSameMonth(startOfWeek(date), endOfWeek(date))) {  // start-of-month for prev slide
        style.backgroundColor = isSameMonth(date, endOfWeek(date)) ? "White":"grey.300";
      } else if (currIndex === getNextSlideIndex(slideIndex) && !isSameMonth(startOfWeek(date), endOfWeek(date))) {  // end-of-month for next slide
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, displayData, getPrevSlideIndex, getNextSlideIndex]);

  const showCurrentMonthButton = React.useCallback((currIndex) => {
    if (displayData.length === 0) return false;
    let filteredData = displayData.filter(((weekData) => weekData[0].slideIndices.includes(currIndex)))
    if (isSameMonth(endOfWeek(filteredData[0][0].date), today.current)) return false;
    return true;
  }, [today, displayData]);

  React.useEffect(() => {
    retrieveScheduleItems(globalData.selectedDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalData.selectedDate, globalData.selectedTagId, globalData.tagModalOpen]);

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  return (
    <Container sx={{p: 0}}>
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
      <Swiper loop={true} preventClicks={false} preventClicksPropagation={false}
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
                  <Grid item zeroMinWidth sx={getDayStyle(dayData.date, dayData.slideIndices, slideIndex)} onClick={() => gotoWeek(dayData.date)} key={slideIndex+"-date-"+dayData.date}>
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
            { showCurrentMonthButton(slideIndex) ?
              <Stack alignItems="center">
                <Button variant="outlined" size="small" sx={{mt: 1}} 
                  onTouchStart={() => setSelectedDateForAll(today.current)}
                  onClick={() => setSelectedDateForAll(today.current)}
                  >Current month</Button>
              </Stack> : null
            }
          </SwiperSlide>
        ))}
      </Swiper>
    </Container>
  )
}