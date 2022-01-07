import * as React from 'react';

const SidebarContext = React.createContext({});

export const SidebarProvider = (props) => {
  const defaultTags = React.useMemo(() => ([{"id": "a", "name": "All tags"}, {"id": "u", "name": "Untagged"}]), [])
  const [tags, setTags] = React.useState(defaultTags);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedTagId, setSelectedTagId] = React.useState("a");
  const [tagModalOpen, setTagModalOpen] = React.useState(false);

  const sidebarMemo = React.useMemo(
    () => ({ defaultTags, tags, setTags, sidebarOpen, setSidebarOpen, selectedTagId, setSelectedTagId, tagModalOpen, setTagModalOpen }),
    [defaultTags, tags, setTags, sidebarOpen, setSidebarOpen, selectedTagId, setSelectedTagId, tagModalOpen, setTagModalOpen]
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
