import { pinia, User, Socket_Users, Socket_Target, Socket_Message } from '../Pinia';
import { io } from "socket.io-client";
const user = User(pinia);
const SocketUsers = Socket_Users(pinia);
const SocketMessage = Socket_Message();
const socket = io('http://localhost:8080', {
    auth: {
        username: user._id
    },
    extraHeaders: {
        'x-username': user.name,
        'x-avatar': user.avatar,
        'x-id': user._id
    },
    autoConnect: false
});
socket.on('connect', () => {
    console.log(`socket is ${socket.connected}`);
});
socket.on('users', (data: string) => {
    // when server send usermap we replace it;
    SocketUsers.usermap = new Map(JSON.parse(data));
    if (SocketUsers.usermap.get(user._id) !== undefined) {
        // what type ?
        (SocketUsers.usermap.get(user._id) as {
            avatar: string,
            username: string,
            socketid: string,
            userid: string,
        }).username = 'You';
    }
    console.log('users data: ', new Map(JSON.parse(data)));
})
socket.on('user_connected', (data: any) => {
    console.log('user_connected', data);
    SocketUsers.usermap.set(data.userid, data.userInfo);
    console.log('now the usermap is :', SocketUsers.usermap)
})

socket.on('user_disconnect', (userid: string) => {
    console.log('user_disconnect', userid);
    SocketUsers.usermap.delete(userid);
    console.log('now the usermap is :', SocketUsers.usermap);
})

socket.on('private_message', (data: {
    content: string,
    from: string,
    senderid: string,
    sendername: string,
    senderavatar: string
}) => {
    console.log('got private message : ', data)
    if (!SocketMessage.messages.has(data.senderid)) {
        SocketMessage.messages.set(data.senderid, { data: [], total: 0 });
    }
    SocketMessage.messages.get(data.senderid)?.data.push({
        type: 'to',
        content: data.content,
        date: new Date()
    })
    SocketMessage.messages.get(data.senderid)!.total += 1;
})
export { socket }