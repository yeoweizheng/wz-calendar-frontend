import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import { useSidebar } from '../services/sidebar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LabelIcon from '@mui/icons-material/Label';
import LabelOffIcon from '@mui/icons-material/LabelOff';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import { useHttp } from '../services/http';
import TagModal from './TagModal';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


export default function Sidebar(props) {
  const { defaultTags, sidebarOpen, setSidebarOpen, tags, setTags, selectedTagId, setSelectedTagId } = useSidebar();
  const { get } = useHttp();
  const {tagModalOpen, setTagModalOpen} = useSidebar();
  const [tagModalType, setTagModalType] = React.useState("create");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState("")
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("success")

  const isTagSelected = React.useCallback((tagId) => {
    return tagId === selectedTagId;
  }, [selectedTagId])

  const handleSelectTag = React.useCallback((tagId) => {
    setSelectedTagId(tagId);
    setSidebarOpen(false);
  }, [setSelectedTagId, setSidebarOpen])

  const handleRetrieveTags = React.useCallback((data) => {
    let newTags = defaultTags.slice(0, 1);
    newTags = newTags.concat(data);
    newTags.push(defaultTags[1]);
    setTags(newTags);
  }, [defaultTags, setTags])

  const retrieveTags = React.useCallback(() => {
    const url = 'tags/';
    get(url, handleRetrieveTags);
  }, [get, handleRetrieveTags])

  const openTagModal = React.useCallback((type) => {
    setSidebarOpen(false);
    setTagModalType(type);
    setTagModalOpen(true);
  }, [setSidebarOpen, setTagModalType, setTagModalOpen])

  const handleTagModalClose = React.useCallback((alertMsg=null, severity=null) => {
    if (alertMsg !== null && severity !== null) {
      setSnackbarOpen(true);
      setSnackbarMessage(alertMsg);
      setSnackbarSeverity(severity);
    }
    setTagModalOpen(false);
  }, [setSnackbarOpen, setSnackbarMessage, setSnackbarSeverity, setTagModalOpen])

  React.useEffect(() => {
    retrieveTags();
  }, [retrieveTags, sidebarOpen, tagModalOpen])

  return (
    <React.Fragment>
      <Snackbar anchorOrigin={{"vertical": "top", "horizontal": "center"}} 
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={3000}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
      </Snackbar>
      <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <Box sx={{ width: 250 }}>
          <List>
            {tags.map((tag) => (
              <ListItem button key={tag.id} selected={isTagSelected(tag.id)} onClick={() => handleSelectTag(tag.id)}>
                <ListItemIcon>
                {
                  tag.id === "a"? <CalendarTodayIcon /> :
                  tag.id === "u"? <LabelOffIcon /> :
                  <LabelIcon />
                }
                </ListItemIcon>
                <ListItemText primary={tag.name} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button key="createTag" onClick={() => openTagModal("create")}>
              <ListItemIcon><AddBoxIcon /></ListItemIcon>
              <ListItemText primary="New Tag" />
            </ListItem>
            {tags.length > 2 ? 
              <ListItem button key="editTag" onClick={() => openTagModal("edit")}>
                <ListItemIcon><EditIcon /></ListItemIcon>
                <ListItemText primary="Edit Tag" />
              </ListItem>
              : null
            }
          </List>
        </Box>
      </Drawer>
      <TagModal
        open={tagModalOpen}
        type={tagModalType}
        handleClose={(alertMsg, severity) => handleTagModalClose(alertMsg, severity)}
      />
    </React.Fragment>
  )
}