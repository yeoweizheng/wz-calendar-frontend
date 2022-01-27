import * as React from 'react';

const SidebarContext = React.createContext({});

export const SidebarProvider = (props) => {
  const defaultTags = React.useMemo(() => ([{"id": "a", "name": "All tags"}, {"id": "u", "name": "Untagged"}]), [])
  const [tags, setTags] = React.useState(defaultTags);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedTagId, setSelectedTagId] = React.useState("a");
  const [tagModalOpen, setTagModalOpen] = React.useState(false);
  const [searchModalOpen, setSearchModalOpen] = React.useState(false);
  const today = React.useMemo(() => (new Date()), []);
  const [selectedDate, setSelectedDate] = React.useState(today);

  const sidebarMemo = React.useMemo(
    () => ({ defaultTags, tags, setTags, sidebarOpen, setSidebarOpen, selectedTagId, setSelectedTagId, tagModalOpen, setTagModalOpen, searchModalOpen, setSearchModalOpen, selectedDate, setSelectedDate, today }),
    [defaultTags, tags, setTags, sidebarOpen, setSidebarOpen, selectedTagId, setSelectedTagId, tagModalOpen, setTagModalOpen, searchModalOpen, setSearchModalOpen, selectedDate, setSelectedDate, today]
  );

  return (
    <SidebarContext.Provider value={sidebarMemo}>
      {props.children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  return React.useContext(SidebarContext);
}
