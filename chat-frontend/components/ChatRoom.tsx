import { useState } from 'react';
import { useSupabaseChat } from '../hooks/useSupabaseChat'; 
import RoomSidebar from './RoomSidebar';
import MessagePane from './MessagePane';

interface ChatRoomProps {
  username: string;
  onLogout: () => void;
}

export default function ChatRoom({ username, onLogout }: ChatRoomProps) {
  const [activeRoom, setActiveRoom] = useState('general');
  
  const { 
    rooms, 
    messages, 
    typingStatus, 
    unreads, 
    isLoadingHistory, 
    systemError, 
    sendMessage, 
    emitTyping, 
    createRoom,
    deleteRoom 
  } = useSupabaseChat(activeRoom, username);

  return (
    <div className="relative flex h-full w-full max-w-7xl mx-auto bg-slate-900 border-x border-slate-800 shadow-2xl">
      
      {/* Dynamic Status Error Banner (Unobtrusive network connection monitoring fallback) */}
      {systemError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-rose-950/80 backdrop-blur border border-rose-800/50 text-rose-200 text-xs rounded-full shadow-lg flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Network Interruption: {systemError}</span>
        </div>
      )}

      <RoomSidebar 
        rooms={rooms} 
        activeRoom={activeRoom} 
        setActiveRoom={setActiveRoom} 
        unreads={unreads}
        username={username} 
        onLogout={onLogout} 
        onCreateRoom={createRoom} 
        onDeleteRoom={deleteRoom}
      />
      
      <MessagePane 
        activeRoom={activeRoom} 
        messages={messages} 
        username={username} 
        typingStatus={typingStatus} 
        isConnected={true} 
        isLoadingHistory={isLoadingHistory}
        onSendMessage={sendMessage} 
        onTyping={emitTyping} 
      />
    </div>
  );
}