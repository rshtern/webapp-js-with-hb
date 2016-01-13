'use strict';
function template(Handlebars, data){
		var quickActions = data.quickActions,
			tabsList = data.tabsList,
			place = 3,
			tabData = [
					{
						'name': 'qr',
						'id': 'quick-reports',
						'frame': '1',
						'describe': 'quickReports',
						'url': '', // or taken from json
						'popup': []						
					},
					{
						'id': 'fmy-folders',
						'frame': '2',
						'describe': 'myFolders',
						'url': '' // or taken from json
					},
					{
						'name': 'mtf',
						'id': 'my-team-folders',
						'frame': '3',
						'describe': 'myTeamFolders',
						'url': '', // or taken from json
						'popup': []
					},
					{
						'name': '',
						'id': 'public-folders',
						'frame': '4',
						'describe': 'publicFolders',
						'url': '' // or taken from json
					}
			],
		 	navTemplate = document.querySelector("#nav-template").innerHTML,
			tabTemplate = document.querySelector("#tab-template").innerHTML,
			template = Handlebars.compile(navTemplate),
			result = template(quickActions);

		for(var i = 0; i<tabsList.length; i++){
			if(tabsList[i].options.url !== undefined){
				tabData[i].url = tabsList[i].options.url;
			}
		};
		for(var i =0; i<tabData.length; i++){
			if(tabData[i].popup){
				for(var j=0; j<place; j++){
					tabData[i].popup.push({
						'place': j+1,
						'id': tabData[i].name,
						'name': 'name',
						'url': 'url'
					})
				}
			}
		}

	 // nav template handlebar magic here
	document.querySelector('nav').innerHTML = result;
	//document.querySelector('#nav-template').removeChild();

	 // tab template handlebars magic here
	 template = Handlebars.compile(tabTemplate);
	 result = template(tabData);
	document.querySelector('.tabs').innerHTML = document.querySelector('.tabs').innerHTML + result;
	// document.querySelector('#tab-template').removeChild();

};
