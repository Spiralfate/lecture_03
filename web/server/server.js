var { createServer } = require('http');
var { Server } = require('node-static');
var file = new Server('./dist/');

var server = createServer((req, res) => {
	file.serve(req, res);
})

server.listen(8080);

console.log('Server running on port 8080');
