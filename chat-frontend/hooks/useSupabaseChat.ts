import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  user: string;
  content: string;
  timestamp: string;
}

export function useSupabaseChat(activeRoom: string, currentUsername: string) {
  const [rooms, setRooms] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingStatus, setTypingStatus] = useState('');
  const [unreads, setUnreads] = useState<Record<string, number>>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [systemError, setSystemError] = useState('');
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeRoomRef = useRef(activeRoom);

  // Synchronize mutable active room tracking state context
  useEffect(() => {
    activeRoomRef.current = activeRoom;
    setUnreads((prev) => ({ ...prev, [activeRoom]: 0 }));
  }, [activeRoom]);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        setSystemError(error.message);
        return;
      }
      if (data) setRooms(data.map((r) => r.name));
    };

    fetchRooms();

    // Listens for changes to the public.rooms table
    const globalRoomChannel = supabase
      .channel('global:rooms_catalog')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rooms' },
        (payload) => {
          setRooms((prev) => [...prev, payload.new.name].sort());
        }
      )
      // FIXED: Added real-time catch tracking block to prune sidebar array structures instantly
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'rooms' },
        (payload) => {
          setRooms((prev) => prev.filter((roomName) => roomName !== payload.old.name));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalRoomChannel);
    };
  }, []);

  useEffect(() => {
    if (!activeRoom) return;

    setIsLoadingHistory(true);
    setMessages([]);

    const loadHistory = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('user_name, content, timestamp')
        .eq('room', activeRoom)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Failed to parse channel history index:', error.message);
      } else if (data) {
        setMessages(
          data.map((m) => ({
            user: m.user_name,
            content: m.content,
            timestamp: m.timestamp,
          }))
        );
      }
      setIsLoadingHistory(false);
    };

    loadHistory();

    const roomChannel = supabase.channel(`room:${activeRoom}`, {
      config: {
        broadcast: { self: false }, 
      },
    });

    roomChannel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const incoming = payload.new;
          const msgPayload: Message = {
            user: incoming.user_name,
            content: incoming.content,
            timestamp: incoming.timestamp,
          };

          // Increment unread notifications block if user sits in alternative tracks
          if (incoming.room === activeRoomRef.current) {
            setMessages((prev) => [...prev, msgPayload]);
          } else {
            setUnreads((prev) => ({
              ...prev,
              [incoming.room]: (prev[incoming.room] || 0) + 1,
            }));
          }
        }
      )
      // Catch real-time (Typing Indicators)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user, isTyping } = payload.payload;
        setTypingStatus(isTyping ? `${user} is typing...` : '');
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setSystemError('Realtime multiplex link interrupted.');
        }
      });

    channelRef.current = roomChannel;

    return () => {
      if (roomChannel) supabase.removeChannel(roomChannel);
    };
  }, [activeRoom]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const { error } = await supabase.from('messages').insert({
      room: activeRoom,
      user_name: currentUsername,
      content: content.trim(),
    });

    if (error) {
      console.error('Message serialization fault:', error.message);
    }

    emitTyping(false);
  };

  const emitTyping = (isTyping: boolean) => {
    if (!channelRef.current) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user: currentUsername, isTyping },
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(false);
      }, 1500);
    }
  };

  const createRoom = async (roomName: string) => {
    const cleanName = roomName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanName) return;

    const { error } = await supabase.from('rooms').insert({
      name: cleanName,
      created_by: currentUsername,
    });

    if (error) {
      console.error('Room provisioning execution failure:', error.message);
    }
  };

  const deleteRoom = async (roomName: string) => {
    if (roomName === 'general') {
      alert("The #general channel is a system requirement and cannot be deleted.");
      return;
    }

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('name', roomName);

    if (error) {
      console.error('Failed to execute channel destruction sequence:', error.message);
      alert('You do not have permission to delete this room.');
      return;
    }
    setRooms((prev) => prev.filter((r) => r !== roomName));
    if (activeRoomRef.current === roomName) {
    setMessages([]);
    window.location.hash = '#general';
    }
  };
  
  return {
    rooms,
    messages,
    typingStatus,
    isConnected: true, 
    systemError,
    unreads,
    isLoadingHistory,
    sendMessage,
    emitTyping,
    createRoom,
    deleteRoom,
  };
}