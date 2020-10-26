import React, { createContext, useReducer, Dispatch } from "react";
import { GraphActions, graphReducer } from "../reducers";

type InitialStateType = {
  graph: any;
};

const initialState = {
  graph: null,
};

const GraphContext = createContext<{
  graphState: InitialStateType;
  graphDispatch: Dispatch<GraphActions>;
}>({
  graphState: initialState,
  graphDispatch: () => null,
});

const mainReducer = ({ graph }: InitialStateType, action: GraphActions) => ({
  graph: graphReducer(graph, action),
});

const GraphProvider: React.FC = ({ children }) => {
  const [graphState, graphDispatch] = useReducer(mainReducer, initialState);

  return (
    <GraphContext.Provider value={{ graphState, graphDispatch }}>
      {children}
    </GraphContext.Provider>
  );
};

export { GraphProvider, GraphContext };
