import getPrismaInstance from "../utils/PrismaClient.js";
import { getPromptReplyFromGemini } from "../utils/apiCalls.js";

export const setUserStatusAvailable = async (req, res) => {
  const prisma = getPrismaInstance();
  const { userId } = req.body;
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: "available",
      },
    });

    // let isLLMCompleted = false;

    // const callLLMWithTimeout = async () => {
    //   try {
    //     const response = await getPromptReplyFromGemini("shut up");
    //     console.log(response);
    //     isLLMCompleted = true;
    //   } catch (error) {
    //     console.log("LLM is slow from error");
    //   }
    // };

    // const timeoutPromise = new Promise((resolve) => {
    //   setTimeout(() => {
    //     if (!isLLMCompleted) {
    //       console.log("LLM is slow from timeout");
    //       resolve();
    //     }
    //   }, 10000); // 10 seconds timeout it will only respond if LLM has not
    // });

    // // Call the LLM function and handle timeout
    // await Promise.race([callLLMWithTimeout(), timeoutPromise]);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
};

export const setUserStatusBusy = async (req, res) => {
  const prisma = getPrismaInstance();
  const { userId } = req.body;
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: "busy",
      },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
