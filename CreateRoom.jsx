import React, { useState } from 'react';
import { createRoom } from './api';

export default function CreateRoom({ onCreated }) {
  const [mode, setMode] = useState('with_victim');

  async function handleCreate() {
    const roomCode = 'court-' + Math.random().toString(36).substring(2, 8);
    const judgeId = 'judge-' + Date.now();
    await createRoom(roomCode, mode, judgeId);
    onCreated(roomCode, judgeId);
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Создать суд</h1>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="border p-2 w-full mb-4"
      >
        <option value="with_victim">С жертвой</option>
        <option value="only_defendant">Только подсудимый</option>
      </select>
      <button onClick={handleCreate} className="bg-green-600 text-white p-2 w-full">
        Создать
      </button>
    </div>
  );
}
