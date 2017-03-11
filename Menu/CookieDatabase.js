var cookieDB = 'JSON_cookie.json';
var userDB = require('./UserDatabase.js');
var lockFile = 'JSON_cookie.lock';
module.exports = {
	//Код для вызова модуля
	cookies: {},
	canary: 0,
	lock: function ()
	{
		if(require('fs').existsSync(lockFile))
		{
			return false;
		}
		else
		{
			try
			{
				require('fs').writeFileSync(lockFile, Date.now()*Math.random());
				require('./CookieDatabase.js').canary = parseFloat(require('fs').writeFileSync(lockFile));
				return true;
			}
			catch(e)
			{
				self.canary = 0;
				return false;
			}
		}
	},
	unlock: function ()
	{
		if(require('fs').existsSync(lockFile))
		{
			if(require('./CookieDatabase.js').canary === 0)
			{
				return false;
			}
			else if(parseFloat(require('fs').readFileSync(lockFile)) === require('./CookieDatabase.js').canary)
			{
				require('./CookieDatabase.js').canary = 0;
				require('fs').unlink(lockFile);
				return true;
			}
			else
			{
				console.log('Process (' + require('fs').readFileSync(lockFile) + ') killed our canary (' + require('./CookieDatabase.js').canary + ').');
				return false;
			}
		}
		else
		{
			return true;
		}
	},
	initializeCookieDatabase: function ()
	{
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			'host':'localhost',
			'port':3306,
			'user':'itacademy',
			'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
			'database':'itacademy'
		});
		connection.connect(function(error){});
		connection.query('CREATE TABLE IF NOT EXISTS `cookies`(`cookie` VARCHAR(255) NOT NULL PRIMARY KEY, `issued` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, `user` INT NULL DEFAULT NULL);',function(error, rows, fields){connection.end();});
		return true;
	}, 
    initializeCookieDatabaseFS: function ()
	{
		if(this !== require('./CookieDatabase.js'))
		{
			console.log('Immutability failed!');
			process.exit();
		}
		console.log('Initializing cookie database.');
		var self = require('./CookieDatabase.js');
		self.canary = 0;
		var fs = require('fs');
		if(fs.existsSync(cookieDB))
		{
			self.cookies = self.loadCookies();
			self.saveCookies();
			return true;
		}
		else
		{
			self.cookies = {};
			self.saveCookies();
			return false;
		}
	},
    //Код выводит все куки на экран 
    loadCookiesFS: function()
	{
		var self = require('./CookieDatabase.js');
		while(!self.lock());
		var cookies = JSON.parse(require('fs').readFileSync(cookieDB, 'utf8'));
		self.unlock();
		return cookies;
	},
	loadCookies: function()
	{
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			'host':'localhost',
			'port':3306,
			'user':'itacademy',
			'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
			'database':'itacademy'
		});
		connection.connect(function(error){});
		var cookies = {};
		connection.query('SELECT * FROM cookies;',function(error, rows, fields)
		{
			for(var i in rows)
			{
				if(rows[i].user)
				{
					cookies[rows[i].cookie] = rows[i].user;
				}
				else
				{
					cookies[rows[i].cookie] = false;
				}
			}
		});
		return cookies;
	},
	saveCookies: function()
	{
		return false;
	},
    //Функция сохраняет куки в жейсон файле 
	saveCookiesFS: function()
	{
		var callback = function()
		{
			var self = require('./CookieDatabase.js');
			if(self.lock())
			{
				console.log('Saved cookies database: '+JSON.stringify(self.cookies));
				require('fs').writeFileSync(cookieDB, JSON.stringify(self.cookies));
				self.unlock();
				setTimeout(callback, 10);
				return true;
			}
			else
			{
				console.log('Failed to persist database, trying again in 100ms...');
				setTimeout(callback, 10);
				return false;
			}
		}
		setTimeout(callback, 10);
	},
    //Создание нового куки 
	generateCookie: function()
	{
		var cookie = '' + Date.now();
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			'host':'localhost',
			'port':3306,
			'user':'itacademy',
			'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
			'database':'itacademy'
		});
		connection.connect(function(error){});
		connection.query('INSERT INTO `cookies`(`cookie`) VALUES("' + cookie + '");',function(error, rows, fields){});
		return cookie;
	},
	generateCookieFS: function()
	{
		var cookie = '' + Date.now();
		require('./CookieDatabase.js').cookies[cookie] = false;
		return cookie;
	},
    //Поиск существующего куки
	cookieExistsFS: function (cookie)
	{
		var self = require('./CookieDatabase.js');
		for(var i in self.cookies)
		{
			if(i === cookie)
			{
				return true;
			}
		}
		return false;
	},
    cookieExists: function (cookie)
	{
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			'host':'localhost',
			'port':3306,
			'user':'itacademy',
			'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
			'database':'itacademy'
		});
		connection.connect(function(error){});
		var result = false;
		connection.query('SELECT * FROM `cookies` WHERE `cookie`="' + parseInt(cookie) + '";',function(error, rows, fields){
			for(var i in rows)
			{
				result = true;
				return;
			}
		});
		return result;
	},
	hasAccess: function (resource, cookie)
	{
		// incorrect since it is allowing anyone logged in to 
		// have access
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			'host':'localhost',
			'port':3306,
			'user':'itacademy',
			'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
			'database':'itacademy'
		});
		connection.connect(function(error){});
		var result = false;
		connection.query('SELECT * FROM `cookies` WHERE `cookie`="' + parseInt(cookie) + '";',function(error, rows, fields){
			for(var i in rows)
			{
				result = true;
				return;
			}
		});
		return result;
	},
	hasAccessFS: function (resource, cookie)
	{
		var self = require('./CookieDatabase.js');
		for(var i in self.cookies) 
		{
			if((i === cookie)&&(self.cookies[i] !== false)) //Если в массиве cookies есть параметр cookie и этот обьект не false, то есть разрешение в систему
			{
				return true;
			}
		}
		return false;
	},
    hasAccessToAddUsers: function (resource, userAdminID)
	{
		for(var i in userDB.users) 
		{
			if((i === userAdminID)&&(userDB.users[i].type === "Admin"))
			{
				return true;
			}
		}
		return false;
	},
    hasAccessToAddUsersFS: function (resource, userAdminID)
	{
		for(var i in userDB.users) 
		{
			if((i === userAdminID)&&(userDB.users[i].type === "Admin"))
			{
				return true;
			}
		}
		return false;
	},
    //Для логирования
	login: function (cookie, userName, userPassword)
	{
		console.log(userName + ':' + userPassword);
		if(userDB.verifyUserPassword(userName, userPassword) === true) //Используем функцию verifyUserPassword 
		{
			var userID = userDB.findUserByName(userName).id; //Берем айди 
			var mysql = require('mysql');
			var connection = mysql.createConnection({
				'host':'localhost',
				'port':3306,
				'user':'itacademy',
				'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
				'database':'itacademy'
			});
			connection.connect(function(error){});
			connection.query('UPDATE `cookies` SET `user`=' + parseInt(userID) + ' WHERE `cookie`="' + parseInt(cookie) + '";',function(error, rows, fields){});
			return true;
		}
		else
		{
			return false;
		}
	},
	loginFS: function (cookie, userName, userPassword)
	{
		if(userDB.verifyUserPassword(userName, userPassword) === true) //Используем функцию verifyUserPassword 
		{
			var userID = userDB.findUserByName(userName).id; //Берем айди 
			require('./CookieDatabase.js').cookies[cookie] = userID; //В value обьекта вписываем айди пользователя  
			return true;
		}
		else
		{
			return false;
		}
	},
	logOut: function (cookie)
	{
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			'host':'localhost',
			'port':3306,
			'user':'itacademy',
			'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
			'database':'itacademy'
		});
		connection.connect(function(error){});
		connection.query('UPDATE `cookies` SET `user`=NULL WHERE `cookie`="' + parseInt(cookie) + '";',function(error, rows, fields){});
		return true;
	},
    //Чтобы выйти из системы
	logOutFS: function (cookie)
	{
		require('./CookieDatabase.js').cookies[cookie] = false; //В value обьекта вписываем false
		return;
	}
}