import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  isRecording: false,
  audioRecorder: null,
  isPaused: false, // Changed from 'pauseRecording' to 'isPaused' for clarity
  audioChunks: [],
  replyToMessage: null, // Add state for replying to messages

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyToMessage } = get();
    set({ isSendingMessage: true });

    try {
      // Log attachment size for debugging if available
      if (messageData.attachment?.data) {
        const sizeInKB = Math.round(messageData.attachment.data.length / 1024);
        console.log(`${messageData.attachment.type} data size:`, sizeInKB, "KB");
      }
      
      // Add replyTo if replying to a message
      if (replyToMessage) {
        messageData.replyTo = replyToMessage._id;
      }
      
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data], replyToMessage: null });
      return res.data;
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error.response?.data?.message || "Failed to send message";
      toast.error(errorMessage);
    } finally {
      set({ isSendingMessage: false });
    }
  },

  startRecording: async () => {
    try {
      // Check if there's an existing recording and stop it first
      const { audioRecorder } = get();
      if (audioRecorder && audioRecorder.state !== "inactive") {
        audioRecorder.stop();
        
        // Wait a bit for the previous recording to clean up
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm' // More compatible format
      });
      const audioChunks = [];
      
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          // Store chunks in store state instead of local variable
          set(state => ({ 
            audioChunks: [...state.audioChunks, event.data]
          }));
        }
      });
      
      mediaRecorder.addEventListener("stop", () => {
        // Only process recording if NOT canceled
        const { audioChunks } = get();
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        set({ 
          isRecording: false,
          audioRecorder: null,
          isPaused: false // Reset pause state
        });
      });
      
      // Request data every second to get better chunk sizes
      mediaRecorder.start(1000);
      set({ 
        isRecording: true,
        audioRecorder: mediaRecorder,
        isPaused: false, // Reset pause state
        audioChunks: [] // Reset chunks when starting new recording
      });
      
    } catch (error) {
      console.error("Error starting audio recording:", error);
      toast.error("Couldn't access microphone. Please check permissions.");
      set({ isRecording: false });
    }
  },

  pauseRecording: () => {
    const { audioRecorder, isPaused } = get(); // Use isPaused instead of pauseRecording
    if (audioRecorder && audioRecorder.state === "recording") {
      try {
        audioRecorder.pause();
        set({ isPaused: true });
      } catch (error) {
        console.error("Error pausing recording:", error);
      }
    } else if (audioRecorder && audioRecorder.state === "paused") {
      try {
        audioRecorder.resume();
        set({ isPaused: false });
      } catch (error) {
        console.error("Error resuming recording:", error);
      }
    }
  },
  
  stopRecording: () => {
    const { audioRecorder, audioChunks } = get();
    if (audioRecorder && audioRecorder.state !== "inactive") {
      try {
        audioRecorder.stop();
        
        // Process the audio data after stopping
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result;
            
            // Send the audio message
            get().sendMessage({
              attachment: {
                data: base64data,
                type: "audio",
                filename: `audio_${new Date().getTime()}.webm`
              }
            });
          };
        }
        
        // Reset audio chunks
        set({ audioChunks: [] });
      } catch (error) {
        console.error("Error stopping recording:", error);
        set({ 
          isRecording: false,
          audioRecorder: null,
          isPaused: false, // Reset pause state
          audioChunks: []
        });
      }
    }
  },
  
  cancelRecording: () => {
    const { audioRecorder } = get();
    if (audioRecorder && audioRecorder.state !== "inactive") {
      try {
        // Stop the recorder without processing the audio
        audioRecorder.stop();
        
        // Stop all audio tracks associated with the recorder
        const stream = audioRecorder.stream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (error) {
        console.error("Error cancelling recording:", error);
      } finally {
        // Reset state including audioChunks to prevent sending
        set({ 
          isRecording: false,
          isPaused: false, // Reset pause state using the new name
          audioRecorder: null,
          audioChunks: [] // Important: clear chunks to prevent sending
        });
      }
    }
  },

  // Add deleteMessage function
  deleteMessage: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/messages/${messageId}`);
      
      // Update messages in the store by filtering out the deleted message
      set(state => ({
        messages: state.messages.filter(msg => msg._id !== messageId)
      }));
      
      toast.success("Message deleted");
      return res.data;
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(error.response?.data?.message || "Failed to delete message");
      throw error;
    }
  },

  // Fixed forwardMessage function
  forwardMessage: async (messageId, receiverIds) => {
    try {
      if (!messageId) {
        toast.error("Message ID is required");
        throw new Error("Invalid message ID");
      }
      
      if (!receiverIds || (Array.isArray(receiverIds) && receiverIds.length === 0)) {
        toast.error("Select at least one recipient");
        throw new Error("No recipients selected");
      }
      
      // Ensure receiverIds is always an array
      const formattedReceiverIds = Array.isArray(receiverIds) ? receiverIds : [receiverIds];
      
      const payload = {
        messageId,
        receiverIds: formattedReceiverIds
      };
      
      console.log("Forwarding message with payload:", payload);
      
      // Make sure we're using the correct API endpoint and sending proper data
      const res = await axiosInstance.post("/messages/forward", payload);
      
      // Don't show a success toast here, as it's already shown in the component
      return res.data;
    } catch (error) {
      console.error("Error forwarding message:", error);
      
      // More detailed error handling
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        "Failed to forward message";
      
      // Don't show error toast here, let the component handle it
      throw error;
    }
  },
  
  // Set message to reply to
  setReplyToMessage: (message) => {
    set({ replyToMessage: message });
  },
  
  // Clear reply state
  clearReplyToMessage: () => {
    set({ replyToMessage: null });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    if (!socket) {
      console.warn("Socket not available for message subscription");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
    
    // Listen for message deletion events
    socket.on("messageDeleted", (messageId) => {
      set(state => ({
        messages: state.messages.filter(msg => msg._id !== messageId)
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("messageDeleted");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));