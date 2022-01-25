import * as React from 'react';
import { styled } from '@mui/material/styles';
import PickersDay from '@mui/lab/PickersDay';
import { useCalendar } from './calendar';
import { isWithinInterval, isSameDay } from 'date-fns';

export function useCustomDay() {
  const [customDayValue, setCustomDayValue] = React.useState(new Date());
  const { getStartEndDateObj } = useCalendar();
  const CustomPickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) =>
      prop !== 'dayIsBetween' && prop !== 'isFirstDay' && prop !== 'isLastDay',
  })(({ theme, dayIsBetween, isFirstDay, isLastDay }) => ({
    ...(dayIsBetween && {
      borderRadius: 0,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.dark,
      },
    }),
    ...(isFirstDay && {
      borderTopLeftRadius: '50%',
      borderBottomLeftRadius: '50%',
    }),
    ...(isLastDay && {
      borderTopRightRadius: '50%',
      borderBottomRightRadius: '50%',
    }),
  }));

  const renderWeekPickerDay = React.useCallback((date, selectedDates, pickersDayProps) => {
    if (!customDayValue) {
      return <PickersDay {...pickersDayProps} />;
    }
    const [start, end] = getStartEndDateObj(customDayValue);
    const dayIsBetween = isWithinInterval(date, { start, end });
    const isFirstDay = isSameDay(date, start);
    const isLastDay = isSameDay(date, end);
    return (
      <CustomPickersDay
        {...pickersDayProps}
        disableMargin
        dayIsBetween={dayIsBetween}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
      />
    );
  }, [customDayValue, getStartEndDateObj]);

  return { renderWeekPickerDay, setCustomDayValue }
}