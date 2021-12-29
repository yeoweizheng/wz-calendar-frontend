import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';

export default function ScheduleItemModal(props) {
  const [name, setName] = React.useState(props.name);

  const handleClose = () => {
    props.handleClose();
  }

  const handleDelete = React.useMemo(() => {
    handleClose();
  }, [])

  const handleSave = React.useMemo(() => {
    handleClose();
  }, [])

  return (
    <Dialog open={props.open} onClose={handleClose} fullWidth keepMounted>
      <DialogTitle>Schedule Item</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={name}
          fullWidth
          variant="standard"
          onChange={(e) => setName(e.target.value)}
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