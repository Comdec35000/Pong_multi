
const targetedFPSRate = 40;



//Logger instance
const log = require('./utils/logger/logger.js');
const LOGGER = new Logger("server");

/*
 * ====================================
 *
 * HTTP Server Creation
 *
 * ====================================
*/
const express = require('express');
const app = express();
const serv = require('http').Server(app);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(4840);

LOGGER.log("Server Up !");

/*
 * ====================================
 *
 * OOP
 *
 * ====================================
*/



var Entity = function() {
  var self = {
    speedX : 5,
    speedY : 5
  }
  self.update = function() {
    self.updatePos()
  }

  self.updatePos = () => {
    self.x = Math.round(self.x + self.speedX);
    self.y = Math.round(self.y + self.speedY);
  }
  return self;
}

var Ball = function() {
  var self = Entity();
    self.y = 190;
    self.x = 290;
    self.angle = Math.round((Math.random()*360));
    self.impactCount = 0;
    self.baseSpeed = 5;

    self.update = function() {
      if(!SOCKET_LIST.lenght == 2) return;


      //// DEBUG:
      while (self.angle > 360) {
        self.angle -= 360;
      }
      while (self.angle < 0) {
        self.angle += 360;
      }

      if(self.y+20 >= 400) {
        self.impactCount++;
        self.y = 375;
        self.angle *= -1
        self.angle += (Math.random()*10)-5;
      } else if (self.y <= 0) {
        self.impactCount++;
        self.y = 5;
        self.angle *= -1
        self.angle += (Math.random()*10)-5;
      }

      if(self.x <= 40 && self.y <= PLAYER_LIST[0].y+120 && self.y+20 >= PLAYER_LIST[0].y) {
        self.impactCount++;
        self.x +=5;
        self.angle = (-self.angle-180) + ((Math.random()*40)-20);
      }

      if(self.x+20 >= 560 && self.y <= PLAYER_LIST[1].y+120 && self.y+20 >= PLAYER_LIST[1].y) {
        self.impactCount++;
        self.x -= 5;
        self.angle = (-self.angle-180) + ((Math.random()*40)-20);
      }


      if(self.x + 20 >= 600) {
        PLAYER_LIST[0].score++
        for(let i in PLAYER_LIST) {
          PLAYER_LIST[i].y = 140;
        }
        return BALL = Ball();
      } else if ( self.x <= 0) {
        PLAYER_LIST[1].score++
        for(let i in PLAYER_LIST) {
          PLAYER_LIST[i].y = 140;
        }
        return BALL = Ball();
      }

      self.baseSpeed += self.impactCount/100;
      if(self.baseSpeed > 10) self.baseSpeed = 10;
      self.speedX = (Math.cos(self.angle*Math.PI/180) * this.baseSpeed)/*self.angle/Math.sqrt(self.angle*self.angle)*/;
      self.speedY = (Math.sin(self.angle*Math.PI/180) * this.baseSpeed)/*self.angle/Math.sqrt(self.angle*self.angle)*/;

      self.updatePos()
    }
  return self;
}

var Player = function(id) {
  var self = Entity();
    self.y = 140;
    self.playerTag = id;
    self.keybindUP = false;
    self.keybindDOWN = false;
    self.score = 0;

    self.updatePos = () => {
      if(self.keybindUP && !self.keybindDOWN) {
        if(self.y + 120 >= 400) return;
        self.y += self.speedY;
      } else if (!self.keybindUP && self.keybindDOWN) {
        if(self.y <= 0) return;
        self.y -= self.speedY;
      }
    }
  return self;
}


const SOCKET_LIST = [0, 0];
const PLAYER_LIST = [0, 0];
var BALL = Ball();

/*
 * ====================================
 *
 * Sockets
 *
 * ====================================
*/

const io = require('socket.io')(serv, {});
io.on('connection', socket => {
  socket.id = Math.round(Math.random()*1000000);
  socket.y = 140;

  if(SOCKET_LIST[0] === 0) {
    SOCKET_LIST[0] = socket;
    socket.id = 0;
  } else if (SOCKET_LIST[1] === 0) {
    SOCKET_LIST[1] = socket;
    socket.id = 1;
  } else {
    return socket.emit('gameFull');
  }

  PLAYER_LIST[socket.id] = Player(socket.id);

  LOGGER.log(SOCKET_LIST);
  socket.on('disconnect', () => {
    SOCKET_LIST[socket.id] = 0;
    PLAYER_LIST[socket.id] = 0;
    LOGGER.log(SOCKET_LIST);
  });


  socket.on('keyPress', (data) => {
    let player = PLAYER_LIST[socket.id]
    if(data.inputID == 'up') {
      player.keybindUP = data.state;
    } else if (data.inputID == 'down') {
      player.keybindDOWN = data.state;
    }
  });


  LOGGER.log("Socket connection detected, ID : " + socket.id);
});

/*
 * ====================================
 *
 * Main Loop
 *
 * ====================================
*/

setInterval(() => {
  var data = [];
  var pack = [];
  for(let i in PLAYER_LIST) {
    if(PLAYER_LIST[i] === 0) return;
    let player = PLAYER_LIST[i];
    player.playerTag = i;
    player.updatePos();

    pack.push({
      playerTag : player.playerTag,
      y : player.y,
      score : player.score
    })
  }
  data.push(pack);
  BALL.update();
  data.push(BALL)

  for (var i = 0; i < SOCKET_LIST.length; i++) {
    let socket = SOCKET_LIST[i];
    socket.emit('newPos', data)
  }

}, 1000/targetedFPSRate);
