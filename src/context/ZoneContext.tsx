
import React, { createContext, useReducer, Dispatch } from "react";
import { Zone } from "../objects/Zone";
import { zoneReducer, ZoneActions } from "../reducers";

type InitialStateType = {
  zones: Zone[];
};

const initialState = {
  zones: [],
};

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: Dispatch<ZoneActions>;
}>({
  state: initialState,
  dispatch: () => null,
});

const mainReducer = ({ zones }: InitialStateType, action: ZoneActions) => ({
  zones: zoneReducer(zones, action),
});

const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider, AppContext };

              