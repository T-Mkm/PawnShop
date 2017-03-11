var fs = require('fs');
var qs = require('querystring');
var userDB = require('./UserDatabase.js');
var cookieDB = require('./CookieDatabase.js');
var menudb = require('./MenuDatabase.js');
userDB.initializeUserDatabase();
//setInterval(userDB.initializeUserDatabase,500);
menudb.initializeMenu();
menudb.initializeCategories();
//menudb.cleanDataBase('mante');
module.exports = {
	'cookie':false,
	'params':{},
	'request':{},
	'response':{},
	'init':function(obj)
	{
		this.cookie = obj.cookie;
		this.request = obj.request;
		this.response = obj.response;
		this.params = obj.params;
	},
	'':function(obj)
	{
		this.init(obj);
		this.response.end(fs.readFileSync('ind.html'));
	},
	'loadOptions':function(obj)
	{
		this.init(obj);
		var result = '';
		for(var i in this)
		{
			if((i !== 'ajaxtest')&&(i !== 'loadOptions')&&(i !== 'ajax')&&(i !== 'init')&&(i !== '')&&(typeof this[i] === 'function'))
			{
				result = result + '<input type="button" value="' + i + '" onclick="CallAJAXFunction(\'' + i + '\',{\'form\':true});" /><br />';
			}
		}
		this.response.end(result);
	},
	'ajax': function(obj)
	{
		this.init(obj);
		var stillOpen = false;
		var mod = this;
			if(this.request.method.toUpperCase() === 'GET')
			{
				data = 'You must use POST with the AJAX command!';
			}
			else if(this.request.method.toUpperCase() === 'POST')
			{
				var post = '';
				stillOpen = true;
				this.request.on('data', function(d)
                {
					post = post + d;
				});
				this.request.on('end', function(){
					var param = qs.parse(post);
					if('action' in param)
					{
						if(param['action'] in mod)
						{
							obj.params = param;
							mod[param['action']](obj);
						}
						else
						{
							this.response.end('Unknown AJAX command: '+param['action']+'!');
						}
					}
					else
					{
						this.response.end('No AJAX command specified!');
					}
				});
			}
			else
			{
				data = 'Only POST or GET!';
			}
			if(stillOpen === false)
			{
				this.response.writeHead(200, {'Content-Type':'text/plain'});
				this.response.end(data);
			}
			return;
	},
	'loadMenu':function(obj)
	{
		require('./Router.js').init(obj);
		if('form' in require('./Router.js').params)
		{
			require('./Router.js').response.end('<input type="button" value="Load Menu" onclick="CallAJAXFunction(\'loadMenu\',{});" /><br/><br/><br/>');
		}
		else
		{
			menudb.loadMenu(function(result){require('./Router.js').response.end(result);});
		}
	},
	'loadCategory':function(obj)
	{
		var me = require('./Router.js');
		me.init(obj);
		if('form' in me.params)
		{
			me.response.end('<input type="number" id="categoryID" placeholder="Enter category id..." /><input type="button" value="Load Menu" onclick="CallAJAXFunction(\'loadCategory\',{\'id\':this.previousSibling.value});" /><br/><br/><br/>');
		}
		else
		{
			menudb.loadCategory(me.params['id'],function(result){me.response.end(JSON.stringify(result));});
		}
	},
	'register':function(obj)
	{
		this.init(obj);
		if('form' in this.params)
		{
			this.response.end('<form method="POST" enctype="application/x-www-form-urlencoded"><label>Name:</label><input id="name" type="text" name="name" value="" placeholder="Enter login..." /><br /><label>Password:</label><input id="password" type="text" name="password" value="" placeholder="Enter password..." /><br /><label>Verify password:</label><input id="confirmpassword" type="text" name="passwordVerify" value="" placeholder="Verify password..." /><br /><label>Email:</label><input id="email" type="text" name="email" value="" placeholder="Enter email..."/><br /><input type="button" value="accept" onclick="CallAJAXFunction(\'register\',{\'username\':document.getElementById(\'name\').value,\'password\':document.getElementById(\'password\').value,\'passwordVerify\':document.getElementById(\'confirmpassword\').value,\'email\':document.getElementById(\'email\').value});"/></form>');
		}
		else
		{
			var UserName = userDB.addUser(this.params['username'], this.params['password'], this.params['passwordVerify'], this.params['email']);
			this.response.end('Success! User '+UserName+' was added.');
		}
	},
	'add':function(obj)
	{
		require('./Router.js').init(obj);
		require('./Router.js').response.writeHead(200, {'Content-Type':'text/html'});
		require('./Router.js').response.write('<form method="POST" enctype="application/x-www-form-urlencoded"><label>itemName:</label><input id="itemName" type="text" name="itemName" value="" placeholder="Enter itemName ..." /><br /><label>itemDescription:</label><input id="itemDescription" type="text" name="itemDescription" value="" placeholder="Enter itemDescription..." /><br /><label>itemCategory:</label><input id="itemCategory" type="text" name="itemCategory" value="" placeholder="Enter itemCategory..." /><br /><input type="button" value="add" onclick="CallAJAXFunction(\'add\',{\'itemName\':document.getElementById(\'itemName\').value,\'itemDescription\':document.getElementById(\'itemDescription\').value,\'itemCategory\':document.getElementById(\'itemCategory\').value});"/></form>');
		if(('itemName' in require('./Router.js').params)&&('itemDescription' in require('./Router.js').params)&&('itemCategory' in require('./Router.js').params))
		{
			menudb.saveItem(require('./Router.js').params['itemName'], require('./Router.js').params['itemDescription'], require('./Router.js').params['itemCategory'],function(result){require('./Router.js').response.end(JSON.stringify(result));});
		}
		else if('form' in require('./Router.js').params)
		{
			require('./Router.js').response.end();
		}
	},
	'loadMenuByCat':function(obj)
	{
		require('./Router.js').init(obj);
		if('form' in require('./Router.js').params)
		{
			require('./Router.js').response.end('<form method="POST" enctype="application/x-www-form-urlencoded"><label>Category:</label><input id="cat" type="text" name="categoryName" value="" placeholder="Enter category ..." /><br /><input type="button" value="Load Menu by Category" onclick="CallAJAXFunction(\'loadMenuByCat\',{\'categoryName\':document.getElementById(\'cat\').value});" /></form>');
		}
		else
		{
			menudb.loadMenuByCat(require('./Router.js').params['categoryName'],function(result){require('./Router.js').response.end(JSON.stringify(result));});
		}
	},
	'login':function(obj)
	{
		this.init(obj);
		mod = require('./Router.js');
		if('form' in this.params)
		{
			mod.response.end('<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Login</title></head><body><form action="/login/" method="POST" enctype="application/x-www-form-urlencoded"><label>Username:</label><input type="text" id="username" name="name" value="" placeholder="Enter your username..." /><br /><label>Password:</label><input type="text" name="password" value="" placeholder="Enter your password..." id="password" /><br /><br /><input type="button" value="Login" onclick="CallAJAXFunction(\'login\',{\'name\':document.getElementById(\'username\').value,\'password\':document.getElementById(\'password\').value});" /></form></body></html>');
		}
		else if(('action' in this.params)&&('name' in this.params)&&('password' in this.params))
		{
			var userID = cookieDB.login(this.cookie, this.params['name'], this.params['password']);
			this.response.end('<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Login</title></head><body><span>USER ID-</span>'+userID+'<br/><input type="button" value="Log out" onclick="CallAJAXFunction(\'logout\',{});"/></body></html>');
		}
		else if(this.request.method.toUpperCase() === 'GET')
		{
			var param = this.request.url.substring(8).split('/');
			if(param.length === 2)
			{
				var userName = decodeURIComponent(param[0]);
				var userPassword = decodeURIComponent(param[1]);
				var userID = cookieDB.login(this.cookie, userName, userPassword);
				switch(userID)
				{
					case -1:
						this.response.end('Error logging in!');
						break;
					default:
						this.response.end('<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Login</title></head><body><span>USER ID-</span>'+userID+'<br/><input type="button" value="Log out" onclick="CallLogoutFunction()"/></body></html>');
						break;
				}
			}
			else
			{
				this.response.end('<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Login</title></head><body><form action="/login/" method="POST" enctype="application/x-www-form-urlencoded"><label>Username:</label><input type="text" name="username" value="" placeholder="Enter your username..." /><br /><label>Password:</label><input type="text" name="password" value="" placeholder="Enter your password..." /><br /><br /><input type="submit" value="Login" /></form></body></html>');
			}
		}
		else if(this.request.method.toUpperCase() === 'POST')
		{
			var post = '';
			var mod = this;
			mod.request.on('data', function (d)
			{
				post = post + d;
			});
			mod.request.on('end', function ()
			{
				console.log(post);
				if('form' in mod.params)
				{
					mod.response.end('<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Login</title></head><body><form action="/login/" method="POST" enctype="application/x-www-form-urlencoded"><label>Username:</label><input type="text" name="username" value="" placeholder="Enter your username..." /><br /><label>Password:</label><input type="text" name="password" value="" placeholder="Enter your password..." /><br /><br /><input type="submit" value="Login" /></form></body></html>');
				}
				else
				{
					var param = qs.parse(post);
					var userID = cookieDB.login(mod.cookie, param['name'], param['password']);
					mod.response.end('<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Login</title></head><body><span>USER ID-</span>'+userID+'<br/><input type="button" value="Log out" onclick="CallAJAXFunction(\'logout\',{})"/></body></html>');
				}
			});
		}
		else
		{
			this.response.end('Take it easy man!');
		}
	},

	'logout':function(obj)
	{
		this.init(obj);
		cookieDB.logOut(this.cookie);
		this.response.end('you logged out');
	},
	'deleteUser':function (obj)
	{
		this.init(obj);
		if('form' in this.params)
		{
			this.response.end('<form method="POST"  enctype="application/x-www-form-urlencoded" action="/deleteUser/"><label>Delete</label><input id="name" type="text" value="" placeholder="Enter user"><input type="button" value="delete" onclick="CallAJAXFunction(\'deleteUser\',{\'userID\':document.getElementById(\'name\').value})"></form>');
		}
		else
		{
			if(userDB.deleteUser(this.params['userID']) === true)
			{
				this.response.end('You deleted '+ this.params['userID'] +'!');
			}
			else
			{
				this.response.end('There\'s no such user!');
			}
		}
	},
	'search': function(obj)
	{
		this.init(obj);
		if('form' in this.params)
		{
			this.response.end('<form method="POST"><label>Search</label><input onkeyup="search(event);" id="name" autocomplete="off" type="text" value="" placeholder="Fill in the blank..."><div id="suggestions"></div></form>');
		}
		else
		{
				this.response.end(userDB.searchUserByName(this.params['searchStr']).join('<br>'));
		}
	}
	
};