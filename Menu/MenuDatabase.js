var fname = 'JSONmenu.lock';
var items = {};
module.exports = {
	cache:{},
	cacheRatios:{},
	cachedItems:{},
	cachedItemsRatios:{},
    initializeMenu: function ()
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
		connection.query('CREATE TABLE IF NOT EXISTS `items`(`ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `name` VARCHAR(255) NOT NULL UNIQUE, `category` INT NOT NULL, `description` TEXT);');
		connection.query('SELECT * FROM `items` LIMIT 0,10;',function(error, rows, fields)
		{
			require('./MenuDatabase.js').cache = {};
			if(rows.length > 0)
			{
				for(var i in rows)
				{
					require('./MenuDatabase.js').cachedItems[rows[i].ID] = rows[i].name;
					require('./MenuDatabase.js').cachedItemsRatios[rows[i].ID] = {'hit':0,'miss':0};
				}
			}
			connection.end();
		});
	},
	initializeMenuFS: function()
	{
		var fs = require('fs');
		if(fs.existsSync('JSON_menu.json'))
		{
			items = JSON.parse(fs.readFileSync('JSON_menu.json'));
			return true;
		}
		else
		{
			items = [];
			return false;
		}
	},
    initializeCategories: function()
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
		connection.query('CREATE TABLE IF NOT EXISTS `categories`(`ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `name` VARCHAR(255) UNIQUE NOT NULL);');
		connection.query('SELECT * FROM `categories` LIMIT 0,10;',function(error, rows, fields)
		{
			require('./MenuDatabase.js').cache = {};
			for(var i in rows)
			{
				require('./MenuDatabase.js').cache[rows[i].ID] = rows[i].name;
				require('./MenuDatabase.js').cacheRatios[rows[i].ID] = {'hit':0,'miss':0};
			}
			connection.end();
		});
	},
    initializeCategoriesFS: function()
    {
        var fs = require('fs');
        if (fs.existsSync('JSON_categories.json'))
        {
			categories = JSON.parse(fs.readFileSync('JSON_categories.json'));
            return true;
        }
        else
		{
			categories = [];
			/*fs.writeFileSync('JSON_categories.json','[]');*/
			return false;
		}
    
    },
	saveItem: function (itemName, itemDescription, itemCategory, onComplete)
	{
		require('./MenuDatabase.js').addCategory(itemCategory,function(catID)
		{
			if(catID > 0)
			{
				var mysql = require('mysql');
				var connection = mysql.createConnection({
					'host':'localhost',
					'port':3306,
					'user':'itacademy',
					'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
					'database':'itacademy'
				});
				//while(!require('./MenuDatabase.js').lock());
				connection.connect(function(error){});
				connection.query('INSERT INTO `items`(`name`,`description`,`category`) VALUES("' + itemName.replace('"','\"') + '","' + itemDescription.replace('"','\"') + '",' + parseInt(catID) + ');',function(error, rows, fields)
				{
					connection.query('SELECT LAST_INSERT_ID() AS `ID`;',function(error, rows, fields)
					{
						var result = rows[0].ID;
						connection.end();
						//require('./MenuDatabase.js').unlock();
						onComplete(result);
					});
				});
			}
			else
			{
				require('./MenuDatabase.js').getCategory(itemCategory,function(cat)
				{
					if(cat.id > 0)
					{
						var mysql = require('mysql');
						var connection = mysql.createConnection({
							'host':'localhost',
							'port':3306,
							'user':'itacademy',
							'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
							'database':'itacademy'
						});
						//while(!require('./MenuDatabase.js').lock());
						connection.connect(function(error){});
						connection.query('INSERT INTO `items`(`name`,`description`,`category`) VALUES("' + itemName.replace('"','\"') + '","' + itemDescription.replace('"','\"') + '",' + parseInt(cat.id) + ');',function(error, rows, fields)
						{
							if(error)
							{
								onComplete(-2);
							}
							else
							{
								connection.query('SELECT LAST_INSERT_ID() AS `ID`;',function(error, rows, fields)
								{
									var result = rows[0].ID;
									connection.end();
									//require('./MenuDatabase.js').unlock();
									onComplete(result);
								});
							}
						});
					}
					else
					{
						onComplete(-3);
					}
				});
			}
		});
	},
    saveItemFS: function (itemName, itemDescription, itemCategory) //ADDED CODE PARAMETER
	{
		var fs = require('fs');
		//var data = fs.readFileSync('JSON_menu.json', 'utf8');
		var id;
       // var items;
		var addCat = this.addCategory(itemCategory);
		if(addCat < 0){
			return -5;
		}
		try
		{
			//items = JSON.parse(data);
			id = items.length;
			for(var i=0; i < items.length;i=i+1){
				if(items[i].itemName === itemName){
					return -2;
				}
			}
			items.push({'id':id, 'itemName':itemName, 'itemDescription':itemDescription, 'itemCategory':addCat}); //CODE IS ADDED TO OBJECT
			if(this.lock()){
			fs.writeFileSync('JSON_menu.json',JSON.stringify(items));
			}else{
			 while(!this.lock());
			 fs.writeFileSync('JSON_menu.json',JSON.stringify(items));
			}		
			this.unlock();
			return id;
		}
		catch(e)
		{
			return -3;
		}

	},
	loadMenu: function(onComplete)
	{
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			'host':'localhost',
			'port':3306,
			'user':'itacademy',
			'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
			'database':'itacademy'
		});
		//while(!require('./MenuDatabase.js').lock());
		connection.connect(function(error){});
		connection.query('SELECT * FROM `items`;',function(error, rows, fields)
		{
			var result = {};
			for(var i in rows)
			{
				result[rows[i].ID] = rows[i];
			}
			connection.end();
			//require('./MenuDatabase.js').unlock();
			onComplete(result);
		});
	},
    loadMenuFS: function ()
	{
		var fs = require('fs');
		var items = fs.readFileSync('JSON_menu.json', 'utf8'); 
		//var itemsParsed = JSON.stringify(data);
       // return itemsParsed;
	},
	addCategory: function (categoryName, onComplete)
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
		//while(!require('./MenuDatabase.js').lock()){};
		connection.query('INSERT INTO `categories`(`name`) VALUES("' + categoryName.replace('"','\"') + '");',function(error, rows, fields)
		{
			if(error)
			{
				onComplete(-1);
			}
			else
			{
				connection.query('SELECT LAST_INSERT_ID() AS `id`;',function(error, rows, fields)
				{
					connection.end();
					onComplete(rows[0]['id']);
				});
				//require('./MenuDatabase.js').unlock();
			}
		});
	},
	addCategoryFS: function(categoryName)
	{
//		if(this.checkDuplicateUserName(name) >= 0)
//		{
//			return -2;
//		}
        var categories;
        var id;
		try
		{
			var fs = require('fs');
			var categories = fs.readFileSync('JSON_categories.json', 'utf8');
            categories = JSON.parse(data);
			for (var i =0; i<categories.length; i=i+1){
				if(categories[i].name === categoryName){
					return -1;
				}
				
			}
            id = categories.length; 
			categories.push({'id': id, 'name': categoryName});
				if(this.lock()){
						fs.writeFileSync('JSON_categories.json',JSON.stringify(categories));
				}
				else
				{
					while(!this.lock());
						fs.writeFileSync('JSON_categories.json',JSON.stringify(categories));
				}
				this.unlock();	
			//fs.writeFileSync('JSON_categories.json', JSON.stringify(categories));
			return id;
		
        }
            
		catch(e)
		{
			return -1;
		}
	},
	getCategory: function (categoryName, onComplete)
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
		connection.query('SELECT `name`,`ID` FROM `categories` WHERE `name`="' + categoryName.replace('"','\"') + '";',function(error, rows,fields)
		{
			if(rows.length > 0)
			{
				var result = {'id': rows[0].ID, 'name': rows[0].name};
				require('./MenuDatabase.js').replaceCache(result);
				connection.end();
				onComplete(result);
			}
		});
	},
    loadCategory: function (id, onComplete)
	{
		var me = require('./MenuDatabase.js');
		console.log(JSON.stringify(me.cacheRatios));
		console.log(JSON.stringify(me.cache));
		if(id in me.cache)
		{
			require('./MenuDatabase.js').cacheHit(id);
			onComplete({'id':id,'name':me.cache[id]});
		}
		else
		{
			require('./MenuDatabase.js').cacheMiss(id);
			var mysql = require('mysql');
			var connection = mysql.createConnection({
				'host':'localhost',
				'port':3306,
				'user':'itacademy',
				'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
				'database':'itacademy'
			});
			connection.connect(function(error){});
			connection.query('SELECT `name`,`ID` FROM `categories` WHERE `ID`=' + parseInt(id) + ';',function(error, rows,fields)
			{
				var result = {'id': rows[0].ID, 'name': rows[0].name};
				require('./MenuDatabase.js').replaceCache(result);
				connection.end();
				onComplete(result);
			});
		}
	},
	cacheHit: function (id)
	{
		var me = require('./MenuDatabase.js');
		if(id in me.cacheRatios)
		{
			me.cacheRatios[id].hit = me.cacheRatios[id].hit + 1;
		}
		else
		{
			me.cacheRatios[id] = {'hit':1, 'miss':0};
		}
	},
	cacheMiss: function (id)
	{
		var me = require('./MenuDatabase.js');
		if(id in me.cacheRatios)
		{
			me.cacheRatios[id].miss = me.cacheRatios[id].miss + 1;
		}
		else
		{
			me.cacheRatios[id] = {'hit':0, 'miss':1};
		}
	},
	replaceCache: function (entry)
	{
		var me = require('./MenuDatabase.js');
		var ratio;
		var current;
		if(entry.id in me.cacheRatios)
		{
			if(me.cacheRatios[entry.id]['miss'] == 0)
			{
				current = me.cacheRatios[entry.id]['hit'];
			}
			else
			{
				current = me.cacheRatios[entry.id]['hit']/me.cacheRatios[entry.id]['miss'];
			}
		}
		else
		{
			current = 1;
		}
		for(var i in me.cacheRatios)
		{
			if(me.cacheRatios[i]['miss'] == 0)
			{
				ratio = me.cacheRatios[i]['hit'];
			}
			else
			{
				ratio = me.cacheRatios[i]['hit']/me.cacheRatios[i]['miss'];
			}
			if((current >= ratio)&&(i != entry.id))
			{
				delete me.cache[i];
				me.cache[entry.id] = entry.name;
				break;
			}
		}
	},
	loadMenuByCat: function (categoryName, onComplete)
	{
		var mysql = require('mysql');
		var connection = mysql.createConnection({
			'host':'localhost',
			'port':3306,
			'user':'itacademy',
			'password':'IKanHazT3h!nnarNATP7z?KThx8a1',
			'database':'itacademy'
		});
		//while(!require('./MenuDatabase.js').lock());
		connection.connect(function(error){});
		connection.query('SELECT `items`.`name` AS `name`, `items`.`description` AS `description`, `items`.`ID` AS `ID` FROM `items` LEFT JOIN `categories` ON `categories`.`ID`=`items`.`category` WHERE `categories`.`name`="' + categoryName.replace('"','\"') + ';',function(error, rows, fields)
		{
			var result = {};
			for(var i in rows)
			{
				result[rows[i].ID] = rows[i];
			}
			connection.end();
			//require('./MenuDatabase.js').unlock();
			onComplete(result);
		});
	},
    loadMenuByCatFS: function (categoryNameToListItems)
	{
		//var fs = require('fs');
		//var items = fs.readFileSync('JSON_menu.json', 'utf8'); 
		//var itemsParsed = JSON.parse(data);
        
        for (var i=0; i < items.length; i = i+1) {
            if (items[i].itemCategory === categoryNameToListItems)
            {
                 return items[i];
            }
        }
        return items[i];
	},
	cleanDataBase: function (itemName){
		var novaia_korobka = [];
		//var fs = require('fs');
		//var data = fs.readFileSync('JSON_menu.json', 'utf8');
		//var itemsParsed = JSON.parse(data);
		var pervyi_mandm = false;
		for(var i=0; i < items.length; i = i+1){
			if (items[i].itemName !== itemName) 
			{
				
				novaia_korobka.push(items[i]);
			}
			else
			{
				if (pervyi_mandm==false) {
					novaia_korobka.push(items[i]);
					pervyi_mandm=true;
				}
			}
		}
		fs.writeFileSync('JSON_menu.json', JSON.stringify(novaia_korobka));
	},

	canary: 0,
	
	unlock: function()
	{
		var fs = require('fs');
		if(fs.existsSync(fname))
		{
			if(require('./Router.js').canary === 0)
			{
				return false;
			}
			else if(require('./Router.js').canary === parseInt(fs.readFileSync(fname)))
			{	
				require('./Router.js').canary = 0;
				fs.unlinkSync(fname);
				return true;
			}
			else
			{	
				console.log('Locked');
				return false;
			}
		}
		else
		{
			return true;
		}
	},	
		
	lock: function()
	{	
		var fs = require('fs');
		if(fs.existsSync(fname))
		{
			return false;
		}	
		else
		{
			require('./Router.js').canary = Date.now();
			fs.writeFileSync('JSONmenu.lock', require('./Router.js').canary);
			return true;
		}	
	}
}		