import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
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
import SettingsIcon from "@mui/icons-material/Settings";
import { useHttp } from '../services/http';
import TagModal from './TagModal';
import { useAuth } from '../services/auth';
import { useSnackbar } from '../services/snackbar';
import { useNav } from '../services/nav';

export default function Sidebar() {
  const [globalData, setGlobalData] = useGlobalData();
  const { get } = useHttp();
  const [tagModalType, setTagModalType] = React.useState("create");
  const {openSnackbar} = useSnackbar();
  const { logout } = useAuth();
  const { isCalView, ensureCalView, isSettingsView } = useNav();

  const isTagSelected = React.useCallback((tagId) => {
    return isCalView() && tagId === globalData.selectedTagId;
  }, [globalData.selectedTagId, isCalView])

  const handleSelectTag = React.useCallback((tagId) => {
    ensureCalView();
    setGlobalData((prev) => ({...prev, selectedTagId: tagId, sidebarOpen: false}))
  }, [setGlobalData, ensureCalView])

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
    ensureCalView();
    setTagModalType(type);
    setGlobalData((prev) => ({...prev, sidebarOpen: false, tagModalOpen: true}));
  }, [setGlobalData, ensureCalView])

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
              <ListItemButton key={tag.id} selected={isTagSelected(tag.id)} onClick={() => handleSelectTag(tag.id)}>
                <ListItemIcon>
                {
                  tag.id === "a"? <CalendarTodayIcon /> :
                  tag.id === "u"? <LabelOffIcon /> :
                  <LabelIcon />
                }
                </ListItemIcon>
                <ListItemText primary={tag.name} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            <ListItemButton key="createTag" onClick={() => openTagModal("create")}>
              <ListItemIcon><AddBoxIcon /></ListItemIcon>
              <ListItemText primary="New Tag" />
            </ListItemButton>
            {globalData.tags.length > 2 ? 
              <ListItemButton key="editTag" onClick={() => openTagModal("edit")}>
                <ListItemIcon><EditIcon /></ListItemIcon>
                <ListItemText primary="Edit Tag" />
              </ListItemButton>
              : null
            }
          </List>
          <Divider />
          <List>
            <ListItemButton key="settings" selected={isSettingsView()} onClick={() => {setGlobalData((prev) => ({...prev, sidebarOpen: false, calView: "settings"}));}}>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
            <ListItemButton key="logout" onClick={() => {setGlobalData((prev) => ({...prev, sidebarOpen: false})); logout();}}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
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