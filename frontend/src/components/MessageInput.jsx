import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Paperclip, Mic, StopCircle, Pause, Play, CornerUpLeft } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);

  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  const {
    sendMessage,
    isRecording,
    isPaused,
    startRecording,
    pauseRecording,
    stopRecording,
    cancelRecording,
    replyToMessage,
    clearReplyToMessage,
  } = useChatStore();

  // Timer for recording duration - improved implementation
  useEffect(() => {
    // Clear any existing interval when component unmounts or recording state changes
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }

    // Only start a new interval if currently recording and not paused
    if (isRecording && !isPaused) {
      const startTime = Date.now() - (recordingTime * 1000); // Account for existing time
      
      const interval = setInterval(() => {
        // Calculate time based on actual elapsed time for accuracy
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setRecordingTime(elapsedSeconds);
      }, 500); // Update twice per second for smoother display
      
      setRecordingInterval(interval);
    }

    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [isRecording, isPaused, recordingTime]); // Added recordingTime to dependencies

  // Format recording time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Determine attachment type
    let attachmentType;
    if (file.type.startsWith("image/")) {
      attachmentType = "image";
    } else if (file.type.startsWith("video/")) {
      attachmentType = "video";
    } else if (file.type.startsWith("audio/")) {
      attachmentType = "audio";
    } else {
      attachmentType = "document";
    }

    // Check file size (limit to 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size should be less than 20MB");
      return;
    }

    setAttachmentFile({
      file,
      type: attachmentType,
    });

    // Create preview based on file type
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentPreview({
        url: reader.result,
        type: attachmentType,
        filename: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachmentPreview(null);
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !attachmentPreview) return;

    try {
      setIsSending(true);

      // Prepare message data
      const messageData = { text: text.trim() };

      // Add attachment if present
      if (attachmentPreview) {
        messageData.attachment = {
          data: attachmentPreview.url,
          type: attachmentPreview.type,
          filename: attachmentPreview.filename,
        };
      }

      await sendMessage(messageData);

      // Clear form
      setText("");
      setAttachmentPreview(null);
      setAttachmentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Reset timer when starting a new recording
      setRecordingTime(0);
      startRecording();
    } else if (isPaused) {
      pauseRecording();
    } else {
      pauseRecording();
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsSending(true);
      const audioBlob = await stopRecording();
      
      if (audioBlob) {
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result;
          
          // Send audio message
          await sendMessage({
            attachment: {
              data: base64data,
              type: "audio",
              filename: `voice_message_${new Date().getTime()}.mp3`
            }
          });
          
          // Reset recording state
          setRecordingTime(0);
        };
      }
    } catch (error) {
      console.error("Failed to send audio message:", error);
      toast.error("Failed to send audio message");
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
    setRecordingTime(0);
  };

  // Get preview component based on attachment type
  const getPreviewComponent = () => {
    if (!attachmentPreview) return null;
    
    switch (attachmentPreview.type) {
      case 'image':
        return (
          <img
            src={attachmentPreview.url}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
          />
        );
      case 'video':
        return (
          <video
            src={attachmentPreview.url}
            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            controls
          />
        );
      case 'audio':
        return (
          <audio
            src={attachmentPreview.url}
            className="w-20 h-5 rounded-lg border border-zinc-700"
            controls
          />
        );
      case 'document':
        return (
          <div className="w-20 h-20 flex items-center justify-center bg-zinc-800 rounded-lg border border-zinc-700">
            <span className="text-xs text-center overflow-hidden">
              {attachmentPreview.filename.slice(0, 10)}
              {attachmentPreview.filename.length > 10 ? '...' : ''}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Reply preview */}
      {replyToMessage && (
        <div className="mb-3 flex items-center justify-between gap-2 p-2 bg-zinc-800 rounded-lg">
          <div className="flex-1 overflow-hidden">
            <span className="text-xs text-zinc-400">Replying to</span>
            <p className="text-sm truncate">{replyToMessage.text}</p>
          </div>
          <button
            onClick={clearReplyToMessage}
            className="btn btn-circle btn-xs"
            type="button"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Attachment preview */}
      {attachmentPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {getPreviewComponent()}
            <button
              onClick={removeAttachment}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
          <span className="text-xs text-gray-400">{attachmentPreview.filename}</span>
        </div>
      )}
      
      {/* Recording status */}
      {isRecording && (
        <div className="mb-3 flex items-center gap-3 text-red-500">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span>Recording... {formatTime(recordingTime)}</span>
          
          {/* Recording controls */}
          <div className="flex items-center gap-2 ml-auto">
            {isPaused ? (
              <button 
                type="button" 
                onClick={toggleRecording}
                className="btn btn-circle btn-xs"
              >
                <Play size={14} />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={toggleRecording}
                className="btn btn-circle btn-xs"
              >
                <Pause size={14} />
              </button>
            )}
            
            <button 
              type="button" 
              onClick={handleStopRecording}
              className="btn btn-circle btn-xs"
            >
              <CornerUpLeft size={14} />
            </button>
            
            <button 
              type="button" 
              onClick={handleCancelRecording}
              className="btn btn-circle btn-xs"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        {!isRecording && (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isRecording || isSending}
            />
            
            {/* Hidden file inputs */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAttachmentChange}
            />
            
            <input
              type="file"
              accept="*/*"
              className="hidden"
              ref={attachmentInputRef}
              onChange={handleAttachmentChange}
            />

            {/* Visible buttons */}
            <button
              type="button"
              className="hidden sm:flex btn btn-circle"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording || isSending}
            >
              <Image size={20} className="text-zinc-400" />
            </button>
            
            <button
              type="button"
              className="hidden sm:flex btn btn-circle"
              onClick={() => attachmentInputRef.current?.click()}
              disabled={isRecording || isSending}
            >
              <Paperclip size={20} className="text-zinc-400" />
            </button>
            
            <button
              type="button"
              className={`hidden sm:flex btn btn-circle ${isRecording ? 'text-red-500' : 'text-zinc-400'}`}
              onClick={toggleRecording}
              disabled={isSending}
            >
              {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>
          </div>
        )}
        
        {!isRecording && (
          <button
            type="submit"
            className="btn btn-sm btn-circle"
            disabled={(!text.trim() && !attachmentPreview) || isRecording || isSending}
          >
            <Send size={22} />
          </button>
        )}
      </form>
    </div>
  );
};

export default MessageInput;