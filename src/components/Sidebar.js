import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import { useGlobalData } from '../services/globalData';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LabelIcon from '@mui/icons-material/Label';
import LabelOffIcon from '@mui/icons-material/LabelOff';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import { useHttp } from '../services/http';
import TagModal from './TagModal';
import { useAuth } from '../services/auth';
import { useSnackbar } from '../services/snackbar';
import { nanoid } from 'nanoid';


export default function Sidebar(props) {
  const [globalData, setGlobalData] = useGlobalData();
  const { get } = useHttp();
  const [tagModalType, setTagModalType] = React.useState("create");
  const {openSnackbar} = useSnackbar();
  const { logout } = useAuth();

  const isTagSelected = React.useCallback((tagId) => {
    return tagId === globalData.selectedTagId;
  }, [globalData.selectedTagId])

  const handleSelectTag = React.useCallback((tagId) => {
    setGlobalData((prev) => ({...prev, selectedTagId: tagId, sidebarOpen: false}))
  }, [setGlobalData])

  const handleRetrieveTags = React.useCallback((data) => {
    let newTags = globalData.defaultTags.slice(0, 1);
    newTags = newTags.concat(data);
    newTags.push(globalData.defaultTags[1]);
    setGlobalData((prev) => ({...prev, tags: newTags}));
  }, [globalData.defaultTags, setGlobalData])

  const retrieveTags = React.useCallback(() => {
    const url = 'tags/';
    get(url, handleRetrieveTags);
  }, [get, handleRetrieveTags])

  const openTagModal = React.useCallback((type) => {
    setTagModalType(type);
    setGlobalData((prev) => ({...prev, sidebarOpen: false, tagModalOpen: true}));
  }, [setGlobalData])

  const handleTagModalClose = React.useCallback((alertMsg=null, severity=null) => {
    if (alertMsg !== null && severity !== null) {
      openSnackbar(alertMsg, severity);
    }
    setGlobalData((prev) => ({...prev, tagModalOpen: false}))
  }, [openSnackbar, setGlobalData])

  React.useEffect(() => {
    if (!globalData.tagModalOpen) retrieveTags();
  }, [retrieveTags, globalData.tagModalOpen])

  return (
    <React.Fragment>
      <Drawer anchor="left" open={globalData.sidebarOpen} onClose={() => setGlobalData((prev) => ({...prev, sidebarOpen: false})) } ModalProps={{keepMounted: true}}>
        <Box style={{"width": "250px"}}>
          <List>
            {globalData.tags.map((tag) => (
              <ListItem button key={nanoid()} selected={isTagSelected(tag.id)} onClick={() => handleSelectTag(tag.id)}>
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
            {globalData.tags.length > 2 ? 
              <ListItem button key="editTag" onClick={() => openTagModal("edit")}>
                <ListItemIcon><EditIcon /></ListItemIcon>
                <ListItemText primary="Edit Tag" />
              </ListItem>
              : null
            }
          </List>
          <Divider />
          <List>
            <ListItem button key="logout" onClick={() => {setGlobalData((prev) => ({...prev, sidebarOpen: false})); logout();}}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <TagModal
        open={globalData.tagModalOpen}
        type={tagModalType}
        handleClose={(alertMsg, severity) => handleTagModalClose(alertMsg, severity)}
      />
    </React.Fragment>
  )
}