import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
 
} from "@chakra-ui/react";
import UserListItem from "../userAvatar/userListItem";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ChatState } from "../../context/chatProvider";

const PeopleModal = ({ accessChat, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchResult, setSearchResult] = useState([]);
  const [scrollBehavior, setScrollBehavior] = useState("inside");
  const [loading, setLoading] = useState(false);

  const btnRef = useRef(null);
  const toast = useToast();
  const { user } = ChatState();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user/explore`, config);
      setLoading(true);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  });

  return (
    <>
      {children ? <span onClick={onOpen}>{children}</span> : null}

      <Modal
        size="lg"
        onClose={onClose}
        isOpen={isOpen}
        finalFocusRef={btnRef}
        scrollBehavior={scrollBehavior}
      >
        <ModalOverlay />
        <ModalContent h="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            All Users
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            {
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => {
                    accessChat(user._id);
                    onClose();
                  }}
                />
              ))
            }
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

{/* <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />; */}

export default PeopleModal;
