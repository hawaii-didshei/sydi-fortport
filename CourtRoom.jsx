import React, { useState, useEffect } from 'react';
import {
  getPlayers,
  getEvidence,
  getMessages,
  sendMessage,
  addEvidence,
  findRoomByCode,
  finishRoomRecord
} from './api.js';
import { compressImage } from './avatar.js';

const SLOTS = {
  judge:      { top: '25%', left: '50%', transform: 'translateX(-50%)' },
  prosecutor: { top: '55%', left: '25%', transform: 'translateX(-50%)' },
  advocate:   { top: '65%', left: '15%', transform: 'translateX(-50%)' },
  victim:     { top: '55%', left: '75%', transform: 'translateX(-50%)' },
  defendant:  { top: '65%', left: '85%', transform: 'translateX(-50%)' }
};

const ROLE_LABELS = {
  judge: 'СУДЬЯ',
  prosecutor: 'ПРОКУРОР',
  advocate: 'АДВОКАТ',
  victim: 'ЖЕРТВА',
  defendant: 'ПОДСУДИМЫЙ',
  witness: 'СВИДЕТЕЛЬ',
  spectator: 'ЗРИТЕЛЬ'
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
  const [roomRecordId, setRoomRecordId] = useState(null);
  const [finished, setFinished] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(function() {
    loadAll();
    findRoomByCode(roomCode).then(function(room) {
      if (room) {
        setRoomRecordId(room.id);
        if (room.status === 'finished') setFinished(true);
      }
    });
    const interval = setInterval(loadAll, 3000);
    return function() { clearInterval(interval); };
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
    const imageUrl = await compressImage(evidenceFile, 400);
    await addEvidence(roomCode, currentUser.player_id, evidenceTitle, imageUrl);
    setEvidenceTitle('');
    setEvidenceFile(null);
    loadAll();
  }

  async function handleFinish() {
    if (!roomRecordId) return;
    if (!window.confirm('Огласить приговор и завершить суд?')) return;
    await finishRoomRecord(roomRecordId);
    setFinished(true);
    alert('Суд завершён. Комната будет удалена через час.');
  }

  function handleCopyInvite() {
    const link = window.location.origin + '/?room=' + roomCode;
    navigator.clipboard.writeText(link);
    setInviteCopied(true);
    setTimeout(function() { setInviteCopied(false); }, 2000);
  }

  const canAddEvidence = ['prosecutor', 'advocate', 'victim'].indexOf(currentUser.role) !== -1;
  const canFinish = currentUser.role === 'judge' && !finished;
  const spectators = players.filter(function(p) {
    return p.role === 'spectator' || p.role === 'witness';
  });

  return (
    <div className="court-room" style={{ backgroundImage: "url('/court-bg.png')" }}>
      {players.map(function(player) {
        const slot = SLOTS[player.role];
        if (!slot) return null;
        return (
          <div key={player.id} className="player-slot" style={slot}>
            <img className="player-avatar" src={player.avatar_url} alt={player.nickname} />
            <span className="player-name">{player.nickname}</span>
            <span className="player-role">{ROLE_LABELS[player.role]}</span>
          </div>
        );
      })}

      {spectators.length > 0 && (
        <div className="spectator-window">
          <h3>Зрители и свидетели</h3>
          {spectators.map(function(s) {
            return (
              <div key={s.id} className="spectator-item">
                <img src={s.avatar_url} alt={s.nickname} />
                <span>{s.nickname}</span>
              </div>
            );
          })}
        </div>
      )}

      <button className="btn-evidence" onClick={() => setIsEvidenceOpen(true)}>
        <img src="/evidence.png" alt="" />
        Улики ({evidence.length})
      </button>

      <button className="btn-chat" onClick={() => setIsChatOpen(true)}>
        <img src="/chat.png" alt="" />
        Чат
      </button>

      <button className="btn-finish" onClick={handleCopyInvite} style={{ bottom: 24, left: '50%' }}>
        {inviteCopied ? 'Ссылка скопирована' : 'Пригласить'}
      </button>

      {canFinish && (
        <button className="btn-finish" onClick={handleFinish} style={{ bottom: 80, left: '50%' }}>
          Огласить приговор
        </button>
      )}

      {finished && (
        <div style={{
          position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: 6,
          border: '2px solid #b8860b', color: '#f0c040', fontWeight: 'bold'
        }}>
          Суд завершён
        </div>
      )}

      {isEvidenceOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setIsEvidenceOpen(false)}>X</button>
            <h2 className="modal-title">Улики</h2>

            {canAddEvidence && !finished && (
              <div className="evidence-form">
                <input
                  type="text"
                  placeholder="Подпись к улике"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEvidenceFile(e.target.files[0])}
                />
                <button className="btn-add-evidence" onClick={handleAddEvidence}>
                  Добавить улику
                </button>
              </div>
            )}

            <div className="evidence-grid">
              {evidence.length === 0 && (
                <p className="evidence-empty">Улик пока нет</p>
              )}
              {evidence.map(function(ev) {
                return (
                  <div key={ev.id} className="evidence-card">
                    <img src={ev.image_url} alt={ev.title} />
                    <p className="evidence-card-title">{ev.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Чат</span>
            <button onClick={() => setIsChatOpen(false)}>X</button>
          </div>
          <div className="chat-messages">
            {messages.map(function(msg, i) {
              return (
                <div key={i} className="chat-message">
                  <span className="chat-message-author">{msg.nickname}: </span>
                  {msg.text}
                </div>
              );
            })}
          </div>
          <div className="chat-input-row">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              disabled={finished}
              placeholder={finished ? 'Суд завершён' : ''}
            />
            <button onClick={handleSendMessage} disabled={finished}>Отправить</button>
          </div>
        </div>
      )}
    </div>
  );
}
