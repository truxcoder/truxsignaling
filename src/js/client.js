'use strict'

var userName = document.querySelector('input#username');
var inputRoom = document.querySelector('input#room');
var btnConnect = document.querySelector('button#connect');
var btnLeave = document.querySelector('button#leave');
var outputArea = document.querySelector('textarea#output');
var inputArea = document.querySelector('textarea#input');
var btnSend = document.querySelector('button#send');

var socket;
var room;

btnConnect.onclick = () => {

  //connect
  socket = io.connect();

  //recieve message
  socket.on('joined', (room, id) => {
    btnConnect.disabled = true;
    btnLeave.disabled = false;
    inputArea.disabled = false;
    btnSend.disabled = false;
    alert("room:" + room + ",id:" + id);
  });

  socket.on('leaved', (room, id) => {
    btnConnect.disabled = false;
    btnLeave.disabled = true;
    inputArea.disabled = true;
    btnSend.disabled = true;

    socket.disconnect();
  });

  socket.on('cmessage', (room, data) => {
  	console.log('in cmessage')
    console.log(room, data)
    outputArea.scrollTop = outputArea.scrollHeight; //窗口总是显示最后的内容
    outputArea.value = outputArea.value + data + '\r';
    console.log(outputArea.value)
  });

  socket.on('disconnect', (socket) => {
    btnConnect.disabled = false;
    btnLeave.disabled = true;
    inputArea.disabled = true;
    btnSend.disabled = true;
  });

  //send message
  room = inputRoom.value;
  socket.emit('join', room);
}

btnSend.onclick = () => {
  let data = inputArea.value;
  data = userName.value + ':' + data;
  console.log('room: ', room)
  console.log('data: ', data)
  socket.emit('message', room, data);
  inputArea.value = '';
}

btnLeave.onclick = () => {
  room = inputRoom.value;
  socket.emit('leave', room);
}

inputArea.onkeypress = (event) => {
  //event = event || window.event;
  if (event.keyCode == 13) { //回车发送消息
    var data = inputArea.value;
    data = userName.value + ':' + data;
    socket.emit('message', room, data);
    inputArea.value = '';
    event.preventDefault(); //阻止默认行为
  }
}