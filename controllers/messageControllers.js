const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const { encryptdata, decryptdata } = require("./encryption");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat").lean();
      for (const m of messages){
        if(m.iv){
          m.content=decryptdata(m.content, m.iv);
        }
        // console.log(m.content);  //to decrypt

      }
      // console.log(messages);
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
console.log(content);
let encryptedmessage = encryptdata(content);
console.log(encryptedmessage);
  var newMessage = {
    sender: req.user._id,
    content: encryptedmessage.encryptedData,
    chat: chatId,
    iv: encryptedmessage.iv
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    
      if(message.iv){
        message.content=decryptdata(message.content, message.iv);
      }
      // console.log(m.content);  //to decrypt

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
