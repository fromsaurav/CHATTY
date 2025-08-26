import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ForwardModal from './ForwardModal';
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { FileText, Mic, Play, Pause, Search, X } from "lucide-react";
import MessageContextMenu from "./MessageContextMenu";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    forwardMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const audioRefs = useRef({});
  const audioMetadataLoaded = useRef({});

  // Keep track of currently playing audio
  const [playingAudio, setPlayingAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDurations, setAudioDurations] = useState({});
  const [audioProgress, setAudioProgress] = useState({});

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    messageId: null,
  });

  // Search functionality
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const searchResultRefs = useRef({});

  const [forwardModal, setForwardModal] = useState({
    isOpen: false,
    messageId: null
  });

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    // Guard against invalid values
    if (!seconds || !isFinite(seconds) || seconds < 0) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  useEffect(() => {
    // Check if selectedUser exists and has an _id before fetching messages
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => {
      // Stop any playing audio when unmounting
      if (playingAudio) {
        const audioEl = audioRefs.current[playingAudio];
        if (audioEl) {
          audioEl.pause();
          // Remove event listeners to prevent memory leaks
          audioEl.onloadedmetadata = null;
          audioEl.ontimeupdate = null;
          audioEl.onended = null;
        }
      }
      unsubscribeFromMessages();
    };
  }, [
    selectedUser,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    playingAudio,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages && !isSearchActive) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSearchActive]);

  // Handle audio playback
  const toggleAudioPlayback = (messageId) => {
    // If we have a currently playing audio that's different from the one clicked
    if (
      playingAudio &&
      playingAudio !== messageId &&
      audioRefs.current[playingAudio]
    ) {
      audioRefs.current[playingAudio].pause();
      setIsPlaying(false);
    }

    const audioElement = audioRefs.current[messageId];
    if (!audioElement) return;

    if (audioElement.paused) {
      audioElement
        .play()
        .then(() => {
          setPlayingAudio(messageId);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Error playing audio:", err);
          // Reset UI state if playback fails
          setPlayingAudio(null);
          setIsPlaying(false);
        });
    } else {
      audioElement.pause();
      setPlayingAudio(null); // Clear the playing audio
      setIsPlaying(false);
    }
  };

  // Audio ended event handler
  const handleAudioEnded = (messageId) => {
    setPlayingAudio(null);
    setIsPlaying(false);

    // Reset progress
    setAudioProgress((prev) => ({
      ...prev,
      [messageId]: 0,
    }));
  };

  // Set up audio element event handlers - Fixed to prevent infinite loops
  const setupAudioElement = (element, messageId) => {
    if (!element) return;

    // Store reference to audio element
    audioRefs.current[messageId] = element;

    // Clear previous event listeners if they exist
    element.onloadedmetadata = null;
    element.ontimeupdate = null;
    element.onended = null;
    element.oncanplay = null;
    element.onloadeddata = null;

    // Only set up event listeners if they haven't been set up before
    if (!audioMetadataLoaded.current[messageId]) {
      // Force load the audio metadata
      element.load();
      
      // Multiple event handlers to ensure we get the duration
      const handleMetadataLoaded = () => {
        if (isFinite(element.duration) && element.duration > 0) {
          setAudioDurations((prev) => ({
            ...prev,
            [messageId]: element.duration,
          }));
          // Mark that we've loaded metadata for this element
          audioMetadataLoaded.current[messageId] = true;
        }
      };

      element.onloadedmetadata = handleMetadataLoaded;
      element.oncanplay = handleMetadataLoaded;
      element.onloadeddata = handleMetadataLoaded;

      // Update progress during playback
      element.ontimeupdate = () => {
        if (element === audioRefs.current[messageId] && element.duration > 0) {
          const progress = element.currentTime / element.duration;
          setAudioProgress((prev) => ({
            ...prev,
            [messageId]: progress,
          }));
        }
      };

      // Handle audio ended
      element.onended = () => handleAudioEnded(messageId);
      
      // Try to load duration immediately if already available
      if (element.readyState >= 1 && element.duration > 0) {
        handleMetadataLoaded();
      }
    }
  };

  // Context menu handlers
  const handleContextMenu = (e, messageId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      position: { x: e.pageX, y: e.pageY },
      messageId,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      position: { x: 0, y: 0 },
      messageId: null,
    });
  };

  const handleDelete = async () => {
    if (contextMenu.messageId) {
      try {
        await deleteMessage(contextMenu.messageId);
        closeContextMenu();
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }
  };

  // Modified forward handler to open the forward modal
  const handleForward = () => {
    if (contextMenu.messageId) {
      setForwardModal({
        isOpen: true,
        messageId: contextMenu.messageId
      });
      closeContextMenu();
    }
  };

  // Function to close the forward modal
  const closeForwardModal = () => {
    setForwardModal({
      isOpen: false,
      messageId: null
    });
  };


  const handleReply = () => {
    if (contextMenu.messageId) {
      const message = messages.find((msg) => msg._id === contextMenu.messageId);
      if (message) {
        // Update your MessageInput component to show reply preview
        // This is a placeholder for the actual implementation
        console.log("Reply to message:", message);
      }
      closeContextMenu();
    }
  };

  const handleShare = () => {
    if (contextMenu.messageId) {
      const message = messages.find((msg) => msg._id === contextMenu.messageId);
      if (message) {
        // Implement share functionality
        // This is a placeholder for the actual implementation
        console.log("Share message:", message);
      }
      closeContextMenu();
    }
  };

  // Search functionality
  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  useEffect(() => {
    if (searchQuery && messages && messages.length > 0) {
      const results = messages.filter(
        (message) =>
          message.text &&
          message.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setCurrentResultIndex(0);

      // Scroll to first result if there are any
      if (results.length > 0 && searchResultRefs.current[results[0]._id]) {
        searchResultRefs.current[results[0]._id].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, messages]);

  const navigateSearchResults = (direction) => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === "next") {
      newIndex = (currentResultIndex + 1) % searchResults.length;
    } else {
      // prev
      newIndex =
        (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    }

    setCurrentResultIndex(newIndex);

    // Scroll to the current result
    const currentResultId = searchResults[newIndex]._id;
    if (searchResultRefs.current[currentResultId]) {
      searchResultRefs.current[currentResultId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  
  // If no user is selected, show a placeholder
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-base-content/50">Select a user to start chatting</p>
      </div>
    );
  }

  // Function to render the appropriate attachment component
  const renderAttachment = (attachment, messageId) => {
    if (!attachment) return null;

    switch (attachment.type) {
      case "image":
        return (
          <img
            src={attachment.url}
            alt="Image"
            className="sm:max-w-[200px] rounded-md mb-2"
          />
        );
      case "video":
        return (
          <video
            src={attachment.url}
            className="sm:max-w-[200px] rounded-md mb-2"
            controls
          />
        );
      case "audio":
        return (
          <div className="flex flex-col w-full mb-2">
            <div className="bg-base-300 rounded-lg p-3">
              <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={() => toggleAudioPlayback(messageId)}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                >
                  {playingAudio === messageId && isPlaying ? (
                    <Pause size={18} className="text-white" />
                  ) : (
                    <Play size={18} className="text-white" />
                  )}
                </button>

                {/* Waveform Visualization */}
                <div className="flex-1 h-10 flex items-center">
                  {[...Array(30)].map((_, i) => {
                    // Create a consistent waveform pattern using the messageId as a seed
                    // This ensures the same message always has the same waveform pattern
                    const seed = messageId.charCodeAt(i % messageId.length);
                    const distanceFromCenter = Math.abs(i - 15) / 15;
                    const randomFactor = 0.7 + (seed % 30) / 100; // Deterministic random between 0.7-1.0
                    const baseHeight = 20 - distanceFromCenter * 12;
                    const height = Math.max(4, baseHeight * randomFactor);

                    // Determine color based on playback progress
                    const isActive =
                      playingAudio === messageId &&
                      i / 30 <= (audioProgress[messageId] || 0);

                    return (
                      <div
                        key={i}
                        className="flex-1 mx-px rounded-full transition-all duration-100"
                        style={{
                          height: `${height}px`,
                          backgroundColor: isActive ? "#10b981" : "#9ca3af",
                          opacity: isActive ? 1 : 0.5,
                          minWidth: "2px",
                          maxWidth: "4px", // Limit maximum width for better visualization
                          margin: "0 1px", // Ensure spacing between bars
                        }}
                      />
                    );
                  })}
                </div>

                {/* Audio Time Display */}
                <div className="text-xs font-medium whitespace-nowrap min-w-16 text-right">
                  {playingAudio === messageId && audioRefs.current[messageId]
                    ? `${formatTime(
                        audioRefs.current[messageId].currentTime || 0
                      )} / ${formatTime(audioDurations[messageId] || audioRefs.current[messageId].duration || 0)}`
                    : `0:00 / ${formatTime(audioDurations[messageId] || 0)}`}
                </div>

                {/* Hidden audio element */}
                <audio
                  ref={(el) => setupAudioElement(el, messageId)}
                  src={attachment.url}
                  className="hidden"
                  preload="metadata"
                />
              </div>
            </div>
          </div>
        );

      case "document":
        return (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-base-300 p-2 rounded-md mb-2 text-sm"
          >
            <FileText size={16} />
            <span className="truncate max-w-[150px]">
              {attachment.filename || "Document"}
            </span>
          </a>
        );
      default:
        return null;
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const highlightSearchText = (text, query) => {
    if (!query || !text) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-yellow-300 text-black">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Search Bar */}
      <div className="flex items-center px-4 py-2 border-b border-base-300">
        <button
          onClick={toggleSearch}
          className={`btn btn-sm btn-circle mr-2 ${
            isSearchActive ? "btn-primary" : ""
          }`}
        >
          <Search size={18} />
        </button>

        {isSearchActive && (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              className="input input-sm input-bordered w-full"
              placeholder="Search in conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateSearchResults("prev")}
                className="btn btn-sm btn-circle"
                disabled={searchResults.length === 0}
              >
                ↑
              </button>
              <button
                onClick={() => navigateSearchResults("next")}
                className="btn btn-sm btn-circle"
                disabled={searchResults.length === 0}
              >
                ↓
              </button>
              <span className="text-xs whitespace-nowrap">
                {searchResults.length > 0
                  ? `${currentResultIndex + 1}/${searchResults.length}`
                  : "0 results"}
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchActive(false);
                }}
                className="btn btn-sm btn-circle"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message, index) => {
            // Add ref only to the last message for scrolling
            const isLastMessage = index === messages.length - 1;
            const isSearchResult = searchResults.includes(message);
            const isCurrentSearchResult =
              isSearchResult &&
              searchResults[currentResultIndex]._id === message._id;

            return (
              <div
                key={message._id}
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end" : "chat-start"
                } ${
                  isCurrentSearchResult ? "ring-2 ring-primary rounded-lg" : ""
                }`}
                ref={(el) => {
                  // Store refs for both last message and search results
                  if (isLastMessage) messageEndRef.current = el;
                  if (isSearchResult)
                    searchResultRefs.current[message._id] = el;
                }}
                onContextMenu={(e) => handleContextMenu(e, message._id)}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {/* Handle legacy image field for backward compatibility */}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Image"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}

                  {/* Handle new attachment field */}
                  {message.attachment &&
                    renderAttachment(message.attachment, message._id)}

                  {/* Display text message with search highlighting */}
                  {message.text && (
                    <p>
                      {isSearchActive && searchQuery
                        ? highlightSearchText(message.text, searchQuery)
                        : message.text}
                    </p>
                  )}

                  {/* If no content, show placeholder for audio/attachment-only messages */}
                  {!message.text && !message.image && !message.attachment && (
                    <p className="text-xs italic">Attachment</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-base-content/50">
              No messages yet. Start a conversation.
            </p>
          </div>
        )}
      </div>

      <MessageInput />

      {/* Context Menu */}
      {contextMenu.visible && (
        <MessageContextMenu
          position={contextMenu.position}
          onClose={closeContextMenu}
          onDelete={handleDelete}
          onForward={handleForward}
          onReply={handleReply}
          onShare={handleShare}
        />
      )}

      
      {/* Forward Modal - Add this to integrate the component */}
      <ForwardModal 
        isOpen={forwardModal.isOpen}
        onClose={closeForwardModal}
        messageId={forwardModal.messageId}
      /> 
    </div>
  );
};

export default ChatContainer;
