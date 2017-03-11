var userDB = 'JSON_user.json';
var RutoEn = 'JSON_RUtoEN.json';
var cacheDB = require('./cacheDB.js');
module.exports = {
	users:false,
	time:Math.random(),
    initializeUserDatabase: function ()
	{
		console.log('Syncing database to file system...');
		var fs = require('fs');
		if(fs.existsSync(userDB))
		{
			this.users = JSON.parse(require('fs').readFileSync(userDB, 'utf8'));
			return true;
		}
		else
		{
			this.users = {};
			return false;
		}
	},
    
    loadUsers: function()
	{
		return JSON.parse(require('fs').readFileSync(userDB, 'utf8'));
	},
    
	saveUsers: function(users)
	{
		return require('fs').writeFileSync(userDB,JSON.stringify(users));
	},
    asyncSaveUsers: function(users)
	{
		return require('fs').writeFile(userDB,JSON.stringify(users));
	},
	nextUserID: function()
	{
		var id = 0;
		for(var i in this.users)
		{
			if(parseInt(this.users[i].id) > id)
			{
				id = parseInt(this.users[i].id);
			}
		}
		return id + 1;
	},
	userExistsByUserName: function (userName)
	{
		if(!userName||(userName.length < 1)) return false;
		for(var i in this.users)
		{
			if(this.users[i].username.toLowerCase() === userName.toLowerCase())
			{
				return true;
			}
		}
		return false;
	},
	matchByFragmentRegExp: function(name, fragment)
	{
		var r = new RegExp(fragment,'i');
		return r.test(name);
	},
	matchByFragment: function (name, fragment) {
		var j = 0;
		for (var i = 0; i < name.length; i = i +1)
		{
			if(name[i] === fragment[j])
			{
				j = j + 1;
			}
			else
			{
				j = 0;
			}
			if(j === fragment.length - 1)
			{
				return true;
			}
			
		}
		return false;
	},
	searchUserByName: function (name)
	{
		var array = [];
		if(/^([1-9]+[0-9]*)|0$/.test(name))
		{
			console.log(name);
			var user = this.findUserByID(name);
			if(user < 0)
			{
			}
			else
			{
				array.push(user.username);
			}
		}
		else
		{
			for(var i in this.users)
			{
				if(this.matchByFragmentRegExp(this.users[i].username, name))
				{
					array.push(this.users[i].username);
				}
			}
		}
		return array;
		
		
		//var array = [];
		//if((name === undefined)||(name.length < 1))
		//{
			//return array;
		//}
		//for(var i in users)
		//{
			//if((users[i].username[0] !== undefined)&&(users[i].username[0].toLowerCase() === //name[0].toLowerCase()))
			//{
				//array.push(users[i].username);
			//}
		//}
		//return array;
	},
	findUserByName: function (userName)
	{
		if(!userName||(userName.length < 1)) return false;
		for(var i in this.users)
		{
			if(this.users[i].username.toLowerCase() === userName.toLowerCase())
			{
				return this.users[i];
			}
		}
		return false;
	},
	findUserByID: function (userID)
	{
		if(/^([1-9]+[0-9]*)|0$/.test(userID))
		{
			if(userID in this.users)
			{
				return this.users[userID];
			}
			else
			{
				return -1;
			}
		}
		else
		{
			return -2;
		}
	},
	verifyUserPassword: function (userName, userPassword)
	{
		var user = this.findUserByName(userName);console.log(JSON.stringify(user));
		if((user !== false)&&(user['username'].toLowerCase() === userName.toLowerCase())&&(user['password'] === userPassword))
		{
			return true;
		}
		else
		{
			return false;
		}
	},
    addUser: function (username, userPassword, userPassVerify, userEmail)
	{
		var id = this.nextUserID();
		var fio;
		
		if(this.userExistsByUserName(username) === false)
		{  
			var userName = username.replace(/./gi, this.replaceRuToEnCallback);
			console.log(userName);
			
			fio=/^(([A-Z]{1}[a-z-]{1,256}\s){1}([A-Z]{1}[a-z-]{1,256}\s){1}((uulu)|(kyzy)))|(([A-Z]{1}[a-z-]{1,256}\s){1}((uulu)|(kyzy))(\s[A-Z]{1}[a-z-]{1,256}){1})|(([A-Z]{1}[a-z-]{1,256}){1}(\s[A-Z]{1}[a-z-]{0,256}){0,2})$/;
			if (fio.test(userName))
			{
				if(/[a-z0-9\.-_]{1,256}@{1}([a-z-0-9]{1,63}\.)+[a-z]{1,63}/i.test(userEmail))
				{
					var match = fio.exec(userName);
					console.log(match);
					userName = userName.replace(/\s/gi,'');
					
					console.log(userName);
					var user = {'id':id, 'username':userName, 'password':userPassword, 'passwordVerify':userPassVerify, 'email':userEmail, 'type':'standard'};
					if(match[4] !== undefined)
					{
						user['firstname'] = match[2];
						user['patronym'] = match[3];
						if(match[4] === 'uulu')
						{
							user['gender'] = 'M';
						}
						else if(match[4] === 'kyzy')
						{
							user['gender'] = 'F';
						}
						else
						{
							user['gender'] = 'alien';
						}
					}
					if(match[9] !== undefined)
					{
						user['firstname'] = match[12];
						user['patronym'] = match[8];
						if(match[9] === 'uulu')
						{
							user['gender'] = 'M';
						}
						else if(match[9] === 'kyzy')
						{
							user['gender'] = 'F';
						}
						else
						{
							user['gender'] = 'alien';
						}
					}
					this.users[id] = user;
						if (userPassword === userPassVerify) 
							{
								return id;
							}
							
						else 
							{
								return "WRONG VERIFIED PASSWORD";
							}
				}
				else
				{
					return 'incorrect email'; 
				}
			}
			else
			{
				return 'Incorrect username';
			}
		}
		else
		{
			return -1;
		}
	},
	//latin: 41-5a 61-7a
	//cyrillic: 410-44f
	 replaceRuToEnByCodeCallback: function (match)
	 {
		var startCyrillic = parseInt('410',16);
		var endCyrillic = parseInt('44f',16);
		var startLatin = parseInt('41',16);
		var endLatin = parseInt('7a',16);
		var code = match.charCodeAt(0);
		if(startCyrillic <= code <= endCyrillic)
		{
			return String.fromCharCode(code - startCyrillic + startLatin);
		}
		else
		{
			return '';
		}
	 },
	 replaceRuToEnCallback: function (match)
	 {
		 var cacheDB = require('./cacheDB.js');
		 cacheDB.init();
		 var symbolsRuToEn = cacheDB.getDatabase('dictRu2En');
		 console.log(match);
		 if(match in symbolsRuToEn)
		 {
			 return symbolsRuToEn[match];
		 }
		 else
		 {
			 return '';
		 }
	},
	replaceRutoEn: function (match)
	{
		if (match[0] in this.symbolsRuToEn)
		{
			var str=''; 
			for (var i = 0; i < match.length; i = i + 1) 
			{
				if (match[i] in this.symbolsRuToEn) 
				{
					str= str + this.symbolsRuToEn[match[i]];
				}
			}
			return str;
		}
		else 
		{
			return false;
		}
	},
	
	deleteUser: function (userID)
	{
		if(userID in this.users)
		{
			delete(this.users[userID]);
			return true;
		}
		else
		{ 
			return false;
		}
	}
}