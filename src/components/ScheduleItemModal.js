import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { useHttp } from '../services/http';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import moment from 'moment';

export default function ScheduleItemModal(props) {
  const [name, setName] = React.useState(props.name);
  const [currentItemDate, setCurrentItemDate] = React.useState(moment());
  const {patch, del} = useHttp()
  const url = 'schedule_items/' + props.id + '/';

  const handleDelete = React.useCallback(() => {
    del(url, () => props.handleClose({"id": props.id, "delete": true}));
  }, [props, del, url])

  const handleSave = React.useCallback(() => {
    const payload = {
      "name": name
    }
    patch(url, payload, props.handleClose)
  }, [name, patch, props.handleClose, url])

  const handleKeyUp = React.useCallback((e) => {
    if (e.keyCode === 13) handleSave();
  }, [handleSave])

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  React.useEffect(() => {
    setName(props.name);
  }, [props.name])

  return (
    <Dialog open={props.open? props.open:false} onClose={() => props.handleClose({"id": props.id, "closeOnly": true})} fullWidth keepMounted>
      <DialogTitle>
        {props.type === "create" ? "Create Schedule Item" : "Edit Schedule Item" }
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={name}
          fullWidth
          variant="standard"
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogContent sx={{pt: 0}}>
        <MobileDatePicker
          value={currentItemDate}
          label="Select date"
          onChange={() => {}}
          renderInput={(params) => {
            return <TextField size="small" variant="standard" fullWidth {...params} />}
          }
        />
      </DialogContent>
      <DialogActions sx={{ pl: 2, pr: 2 }}>
        <Button onClick={handleDelete} color="error">Delete</Button>
        <Box sx={{ flexGrow: 1}} />
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}