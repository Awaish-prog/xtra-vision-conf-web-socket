import * as WebSocket from 'ws';
import * as http from 'http';
import { disconnetUser, enterName, getUserNames, joinRoomHandler, putDown, raiseHand, sendSignalToNewUser, sendSignalToUserInMeeting, sendTimerToAll, turnCameraOff, turnMicOff } from './enentHandlers/roomsHandler';

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
          sendSignalToUserInMeeting(data);
          break;
        case "send-signal-to-new-user":
          sendSignalToNewUser(data);
          break;
        case "disconnect-user":
          disconnetUser(data);
          break;
        case "send-timer":
          sendTimerToAll(data);
          break;
        case "turn-camera-off":
          turnCameraOff(data);
          break;
        case "turn-mic-off":
          turnMicOff(data);
          break;
        case "enter-name":
          enterName(data, ws);
          break;
        case "get-user-names":
          getUserNames(ws);
          break;
        case "raise-hand":
          raiseHand(data);
          break;
        case "put-down":
          putDown(data);
          break;
        default:
          console.log(event);
    }
  });

  ws.on('close', () => {
    disconnetUser(JSON.stringify(ws))
    console.log('Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('WebSocket server is listening on port 3001');
});