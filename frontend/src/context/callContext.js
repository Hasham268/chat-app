import reducer from "../reducers/stateReducer";
import React, { createContext, useContext, useReducer } from "react";

const initialState = {
  videoCall: undefined,
  voiceCall: undefined,
  incomingVideoCall: undefined,
  incomingVoiceCall: undefined,
  onlineUsers: undefined
};

const CallContext = createContext();

const CallContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CallContext.Provider
      value={{
        ...state, dispatch
      }}
    >
      {children}
    </CallContext.Provider>
  );
};


const useCallContext = () => {
  return useContext(CallContext);
};

export { CallContextProvider, CallContext, useCallContext };