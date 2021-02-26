const Koa = require('koa');
const fs = require('fs')
const log4js = require('log4js')
const path = require('path')
const app = new Koa();
const static_ = require('koa-static')
const USERCOUNT = 3;

const router = require('koa-router')()
router.get('/', async (ctx, next) => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream(__dirname + '/'+'./index.html');
});
app.use(static_(
    path.join(__dirname, './js')
))
app.use(router.routes())
// const static = require('node-static');
const http = require('http');
const server = http.createServer(app.callback());
const io = require('socket.io')(server);
// 
// const file = new(static.Server)();
// const app = http.createServer(function (req, res) {
//   file.serve(req, res);
// }).listen(2013);
// console.log(app)
// const io = require('socket.io')(app); 


// const server = require('http').createServer();
// const io = require('socket.io')(server);
// io.on('connection', client => {
//   client.on('event', data => { /* … */ });
//   client.on('disconnect', () => { /* … */ });
// });
// server.listen(3000);

log4js.configure({
    appenders: {
        file: {
            type: 'file',
            filename: 'app.log',
            layout: {
                type: 'pattern',
                pattern: '%r %p - %m',
            }
        }
    },
    categories: {
       default: {
          appenders: ['file'],
          level: 'debug'
       }
    }
});

let logger = log4js.getLogger();

io.on('connection', (socket)=> {
// io.sockets.on('connection', (socket)=> {

    socket.on('message', (room, data)=>{
        logger.debug('message, room: ' + room + ", data, type:" + data.type);
        logger.debug('message, room: ' + room + ', data: '+data+', type: ' + data.type);
        // socket.emit('cmessage',room, data);
        io.to(room).emit('cmessage',room, data);
    });

    /*
    socket.on('message', (room)=>{
        logger.debug('message, room: ' + room );
        socket.to(room).emit('message',room);
    });
    */

    socket.on('join', (room)=>{
        socket.join(room);
        // var myRoom = io.sockets.adapter.rooms[room]; 
        var myRoom = io.sockets.adapter.rooms.get(room); 
        console.log('io.sockets.adapter.rooms:',io.sockets.adapter.rooms)
        console.log('myRoom:',myRoom)
        var users = (myRoom)? myRoom.size : 0;
        // var users = (myRoom)? Object.keys(myRoom.sockets).length : 0;
        logger.debug('the user number of room (' + room + ') is: ' + users);

        if(users < USERCOUNT){
            // socket.emit('joined', room, socket.id); //发给除自己之外的房间内的所有人
            io.in(room).emit('joined', room, socket.id); //发给房间内的所有人
            if(users > 1){
                io.to(room).emit('otherjoin', room, socket.id);
                // socket.to(room).emit('otherjoin', room, socket.id);

            }
        
        }else{
            socket.leave(room);    
            socket.emit('full', room, socket.id);
        }
        //socket.emit('joined', room, socket.id); //发给自己
        //socket.broadcast.emit('joined', room, socket.id); //发给除自己之外的这个节点上的所有人
        //io.in(room).emit('joined', room, socket.id); //发给房间内的所有人
    });

    socket.on('leave', (room)=>{

        socket.leave(room);

        var myRoom = io.sockets.adapter.rooms[room]; 
        var users = (myRoom)? Object.keys(myRoom.sockets).length : 0;
        logger.debug('the user number of room is: ' + users);

        //socket.emit('leaved', room, socket.id);
        //socket.broadcast.emit('leaved', room, socket.id);
        socket.to(room).emit('bye', room, socket.id);
        socket.emit('leaved', room, socket.id);
        //io.in(room).emit('leaved', room, socket.id);
    });

});


server.listen(3000);
