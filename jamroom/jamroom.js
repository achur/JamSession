var fs = require("fs");
var origPage = fs.readFileSync("jamroom.html", "UTF-8");

// Require HTTP module (to start server) and Socket.IO
var http = require('http'), io = require('socket.io');

// Start the server at port 8080
var server = http.createServer(function(request, res){ 

  var filePath = "." + request.url;
  console.log(request.url);
  var page;
  if(request.url.indexOf("/src") === 0 || request.url.indexOf("/lib") === 0)
  {
  	page = fs.readFileSync(filePath, "UTF-8");
  }
  else
  {
  	page = origPage;
  }
  
  // Send HTML headers and message  res.writeHead(200,{ 'Content-Type': 'text/html' }); 
  res.end(page);
});
server.listen(8080);

var io = require('socket.io').listen(1234);
// Add a connect listener
io.sockets.on('connection', function(client){
  // Success!  Now listen to messages to be received
  client.on('message',function(event){ 
    console.log('Received message from client!',event);
  });
  client.on('noteDown',function(event){ 
    console.log('Received message from client!',event);
    io.sockets.emit('playNote', event);
  });
  client.on('disconnect',function(){
    console.log('Server has disconnected');
  });
});