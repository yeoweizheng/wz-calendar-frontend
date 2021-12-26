import * as React from 'react';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useCalendar } from '../services/calendar';

export default function WeeklyCalendar() {

  const { getDatesInWeek, getDaysInWeek } = useCalendar();
  const [displayData, setDisplayData] = React.useState([]);

  const generateDisplayData = React.useCallback((dates, days) => {
    let data = [];
    for (let i = 0; i < 7; i++) {
      data.push({ "date": dates[i], "day": days[i] })
    }
    setDisplayData(data);
  }, [setDisplayData])

  React.useEffect(() => {
    const dates = getDatesInWeek();
    const days = getDaysInWeek();
    generateDisplayData(dates, days);
  }, [getDatesInWeek, getDaysInWeek, generateDisplayData]);

  return (
    <Container maxWidth="md" sx={{p: 0}}>
      <Typography component="h5" variant="h5" align="center" color="text.primary" sx={{ m: 2 }} gutterBottom >Weekly Calendar</Typography>
      <Grid container>
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
                  <Chip label="Task here"></Chip>
                </CardContent>
              </Card>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </Container>
  )
}