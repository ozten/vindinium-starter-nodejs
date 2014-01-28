module.exports = function(curState, cb) {
  var dirs = ['Stay', 'North', 'South', 'East', 'West'];
  setTimeout(function() {
    cb(choose(dirs));
  }, 2000);
};

function choose(dirs) {
  return dirs[Math.floor(Math.random() * dirs.length)];
}