'use strict';
(function(){

	UTILS.ajax(location + '/data/config.json', {
		done: function(response) {
			if(response){
				template(Handlebars, response);
				main(response.notification);
			}
		},
		fail: function(err){
			// UTILS.console.log(err);
			alert('error - data was not loaded or recieved from server');
		}
	});
})();