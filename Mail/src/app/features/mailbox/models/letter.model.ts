export interface Letter {
    id: number,
    senderId: number, 
    name: string,
    date: string, // to be converted in backend
    content: string
}