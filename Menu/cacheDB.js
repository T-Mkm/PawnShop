var fs = require('fs');

module.exports = {
	init: function()
	{
		this.dictRu2En = JSON.parse(fs.readFileSync('JSON_RUtoEN.json', 'utf8'));
		this.cookieDB = JSON.parse(fs.readFileSync('JSON_cookie.json', 'utf8'));
		this.userDB = JSON.parse(fs.readFileSync('JSON_user.json', 'utf8'));
		this.menuDB = JSON.parse(fs.readFileSync('JSON_menu.json', 'utf8'));
		this.categoriesDB = JSON.parse(fs.readFileSync('JSON_categories.json', 'utf8'));
	},
	getDatabase: function(database)
	{
			return this[database];
	}
}