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
import ScheduleItemModal from './ScheduleItemModal';
import IconButton from '@mui/material/IconButton';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotesIcon from '@mui/icons-material/Notes';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useGlobalData } from '../services/globalData';
import { useCustomDay } from '../services/customday';
import { add, sub, format, isSameDay, parse } from 'date-fns';
import { useSnackbar } from '../services/snackbar';
import Fade from '@mui/material/Fade';
import LinearProgress from '@mui/material/LinearProgress';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useSlide } from '../services/slide';
import { useTouch } from '../services/touch';

export default function WeeklyCalendar() {

  const { getDateObjIn3Weeks, get3WeeksStartEndDateObj, getTimeStr } = useCalendar();
  const { get } = useHttp();
  const [globalData,] = useGlobalData();
  const [displayData, setDisplayData] = React.useState([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const today = React.useRef(new Date());
  const defaultModalItem = {"id": 0, "name": "", "type": "create", "date": today.current, "time": "", "notes": "", "done": false, "tag": "u"}
  const [modalItem, setModalItem] = React.useState(defaultModalItem);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const {renderWeekPickerDay, setCustomDayValue, setSelectedDateForAll} = useCustomDay();
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
    const dates = getDateObjIn3Weeks(selectedDateRef.current);
    let data = [];
    let itemMapping = {};
    for (let item of scheduleItems.current) {
      if (item.date in itemMapping) {
        itemMapping[item.date].push(item);
      } else {
        itemMapping[item.date] = [item];
      }
    }
    for (let i = 0; i < 21; i++) {
      let dateStr = format(dates[i], "yyyy-MM-dd");
      let dataSlideIndex;
      if (i < 7) dataSlideIndex = getPrevSlideIndex(slideIndex.current);
      if (i >= 7 && i < 14) dataSlideIndex = slideIndex.current;
      if (i >= 14) dataSlideIndex = getNextSlideIndex(slideIndex.current);
      data.push({
        "date": dates[i],
        "day": format(dates[i], "E"),
        "items": dateStr in itemMapping? itemMapping[dateStr] : [],
        "slideIndex": dataSlideIndex
      });
    }
    setLoading(false);
    setDisplayData(data);
  }, [getDateObjIn3Weeks, getPrevSlideIndex, getNextSlideIndex])

  const gotoNextWeek = React.useCallback((delay=0) => {
    const newDate = add(selectedDateRef.current, {"weeks": 1})
    setTimeout(() => {
      setSelectedDateForAll(newDate, selectedDateRef)
      handleRetrieveScheduleItems();
    }, delay)
  }, [setSelectedDateForAll, handleRetrieveScheduleItems])

  const gotoPrevWeek = React.useCallback((delay=0) => {
    const newDate = sub(selectedDateRef.current, {"weeks": 1})
    setTimeout(() => {
      setSelectedDateForAll(newDate, selectedDateRef)
      handleRetrieveScheduleItems();
    }, delay);
  }, [setSelectedDateForAll, handleRetrieveScheduleItems])

  const handleKeyUp = React.useCallback((e) => {
    if (loading || modalOpen || globalData.tagModalOpen || datePickerOpen || globalData.sidebarOpen) return;
    if (e.keyCode === 37) {
      gotoPrevWeek();
    } else if (e.keyCode === 39) {
      gotoNextWeek();
    }
  }, [gotoPrevWeek, gotoNextWeek, loading, modalOpen, globalData.tagModalOpen, datePickerOpen, globalData.sidebarOpen])

  const retrieveScheduleItems = React.useCallback((selectedDate) => {
    setLoading(true);
    const [startDateObj, endDateObj] = get3WeeksStartEndDateObj(selectedDate);
    let url = 'schedule_items/?start_date=' + format(startDateObj, 'yyyy-MM-dd') + '&end_date=' + format(endDateObj, 'yyyy-MM-dd');
    if (globalData.selectedTagId !== "a") {
      url += "&tag=" + globalData.selectedTagId
    }
    get(url, (data) => {handleRetrieveScheduleItems(data, true)});
  }, [get, get3WeeksStartEndDateObj, handleRetrieveScheduleItems, globalData.selectedTagId]);

  const handleSlideNext = React.useCallback((swiper) => {
    if (swiperDestroyed.current) return;
    slideIndex.current = swiper.realIndex;
    gotoNextWeek(50);
  }, [gotoNextWeek])

  const handleSlidePrev = React.useCallback((swiper) => {
    if (swiperDestroyed.current) return;
    slideIndex.current = swiper.realIndex;
    gotoPrevWeek(50);
  }, [gotoPrevWeek])

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

  const getChipLabel = React.useCallback((item) => {
    let timeStr = getTimeStr(item.time);
    const max_length = 33;
    let itemNameTruncated;
    if (item.name.length + timeStr.length > max_length) {
      itemNameTruncated = item.name.substr(0, max_length - timeStr.length - 3) + "...";
    } else {
      itemNameTruncated = item.name;
    }
    return itemNameTruncated + timeStr;
  }, [getTimeStr])

  const getSameDayStyle = React.useCallback((date) => {
    return {border: 0.5, borderColor: "grey.500", backgroundColor: isSameDay(date, today.current)? "LightYellow":"White"}
  }, [today]);

  const showCurrentWeekButton = React.useCallback((currIndex) => {
    let filteredData = displayData.filter((data) => data.slideIndex === currIndex)
    for(let data of filteredData) {
      if (isSameDay(data.date, today.current)) return false; 
    }
    return true;
  }, [today, displayData]);

  React.useEffect(() => {
    if (!isSameDay(selectedDateRef.current, globalData.selectedDate)) selectedDateRef.current = globalData.selectedDate;
    if (!modalOpen) retrieveScheduleItems(globalData.selectedDate);
  }, [retrieveScheduleItems, globalData.selectedDate, modalOpen, globalData.selectedTagId, globalData.tagModalOpen]);

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  return (
    <Container maxWidth="md" sx={{p: "0 !important", overflowX: "hidden"}}>
      <Fade in={loading}><LinearProgress /></Fade>
      <Stack alignItems="center">
        <Stack direction="row" sx={{pt: 2}}>
          <IconButton color="primary"
            onClick={gotoPrevWeek}
            onTouchStart={(e) => registerTouch(e, touchRef.current)} 
            onTouchEnd={(e) => handleTouch(e, touchRef.current, gotoPrevWeek)} 
            ><ArrowBackIcon /></IconButton>
          <MobileDatePicker
            value={selectedDateRef.current}
            label="Select week"
            onChange={(value) => {setCustomDayValue(value)}}
            onAccept={(value) => {setSelectedDateForAll(value, selectedDateRef); handleRetrieveScheduleItems();}}
            onOpen={() => setDatePickerOpen(true)}
            onClose={() => setDatePickerOpen(false)}
            renderDay={renderWeekPickerDay}
            inputFormat="'Week 'w' of 'yyyy"
            renderInput={(params) => {
              return <TextField size="small" {...params} />}
            }
            reduceAnimations={true}
            keepMounted
          />
          <IconButton color="primary" 
            onClick={gotoNextWeek}
            onTouchStart={(e) => registerTouch(e, touchRef.current)} 
            onTouchEnd={(e) => handleTouch(e, touchRef.current, gotoNextWeek)} 
            ><ArrowForwardIcon /></IconButton>
        </Stack>
      </Stack>
      <Swiper loop={true} preventClicks={false} preventClicksPropagation={false} speed={200}
        onSlideNextTransitionStart={handleSlideNext} onSlidePrevTransitionStart={handleSlidePrev}
        onAfterInit={() => swiperDestroyed.current=false} onBeforeDestroy={() => {swiperDestroyed.current=true}}>
        {[0,1,2].map((slideIndex) => (
          <SwiperSlide key={slideIndex}>
            <Grid container sx={{mt: 1, border: 0.5, borderColor: "grey.500"}}>
              {displayData.filter((data) => data.slideIndex === slideIndex).map((data) => (
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
                          <Chip label={getChipLabel(item)} size="small" color={item.done? "success": "primary"} 
                            icon={item.notes === "" ? null : <NotesIcon />}
                            onClick={() => openModal(item.id)} 
                            onTouchStart={(e) => registerTouch(e, touchRef.current)} 
                            onTouchEnd={(e) => handleTouch(e, touchRef.current, () => openModal(item.id))} 
                            sx={{ fontWeight: "medium" }}>
                          </Chip>
                        </React.Fragment>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={1} sm={1} md={1} sx={getSameDayStyle(data.date)}>
                    <Box sx={{ pt: 1, pb: 1 }} textAlign="center">
                      <IconButton size="small" 
                        onClick={() => openModal(0, data.date)}
                        onTouchStart={(e) => registerTouch(e, touchRef.current)}
                        onTouchEnd={(e) => handleTouch(e, touchRef.current, () => openModal(0, data.date))}
                        ><AddBoxIcon fontSize="small" /></IconButton>
                    </Box>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
            { showCurrentWeekButton(slideIndex) ? 
              <Stack alignItems="center">
                <Button variant="outlined" size="small" sx={{mt: 1}} 
                  onClick={() => {setSelectedDateForAll(today.current, selectedDateRef); handleRetrieveScheduleItems();}}
                  onTouchStart={(e) => registerTouch(e, touchRef.current)}
                  onTouchEnd={(e) => handleTouch(e, touchRef.current, () => {setSelectedDateForAll(today.current, selectedDateRef); handleRetrieveScheduleItems();})}
                  >Current week</Button>
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
        notes={modalItem.notes}
        time={modalItem.time}
        done={modalItem.done}
        tag={modalItem.tag}
        handleClose={(alertMsg, severity) => handleModalClose(alertMsg, severity)} />
    </Container>
  )
}
