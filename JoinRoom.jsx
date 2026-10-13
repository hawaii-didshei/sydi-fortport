import React, { useState } from 'react';
import { addPlayer, findRoomByCode } from './api';
import { cropToSquare } from './avatar';

export default function JoinRoom({ roomCode, onJoin }) {
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState('spectator');
  const [avatarFile, setAvatarFile] = useState(null);

  async function handleJoin() {
    if (!nickname || !avatarFile) return;
    const room = await findRoomByCode(roomCode);
    if (!room) {
      alert('Комната не найдена');
      return;
    }
    const squareFile = await cropToSquare(avatarFile);
    const avatarUrl = await uploadAvatar(squareFile);
    const playerId = 'player-' + Date.now();
    await addPlayer(roomCode, nickname, avatarUrl, role);
    onJoin({
      player_id: playerId,
      nickname: nickname,
      role: role,
      avatar_url: avatarUrl
    });
  }

  async function uploadAvatar(file) {
    return 'https://example.com/placeholder.jpg';
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Вход в суд</h1>
      <input
        type="text"
        placeholder="Ник"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 w-full mb-2"
      >
        <option value="spectator">Зритель</option>
        <option value="witness">Свидетель</option>
        <option value="prosecutor">Прокурор</option>
        <option value="advocate">Адвокат</option>
        <option value="defendant">Подсудимый</option>
        <option value="victim">Жертва</option>
      </select>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatarFile(e.target.files[0])}
        className="mb-4"
      />
      <button onClick={handleJoin} className="bg-blue-600 text-white p-2 w-full">
        Войти
      </button>
    </div>
  );
}
