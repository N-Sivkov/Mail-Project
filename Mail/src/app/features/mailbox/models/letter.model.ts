export interface Letter {
    id: number,
    senderId: number,
    sender: string,
    recipientIds: number[],
    recipients: string[],
    copyRecipientIds: number[], 
    copyRecipients: string[],
    subject: string,
    date: string, // to be converted in backend
    content: string,
    read: boolean
}