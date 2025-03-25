import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ message: "Failed to get users" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Failed to get messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, attachment } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    
    let attachmentData = null;
    
    if (attachment && attachment.data) {
      try {
        console.log(`Uploading ${attachment.type} to Cloudinary...`);
        
        // Determine resource type for Cloudinary based on attachment type
        let resourceType = "auto";
        if (attachment.type === "image") resourceType = "image";
        if (attachment.type === "video") resourceType = "video";
        if (attachment.type === "audio") resourceType = "video"; // Cloudinary handles audio under video resource type
        if (attachment.type === "document") resourceType = "raw";
        
        // Set folder name based on attachment type
        const folder = `chat_${attachment.type}s`;
        
        // Upload to Cloudinary with appropriate resource type
        const uploadPromise = cloudinary.uploader.upload(attachment.data, {
          folder,
          resource_type: resourceType,
          timeout: 120000, // 2 minutes timeout for larger files
        });
        
        const uploadResponse = await uploadPromise;
        
        attachmentData = {
          url: uploadResponse.secure_url,
          type: attachment.type,
          filename: attachment.filename || "file"
        };
        
        console.log(`${attachment.type} uploaded successfully:`, uploadResponse.secure_url);
      }  catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(400).json({ 
          message: `Failed to upload ${attachment.type}. Please try again with a smaller file.`
        });
      }
    }
    
    if (!text && !attachmentData) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      attachment: attachmentData,
    });
    
    await newMessage.save();
    
    // Send real-time message via socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// delete message endpoint
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the message first to verify ownership
    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Check if the user is authorized to delete this message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    // If message has an attachment, we might want to delete it from Cloudinary
    // This is optional but good for storage management
    if (message.attachment && message.attachment.url) {
      try {
        // Extract public_id from the Cloudinary URL
        const urlParts = message.attachment.url.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        const folderPath = urlParts[urlParts.length - 2];
        const publicId = `${folderPath}/${filename}`;
        
        // Delete from Cloudinary based on resource type
        let resourceType = "image";
        if (message.attachment.type === "video") resourceType = "video";
        if (message.attachment.type === "audio") resourceType = "video";
        if (message.attachment.type === "document") resourceType = "raw";
        
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue with message deletion even if Cloudinary deletion fails
      }
    }

    // Delete the message
    await Message.findByIdAndDelete(id);
    
    // Notify other users about deletion via socket
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", id);
    }
    
    res.status(200).json({ message: "Message deleted successfully", messageId: id });
  } catch (error) {
    console.error("Error in deleteMessage controller:", error.message);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

// Add forward message endpoint
export const forwardMessage = async (req, res) => {
  try {
    const { messageId, receiverIds } = req.body;
    const senderId = req.user._id;
    
    if (!messageId || !receiverIds || !Array.isArray(receiverIds) || receiverIds.length === 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    
    // Find the original message
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: "Original message not found" });
    }
    
    console.log("Original message to forward:", {
      text: originalMessage.text,
      hasAttachment: !!originalMessage.attachment
    });
    
    // Prepare new message data
    const forwardedMessages = [];
    
    // Create a new message for each receiver
    for (const receiverId of receiverIds) {
      // Create message with proper defaults for text
      const newMessage = new Message({
        senderId,
        receiverId,
        text: originalMessage.text || "", // Ensure text is never undefined
        attachment: originalMessage.attachment, // This can be null if no attachment
        isForwarded: true
      });
      
      console.log(`Creating forwarded message for ${receiverId}:`, {
        text: newMessage.text,
        hasAttachment: !!newMessage.attachment
      });
      
      await newMessage.save();
      forwardedMessages.push(newMessage);
      
      // Send real-time message via socket
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }
    
    res.status(201).json({ 
      message: "Message forwarded successfully", 
      forwardedMessages 
    });
  } catch (error) {
    console.error("Error in forwardMessage controller:", error);
    res.status(500).json({ message: "Failed to forward message", error: error.message });
  }
};