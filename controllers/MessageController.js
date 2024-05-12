import getPrismaInstance from "../utils/PrismaClient.js";
import { getPromptReplyFromGemini } from "../utils/apiCalls.js";
import verifyId from "../utils/verifyObjectId.js";
import { io } from "../index.js";
export const addMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { message, to, from } = req.body;

    // Step 1: Add the message to the database
    const newMessage = await prisma.messages.create({
      data: {
        message: message,
        senderId: from,
        receiverId: to,
        // Assuming messageStatus is "sent" by default
      },
    });

    // Step 1: Respond to sender A with an appropriate response
    res.status(201).json({ status: true, message: newMessage });

    // Step 1: Check if the recipient B is either BUSY or OFFLINE
    const recipient = await prisma.user.findUnique({
      where: {
        id: to,
      },
    });

    //LLM will only respond if the user who is recipient is BUSY or OFFLINE
    if (recipient.status === "busy" || !global.onlineUsers.has(recipient.id)) {
      try {
        let isLLMCompleted = false;

        const callLLMWithTimeout = async () => {
          try {
            const response = await getPromptReplyFromGemini(message);
            // throw new Error("Mock error from gemini");
            console.log(response);
            const newLLMMessage = await prisma.messages.create({
              data: {
                message: response,
                senderId: to,
                receiverId: from,
              },
            });
            // console.log(newLLMMessage);
            //have to implement socket to add this msg to the sender
            const sendUserSocket = global.onlineUsers.get(from);
            console.log("sendUserSocket:: ",sendUserSocket);
            if (sendUserSocket) {
              io.to(sendUserSocket).emit("rcv-msg", {
                from: to,
                message: newLLMMessage,
              });
            }
            isLLMCompleted = true;
          } catch (error) {
            console.log("LLM is slow from error");
          }
        };

        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            if (!isLLMCompleted) {
              console.log("LLM is slow from timeout");
              const defaultResponse =
                "I am unavailable right now, let's talk later?";
              prisma.messages
                .create({
                  data: {
                    message: defaultResponse,
                    senderId: to,
                    receiverId: from,
                  },
                })
                .then((newLLMMessage) => {
                  console.log(newLLMMessage);
                  //have to implement socket to add this msg to the sender
                });
              resolve();
            }
          }, 10000); // 10 seconds timeout it will only respond if LLM has not
        });

        await Promise.race([callLLMWithTimeout(), timeoutPromise]);
      } catch (error) {
        console.log("LLM is slow from error", error);
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.params;
    if (verifyId(from) && verifyId(to)) {
      const prisma = getPrismaInstance();
      const messages = await prisma.messages.findMany({
        where: {
          receiverId: { not: undefined },
          senderId: { not: undefined },
          OR: [
            {
              senderId: from,
              receiverId: to,
            },
            {
              senderId: to,
              receiverId: from,
            },
          ],
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      const unreadMessages = [];

      messages?.forEach((msg, i) => {
        if (msg.senderId === from && msg.messageStatus !== "read") {
          messages[i].messageStatus = "read";
          unreadMessages.push(msg.id);
        }
        // else{
        //   console.log("not reading cuz, msgSender:",msg.senderId,", and to: ",to," n msg status",msg.messageStatus)
        // }
      });

      //updating read status in db
      await prisma.messages.updateMany({
        where: {
          id: { in: unreadMessages },
        },
        data: {
          messageStatus: "read",
        },
      });

      res.status(200).json({
        status: true,
        messages: { allMessages: messages, unreadMessages: unreadMessages },
      });
    } else {
      console.log(from, to);
      res
        .status(404)
        .json({ message: "from and to must be valid", from: from, to: to });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getInitialUsersWithMessages = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const prisma = getPrismaInstance();
    console.log("User Id logged in: " + userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentMessages: {
          include: {
            sender: true,
            receiver: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        receivedMessages: {
          include: {
            sender: true,
            receiver: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const messages = [...user.sentMessages, ...user.receivedMessages];
    messages.sort((a, b) => b.createdAt - a.createdAt);
    const users = new Map();
    //map for storing all the users who were chatting with the user "UserId".
    //it contains the user details,totalNumber of unread messages from the particular user.

    const messageStatusChange = [];

    messages.forEach((msg) => {
      const isSender = msg.senderId === userId;
      const calculatedId = isSender ? msg.receiverId : msg.senderId;
      if (msg.messageStatus === "sent" && !isSender) {
        messageStatusChange.push(msg.id);
        console.log("found undelivered message:", msg.id);
      }
      if (!users.has(calculatedId)) {
        const {
          id,
          createdAt,
          type,
          senderId,
          receiverId,
          messageStatus,
          message,
        } = msg;

        let user = {
          messageId: id,
          type,
          createdAt,
          senderId,
          receiverId,
          messageStatus,
          message,
        };

        if (isSender) {
          user = {
            ...user,
            totalUnreadMessages: 0,
            ...msg.receiver,
          };
        } else {
          user = {
            ...user,
            totalUnreadMessages: messageStatus === "read" ? 0 : 1,
            ...msg.sender,
          };
        }
        users.set(calculatedId, user);
      } else if (msg.messageStatus !== "read" && !isSender) {
        const user = users.get(calculatedId);
        users.set(calculatedId, {
          ...user,
          totalUnreadMessages: user.totalUnreadMessages + 1,
        });
      }
    });

    if (messageStatusChange.length) {
      console.log("Total undelived messages: " + messageStatusChange.length);
      await prisma.messages.updateMany({
        where: {
          id: { in: messageStatusChange },
        },
        data: {
          messageStatus: "delivered",
        },
      });
    }

    // console.log("Total users associated with: ", users.size);
    const result = Array.from(users, ([userId, data]) => {
      return { userId, data };
    });
    return res
      .status(200)
      .json({ users: result, onlineUsers: Array.from(onlineUsers.keys()) });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: error,
      message: "Unable to fetch unread messages with users",
    });
  }
};
