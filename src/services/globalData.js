import * as React from 'react';
import { createContainer } from 'react-tracked';

const initialState = {
  defaultTags: [{"id": "a", "name": "All tags"}, {"id": "u", "name": "Untagged"}],
  tags: [{"id": "a", "name": "All tags"}, {"id": "u", "name": "Untagged"}],
  sidebarOpen: false,
  selectedTagId: "a",
  tagModalOpen: false,
  searchModalOpen: false,
  selectedDate: new Date(),
  snackbarData: {"open": false, "message": "", "severity": "success", "autoclose": true}
};

const useGlobalState = () => React.useState(initialState);

export const { Provider: GlobalDataProvider, useTracked: useGlobalData } = createContainer(useGlobalState);