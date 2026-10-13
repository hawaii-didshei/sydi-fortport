import React, { useState } from 'react';
import { addPlayer, findRoomByCode } from './api.js';
import { cropToSquare, compressImage } from './avatar.js';

export default function JoinRoom({ roomCode, onJoin }) {
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState('spectator');
  const [avatarFile, setAvatarFile] = useState(null);
  const [code, setCode] = useState(roomCode || '');
  const [error, setError] = useState('');

  async function handleJoin() {
    setError('');
    if (!nickname || !avatarFile || !code) {
      setError('Заполни все поля');
      return;
    }
    const room = await findRoomByCode(code);
    if (!room) {
      setError('Комната не найдена');
      return;
    }
    const squareFile = await cropToSquare(avatarFile);
    const avatarUrl = await compressImage(squareFile, 128);
    const playerId = 'player-' + Date.now();
    await addPlayer(code, nickname, avatarUrl, role);
    onJoin({
      player_id: playerId,
      nickname: nickname,
      role: role,
      avatar_url: avatarUrl
    });
  }

  return (
    <div className="join-page">
      <h1>Вход в суд</h1>
      <div className="join-field">
        <label>Код комнаты</label>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} />
      </div>
      <div className="join-field">
        <label>Ник</label>
        <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </div>
      <div className="join-field">
        <label>Роль</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="spectator">Зритель</option>
          <option value="witness">Свидетель</option>
          <option value="prosecutor">Прокурор</option>
          <option value="advocate">Адвокат</option>
          <option value="defendant">Подсудимый</option>
          <option value="victim">Жертва</option>
        </select>
      </div>
      <div className="join-field">
        <label>Аватарка</label>
        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
      </div>
      {error && <p style={{ color: '#ff4444', fontSize: 13, marginBottom: 8 }}>{error}</p>}
      <button className="join-btn" onClick={handleJoin}>Войти</button>
    </div>
  );
}
