import React, { useState, useEffect } from 'react';
import CreateRoom from './CreateRoom.jsx';
import JoinRoom from './JoinRoom.jsx';
import CourtRoom from './CourtRoom.jsx';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [roomCode, setRoomCode] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(function() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      setRoomCode(code);
      setScreen('join');
    }
  }, []);

  function handleCreated(code, judgeId) {
    setRoomCode(code);
    setCurrentUser({
      player_id: judgeId,
      nickname: 'Судья',
      role: 'judge',
      avatar_url: '/judge-default.png'
    });
    setScreen('court');
  }

  function handleJoin(user) {
    setCurrentUser(user);
    setScreen('court');
  }

  if (screen === 'menu') {
    return (
      <div className="menu-page">
        <h1>Суд</h1>
        <button className="menu-btn" onClick={() => setScreen('create')}>Создать суд</button>
        <button className="menu-btn" onClick={() => setScreen('join')}>Войти в суд</button>
      </div>
    );
  }

  if (screen === 'create') {
    return <CreateRoom onCreated={handleCreated} />;
  }

  if (screen === 'join') {
    return <JoinRoom roomCode={roomCode} onJoin={handleJoin} />;
  }

  if (screen === 'court') {
    return <CourtRoom roomCode={roomCode} currentUser={currentUser} />;
  }

  return null;
}
