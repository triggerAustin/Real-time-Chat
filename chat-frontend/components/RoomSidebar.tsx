import { useState, FormEvent } from 'react';

interface RoomSidebarProps {
  rooms: string[];
  activeRoom: string;
  setActiveRoom: (room: string) => void;
  unreads: Record<string, number>;
  username: string;
  onLogout: () => void;
  onCreateRoom: (name: string) => void;
  onDeleteRoom: (name: string) => void; 
}

export default function RoomSidebar({ 
  rooms, 
  activeRoom, 
  setActiveRoom, 
  unreads, 
  username, 
  onLogout, 
  onCreateRoom,
  onDeleteRoom
}: RoomSidebarProps) {
  const [newRoomName, setNewRoomName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onCreateRoom(newRoomName);
    setNewRoomName('');
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/40 flex flex-col justify-between p-4 selection:bg-cyan-500/30">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Channels</h3>
        </div>
        
        <nav className="space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {rooms.map((r) => {
            const isActive = activeRoom === r;
            const count = unreads[r] || 0;
            return (
              <div key={r} className="group relative flex items-center w-full">
                <button
                  onClick={() => setActiveRoom(r)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between pr-8 relative ${
                    isActive 
                      ? 'bg-slate-800/80 text-cyan-400 font-semibold shadow-inner border-l-2 border-cyan-400 rounded-l-none' 
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'}>#</span>
                    <span className="truncate">{r}</span>
                  </div>
                  
                  {count > 0 && !isActive && (
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.3)] shrink-0">
                      {count}
                    </span>
                  )}
                </button>

                {/* Show delete action on row hover (Locked for system critical #general) */}
                {r !== 'general' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Stops the container switch event loop sequence from triggering
                      if (confirm(`Are you sure you want to delete #${r}?`)) {
                        onDeleteRoom(r);
                      }
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 text-xs font-bold px-1.5 py-0.5 rounded transition-all z-20"
                    title="Delete Channel"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-800/60 mx-2 space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">New Channel</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. general" 
              value={newRoomName} 
              onChange={(e) => setNewRoomName(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/20 placeholder-slate-700 transition-all" 
            />
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 rounded-lg font-bold border border-slate-700/50 active:scale-95 transition-transform">+</button>
          </div>
        </form>
      </div>

      {/* Profile Area with Online Badge Status Overlay */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between px-2 bg-slate-950/20 rounded-xl p-2">
        <div className="flex items-center gap-2.5 truncate max-w-[70%]">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
              {username.substring(0, 2).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-slate-200 truncate leading-tight">{username}</p>
            <p className="text-[10px] text-slate-500 font-medium">Active Now</p>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs font-bold text-rose-400/90 hover:text-rose-400 hover:underline transition-all pr-1">Logout</button>
      </div>
    </aside>
  );
}