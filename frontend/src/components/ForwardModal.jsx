import React, { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const ForwardModal = ({ isOpen, onClose, messageId }) => {
  const { users, getUsers, forwardMessage } = useChatStore();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isForwarding, setIsForwarding] = useState(false);
  
  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      getUsers();
    }
  }, [isOpen, getUsers]);
  
  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
      setIsForwarding(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    
    setIsForwarding(true);
    
    try {
      // Make sure messageId is valid
      if (!messageId) {
        toast.error("Invalid message selected");
        setIsForwarding(false);
        return;
      }
      
      console.log("Forwarding message:", messageId, "to users:", selectedUsers);
      
      await forwardMessage(messageId, selectedUsers);
      toast.success(`Message forwarded to ${selectedUsers.length} user(s)`);
      onClose();
    } catch (error) {
      console.error("Error forwarding message:", error);
      
      // Extract the most meaningful error message
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        "Failed to forward message";
      
      toast.error(errorMessage);
    } finally {
      setIsForwarding(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-base-100 rounded-lg p-4 w-80 max-w-md max-h-[70vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Forward Message</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm p-1">
            <X size={18} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow mb-4">
          {users.length === 0 ? (
            <p className="text-center text-gray-500">No users available</p>
          ) : (
            <div className="space-y-2">
              {users.map(user => (
                <div 
                  key={user._id} 
                  className={`flex items-center p-2 rounded cursor-pointer ${
                    selectedUsers.includes(user._id) ? 'bg-primary bg-opacity-20' : 'hover:bg-base-200'
                  }`}
                  onClick={() => handleUserSelect(user._id)}
                >
                  <div className="avatar mr-3">
                    <div className="w-8 h-8 rounded-full">
                      <img 
                        src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}`} 
                        alt={user.fullName}
                      />
                    </div>
                  </div>
                  <span className="flex-1">{user.fullName}</span>
                  {selectedUsers.includes(user._id) && (
                    <CheckCircle size={18} className="text-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-sm"
            disabled={isForwarding}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="btn btn-primary btn-sm"
            disabled={selectedUsers.length === 0 || isForwarding}
          >
            {isForwarding ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Forwarding...
              </>
            ) : (
              `Forward to ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;