
module.exports.Logger = (function() {
  Logger = function(name) {
    this.id = name.toUpperCase();
  },
  Logger.prototype.getDate = function(){
    var date = new Date();
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  },
  Logger.prototype.log = function(text) {
    return console.log(`[${this.getDate()}]:[${this.id}]: ${text}`)
  },
  Logger.prototype.error = function(text) {
    return console.error(`[${this.getDate()}]:[${this.id}]: ${text}`)
  },
  Logger.prototype.warn = function(text) {
    return console.warn(`[${this.getDate()}]:[${this.id}]: ${text}`)
  },
  Logger.prototype.info = function(text) {
    return console.info(`[${this.getDate()}]:[${this.id}]: ${text}`)
  }
})();
