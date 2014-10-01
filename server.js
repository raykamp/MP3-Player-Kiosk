if(process.platform != 'darwin'){
	var app = require('http').createServer(handler),
    io = require('/usr/local/lib/node_modules/socket.io').listen(app),
    fs = require('fs'),
    path = require('path'),
    async = require('/usr/local/lib/node_modules/async');

	var id3 = require('/usr/local/lib/node_modules/id3js');
	var lame = require("/usr/local/lib/node_modules/lame");
	var Speaker = require("/usr/local/lib/node_modules/speaker");
}else{
	var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	fs = require('fs'),
	path = require('path'),
	async = require('async');

	var id3 = require('id3js');
	var lame = require("lame");
	var Speaker = require("speaker");
}
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};


//Helper functions
function anokaLog(item){
	console.log(new Date().toString(), " \t", item);
}
function getRandomObjKey(obj){
	var keyCount = Object.keys(obj).length;
	if(keyCount== 0) return null;
	return Object.keys(obj)[Math.floor(Math.random()*keyCount)];
}
function getRandomArrayElement(arr){
	if(arr.length == 0) return null;
	return arr[Math.floor(Math.random()*arr.length)];
}
function getExtension(filename) {
	var i = filename.lastIndexOf('.');
	return (i < 0) ? '' : filename.substr(i);
}

//Web Server
function handler(req, res) {
	var
    fileName = path.basename(req.url) || 'client.html';

    if (fileName == 'logo.png'){
    	var filename = __dirname + '/logo.png';
    	var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
    	res.writeHead(200, {'Content-Type':mimeType});
	    var fileStream = fs.createReadStream(filename);
	    fileStream.pipe(res);
    }else if (fileName == 'jquery.min.js'){
    	var filename = __dirname + '/jquery.min.js';
	    var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
	    res.writeHead(200, {'Content-Type':mimeType});
	    var fileStream = fs.createReadStream(filename);
	    fileStream.pipe(res);
    }else{
	  	fs.readFile(__dirname + '/client.html', function(err, data) {
	   		if (err) {
	      		anokaLog(err);
	      		res.writeHead(500);
	      		return res.end('Error loading client.html');
	      	}
	    	 res.writeHead(200);
	    	 res.end(data);
	  	});
	 }
}

var mainSocket;
function sendTags(tags){
	tags.time = new Date();
	// Send the new data to the client
	if(mainSocket && mainSocket!== null){
	  	mainSocket.volatile.emit('notification', JSON.stringify(tags));
	  	anokaLog("Sent Tags over the socket! " + mainSocket);
	}else{
		anokaLog("No active socket to send tags to");
	}
}
9
// Create a new websocket to keep the content updated without any AJAX request
io.sockets.on('connection', function(socket) {
	mainSocket = socket;
  	anokaLog("A socket connection has been established!");
  	anokaLog(activeTags);
  	setTimeout(
  		function(){
  			socket.volatile.emit('notification', JSON.stringify(activeTags));
  		}
  	,2000);
});
io.sockets.on('disconnect', function () {
	mainSocket = null;
    anokaLog("A socket connection has been disconnected!");
});

//MP3 tag parsing and playing
function play(url, cb) { 
	anokaLog("File will start playing:");
	anokaLog("\turl: " + url);
	fs.createReadStream(url)
	.pipe(new lame.Decoder())
	.on('format', function (format) {
		try {
        	var spk = new Speaker(format);
        	//spk.on('finish', cb);
        	spk.on('open', function(){anokaLog('Player Event: open')});
        	spk.on('flush', function(){anokaLog('Player Event: flush')});
       		spk.on('close', function(){
       			anokaLog('Player Event: close');
       			cb();
       		});
	    	this.pipe(spk);
       	} catch(e){
       		anokaLog("Error in playing file:")
        	anokaLog("\nerror: " + e);
       	}
	});
}

function readTags(file,cb){
	id3({ file: file, type: id3.OPEN_LOCAL }, function(err, tags) {
		if(err){
			anokaLog("Error reading Tags:");
			anokaLog("\tfile:"+JSON.stringify(file));
			anokaLog("\terror:"+JSON.stringify(error));
			cb(null);
		}else{
			cb(tags);
		}
	});
}


var activeTags;
function processFile(file,cb){
	async.series([
		function(callback){
	    	readTags(file,function(tags){
	    		if(tags == null){
	    			callback("Error parsing tags", 'one');
	    		}else{
		    		activeTags = tags;
		    		anokaLog("File: " + file);
		    		anokaLog("\tTitle: " + tags.title);
				    anokaLog("\tArtist: " + tags.artist);
				    anokaLog("\tAlbum: " + tags.album);
				    anokaLog("\tYear: " + tags.year);
				    anokaLog(tags);
				    sendTags(tags);
				    callback(null, 'one');
				}
		    })
	    }
		,function(callback){
			if(activeTags.title == null){ //If this song has no title tag, skip it entirely
				callback(null, 'three');
			}else{
	    		play(file, function(){
				  	anokaLog("Playback has ended!");
				  	callback(null, 'three');
				})
			}
		}
	],
	// optional callback
	function(err, results){
		if(err){
			anokaLog("Error in processing file: "+error);
		}else{
		    anokaLog("File Processed!");
		}
	    cb();
	});
}

function getMp3Listing(dir) {
	var subdirectories = fs.readdirSync(dir).filter(function (file) {
		return fs.statSync(dir+file).isDirectory();
	});

	var fileListing = new Object();
	subdirectories.forEach(function(part, index, theArray){
		var dirPath = dir+part+'/';
		fileListing[dirPath] = fs.readdirSync(dirPath).filter(function (file) {
			//anokaLog(getExtension(dirPath+file));
		 return (fs.statSync(dirPath+file).isFile() && getExtension(dirPath+file)==='.mp3');
		});
	});
	return fileListing;
}

// creating the server ( localhost:8000 ) 
app.listen(8000);

if(process.platform != 'darwin'){
  	var fileListing = getMp3Listing(__dirname+"/mp3s/");
}else{
	var fileListing = getMp3Listing(__dirname+"/mp3s/");
}
anokaLog("File listing: ");
anokaLog(fileListing);

var i = 0;
var randomDir = getRandomObjKey(fileListing);
var randomFile = getRandomArrayElement(fileListing[randomDir]);
//Loop through all mp3 files forever
async.forever(
    function(next) {
    	//If there are no MP3 folders
    	if(randomDir == null){
    		next("error: No Mp3 folders");
    	}
    	//If there is an empty folder, pass over it and reset
    	else if(randomFile == null){
    		randomDir = getRandomObjKey(fileListing);
    		randomFile = getRandomArrayElement(fileListing[randomDir]);
    		next();
    	}else{
	    	processFile(randomDir+randomFile,function(){
	    		if (i++ >= 3){
	    			randomDir = getRandomObjKey(fileListing);
	    			i=0;
	    		}
	    		anokaLog("i="+i);
	    		randomFile = getRandomArrayElement(fileListing[randomDir]);
	    		next();
	    	});
	    }
    },
    function(err) {
        // if next is called with a value in its first parameter, it will appear
        // in here as 'err', and execution will stop.
    }
);

