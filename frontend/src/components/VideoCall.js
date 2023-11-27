import React, { useEffect } from 'react'
import Container from "./Container";
import { useCallContext } from "../context/callContext";
import { ChatState } from "../context/chatProvider";

const VideoCall = () => {
  const { user, socket } = ChatState();
  const { videoCall } = useCallContext();

    useEffect(() => {
      if (videoCall.type === "out-going") {
        socket.emit("outgoing-video-call", {
          to: videoCall._id,
          from: {
            id: user._id,
            profilePicture: user.pic,
            name: user.name,
          },
          callType: videoCall.callType,
          roomId: videoCall.roomId,
        });
      }
    }, [videoCall, socket, user._id, user.name, user.pic]);
  return (
    <Container data={videoCall} />
  )
}

export default VideoCall