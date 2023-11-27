import React from "react";
import { Image } from "@chakra-ui/react";
import { useCallContext } from "../context/callContext";
import { ChatState } from "../context/chatProvider";

const IncomingVideoCall = () => {
  const { dispatch, incomingVideoCall } = useCallContext();
  const { socket } = ChatState();

  const acceptCall = () => {
    dispatch({
      type: "SET-VIDEO-CALL",
      payload: {
        ...incomingVideoCall,
        type: "in-coming",
      },
    });
    socket.emit("accept-incoming-call", { id: incomingVideoCall.id });
    dispatch({ type: "SET-INCOMING-VIDEOCALL", payload: undefined });
  };

  const rejectCall = () => {
    socket.emit("reject-video-call", { from: incomingVideoCall.id });

    dispatch({ type: "END-CALL" });
  };

  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 flex gap-5 items-center justify-start text-white p-4 bg-conversation-panel-background drop-shadow-2xl border-icon-green border-2 py-14  bg-teal-600 rounded-2xl">
      <div>
        <Image
          alt="avatar"
          height={100}
          width={100}
          src={incomingVideoCall.profilePicture}
          className="rounded-full"
        />
      </div>

      <div>
        <div className="text-black">{incomingVideoCall.name}</div>
        <div className="text-xs text-black">Incoming Video Call</div>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-red-500 p-1 px-3 text-sm rounded-full"
            onClick={rejectCall}
          >
            Reject
          </button>

          <button
            className="bg-green-500 p-1 px-3 text-sm rounded-full"
            onClick={acceptCall}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
export default IncomingVideoCall;
