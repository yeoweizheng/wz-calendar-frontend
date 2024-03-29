import * as React from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { useHttp } from '../services/http';
import { useGlobalData } from '../services/globalData';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function TagModal(props) {
  const [name, setName] = React.useState("");
  const [nameError, setNameError] = React.useState(false);
  const [globalData, setGlobalData] = useGlobalData();
  const [selectedTagId, setSelectedTagId] = React.useState("");
  const [tagMenuOpen, setTagMenuOpen] = React.useState(false);
  const {post, patch, del} = useHttp()
  const baseUrl = 'tags/';

  const handleNameChange = React.useCallback((e) => {
    setName(e.target.value);
  }, [setName]);

  const getTagName = React.useCallback((tagId) => {
    for(let tag of globalData.tags) {
      if (tag.id === tagId) return tag.name;
    }
  }, [globalData.tags])

  const handleDelete = React.useCallback(() => {
    if (selectedTagId === "" || selectedTagId === undefined || selectedTagId === null) return;
    const patchUrl = baseUrl + selectedTagId + '/';
    del(patchUrl, () => {
      setSelectedTagId("");
      if (globalData.selectedTagId === selectedTagId) setGlobalData((prev) => ({...prev, selectedTagId: "a"}));
      props.handleClose("Deleted " + getTagName(selectedTagId), "error");
    }, 
      () => props.handleClose("Error deleting " + getTagName(selectedTagId), "error"));
  }, [props, del, selectedTagId, getTagName, globalData, setGlobalData])

  const handleSave = React.useCallback(() => {
    if (name === "" || name === undefined || name === null) {
      setNameError(true);
      return;
    }
    const payload = {
      "name": name
    }
    if (props.type === "edit") {
      const patchUrl = baseUrl + selectedTagId + '/';
      patch(patchUrl, payload, (data) => props.handleClose("Updated " + data.name, "success"));
    } else {
      post(baseUrl, payload, (data) => props.handleClose("Created " + data.name, "success"));
    }
  }, [name, post, patch, props, baseUrl, selectedTagId])
  
  const handleSelectedTagId = React.useCallback((e) => {
    setSelectedTagId(e.target.value);
    setTagMenuOpen(false);
  }, [setSelectedTagId, setTagMenuOpen])

  const closeDialog = React.useCallback(() => {props.handleClose()}, [props]);

  React.useEffect(() => {
    if (globalData.tagModalOpen) {
      setName("");
      setNameError(false);
      setSelectedTagId("")
    }
  }, [globalData.tagModalOpen])

  return (
    <Dialog open={props.open ? props.open : false} onClose={closeDialog} fullWidth keepMounted>
      <DialogTitle>
        <Box style={{"display": "flex"}}>
          <Box className="spacer-box">
            <Typography variant="h6" component="h6" sx={{mt: 0.5}}>
              {props.type === "create" ? "Create Tag" : "Edit Tag"}
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={closeDialog}><CloseIcon /></IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          {props.type === "create" ? null :
              <FormControl fullWidth>
                <InputLabel size="small" variant="standard" id="tag-modal-input-label">Tag</InputLabel>
                <Select size="small" 
                  labelId="tag-modal-input-label"
                  label="Tag"
                  variant="standard"
                  open={tagMenuOpen}
                  value={selectedTagId} 
                  onChange={(e) => handleSelectedTagId(e)}
                  onOpen={() => setTagMenuOpen(true)}
                  onClose={() => setTagMenuOpen(false)}
                  >
                  {globalData.tags.map((tag) => (
                    tag.id !== "a" && tag.id !== "u"?
                    <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem> : null
                  ))}
                </Select>
              </FormControl>
          }
          <TextField
            label="Name"
            value={name}
            size="small"
            variant="standard"
            fullWidth
            onChange={(e) => handleNameChange(e)}
            required
            error={nameError}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        { props.type === "edit" ?
          <Button onClick={handleDelete} color="error">Delete</Button> : null
        }
        <Box className="spacer-box" />
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}