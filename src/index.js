const path = require('path')
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocation} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}= require('./utils/users')

const app = express()
const server = http.createServer(app)
const io =socketIo(server)

const port = 3000
const publicDirectory = path.join(__dirname,'../public')
app.use(express.static(publicDirectory))

//let count = 0
//const meesage= "Welcome to chat"
io.on('connection',(socket)=>{
    console.log('New Web-Socket connection')
    debugger
    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id: socket.id,username,room})
        if(error){
             return callback(error)
        }

        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username,`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()

    })
    socket.on('sendMessage',(msg,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(msg)){
           return  callback('Profanity is not allowed')
        }
       // console.log(msg)
        io.to(user.room).emit('message',generateMessage(user.username,msg))
        callback()
    })
     debugger
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
       // console.log(user.username)
        if(user){
            io.to(user.room).emit('message',generateMessage( user.username,`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        console.log(user.username)
        io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })


    //socket.emit('countUpdated',count)

    // socket.on('increment',()=>{
    //     count++
    //    // socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count)
    // })
})

server.listen(port,()=>{
    console.log('Server is up')

})