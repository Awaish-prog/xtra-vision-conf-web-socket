import { socketToRoom, userIdsToNames, users, usersToSockets, usersToStreamStatus } from "../data/userAndSocketsData";
import { UserRoomData, SignalData, TimerData, ToggleData, UserNameData, RaiseHandData } from "../types/userAndRoomTypes";

function joinRoomHandler(data: UserRoomData, ws: any): void{
    try{
        if (users[data.roomId]) {
            const length = users[data.roomId].length;
            if(users[data.roomId].includes(data.userId)){
                console.log("Repeated...");
                return;
            }
            if (length === 4) {
                console.log("Room full...");
                ws.send(JSON.stringify({event: "room-is-full" }));
                return;
            }
            users[data.roomId].push(data.userId);
        } else {
            users[data.roomId] = [data.userId];
        }
        socketToRoom[data.userId] = data.roomId;
        usersToSockets[data.userId] = ws
        usersToStreamStatus[data.userId] = {
            videoOn: true,
            audioOn: true
        }
        const usersInRoom = users[data.roomId].filter(id => id !== data.userId);
        console.log(users);
        ws.send(JSON.stringify({event: "get-all-users", usersInRoom, usersToStreamStatus }));
    }
    catch(e){
        console.log(e);
        ws.send(JSON.stringify({event: "get-all-users", usersInRoom: [], usersToStreamStatus: {}}));
    }
}

function sendSignalToUserInMeeting(signalData: SignalData){
    usersToSockets[signalData.userToConnect].send(JSON.stringify({ event: "new-user-joined", signalData }))
}

function sendSignalToNewUser(signalData: SignalData){
    usersToSockets[signalData.userToConnect].send(JSON.stringify({ event: "get-signal-from-users-in-meeting", signalData }))
}

function disconnetUser(wsString: string){
    try{
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
                delete socketToRoom[key];
                delete usersToSockets[key];
                delete userIdsToNames[key];
                delete usersToStreamStatus[key];
                return
            }
        }
    }
    catch(e){
        console.log(e);
    }
}

function sendTimerToAll({ timer, roomId }: TimerData){
    users[roomId].forEach((user: string) => {
        usersToSockets[user].send(JSON.stringify({event: "get-timer", timer}))
    })
}

function turnMicOff({ userId, roomId, turnOn }: ToggleData){
    usersToStreamStatus[userId].audioOn = turnOn;
    users[roomId].forEach(user => {
        if(user !== userId){
            usersToSockets[user].send(JSON.stringify({event: "turn-off-mic", userIdMicOff: userId, turnOnMic: turnOn}))
        }
    })
}

function turnCameraOff({ userId, roomId, turnOn }: ToggleData){
    usersToStreamStatus[userId].videoOn = turnOn;
    users[roomId].forEach(user => {
        if(user !== userId){
            usersToSockets[user].send(JSON.stringify({event: "turn-off-camera", userIdVideoOff: userId, turnOnVideo: turnOn}))
        }
    })
}

function enterName({ userId, userName }: UserNameData, ws: any){
    userIdsToNames[userId] = userName;
    ws.send((JSON.stringify({event: "get-user-name", userId, userName})))
}

function getUserNames(ws: any){
    ws.send(JSON.stringify({event: "get-user-names", userIdsToNames}));
}

function raiseHand({ userId, hostId }: RaiseHandData){
    usersToSockets[hostId].send(JSON.stringify({event: "raise-hand", data: {userId}}));
}

function putDown({ userId, hostId }: RaiseHandData){
    usersToSockets[hostId].send(JSON.stringify({event: "put-down", data: {userId}}));
}

export { joinRoomHandler, sendSignalToUserInMeeting, sendSignalToNewUser, disconnetUser, sendTimerToAll, turnMicOff, turnCameraOff, enterName, getUserNames, raiseHand, putDown }