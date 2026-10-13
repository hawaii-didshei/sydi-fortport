import React, { useState, useEffect } from 'react';
import {
  getPlayers,
  getEvidence,
  getMessages,
  sendMessage,
  addEvidence
} from './api';

const SLOTS = {
  judge:      { top: '25%', left: '50%', transform: 'translateX(-50%)' },
  prosecutor: { top: '55%', left: '25%', transform: 'translateX(-50%)' },
  advocate:   { top: '65%', left: '15%', transform: 'translateX(-50%)' },
  victim:     { top: '55%', left: '75%', transform: 'translateX(-50%)' },
  defendant:  { top: '65%', left: '85%', transform: 'translateX(-50%)' }
};

export default function CourtRoom({ roomCode, currentUser }) {
  const [players, setPlayers] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 3000);
    return () => clearInterval(interval);
  }, [roomCode]);

  async function loadAll() {
    const p = await getPlayers(roomCode);
    const e = await getEvidence(roomCode);
    const m = await getMessages(roomCode);
    setPlayers(p);
    setEvidence(e);
    setMessages(m);
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return;
    await sendMessage(roomCode, currentUser.player_id, currentUser.nickname, newMessage);
    setNewMessage('');
    loadAll();
  }

  async function handleAddEvidence() {
    if (!evidenceTitle || !evidenceFile) return;
    const imageUrl = await uploadImage(evidenceFile);
    await addEvidence(roomCode, currentUser.player_id, evidenceTitle, imageUrl);
    setEvidenceTitle('');
    setEvidenceFile(null);
    loadAll();
  }

  async function uploadImage(file) {
    return 'https://example.com/placeholder.jpg';
  }

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/court-bg.png')" }}
    >
      {players.map(function(player) {
        const slot = SLOTS[player.role];
        if (!slot) return null;
        return (
          <div
            key={player.id}
            className="absolute flex flex-col items-center"
            style={{ top: slot.top, left: slot.left, transform: slot.transform }}
          >
            <img
              src={player.avatar_url}
              alt={player.nickname}
              className="w-20 h-20 rounded-full border-4 border-yellow-600 object-cover"
            />
            <span className="mt-1 bg-black text-white px-2 rounded text-sm">
              {player.nickname}
            </span>
          </div>
        );
      })}

      <button
        onClick={() => setIsEvidenceOpen(true)}
        className="absolute bottom-6 left-6 bg-red-700 text-white p-3 rounded"
      >
        Улики ({evidence.length})
      </button>

      <button
        onClick={() => setIsChatOpen(true)}
        className="absolute bottom-6 right-6 bg-blue-700 text-white p-3 rounded"
      >
        Чат
      </button>

      {isEvidenceOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded w-3/4 max-w-2xl">
            <button
              onClick={() => setIsEvidenceOpen(false)}
              className="float-right text-red-500 text-xl"
            >
              X
            </button>
            <h2 className="text-xl font-bold mb-4">Улики</h2>

            {['prosecutor', 'advocate', 'victim'].indexOf(currentUser.role) !== -1 && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Подпись"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  className="p-2 bg-gray-800 text-white w-full mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEvidenceFile(e.target.files[0])}
                  className="mb-2"
                />
                <button
                  onClick={handleAddEvidence}
                  className="bg-green-600 text-white p-2 rounded w-full"
                >
                  Добавить
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {evidence.map(function(ev) {
                return (
                  <div key={ev.id} className="bg-gray-800 p-2 rounded">
                    <img src={ev.image_url} alt={ev.title} className="w-full h-32 object-cover" />
                    <p className="font-bold text-sm mt-1">{ev.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isChatOpen && (
        <div className="absolute bottom-20 right-6 w-80 h-96 bg-gray-900 text-white rounded flex flex-col z-50">
          <div className="flex justify-between p-2 bg-blue-800">
            <span>Чат</span>
            <button onClick={() => setIsChatOpen(false)}>X</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {messages.map(function(msg, i) {
              return (
                <div key={i} className="mb-1">
                  <span className="text-blue-400">{msg.nickname}: </span>
                  {msg.text}
                </div>
              );
            })}
          </div>
          <div className="p-2 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-1 bg-gray-800 text-white"
            />
            <button onClick={handleSendMessage} className="bg-blue-600 p-1 rounded">
              Отправить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
