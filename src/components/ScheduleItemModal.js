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
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function ScheduleItemModal(props) {
  const [name, setName] = React.useState(props.name);
  const [nameInput, setNameInput] = React.useState();
  const [nameError, setNameError] = React.useState(false);
  const [date, setDate] = React.useState(moment());
  const [done, setDone] = React.useState(false);
  const {post, patch, del} = useHttp()
  const baseUrl = 'schedule_items/';
  const patchUrl = baseUrl + props.id + '/';

  const handleDelete = React.useCallback(() => {
    del(patchUrl, () => props.handleClose("Deleted " + name + " [" + date.format("D-MMM-YY ddd") + "]", "error"));
  }, [props, date, name, del, patchUrl])

  const handleSave = React.useCallback(() => {
    if (name === "" || name === undefined || name === null) {
      setNameError(true);
      return;
    }
    const payload = {
      "name": name,
      "date": date.format("YYYY-MM-DD"),
      "done": done
    }
    if (props.type === "edit") {
      patch(patchUrl, payload, (data) => props.handleClose("Updated " + data.name + " [" + moment(data.date, "YYYY-MM-DD").format("D-MMM-YY ddd") + "]", "success"));
    } else {
      post(baseUrl, payload, (data) => props.handleClose("Created " + data.name + " [" + moment(data.date, "YYYY-MM-DD").format("D-MMM-YY ddd") + "]", "success"));
    }
  }, [name, post, patch, props, baseUrl, patchUrl, date, done])

  const handleNameChange = React.useCallback((e) => {
    setNameError(false);
    setName(e.target.value);
  }, []);

  const handleKeyUp = React.useCallback((e) => {
    if (e.keyCode === 13) handleSave();
  }, [handleSave])

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  React.useEffect(() => {
    setName(props.name);
    setDate(moment(props.date, 'YYYY-MM-DD'));
    setDone(props.done);
    if (nameInput && props.type === "create") nameInput.focus();
  }, [props.name, props.date, props.done, props.type, nameInput])

  return (
    <Dialog open={props.open? props.open:false} onClose={() => props.handleClose()} fullWidth keepMounted>
      <DialogTitle>
        {props.type === "create" ? "Create Schedule Item" : "Edit Schedule Item" }
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={name}
          fullWidth
          variant="standard"
          onChange={(e) => handleNameChange(e)}
          required
          error={nameError}
          inputRef={el => {setNameInput(el)}}
        />
      </DialogContent>
      <DialogContent sx={{pt: 0}}>
        <MobileDatePicker
          value={date}
          label="Select date"
          onChange={(value) => {setDate(value);}}
          renderInput={(params) => {
            params['inputProps']['value'] = date.format('D MMM YY (ddd)')
            return <TextField size="small" variant="standard" fullWidth {...params} />}
          }
          keepMounted
        />
      </DialogContent>
      { props.type === "edit" ?
        <DialogContent sx={{pt: 0}}>
          <FormGroup>
            <FormControlLabel control={<Checkbox checked={done} onChange={(e) => setDone(e.target.checked)}/>} label="Done" />
          </FormGroup>
        </DialogContent> : null
      }
      <DialogActions sx={{ pl: 2, pr: 2 }}>
        { props.type === "edit" ?
          <Button onClick={handleDelete} color="error">Delete</Button> : null
        }
        <Box sx={{ flexGrow: 1}} />
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}