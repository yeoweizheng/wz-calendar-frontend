import * as React from "react";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useHttp } from '../services/http';
import { useSidebar } from '../services/sidebar';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { format, parse } from 'date-fns';


export default function SearchModal(props) {

  const { get } = useHttp();
  const [searchItems, setSearchItems] = React.useState([]);
  const [searchStr, setSearchStr] = React.useState("");
  const {setSelectedDate, setSearchModalOpen} = useSidebar();

  const handleRetrieveSearchItems = React.useCallback((data, searchStr) => {
    if (searchStr !== "") {
      setSearchItems(data);
    } else {
      setSearchItems([]);
    }
  }, [])

  const handleSearchChange = React.useCallback((e) => {
    const searchStr = e.target.value;
    setSearchStr(searchStr);
    let url = 'schedule_items/?search_str=' + searchStr;
    get(url, (data) => handleRetrieveSearchItems(data, searchStr));
  }, [get, handleRetrieveSearchItems, setSearchStr])

  const handleSearchItemClick = React.useCallback((item) => {
    setSearchModalOpen(false);
    setSearchStr("");
    setSearchItems([]);
    setSelectedDate(parse(item.date, "yyyy-MM-dd", new Date()));
  }, [setSearchModalOpen, setSelectedDate, setSearchStr, setSearchItems])

  const handleClose = React.useCallback(() => {
    setSearchModalOpen(false);
    setSearchStr("");
    setSearchItems([]);
  }, [setSearchStr, setSearchModalOpen])

  return (
    <Dialog open={props.open ? props.open : false} onClose={() => handleClose()} fullWidth keepMounted>
      <DialogContent>
        <Stack direction="row" sx={{p: 0}}>
          <TextField
            type="search"
            label="Search outstanding items"
            fullWidth
            onChange={(e) => handleSearchChange(e)}
            value={searchStr}
          />
        </Stack>
        <List>
          {searchItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton sx={{pr: 0}} onClick={() => handleSearchItemClick(item)}>
                <ListItemText primary={format(parse(item.date, "yyyy-MM-dd", new Date()), "d MMM yy (E)") + " - " + item.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  )
}