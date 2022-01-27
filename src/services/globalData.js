import * as React from 'react';

const GlobalDataContext = React.createContext({});

export const GlobalDataProvider = (props) => {
  const defaultTags = React.useMemo(() => ([{"id": "a", "name": "All tags"}, {"id": "u", "name": "Untagged"}]), [])
  const [tags, setTags] = React.useState(defaultTags);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedTagId, setSelectedTagId] = React.useState("a");
  const [tagModalOpen, setTagModalOpen] = React.useState(false);
  const [searchModalOpen, setSearchModalOpen] = React.useState(false);
  const today = React.useMemo(() => (new Date()), []);
  const [selectedDate, setSelectedDate] = React.useState(today);

  const globalDataMemo = React.useMemo(
    () => ({ defaultTags, tags, setTags, sidebarOpen, setSidebarOpen, selectedTagId, setSelectedTagId, tagModalOpen, setTagModalOpen, searchModalOpen, setSearchModalOpen, selectedDate, setSelectedDate, today }),
    [defaultTags, tags, setTags, sidebarOpen, setSidebarOpen, selectedTagId, setSelectedTagId, tagModalOpen, setTagModalOpen, searchModalOpen, setSearchModalOpen, selectedDate, setSelectedDate, today]
  );

  return (
    <GlobalDataContext.Provider value={globalDataMemo}>
      {props.children}
    </GlobalDataContext.Provider>
  )
}

export const useGlobalData = () => {
  return React.useContext(GlobalDataContext);
}
