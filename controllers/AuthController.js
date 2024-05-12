import getPrismaInstance from "../utils/PrismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const checkUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ msg: "email is required.", status: false });
    }
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({ msg: "user not found", status: false });
    } else return res.json({ msg: "user found", status: true, data: user });
  } catch (error) {
    console.log(error);
    next(err);
  }
};

export const onBoardUser = async (req, res, next) => {
  const body = req.body;
  console.log(body);
  const { name, email, password, about } = req.body;
  // const {name,email,password,about} } = body;
  console.log("user data received: ", name, email, password, about);
  try {
    if (!name || !email || !password) {
      return res.json({
        message: "insufficient or invalid userInfo",
        status: false,
      });
    }
    const prisma = getPrismaInstance();
    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 12), ////12 is salt difficulty level(higher takes more time)
        about,
        name,
      },
    });
    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("user created: ", user,token);
    delete user.password;
    return res.json({
      message: "user created successfully",
      status: true,
      user,
      token
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.json({
        message: "insufficient or invalid userInfo",
        status: false,
      });
    }
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.json({ msg: "user not found", status: false });
    }
    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res.json({ msg: "password incorrect", status: false });
    }
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    delete user.password;
    return res.json({ msg: "user found", status: true, user, token });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
    const groupedByInitialLetters = {};
    users.forEach((user) => {
      let initalLetter = user.name.charAt(0).toUpperCase();
      if (!groupedByInitialLetters[initalLetter]) {
        groupedByInitialLetters[initalLetter] = [];
      }
      groupedByInitialLetters[initalLetter].push(user);
    });
    return res
      .status(200)
      .json({ status: true, users: groupedByInitialLetters });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
