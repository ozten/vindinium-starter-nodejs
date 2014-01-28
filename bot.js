module.exports = function(curState, cb) {
  var dirs = ['Stay', 'North', 'South', 'East', 'West'];
  cb(choose(dirs));
};

function choose(dirs) {
  return dirs[Math.floor(Math.random() * dirs.length)];
}