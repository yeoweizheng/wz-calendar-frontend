import * as React from 'react';
import { styled } from '@mui/material/styles';
import PickersDay from '@mui/lab/PickersDay';
import moment from 'moment';
import { useCalendar } from './calendar';

export function useCustomDay() {
  const [customDayValue, setCustomDayValue] = React.useState(moment());
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
    const dayIsBetween = date.isBetween(start, end, undefined, "[]");
    const isFirstDay = date.isSame(start, "day");
    const isLastDay = date.isSame(end, "day");
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