import CONFIG from './config';

const headers = {
  'Authorization': 'Bearer ' + CONFIG.TOKEN,
  'Content-Type': 'application/json'
};

function url(tableId) {
  return CONFIG.API_URL + '/databases/' + CONFIG.DATABASE_ID + '/tables/' + tableId + '/records';
}

async function request(method, tableId, body, recordId) {
  let fullUrl = url(tableId);
  if (recordId) fullUrl += '/' + recordId;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(fullUrl, options);
  return await res.json();
}

export async function createRoom(roomCode, mode, judgeId) {
  return request('POST', CONFIG.TABLES.ROOMS, {
    room_code: roomCode,
    mode: mode,
    status: 'waiting',
    judge_id: judgeId,
    delete_at: 0,
    created_at: new Date().toISOString()
  });
}

export async function findRoomByCode(roomCode) {
  const where = encodeURIComponent('(room_code,eq,' + roomCode + ')');
  const fullUrl = url(CONFIG.TABLES.ROOMS) + '?where=' + where + '&response_format=names';
  const res = await fetch(fullUrl, { headers });
  const data = await res.json();
  return data.data.records[0];
}

export async function finishRoom(recordId, deleteAt) {
  return request('PUT', CONFIG.TABLES.ROOMS, {
    status: 'finished',
    delete_at: deleteAt
  }, recordId);
}

export async function deleteRoom(recordId) {
  return request('DELETE', CONFIG.TABLES.ROOMS, null, recordId);
}

export async function addPlayer(roomCode, nickname, avatarUrl, role) {
  return request('POST', CONFIG.TABLES.PLAYERS, {
    room_code: roomCode,
    nickname: nickname,
    avatar_url: avatarUrl,
    role: role,
    joined_at: new Date().toISOString()
  });
}

export async function getPlayers(roomCode) {
  const where = encodeURIComponent('(room_code,eq,' + roomCode + ')');
  const fullUrl = url(CONFIG.TABLES.PLAYERS) + '?where=' + where + '&response_format=names';
  const res = await fetch(fullUrl, { headers });
  const data = await res.json();
  return data.data.records;
}

export async function addEvidence(roomCode, authorId, title, imageUrl) {
  return request('POST', CONFIG.TABLES.EVIDENCE, {
    room_code: roomCode,
    author_id: authorId,
    title: title,
    image_url: imageUrl,
    created_at: new Date().toISOString()
  });
}

export async function getEvidence(roomCode) {
  const where = encodeURIComponent('(room_code,eq,' + roomCode + ')');
  const fullUrl = url(CONFIG.TABLES.EVIDENCE) + '?where=' + where + '&response_format=names';
  const res = await fetch(fullUrl, { headers });
  const data = await res.json();
  return data.data.records;
}

export async function sendMessage(roomCode, playerId, nickname, text) {
  return request('POST', CONFIG.TABLES.MESSAGES, {
    room_code: roomCode,
    player_id: playerId,
    nickname: nickname,
    text: text,
    created_at: new Date().toISOString()
  });
}

export async function getMessages(roomCode) {
  const where = encodeURIComponent('(room_code,eq,' + roomCode + ')');
  const fullUrl = url(CONFIG.TABLES.MESSAGES) + '?where=' + where + '&sort=created_at&response_format=names';
  const res = await fetch(fullUrl, { headers });
  const data = await res.json();
  return data.data.records;
}
