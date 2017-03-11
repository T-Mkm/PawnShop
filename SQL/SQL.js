var defaultUserValues = {'gender':'"U"','status':'0','type':'"U"'};
var defaultCategoryValues = {};
var oldUsersDB = JSON.parse(require('fs').readFileSync('../Menu/JSON_user.json'));
var oldCategoriesDB = JSON.parse(require('fs').readFileSync('../Menu/JSON_categories.json'));
var allowedUserProperties = {'username':'username','id':'id','password':'password','lastname':'surname','firstname':'firstname','patronym':'patronym','email':'email','status':'status','type':'type','gender':'gender'};
var allowedCategoryProperties = {'name':'name','id':'ID'};
function cleanVariable(v, field, defaults)
{
	if((field == undefined)||!(field in v)||(v[field] == 'null')||(v[field] == 'undefined')||(v[field] == undefined)||(v[field] == null)||(v[field] == false))
	{
		if(field in defaults)
		{
			return defaults[field];
		}
		else
		{
			return 'NULL';
		}
	}
	else
	{
		if(field === 'type')
		{
			if(/^Admin$/gi.test(v[field]))
			{
				return '"A"';
			}
			else
			{
				return '"U"';
			}
		}
		else if(field === 'username')
		{
			var u = v[field].split(/\s+/);
			if(u.length > 0)
			{
				v.firstname = u[0];
				if(u.length === 3)
				{
					v.patronym = u[2];
				}
				else
				{
					v.patronym = u[1]
				}
				return '"'+v[field].replace(/\s+/gi,'')+'"';
			}
			else
			{
				return '"'+v[field]+'"';
			}
		}
		else
		{
			if(typeof(v[field]) === 'number')
			{
				return ''+v[field];
			}
			else
			{
				if(/^-?[1-9]+[0-9]*\.*[0-9]*$/.test(v[field]))
				{
					return ''+parseFloat(v[field]);
				}
				else
				{
					return '"'+v[field]+'"';
				}
			}
		}
	}
}
function callbackUpdateSQL(error, rows, fields)
{
	if(error)
	{
		console.log('Error updating entry: ' + error);
	}
}
var mysql = require('mysql');
var connection = mysql.createConnection(
{
	'host':'localhost',
	'port':3306,
	'user':'itacademy',
	'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
	'database':'itacademy'
});
connection.connect(function(error)
{
	if(!error)
	{
		console.log('Database is connected.');
	}
	else
	{
		console.log('Database connection: ' + error + '.');
	}
});
connection.query('CREATE TABLE IF NOT EXISTS `users`(`ID` int PRIMARY KEY NOT NULL AUTO_INCREMENT, `status` TINYINT(1) NOT NULL DEFAULT 0, `type` CHAR(1) NOT NULL DEFAULT \'U\', `username` VARCHAR(255) NOT NULL UNIQUE, `email` VARCHAR(255) NOT NULL UNIQUE, `password` VARCHAR(255) NOT NULL, `firstname` VARCHAR(255) NULL DEFAULT NULL, `surname` VARCHAR(255) NULL DEFAULT NULL, `patronym` VARCHAR(255) NULL DEFAULT NULL, `gender` CHAR(1) NOT NULL DEFAULT \'U\');',function(error, rows, fields){if(error){console.log(error);}});
connection.query('CREATE TABLE IF NOT EXISTS `categories`(`ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `name` VARCHAR(255) UNIQUE NOT NULL);');
function updateUser(user)
{
	var query = 'UPDATE users SET ';
	var j = 0;
	var where = '';
	for(var i in allowedUserProperties)
	{
		if(i !== 'id')
		{
			if(j === 0)
			{
				query = query + '`' + allowedUserProperties[i] + '`=' + cleanVariable(user,i,defaultUserValues);
			}
			else
			{
				query = query + ',`' + allowedUserProperties[i] + '`=' + cleanVariable(user,i,defaultUserValues);
			}
			++j;
		}
		else
		{
			where = ' WHERE `id`=' + parseInt(user[i]);
		}
	}
	connection.query(query+where,callbackUpdateSQL);
}
function updateCategory(category)
{
	var query = 'UPDATE `categories` SET ';
	var j = 0;
	var where = '';
	for(var i in allowedCategoryProperties)
	{
		if(i !== 'id')
		{
			if(j === 0)
			{
				query = query + '`' + allowedCategoryProperties[i] + '`=' + cleanVariable(category,i,defaultCategoryValues);
			}
			else
			{
				query = query + ',`' + allowedCategoryProperties[i] + '`=' + cleanVariable(category,i,defaultCategoryValues);
			}
			++j;
		}
		else
		{
			where = ' WHERE `id`=' + parseInt(category[i]);
		}
	}
	connection.query(query+where,callbackUpdateSQL);
}
function insertUser(user)
{
	var query = 'INSERT INTO users(';
	var values = ') VALUES(';
	var j = 0;
	for(var i in allowedUserProperties)
	{
		if(j === 0)
		{
			query = query + '`' + allowedUserProperties[i] + '`';
			values = values + cleanVariable(user,i,defaultUserValues);
		}
		else
		{
			query = query + ',`' + allowedUserProperties[i] + '`';
			values = values + ',' + cleanVariable(user,i,defaultUserValues);
		}
		++j;
	}
	values = values + ');';
	connection.query(query+values,(function(u)
	{
		return function (error, rows, fields)
		{
			if(error)
			{
				if(error['errno'] === 1062)
				{
					updateUser(u);
				}
				else if(error['errno'] === 1048)
				{
					u['username'] = '' + u['id'];
					updateUser(u);
				}
				else
				{
					console.log('Error inserting user ' + JSON.stringify(u));
				}
			}
			else
			{
				console.log('Inserted user ' + JSON.stringify(u) + ' successfully!');
			}
		}
	})(user));
}
function insertCategory(category)
{
	var query = 'INSERT INTO `categories`(';
	var values = ') VALUES(';
	var j = 0;
	for(var i in allowedCategoryProperties)
	{
		if(j === 0)
		{
			query = query + '`' + allowedCategoryProperties[i] + '`';
			values = values + cleanVariable(category,i,defaultCategoryValues);
		}
		else
		{
			query = query + ',`' + allowedCategoryProperties[i] + '`';
			values = values + ',' + cleanVariable(category,i,defaultCategoryValues);
		}
		++j;
	}
	values = values + ');';
	connection.query(query+values,(function(c)
	{
		return function (error, rows, fields)
		{
			if(error)
			{
				if(error['errno'] === 1062)
				{
					updateCategory(c);
				}
				else if(error['errno'] === 1048)
				{
					c['name'] = '' + c['id'];
					updateCategory(c);
				}
				else
				{
					console.log('Error inserting category ' + JSON.stringify(c));
				}
			}
			else
			{
				console.log('Inserted category ' + JSON.stringify(c) + ' successfully!');
			}
		}
	})(category));
}
for(var u in oldUsersDB)
{
	insertUser(oldUsersDB[u]);
}
for(var c in oldCategoriesDB)
{
	insertCategory(oldCategoriesDB[c]);
}
connection.query('SELECT * FROM users;',function(error, rows, fields)
{
	for(var i in rows)
	{
		console.log(rows[i].username);
	}
	connection.end();
});
/*
For Islam:
sudo apk-get install mariadb-server
service mysql start
For NPM:
npm install mysql
For MAC:
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew install mariadb
Wi-Fi password:
IKanHazT3h!nnarNATP7z?KThx8a1
*/