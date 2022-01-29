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
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useGlobalData } from '../services/globalData';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { format } from 'date-fns';

export default function ScheduleItemModal(props) {
  const [name, setName] = React.useState(props.name);
  const [nameError, setNameError] = React.useState(false);
  const [date, setDate] = React.useState(new Date());
  const [done, setDone] = React.useState(false);
  const {post, patch, del} = useHttp()
  const baseUrl = 'schedule_items/';
  const patchUrl = baseUrl + props.id + '/';
  const { tags } = useGlobalData();
  const [ selectedTagId, setSelectedTagId ] = React.useState("u");
  const [ tagMenuOpen, setTagMenuOpen ] = React.useState(false);

  const handleDelete = React.useCallback(() => {
    del(patchUrl, () => props.handleClose("Deleted " + name, "error"));
  }, [props, name, del, patchUrl])

  const handleSave = React.useCallback(() => {
    if (name === "" || name === undefined || name === null) {
      setNameError(true);
      return;
    }
    const tagId = selectedTagId === "u" ? null : selectedTagId;
    const payload = {
      "name": name,
      "date": format(date, "yyyy-MM-dd"),
      "done": done,
      "tag": tagId
    }
    if (props.type === "edit") {
      patch(patchUrl, payload, (data) => props.handleClose("Updated " + data.name, "success"));
    } else {
      post(baseUrl, payload, (data) => props.handleClose("Created " + data.name, "success"));
    }
  }, [name, post, patch, props, baseUrl, patchUrl, date, done, selectedTagId])

  const handleNameChange = React.useCallback((e) => {
    setNameError(false);
    setName(e.target.value);
  }, []);

  const handleKeyUp = React.useCallback((e) => {
    if (props.open && e.keyCode === 13) {
      handleSave();
    }
  }, [handleSave, props.open]);

  const handleSelectedTagId = React.useCallback((e) => {
    setSelectedTagId(e.target.value);
    setTagMenuOpen(false);
  }, [setSelectedTagId, setTagMenuOpen])

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  React.useEffect(() => {
    setName(props.name);
    setNameError(false);
    setDate(props.date);
    setDone(props.done);
    const tag = props.tag === null ? "u": props.tag;
    setSelectedTagId(tag);
  }, [props.name, props.date, props.done, props.tag])

  return (
    <Dialog open={props.open? props.open:false} onClose={() => props.handleClose()} fullWidth keepMounted>
      <DialogTitle sx={{pt: 1, pb: 1}}>
        <Box sx={{display: "flex"}}>
          <Box sx={{ flexGrow: 1}}>
            <Typography variant="h6" component="h6" sx={{mt: 0.5}}>
              {props.type === "create" ? "Create Schedule Item" : "Edit Schedule Item"}
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={() => props.handleClose()}><CloseIcon /></IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{pb: 0}}>
        <Stack spacing={1}>
          <TextField
            label="Name"
            value={name}
            size="small"
            fullWidth
            onChange={(e) => handleNameChange(e)}
            variant="standard"
            required
            error={nameError}
          />
          <MobileDatePicker
            value={date}
            label="Select date"
            onChange={() => {}}
            onAccept={(value) => {setDate(value)}}
            inputFormat="d MMM yy (E)"
            renderInput={(params) => {
              return <TextField size="small" variant="standard" fullWidth {...params} />}
            }
            keepMounted
          />
          <FormControl fullWidth>
            <InputLabel size="small" variant="standard" id="tag-input-label">Tag</InputLabel>
            <Select size="small" 
              labelId="tag-input-label"
              label="Tag"
              variant="standard"
              open={tagMenuOpen}
              value={selectedTagId} 
              onChange={(e) => handleSelectedTagId(e)}
              onOpen={() => setTagMenuOpen(true)}
              onClose={() => setTagMenuOpen(false)}
              >
              {tags.map((tag) => (
                tag.id !== "a"?
                <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem> : null
              ))}
            </Select>
          </FormControl>
          { props.type === "edit" ?
            <FormGroup sx={{mt: 0}}>
              <FormControlLabel control={<Checkbox sx={{pt: 0, pb: 0}} checked={done} onChange={(e) => setDone(e.target.checked)}/>} label="Done" />
            </FormGroup>
            : null
          }
        </Stack>
      </DialogContent>
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