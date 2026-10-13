const cron = require('node-cron');
const CONFIG = require('./config');

async function cleanupRooms() {
  const now = Math.floor(Date.now() / 1000);
  const where = encodeURIComponent('(delete_at,lt,' + now + ')');
  const url = CONFIG.API_URL + '/databases/' + CONFIG.DATABASE_ID + '/tables/' + CONFIG.TABLES.ROOMS + '/records?where=' + where;
  const res = await fetch(url, {
    headers: { 'Authorization': 'Bearer ' + CONFIG.TOKEN }
  });
  const data = await res.json();
  const rooms = data.data.records;

  for (let i = 0; i < rooms.length; i++) {
    const deleteUrl = CONFIG.API_URL + '/databases/' + CONFIG.DATABASE_ID + '/tables/' + CONFIG.TABLES.ROOMS + '/records/' + rooms[i].id;
    await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + CONFIG.TOKEN }
    });
  }
}

cron.schedule('0 * * * *', cleanupRooms);
