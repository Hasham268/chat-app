import SideDrawer from "../components/miscellaneous/SideDrawer";
import { Box } from "@chakra-ui/layout";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { ChatState } from "../context/chatProvider";
import { useEffect, useState } from "react";
import VoiceCall from "../components/VoiceCall";
import VideoCall from "../components/VideoCall";
import { useCallContext } from "../context/callContext";
import IncomingVideoCall from "../components/IncomingVideoCall";
import IncomingVoiceCall from "../components/incomingVoiceCall";

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, socket } = ChatState();
  const {
    voiceCall,
    videoCall,
    dispatch,
    incomingVoiceCall,
    incomingVideoCall,
  } = useCallContext();


  useEffect(() => {
    if (socket) {
      socket.on("incoming-voice-call", ({ from, roomId, callType }) => {
        dispatch({
          type: "SET-INCOMING-VOICECALL",
          payload: { ...from, roomId, callType },
        });
      });

      socket.on("incoming-video-call", ({ from, roomId, callType }) => {
        dispatch({
          type: "SET-INCOMING-VIDEOCALL",
          payload: { ...from, roomId, callType },
        });
      });

      socket.on("voice-call-rejected", () => {
        dispatch({
          type: "END-CALL",
        });
      });

      socket.on("online-users", ({onlineUsers}) => {
        dispatch({
          type: "SET-ONLINE-USERS",
          payload: onlineUsers
        });
      });

    }
  }, [socket, dispatch]);

  return (
    <>
      {incomingVoiceCall && <IncomingVoiceCall />}

      {incomingVideoCall && <IncomingVideoCall />}

      {videoCall && (
   
          <div className="h-screen w-screen max-h-full overflow-hidden">
            <VideoCall />
          </div>
 
      )}

      {voiceCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VoiceCall />
        </div>
      )}

      {!videoCall && !voiceCall && (
        <div style={{ width: "100%" }}>
          {user && <SideDrawer />}
          <Box
            display="flex"
            justifyContent="space-between"
            w="100%"
            h="91.5vh"
            p="10px"
          >
            {user && <MyChats fetchAgain={fetchAgain} />}
            {user && (
              <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
            )}
          </Box>
        </div>
      )}
    </>
  );
};

export default ChatPage;
