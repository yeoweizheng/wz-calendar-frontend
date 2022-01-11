import * as React from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { useHttp } from '../services/http';
import { useSidebar } from '../services/sidebar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export default function TagModal(props) {
  const [name, setName] = React.useState("");
  const [nameInput, setNameInput] = React.useState();
  const [nameError, setNameError] = React.useState(false);
  const {tags, tagModalOpen} = useSidebar();
  const [selectedTagId, setSelectedTagId] = React.useState("");
  const [tagMenuOpen, setTagMenuOpen] = React.useState(false);
  const {post, patch, del} = useHttp()
  const baseUrl = 'tags/';

  const handleNameChange = React.useCallback((e) => {
    setName(e.target.value);
  }, [setName]);

  const getTagName = React.useCallback((tagId) => {
    for(let tag of tags) {
      if (tag.id === tagId) return tag.name;
    }
  }, [tags])

  const handleDelete = React.useCallback(() => {
    if (selectedTagId === "" || selectedTagId === undefined || selectedTagId === null) return;
    const patchUrl = baseUrl + selectedTagId + '/';
    del(patchUrl, () => props.handleClose("Deleted " + getTagName(selectedTagId), "error"), 
      () => props.handleClose("Error deleting " + getTagName(selectedTagId), "error"));
  }, [props, del, selectedTagId, getTagName])

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
  
  const handleKeyUp = React.useCallback((e) => {
    if (e.keyCode === 13) handleSave();
  }, [handleSave])

  const handleSelectedTagId = React.useCallback((e) => {
    setSelectedTagId(e.target.value);
    setTagMenuOpen(false);
  }, [setSelectedTagId, setTagMenuOpen])

  React.useEffect(() => {
    setName("");
    setNameError(false);
    setSelectedTagId("")
    if (nameInput && props.type === "create") nameInput.focus();
  }, [tagModalOpen, setSelectedTagId, tags, nameInput, props.type, props.open])

  React.useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp);
    return () => { window.document.removeEventListener('keyup', handleKeyUp); }
  }, [handleKeyUp]);

  return (
    <Dialog open={props.open ? props.open : false} onClose={() => props.handleClose()} fullWidth keepMounted>
      <DialogTitle>
        {props.type === "create" ? "Create Tag" : "Edit Tag"}
      </DialogTitle>
      <DialogContent>
        {props.type === "create" ? null :
            <FormControl fullWidth>
              <InputLabel size="small">Tag</InputLabel>
              <Select size="small" 
                open={tagMenuOpen}
                value={selectedTagId} 
                onChange={(e) => handleSelectedTagId(e)}
                onOpen={() => setTagMenuOpen(true)}
                onClose={() => setTagMenuOpen(false)}
                >
                {tags.map((tag) => (
                  tag.id !== "a" && tag.id !== "u"?
                  <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem> : null
                ))}
              </Select>
            </FormControl>
        }
        <TextField
          label="Name"
          value={name}
          fullWidth
          variant="standard"
          onChange={(e) => handleNameChange(e)}
          required
          error={nameError}
          inputRef={el => { setNameInput(el) }}
        />
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