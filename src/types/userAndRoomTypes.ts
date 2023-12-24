export type Users = {
    [key: string]: string[]
}

export type SocketToRoom = {
    [key: string]: string
}

export type UsersToSocket = {
    [key: string]: any
}

export type JoinRoomData = {
    userId: string,
    roomId: string
}

export type SignalData = {
    userToConnect: string,
    userId: string,
    signal: any
}