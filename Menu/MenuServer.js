process.on('SIGINT', function()
{
	console.log('Shutting down, received SIGINT...');
	require('./CookieDatabase.js').unlock();
	process.exit();
});
process.on('SIGTERM', function()
{
	console.log('Shutting down, received SIGINT...');
	require('./CookieDatabase.js').unlock();
	process.exit();
});
process.on('SIGHUP', function()
{
	console.log('Shutting down, received SIGINT...');
	require('./CookieDatabase.js').unlock();
	process.exit();
});
process.on('SIGABRT', function()
{
	console.log('Shutting down, received SIGINT...');
	require('./CookieDatabase.js').unlock();
	process.exit();
});
process.on('SIGQUIT', function()
{
	console.log('Shutting down, received SIGINT...');
	require('./CookieDatabase.js').unlock();
	process.exit();
});
var mysql = require('mysql');
var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var requestsController = require('./Router.js');
var userDB = require('./UserDatabase.js');
var cookieDB = require('./CookieDatabase.js');
cookieDB.initializeCookieDatabase();
//var cacheDB = require('./cacheDB.js');
//cacheDB.init();
var defaultServer = http.createServer(function(request, response) //createServer is constant function from http module 
{
	// COOKIE HANDLER
	var cookie = false;
	if(request.headers.cookie)
	{
		var cookies = request.headers.cookie.split(';');
		var subcookie;
		for(var i = 0; i < cookies.length; i = i + 1)
		{
			subcookie = cookies[i].split('=');
			if((subcookie.length === 2)&&(subcookie[0].trim().toLowerCase() === 'menucookie'))
			{
				cookie = subcookie[1];
			}
		}
		if(cookie === false)
		{
			cookie = cookieDB.generateCookie();
		}
	}
	else
	{
		cookie = cookieDB.generateCookie();
	}
	response.setHeader('Set-Cookie','menucookie=' + cookie + '; Path=/');
	console.log(cookie);
	console.log(request.headers.cookie);
	console.log(request.url);
	
	// ROUTER
	var params = request.url.split('/');
	console.log(params);
	var obj = {};
	obj.request = request;
	obj.response = response;
	obj.cookie = cookie;
	obj.params = params;
	if(params.length < 2)
	{
		requestsController['ajaxtest'](obj);
	}
    else if(params[1] in requestsController)
	{
		requestsController[params[1]](obj);
	}
	else
	{
		response.writeHead(404, {'Content-Type':'text/html'});
		response.end(fs.readFileSync('error.html','utf8'));
	}
	console.log("\n");
});

var port = 2000;//parseInt((Math.random()*(100))+2000);
console.log(port);
defaultServer.listen(port);
console.log ('Connected');