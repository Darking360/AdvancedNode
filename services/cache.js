const moongose = require('mongoose');
const exec = moongose.Query.prototype.exec;

moongose.Query.prototype.exec = function() {
  console.log('AM ABOUT TO RUN A QUERY');
  return exec.apply(this, arguments);
};