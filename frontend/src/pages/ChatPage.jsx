import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import useSocket from '../hooks/useSocket';

const ChatPage = () => {
  const { user } = useAuthStore();
  const socket = useSocket();
  const [searchParams] = useSearchParams();
  const initialBookingId = searchParams.get('bookingId');

  const { chats, messages, currentChat, fetchChats, fetchChatMessages, sendMessage } = useChatStore();
  const [text, setText] = useState('');
  const [activeBookingId, setActiveBookingId] = useState(initialBookingId || '');
  const [selectedFileBase64, setSelectedFileBase64] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Fetch conversations list on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // 2. Fetch messages and join socket room when active chat changes
  useEffect(() => {
    if (activeBookingId) {
      fetchChatMessages(activeBookingId).then((data) => {
        if (data && data.chat && socket) {
          socket.emit('join_chat', { chatId: data.chat._id });
        }
      });
    }
  }, [activeBookingId, socket]);

  // 3. Scroll message thread to the bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFileBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !selectedFileBase64) || !currentChat) return;

    const attachments = selectedFileBase64 ? [selectedFileBase64] : [];

    if (socket) {
      // Emit via WebSockets
      socket.emit('send_message', {
        chatId: currentChat._id,
        text,
        attachments,
      });
    } else {
      // Fallback to API if socket is not initialized
      await sendMessage(currentChat._id, text, attachments);
    }
    
    setText('');
    setSelectedFileBase64('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between h-screen">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 h-16 flex items-center justify-between px-6 flex-shrink-0">
        <Link to="/" className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          QuickServe.lk
        </Link>
        <Link
          to={user?.role === 'provider' ? '/dashboard/provider' : '/dashboard/customer'}
          className="text-sm font-semibold hover:text-amber-400 transition"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex overflow-hidden max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6 h-[calc(100vh-128px)]">
        
        {/* Sidebar chats list */}
        <section className="w-80 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col flex-shrink-0">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Inbox Chats</h2>
          </div>
          <div className="flex-grow overflow-y-auto divide-y divide-slate-850">
            {chats.map((chat) => {
              const recipient = chat.participants.find((p) => p._id !== user?._id);
              const isActive = chat.bookingId?._id === activeBookingId;
              
              return (
                <button
                  key={chat._id}
                  onClick={() => setActiveBookingId(chat.bookingId?._id)}
                  className={`w-full p-4 text-left hover:bg-slate-850/50 transition flex items-center gap-3 ${
                    isActive ? 'bg-amber-500/10 border-l-4 border-l-amber-500' : ''
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-950 flex items-center justify-center font-bold text-amber-500 uppercase border border-slate-850">
                    {recipient?.profileImage ? (
                      <img src={recipient.profileImage} alt="" className="object-cover w-full h-full rounded-xl" />
                    ) : (
                      recipient?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-white block text-sm">{recipient?.name}</span>
                    <span className="text-slate-500 text-xs mt-0.5 block truncate">
                      Job: {chat.bookingId?.serviceId?.name || 'Service Booking'}
                    </span>
                  </div>
                </button>
              );
            })}

            {chats.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-10">No chats found.</p>
            )}
          </div>
        </section>

        {/* Chat window thread */}
        <section className="flex-grow bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden relative">
          {currentChat ? (
            <>
              {/* Top Bar */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center flex-shrink-0">
                <div>
                  <h3 className="font-bold text-white">
                    {currentChat.participants.find((p) => p._id !== user?._id)?.name}
                  </h3>
                  <span className="text-slate-500 text-xs">
                    Service Room: {currentChat.bookingId?.serviceId?.name}
                  </span>
                </div>
              </div>

              {/* Messages Grid */}
              <div className="flex-grow p-6 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md p-4 rounded-3xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold rounded-tr-none'
                            : 'bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-2 space-y-1.5">
                            {msg.attachments.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt="Attachment"
                                className="max-w-full rounded-2xl border border-slate-850 object-cover max-h-60"
                              />
                            ))}
                          </div>
                        )}
                        {msg.text && <p>{msg.text}</p>}
                        <span className={`text-[10px] block text-right mt-1.5 ${
                          isMe ? 'text-slate-900/70' : 'text-slate-550'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Image Preview Drawer */}
              {selectedFileBase64 && (
                <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex gap-3 items-center flex-shrink-0 animate-fade-in">
                  <div className="relative h-16 w-16 rounded-xl border border-slate-800 overflow-hidden group">
                    <img src={selectedFileBase64} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSelectedFileBase64('')}
                      className="absolute top-0 right-0 bg-red-500/80 hover:bg-red-500 text-white text-[9px] h-5 w-5 flex items-center justify-center rounded-bl-xl font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="text-slate-455 text-xs font-semibold">Image attachment ready to send.</span>
                </div>
              )}

              {/* Input field */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/40 flex gap-3 flex-shrink-0 items-center">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-slate-955 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white rounded-2xl transition cursor-pointer"
                  title="Attach Image"
                >
                  📎
                </button>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-grow rounded-2xl bg-slate-950 border border-slate-850 px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl transition cursor-pointer"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <svg className="h-16 w-16 mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="font-bold text-white text-lg">Select a Chat to Start Messaging</h3>
              <p className="text-xs max-w-sm mt-2 leading-relaxed text-slate-400">
                To start a conversation, you need to have an active, accepted booking request. Once a service provider accepts your job order, a secure messaging room is opened and will appear in the left sidebar.
              </p>
              <Link
                to="/search"
                className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition"
              >
                Find & Book Providers Now
              </Link>
            </div>
          )}
        </section>


      </main>
    </div>
  );
};

export default ChatPage;
