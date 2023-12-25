import { socketToRoom, users, usersToSockets } from "../data/userAndSocketsData";
import { JoinRoomData, SignalData, TimerData } from "../types/userAndRoomTypes";

function joinRoomHandler(data: JoinRoomData, ws: any): void{
    if (users[data.roomId]) {
        const length = users[data.roomId].length;
        // if (length === 4) {
        //     // socket.emit("room full");
        //     return;
        // }
        users[data.roomId].push(data.userId);
    } else {
        users[data.roomId] = [data.userId];
        console.log("Brand new...");
    }
    socketToRoom[data.userId] = data.roomId;
    usersToSockets[data.userId] = ws
    const usersInRoom = users[data.roomId].filter(id => id !== data.userId);
    ws.send(JSON.stringify({event: "get-all-users", usersInRoom}));
}

function sendSignalToUserInMeeting(signalData: SignalData){
    usersToSockets[signalData.userToConnect].send(JSON.stringify({ event: "new-user-joined", signalData }))
}

function sendSignalToNewUser(signalData: SignalData){
    usersToSockets[signalData.userToConnect].send(JSON.stringify({ event: "get-signal-from-users-in-meeting", signalData }))
}

function disconnetUser(wsString: string){
    for (const [key, value] of Object.entries(usersToSockets)) {
        if(wsString === JSON.stringify(value)){
            const roomID = socketToRoom[key];
            let room = users[roomID];
            if (room) {
                room = room.filter(id => id !== key);
                users[roomID] = room;
            }
            users[roomID].forEach(user => {
                usersToSockets[user].send(JSON.stringify({ event: "remove-user", userId: key }));
            })
            delete socketToRoom[key]
            delete usersToSockets[key]
            console.log(users);
            return
        }
    }
}

function sendTimerToAll({ timer, roomId }: TimerData){
    console.log(timer, roomId);
    users[roomId].forEach((user: string) => {
        usersToSockets[user].send(JSON.stringify({event: "get-timer", timer}))
    })
}

export { joinRoomHandler, sendSignalToUserInMeeting, sendSignalToNewUser, disconnetUser, sendTimerToAll }