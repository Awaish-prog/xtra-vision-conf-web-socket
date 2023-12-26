import { socketToRoom, users, usersToSockets } from "../data/userAndSocketsData";
import { UserRoomData, SignalData, TimerData, ToggleData } from "../types/userAndRoomTypes";

function joinRoomHandler(data: UserRoomData, ws: any): void{
    if (users[data.roomId]) {
        const length = users[data.roomId].length;
        if (length === 5) {
            return;
        }
        users[data.roomId].push(data.userId);
    } else {
        users[data.roomId] = [data.userId];
    }
    console.log(data.roomId);
    console.log(data.userId);
    socketToRoom[data.userId] = data.roomId;
    usersToSockets[data.userId] = ws
    const usersInRoom = users[data.roomId].filter(id => id !== data.userId);
    ws.send(JSON.stringify({event: "get-all-users", usersInRoom }));
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
    users[roomId].forEach((user: string) => {
        usersToSockets[user].send(JSON.stringify({event: "get-timer", timer}))
    })
}

function turnMicOff({ userId, roomId, turnOn }: ToggleData){
    users[roomId].forEach(user => {
        if(user !== userId){
            usersToSockets[user].send(JSON.stringify({event: "turn-off-mic", userIdMicOff: userId, turnOnMic: turnOn}))
        }
    })
}

function turnCameraOff({ userId, roomId, turnOn }: ToggleData){
    users[roomId].forEach(user => {
        if(user !== userId){
            usersToSockets[user].send(JSON.stringify({event: "turn-off-camera", userIdVideoOff: userId, turnOnVideo: turnOn}))
        }
    })
}

export { joinRoomHandler, sendSignalToUserInMeeting, sendSignalToNewUser, disconnetUser, sendTimerToAll, turnMicOff, turnCameraOff }