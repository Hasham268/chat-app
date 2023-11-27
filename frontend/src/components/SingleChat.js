import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useRef, useState } from "react";
import { ChatState } from "../context/chatProvider";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import Lottie from "react-lottie";
import { MdCall } from "react-icons/md";
import { BsFillCameraVideoFill } from "react-icons/bs";
import animationData from "../animations/typing.json";
import ScrollableChat from "./ScrollableChat";
// import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { BsEmojiSmile } from "react-icons/bs";
import { GrAttachment } from "react-icons/gr";
import EmojiPicker from "emoji-picker-react";
import PhotoPicker from "./miscellaneous/PhotoPicker";
import { useCallContext } from "../context/callContext";
// const ENDPOINT = "http://localhost:5000";
var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { dispatch, onlineUsers } = useCallContext();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const [grabPhoto, setGrabPhoto] = useState(false);

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    socket,
  } = ChatState();

  let otherUser;

  if(selectedChat){
    otherUser =
      selectedChat.users[0]._id === user._id
        ? selectedChat.users[1]
        : selectedChat.users[0];
  }

  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    try {
      await axios
        .post(
          `/api/stripe/create-checkout-session`
          //  , {
          //   userId: user._id
          // }
        )
        .then((res) => {
          if (res.data.url) {
            window.location.href = res.data.url;
          }
        })
        .catch((e) => console.log(e.message));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage("pass");
    }

    if (query.get("canceled")) {
      setMessage("fail");
    }
  }, []);

  useEffect(() => {
    if (grabPhoto) {
      const fileInput = document.getElementById("photo-picker");

      if (fileInput) {
        // fileInput.click();
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        fileInput.dispatchEvent(clickEvent);
        document.body.onfocus = (e) => {
          setTimeout(() => {
            setGrabPhoto(false);
          }, 1000);
        };
      }
    }
  }, [grabPhoto]);

  const photoPickerChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/avif"
      ) {
        const formData = new FormData();
        formData.append("image", file);

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
          params: {
            chatId: selectedChat,
          },
        };
        const { data } = await axios.post(
          "api/message/add-image-message",
          formData,
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
        setFetchAgain(!fetchAgain);
      } else {
        toast({
          title: "Error Occured!",
          description: "Only images can be uploaded ",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "emoji-open") {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target)
        ) {
          setShowEmojiPicker(false);
        }
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const toast = useToast();

  const handleEmojiModal = () => {
    setShowEmojiPicker((showEmojiPicker) => !showEmojiPicker);
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage((prevMessage) => (prevMessage += emoji.emoji));
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id, user._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
        setFetchAgain(!fetchAgain);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    // socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
        setFetchAgain(!fetchAgain);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleVoiceCall = () => {
    const otherUser =
      selectedChat.users[0]._id === user._id
        ? selectedChat.users[1]
        : selectedChat.users[0];

    dispatch({
      type: "SET-VOICE-CALL",
      payload: {
        ...otherUser,
        type: "out-going",
        callType: "voice",
        roomId: Date.now(),
      },
    });
  };

  const handleVideoCall = () => {
    if (message && message === "pass") {
      const otherUser =
        selectedChat.users[0]._id === user._id
          ? selectedChat.users[1]
          : selectedChat.users[0];

      dispatch({
        type: "SET-VIDEO-CALL",
        payload: {
          ...otherUser,
          type: "out-going",
          callType: "video",
          roomId: Date.now(),
        },
      });
    } else {
      handlePayment();
    }
  };
  return (
    <>
      {/* <div>{message ? <Message message={message} /> : null }</div> */}
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}

                  <div>
                    {onlineUsers && onlineUsers.includes(otherUser._id) ? (
                      <span style={{ fontSize: "20px"}}>
                        Online
                      </span>
                    ) : (
                      <span style={{ fontSize: "20px"}}>
                        Offline
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      // justifyContent: "space-between",
                      // width: "80px",
                      // marginLeft: "420px",
                    }}
                  >
                    <MdCall
                      className=" mt-1"
                      fontSize={30}
                      cursor="pointer"
                      onClick={handleVoiceCall}
                    />
                    <BsFillCameraVideoFill
                      className="ml-3 mr-4 mt-1"
                      cursor="pointer"
                      onClick={handleVideoCall}
                    />

                    <ProfileModal
                      user={getSenderFull(user, selectedChat.users)}
                    />
                  </div>
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}

              <BsEmojiSmile
                fontSize={28}
                onClick={handleEmojiModal}
                id="emoji-open"
              />
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  style={{ marginBottom: "410px", position: "absolute" }}
                >
                  <EmojiPicker
                    width={350}
                    height={350}
                    onEmojiClick={handleEmojiClick}
                  />
                </div>
              )}
              <GrAttachment
                style={{ marginLeft: "33px", position: "absolute" }}
                fontSize={24}
                onClick={() => setGrabPhoto(true)}
              />

              <div id="photo-picker-element"></div>
              {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}

              <Input
                marginLeft={10}
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
