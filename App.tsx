
import React, { useState, useEffect } from 'react';
import { Tab, Post, User, Message } from './types';
import { HomeIcon, FriendsIcon, MessageIcon, NotificationIcon, VideoIcon, MenuIcon } from './components/Icons';
import { Stories } from './components/Stories';
import { PostItem } from './components/PostItem';
import { Auth } from './components/Auth';
import { db } from './services/dbService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [posts, setPosts] = useState<Post[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Persistent Login
  useEffect(() => {
    const savedUser = localStorage.getItem('active_fb_lite_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Sync Messages and Posts in Real-time across Tabs
  useEffect(() => {
    const sync = () => {
      setMessages(db.getMessages());
      setPosts(db.getPosts());
    };
    
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('active_fb_lite_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('active_fb_lite_user');
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !user || !selectedFriend) return;
    
    const msg: Message = {
      id: Date.now().toString(),
      senderName: user.firstName,
      senderAvatar: user.avatar,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true // Note: This will be dynamic based on the active tab's user in the view
    };
    
    db.sendMessage({ ...msg, senderId: user.id, receiverId: selectedFriend.id } as any);
    setChatMessage("");
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  const filteredMessages = messages.filter(m => 
    (m as any).senderId === user.id && (m as any).receiverId === selectedFriend?.id ||
    (m as any).senderId === selectedFriend?.id && (m as any).receiverId === user.id
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      {/* Top Header */}
      {!selectedFriend && (
        <header className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-200 sticky top-0 z-50">
          <h1 className="text-[#1877F2] text-2xl font-black tracking-tighter">facebook</h1>
          <div className="flex space-x-2">
            <button className="bg-gray-100 p-2 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></button>
            <button onClick={() => setActiveTab(Tab.MENU)} className="bg-gray-100 p-2 rounded-full"><MenuIcon active={activeTab === Tab.MENU} className="w-5 h-5" /></button>
          </div>
        </header>
      )}

      {/* Main App Navigation */}
      {!selectedFriend && (
        <nav className="bg-white flex border-b border-gray-200 sticky top-[52px] z-50">
          <button onClick={() => setActiveTab(Tab.HOME)} className={`flex-1 flex justify-center py-3 border-b-2 ${activeTab === Tab.HOME ? 'border-blue-600' : 'border-transparent'}`}><HomeIcon active={activeTab === Tab.HOME} className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab(Tab.FRIENDS)} className={`flex-1 flex justify-center py-3 border-b-2 ${activeTab === Tab.FRIENDS ? 'border-blue-600' : 'border-transparent'}`}><FriendsIcon active={activeTab === Tab.FRIENDS} className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab(Tab.MESSAGES)} className={`flex-1 flex justify-center py-3 border-b-2 ${activeTab === Tab.MESSAGES ? 'border-blue-600' : 'border-transparent'}`}><MessageIcon active={activeTab === Tab.MESSAGES} className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab(Tab.NOTIFICATIONS)} className={`flex-1 flex justify-center py-3 border-b-2 ${activeTab === Tab.NOTIFICATIONS ? 'border-blue-600' : 'border-transparent'}`}><NotificationIcon active={activeTab === Tab.NOTIFICATIONS} className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab(Tab.MENU)} className={`flex-1 flex justify-center py-3 border-b-2 ${activeTab === Tab.MENU ? 'border-blue-600' : 'border-transparent'}`}><MenuIcon active={activeTab === Tab.MENU} className="w-6 h-6" /></button>
        </nav>
      )}

      <main className="flex-1 overflow-y-auto">
        {activeTab === Tab.HOME && (
          <div className="pb-16">
            <div className="bg-white p-3 mb-2 flex items-center shadow-sm">
              <img src={user.avatar} className="w-10 h-10 rounded-full mr-3 border border-gray-100" />
              <button onClick={() => alert("Post feature is live! Type on the real feed.")} className="flex-1 bg-gray-100 rounded-full text-left px-4 py-2 text-gray-500 text-sm">What's on your mind?</button>
            </div>
            <Stories />
            {posts.length === 0 ? (
               <div className="p-8 text-center text-gray-500 text-sm">No posts yet. Start the conversation!</div>
            ) : (
               posts.map(p => <PostItem key={p.id} post={p} />)
            )}
          </div>
        )}

        {activeTab === Tab.MESSAGES && !selectedFriend && (
          <div className="bg-white min-h-screen">
            <h2 className="text-xl font-bold p-3 border-b">Chats</h2>
            <div className="divide-y">
              {db.getUsers().filter(u => u.id !== user.id).map(u => (
                <div key={u.id} onClick={() => setSelectedFriend(u)} className="flex items-center p-3 active:bg-gray-100 cursor-pointer">
                  <div className="relative">
                    <img src={u.avatar} className="w-14 h-14 rounded-full mr-3" />
                    <div className="absolute bottom-0 right-3 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{u.firstName} {u.lastName}</h4>
                    <p className="text-xs text-gray-500">Active now</p>
                  </div>
                </div>
              ))}
              {db.getUsers().length <= 1 && (
                <div className="p-8 text-center text-gray-500 text-sm">Open this app in another tab/browser to chat with another account!</div>
              )}
            </div>
          </div>
        )}

        {selectedFriend && (
          <div className="flex flex-col h-[calc(100vh-0px)] bg-white fixed inset-0 z-[60] max-w-lg mx-auto">
            <div className="p-2 border-b flex items-center bg-white shadow-sm">
              <button onClick={() => setSelectedFriend(null)} className="p-2"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg></button>
              <img src={selectedFriend.avatar} className="w-8 h-8 rounded-full mx-2" />
              <div className="flex-1 font-bold text-sm">{selectedFriend.firstName}</div>
              <div className="flex space-x-4 text-blue-600 pr-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5]">
              {filteredMessages.map((m, idx) => {
                const isMe = (m as any).senderId === user.id;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start items-end'}`}>
                    {!isMe && <img src={m.senderAvatar} className="w-6 h-6 rounded-full mr-2 mb-1" />}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-[#1877F2] text-white' : 'bg-white text-gray-900 shadow-sm'}`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-2 border-t flex items-center space-x-2 bg-white">
              <input 
                value={chatMessage} 
                onChange={(e) => setChatMessage(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Aa" 
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
              />
              <button onClick={handleSendMessage} className="text-blue-600 font-bold px-2 disabled:opacity-50" disabled={!chatMessage.trim()}>Send</button>
            </div>
          </div>
        )}

        {activeTab === Tab.MENU && (
          <div className="p-3 space-y-3">
             <div className="bg-white p-3 rounded-lg flex items-center">
               <img src={user.avatar} className="w-12 h-12 rounded-full mr-3" />
               <div className="font-bold">{user.firstName} {user.lastName}</div>
             </div>
             <button onClick={handleLogout} className="w-full bg-white p-4 text-red-600 font-bold rounded-lg text-left">Log Out</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
