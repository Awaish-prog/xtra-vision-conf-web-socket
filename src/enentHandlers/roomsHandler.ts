import { socketToRoom, timers, users, usersToSockets } from "../data/userAndSocketsData";
import { UserRoomData, SignalData, TimerData, ToggleData } from "../types/userAndRoomTypes";

function joinRoomHandler(data: UserRoomData, ws: any): void{
    if (users[data.roomId]) {
        const length = users[data.roomId].length;
        // if (length === 4) {
        //     // socket.emit("room full");
        //     return;
        // }
        users[data.roomId].push(data.userId);
    } else {
        users[data.roomId] = [data.userId];
        timers[data.roomId] = -3
        console.log("Brand new...");
    }
    socketToRoom[data.userId] = data.roomId;
    usersToSockets[data.userId] = ws
    const usersInRoom = users[data.roomId].filter(id => id !== data.userId);
    const timerInit: number = timers[data.roomId]
    ws.send(JSON.stringify({event: "get-all-users", usersInRoom, timerInit }));
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
    timers[roomId] = timer;
    users[roomId].forEach((user: string) => {
        usersToSockets[user].send(JSON.stringify({event: "get-timer", timer}))
    })
}

function turnMicOff({ userId, roomId, turnOn }: ToggleData){
    users[roomId].forEach(user => {
        if(user !== userId){
            usersToSockets[user].send(JSON.stringify({event: "turn-off-mic", userId, turnOn}))
        }
    })
}

function turnCameraOff({ userId, roomId, turnOn }: ToggleData){
    users[roomId].forEach(user => {
        if(user !== userId){
            usersToSockets[user].send(JSON.stringify({event: "turn-off-camera", userId, turnOn}))
        }
    })
}

export { joinRoomHandler, sendSignalToUserInMeeting, sendSignalToNewUser, disconnetUser, sendTimerToAll, turnMicOff, turnCameraOff }