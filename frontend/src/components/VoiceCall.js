import React, { useEffect } from "react";
import Container from "./Container";
import { useCallContext } from "../context/callContext";
import { ChatState } from "../context/chatProvider";

const VoiceCall = () => {
  const { user, socket } = ChatState();
  const { voiceCall } = useCallContext();

  useEffect(() => {
    if (voiceCall.type === "out-going") {
      socket.emit("outgoing-voice-call", {
        to: voiceCall._id,
        from: {
          id: user._id,
          profilePicture: user.pic,
          name: user.name,
        },
        callType: voiceCall.callType,
        roomId: voiceCall.roomId,
      });
    }
  }, [voiceCall, socket, user._id, user.name, user.pic]);

  return <Container data={voiceCall} />;
};

export default VoiceCall;
