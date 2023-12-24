import { socketToRoom, users, usersToSockets } from "../data/userAndSocketsData";
import { JoinRoomData, SignalData } from "../types/userAndRoomTypes";

function joinRoomHandler(data: JoinRoomData, ws: any): void{
    if (users[data.roomId]) {
        const length = users[data.roomId].length;
        if (length === 4) {
            // socket.emit("room full");
            return;
        }
        users[data.roomId].push(data.userId);
    } else {
        users[data.roomId] = [data.userId];
    }
    socketToRoom[data.userId] = data.roomId;
    usersToSockets[data.userId] = ws
    const usersInRoom = users[data.roomId].filter(id => id !== data.userId);
    ws.send(JSON.stringify({event: "get-all-users", usersInRoom}));
}

function sendSignalToUserInMeeting(signalData: SignalData){
    // console.log(usersToSockets[signalData.userToConnect]);
    // console.log(usersToSockets[signalData.userId]);
    usersToSockets[signalData.userToConnect].send(JSON.stringify({ event: "new-user-joined", signalData }))
}

export { joinRoomHandler, sendSignalToUserInMeeting }