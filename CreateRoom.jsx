import React, { useState } from 'react';
import { createRoom } from './api.js';

export default function CreateRoom({ onCreated }) {
  const [mode, setMode] = useState('with_victim');

  async function handleCreate() {
    const roomCode = 'court-' + Math.random().toString(36).substring(2, 8);
    const judgeId = 'judge-' + Date.now();
    const result = await createRoom(roomCode, mode, judgeId);
    const recordId = result.data ? result.data.id : null;
    onCreated(roomCode, judgeId, recordId);
  }

  return (
    <div className="create-page">
      <h1>Создать суд</h1>
      <div className="join-field">
        <label>Режим</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="with_victim">С жертвой</option>
          <option value="only_defendant">Только подсудимый</option>
        </select>
      </div>
      <button className="btn-create" onClick={handleCreate}>Создать</button>
    </div>
  );
}
