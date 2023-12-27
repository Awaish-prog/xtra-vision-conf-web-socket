export type Users = {
    [key: string]: string[]
}

export type SocketToRoom = {
    [key: string]: string
}

export type UsersToSocket = {
    [key: string]: any
}

export type UserIdsToNames = {
    [key: string]: string
}

export type UserRoomData = {
    userId: string,
    roomId: string
}

export type SignalData = {
    userToConnect: string,
    userId: string,
    signal: any
}

export type TimerData = {
    timer: number,
    roomId: string
}

export type ToggleData = UserRoomData & {
    turnOn: boolean
}

export type UserNameData = {
    userId: string,
    userName: string,
}

export type RaiseHandData = {
    userId: string,
    hostId: string
}