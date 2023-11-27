const reducer = (state, action) => {
  switch (action.type) {
    case "SET-VIDEO-CALL":
      return {
        ...state,
        videoCall: action.payload,
      };
    case "SET-VOICE-CALL":
      return {
        ...state,
        voiceCall: action.payload,
      };
    case "SET-INCOMING-VIDEOCALL":
      return {
        ...state,
        incomingVideoCall: action.payload,
      };
    case "SET-INCOMING-VOICECALL":
      return {
        ...state,
        incomingVoiceCall: action.payload,
      };
    case "SET-ONLINE-USERS":
      return {
        ...state,
        onlineUsers: action.payload
      };
    case "END-CALL":
      return {
        ...state,
        voiceCall: undefined,
        videoCall: undefined,
        incomingVideoCall: undefined,
        incomingVoiceCall: undefined,
      };
    default:
      return state;
  }
};

export default reducer;