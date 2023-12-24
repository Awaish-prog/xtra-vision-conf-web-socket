import * as WebSocket from 'ws';
import * as http from 'http';
import { joinRoomHandler, sendSignalToUserInMeeting } from './enentHandlers/roomsHandler';

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  ws.on('message', (message: string) => {
    const { event, data } = JSON.parse(message)

    switch(event){
        case "join-room":
          joinRoomHandler(data, ws);
          break;
        case "send-signal":
          sendSignalToUserInMeeting(data)
          break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('WebSocket server is listening on port 3001');
});