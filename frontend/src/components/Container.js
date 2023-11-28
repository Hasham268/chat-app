import { ChatState } from "../context/chatProvider";
import React, { useEffect, useState } from "react";
import { MdCallEnd } from "react-icons/md";
import { useCallContext } from "../context/callContext";
import { Image } from "@chakra-ui/react";
import axios from "axios";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

const Container = ({ data }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishStream, setPublishStream] = useState(undefined);
  const { dispatch } = useCallContext();
  const { socket, user } = ChatState();

  const ZEGO_SERVER_SECRET = "390a6942b98383948f06a26c7ec6c2b5";
  const ZEGO_APP_ID = 697202935;
  const ZEGO_SERVER_URL =
    "wss://webliveroom697202935-api-bak.coolzcloud.com/ws";

  useEffect(() => {
    if (data.type === "out-going") {
      socket.on("accept-call", () => setCallAccepted(true));
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }
  }, [data, socket]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const returnedToken = await axios.get(
          `/api/user/generate-token/${user._id}`
        );

        setToken(returnedToken.data.token);
      } catch (e) {
        console.log(e);
      }
    };
    getToken();
  }, [callAccepted, user._id]);

  useEffect(() => {
    const startCall = async () => {
      const zg = new ZegoExpressEngine(ZEGO_APP_ID, ZEGO_SERVER_URL);
      setZgVar(zg);

      zg.on(
        "roomStreamUpdate",
        async (roomID, updateType, streamList, extendedData) => {
          if (updateType === "ADD") {
            const rmVideo = document.getElementById("remote-video");
            const vd = document.createElement(
              data.callType === "video" ? "video" : "audio"
            );
            vd.id = streamList[0].streamID;
            vd.autoplay = true;
            vd.playsInline = true;
            vd.muted = true;
            if (rmVideo) {
              rmVideo.appendChild(vd);
            }

            zg.startPlayingStream(streamList[0].streamID, {
              audio: true,
              video: true,
            }).then((stream) => (vd.srcObject = stream));
          } else if (updateType === "DELETE") {
            // zg.destroyStream(localStream);
            zg.stopPublishingStream(streamList[0].streamID);
            zg.stopPlayingStream(streamList[0].streamID);
            zg.logoutRoom(data.roomId.toString());
            dispatch({ type: "END-CALL" });
          }
        }
      );

      zg.loginRoom(
        data.roomId.toString(),
        token,
        {
          userID: user._id.toString(),
          userName: user.name,
        },
        { userUpdate: true }
      ).then(async (result) => {
        if (result === true) {
          const localStream = await zg.createStream({
            camera: {
              audio: true,
              video: data.callType === "video" ? true : false,
            },
          });

          const localVideo = document.getElementById("local-audio");
          const videoElement = document.createElement(
            data.callType === "video" ? "video" : "audio"
          );
          videoElement.id = "video-local-zego";
          videoElement.className = "h-28 w-34";
          videoElement.autoplay = true;
          videoElement.muted = false;
          videoElement.playsInline = true;
          localVideo.appendChild(videoElement);

          var td = document.getElementById("video-local-zego");
          td.srcObject = localStream;
          let streamId = new Date().getTime().toString();
          setPublishStream(streamId);
          setLocalStream(localStream);
          zg.startPublishingStream(streamId, localStream);
        }
      });
    };

    if (token) {
      startCall();
    }
  }, [token]);

  const endCall = () => {
    const id = data._id || data.id;
    if (zgVar && localStream && publishStream) {
      zgVar.destroyStream(localStream);
      zgVar.stopPublishingStream(publishStream);
      zgVar.logoutRoom(data.roomId.toString());
    }
    if (data.callType === "voice") {
      socket.emit("reject-voice-call", {
        from: id,
      });
    } else {
      socket.emit("reject-video-call", {
        from: id,
      });
    }
    dispatch({ type: "END-CALL" });
  };

  return (
    <div className=" flex flex-col  overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl my-5">{data.name}</span>
        <span className="text-lg">
          {callAccepted && data.callType !== "video"
            ? "On going call"
            : "Calling"}
        </span>
      </div>

      {(!callAccepted || data.callType === "audio") && (
        <div className="my-18 mt-20">
          <Image
            alt="avatar"
            height={210}
            width={230}
            src={data.pic || data.profilePicture}
            className="rounded-full"
          />
        </div>
      )}

      <div className="my-5 relative" id="remote-video">
        <div className="absolute bottom-5 right-5" id="local-audio"></div>
      </div>

      <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
        <MdCallEnd className="text-3xl cursor-pointer" onClick={endCall} />
      </div>
    </div>
  );
};

export default Container;
