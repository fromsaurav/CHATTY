import React, { useEffect, useRef } from "react";
import { Reply, Share, Trash, Forward } from "lucide-react";

const MessageContextMenu = ({ position, onClose, onDelete, onForward, onReply, onShare }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-base-200 shadow-lg rounded-md py-1 min-w-40 border border-base-300"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <button 
        onClick={onReply} 
        className="w-full text-left px-4 py-2 hover:bg-base-300 flex items-center gap-2"
      >
        <Reply size={16} />
        <span>Reply</span>
      </button>
      <button 
        onClick={onForward} 
        className="w-full text-left px-4 py-2 hover:bg-base-300 flex items-center gap-2"
      >
        <Forward size={16} />
        <span>Forward</span>
      </button>
      <button 
        onClick={onShare} 
        className="w-full text-left px-4 py-2 hover:bg-base-300 flex items-center gap-2"
      >
        <Share size={16} />
        <span>Share</span>
      </button>
      <div className="divider my-0.5 h-px bg-base-300"></div>
      <button 
        onClick={onDelete} 
        className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-500 flex items-center gap-2"
      >
        <Trash size={16} />
        <span>Delete</span>
      </button>
    </div>
  );
};

export default MessageContextMenu;