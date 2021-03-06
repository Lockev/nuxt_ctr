const Draft = require("./Draft");

class Room extends Draft {
  static ROOMS = [];
  static PIN_LENGTH = 4;

  constructor(pin, admin) {
    super();
    this.pin = pin;
    this.admin = admin;
    this.users = [];
    this.spectators = [];
  }

  static checkAdmin(ele, socket) {
    let index = this.ROOMS.findIndex(data => data.pin === ele.toUpperCase());
    if (index === -1) return false;
    return this.ROOMS[index].admin === socket.id ? index : false;
  }

  static newPin() {
    const characters = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    let result = "";
    for (let i = 0; i < this.PIN_LENGTH; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    while (this.ROOMS.findIndex(data => data.pin === result) !== -1) {
      result = "";
      for (let i = 0; i < this.PIN_LENGTH; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
    }
    return result;
  }

  static createRoom(ele, socket) {
    let pin = this.newPin();
    let actualRoom = new Room(pin, socket.id);
    this.ROOMS.push(actualRoom);
    socket.emit("RES_CREATE_ROOM", actualRoom);
    return pin;
  }

  static joinRoom(ele, socket) {
    socket.join(ele);
    let index = this.ROOMS.findIndex(data => data.pin === ele.toUpperCase());
    if (this.ROOMS[index].users.length < 2) {
      this.ROOMS[index].addUser(socket.id);
    } else {
      this.ROOMS[index].addSpectators(socket.id);
    }
  }

  static checkRoom(ele, socket) {
    let index = this.ROOMS.findIndex(data => data.pin === ele.toUpperCase());
    if (index === -1) {
      socket.emit("RES_CHECK_ROOM", { exist: false });
    } else {
      if (this.ROOMS[index].admin === socket.id) {
        socket.emit("RES_CHECK_ROOM", { exist: true, isAdmin: true });
      } else {
        socket.emit("RES_CHECK_ROOM", { exist: true, isAdmin: false });
      }
    }
  }

  static disconnectRoom(ele, socket) {
    let index = -1;
    this.ROOMS.map(ele => {
      let temp = ele.users.indexOf(socket.id);
      if (temp !== -1) {
        index = temp;
      }
    });
    let indexRoom = this.ROOMS.findIndex(ele => ele.users[index] === socket.id);
    if (index !== -1) {
      this.ROOMS[indexRoom].users.splice(index, 1);
    } else {
      this.ROOMS.map(ele => {
        let temp = ele.spectators.indexOf(socket.id);
        if (temp !== -1) {
          index = temp;
        }
      });
      indexRoom = this.ROOMS.findIndex(
        ele => ele.spectators[index] === socket.id
      );
      if (index !== -1) {
        this.ROOMS[indexRoom].spectators.splice(index, 1);
      }
    }
  }

  addUser(user) {
    this.users.push(user);
  }

  addSpectators(user) {
    this.spectators.push(user);
  }
}

module.exports = Room;
