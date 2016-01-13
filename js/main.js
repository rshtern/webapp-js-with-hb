'use strict';

function main(dataFromJSON){

	// --- global variables ---

	// ajax variables
	var notification = UTILS.selectOneElem('.notifications'),
		quickActions = {},
		tabsList = {},
		formSearch = UTILS.selectOneElem('form.search-box'),
		search = UTILS.selectOneElem('input[type="search"]'),
		message = '',
	// jsonContentToHTML variables
		nav = UTILS.selectOneElem('nav'), 
		navSection = UTILS.selectAllElem('.nav-section'),		
		iframes = UTILS.selectAllElem('iframe.frame'),
	// tabEvents and frameEvents variables
		tabs = UTILS.selectOneElem('.tabs'),
		buttons = UTILS.selectAllElem('.buttons li'),
		frames = UTILS.selectAllElem('[frame]'),
		re = /\#\S*/g, // select only the hash string from the '#'
		tabHash = '', 
	// url validation regular expression was taken from jQuery url validation
		urlRegExValidate = /^(https?|ftp):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
		popUpMenu = UTILS.selectAllElem('.popup-menu'),
		popUpQr = popUpMenu[0],
		popUpMtf = popUpMenu[1],
		expandButtons = UTILS.selectAllElem('.expand'),
		inputs = UTILS.selectAllElem('.popup-menu input[type="text"]'),
		emptyFields, // test variable for verifing empty input fields
		inputValueTest = [],
		inputValueForm = [],
		dropDowns = UTILS.selectAllElem('.drop-down'),
		dropDownQr = dropDowns[0],
		dropDownMtf = dropDowns[1],
		frameInputData = {
			qr: {	name: ['','',''],
					url: ['','','']
					},
			mtf: {	name: ['','',''],
					url: ['','','']
					},
			lastHash: ''
		},

		// validation variables
		// using regex to clip the id into array of form name, form type, and place
		matchRe = /\w[a-zA-Z]*/g,
		targetObj = {
			formName: [],
			formType: [],
			storePlace: [],
			formData: [],
			lastHash: ''
		},
		iframeWindows = UTILS.selectAllElem('iframe.frame'),

	// webApp content here
	webApp = {

		//---------------------//
		// main functions here
		//---------------------//

	    init: function(){
	    	//this.ajaxCall();
	    	this.startUp();
	    	this.keyboardEvents();
	    	this.tabEvents();
	    	this.frameEvents();
	      	this.searchBox();
	    }, // end of init

	    startUp: function(){
	    	if(dataFromJSON !== null){
	    		notification.classList.remove('hidden');
				notification.innerHTML = dataFromJSON;
	    	} else {
	    		notification.classList.remove('hidden');
				notification.innerHTML = 'error - data was not loaded or recieved from server';

	    	}
	    	function dataCheck(){
	    		if(window.localStorage){
	    			var data = JSON.parse(localStorage.getItem('data'));
	    			return data;
	    		} else {
	    			var data = UTILS.cookieHandler.check();
	    			return data;
	    		}
	    	}

	    	function webAppRestoreData(restoredData){
	    		// check incoming data and set webapp according to data
	    		var objectData = restoredData(),
	    			fullHash = '',
	    			hashData = '',
	    			lastTab = '',
	    			lastFrame = '',
	    			lastUrl = '',
	    			lastQr = '', 
	    			lastMtf = '';
		    		// set tab from last hash or defualt
	    			// if i have previous data
		    		if(objectData !== null && objectData.lastHash.length>0){
		    			fullHash = objectData.lastHash;
		    			UTILS.hashHelper(fullHash);
		    			hashData = location.hash.split('/');
		    			lastTab = UTILS.selectOneElem('a[href="' + hashData[0] + '"]');
		    			lastFrame = hashData[1];

		    			// check last url was on or or mtf? and under what name?
		    			if(lastTab.getAttribute('data') === 'qr'){
		    				for(var i = 0; objectData.qr.name.length>i; i++){
		    					if(objectData.qr.name[i].indexOf(lastFrame)>-1){
		    						lastUrl = objectData.qr.url[i];
		    					}
		    				}
		    			}
		    			if(lastTab.getAttribute('data') === 'mtf'){
		    				for(var i = 0; objectData.mtf.name.length>i; i++){
		    					if(objectData.mtf.name[i].indexOf(lastFrame)>-1){
		    						lastUrl = objectData.mtf.url[i];
		    					}
		    				}
		    			}

		    			// hide popup if there is data
		    			if(objectData.qr.name.length>0 && objectData.mtf.name.length>0 ){
		    				if(!UTILS.hasClass(popUpQr, 'hidden')){
	    						UTILS.addClass(popUpQr, 'hidden');
		    				}  
		    				if(!UTILS.hasClass(popUpMtf, 'hidden')){
	    						UTILS.addClass(popUpMtf, 'hidden');
		    				}									
		    			} else {
		    				webApp.hidePopUp(lastTab);
		    			}
		    			// fill input fields with data from storage
		    			// than build and show dropdowns
		    			webApp.inputsNDropdowns(objectData);

	    				// set iframes
	    				webApp.setIframe(lastTab, lastUrl, lastQr, lastMtf);
	    				// set expand buttons
	    				webApp.setExpand(lastTab, lastUrl, lastQr, lastMtf);

		    		} else {
		    		// if no previous data revert to defualt
		    			UTILS.hashHelper('#quick-reports');
		    			lastTab = UTILS.selectOneElem('a[href="#quick-reports"]');
		    			lastFrame = null;
		    			inputs[0].focus();

		    		}
	    			webApp.tabSelect(lastTab, lastTab.href);

	    	}
	    	webAppRestoreData(dataCheck);

	    }, // end of startup function


	    // this function here takes control of tab navigation through the middle dropdown menu
	    // with the right behaivour and animations
	    keyboardEvents: function(){
	    	// 2 cases 1> anchor link 2> div.menu-hint
	    	nav.onkeyup = function(e){
	    		var target = e.target;

	    		if(target.nodeName.toLowerCase() === 'nav'){
	    			for(var i = 0; i<navSection.length; i++){
						UTILS.removeClass(navSection[i], 'hover');
					}
	    		}

	    		// case 1> here - if im on an anchor clear all hover effects and hide all menus but show target menu
				if(target.nodeName.toLowerCase() === 'a'){
					target.onfocus = function(elm){
						if(!UTILS.hasClass(target.parentElement.parentElement.parentElement.parentElement, 'hover')){
							for(var i = 0; i<navSection.length; i++){
								UTILS.removeClass(navSection[i], 'hover');
							}
							UTILS.addClass(target.parentElement.parentElement.parentElement.parentElement, 'hover');
						}
					}
				}

	    		// case 2> here - if not anchor clear all menus but set current menu
	    		// and when target blurs clear all menus but set current menu
	    		if(target.nodeName.toLowerCase() === 'div' && UTILS.hasClass(target, 'menu-hint')){
	    			target.onblur = function(elm){
						for(var i = 0; i<navSection.length; i++){
							UTILS.removeClass(navSection[i], 'hover');
						}
						UTILS.addClass(target.parentElement.parentElement, 'hover');
					}
				}

	    	}

	    	tabs.onkeyup = function(e){
		    	clearNav();
		    	var target = e.target,
		    	targetMatch = target.id.match(matchRe);
		    	if (e.keyCode === 27){
		    		if(targetMatch[0] === 'qr'){
		    			//console.log('esc clicked in qr');
		    			UTILS.addClass(popUpQr, 'hidden');
		    		} 
		    		if(targetMatch[0] === 'mtf'){
		    			//console.log('esc clicked in mtf');
		    			UTILS.addClass(popUpMtf, 'hidden');
		    		}
		    	}	
	    	}
	    	search.onkeyup = clearNav;
	    	
	    	function clearNav(){
	    		for(var i = 0; i<navSection.length; i++){
					UTILS.removeClass(navSection[i], 'hover');
				}	
	    	}
	    }, // end of keyboard events function

	    searchBox: function(){
	    	UTILS.addEvent(formSearch,'submit', function(e){
	    		e.preventDefault();
	    		var target = e.target;
	    		
	    		// if results found than:
	    		if (webApp.resultFound(search.value)) {
	    			notification.textContent = 'Showing results for: ' + search.value;	
	    		} else {
	    			notification.textContent = 'Nothing was found for: ' + search.value;
	    		}
	    		// else show error message
	    	}, false);
	    }, // end of search box function

	    resultFound: function(searchValue){
	    	var queryIndex = [];
	    	function reportQuery(query, inputName){
	    		var str = searchValue.toLowerCase();
		    	for(var i = 0; i < frameInputData[query][inputName].length; i++){
		    		if(frameInputData[query][inputName][i].toLowerCase().indexOf(str)>-1) {
		    			console.log('result for: ' + searchValue + ' found on ' + query + " on " + inputName + " " + i);
		    			queryIndex = [true, query, i];
		    			return true; // [if true] and [query = qr or mtf] and [i = index of select dropdown]
		    		}
		    	}
	    	}

	    	// case 1 qr name
	    	// case 2 qr url
	    	// case 3 mtf name
	    	// case 4 mtf url
	    	if(reportQuery('qr', 'name') || reportQuery('qr', 'url') || reportQuery('mtf', 'name') || reportQuery('mtf', 'url')){
			// change to selected tab and frame (make active and hide all the other tabs)
			// change to the selected dropdown value
			// hide popup for selected tab

				// reset all active li's
		        UTILS.resetClass(buttons, 'active', '');
		        UTILS.resetClass(frames, 'active', 'hidden');
		        
		        // set active frames, tabs, frames and buttons
		        if(queryIndex[1] === 'qr'){
		        	UTILS.addClass(buttons[0], 'active');
		        	UTILS.multiAddClass(frames, 'hidden');
		        	UTILS.removeClass(frames[0], 'hidden');
		        	UTILS.addClass(popUpQr,'hidden');
		        	for(var i = 0; i< dropDownQr.options.length; i++){
		        		dropDownQr.options[i].removeAttribute('selected');	
		        	}
		        	dropDownQr.options[queryIndex[2]].setAttribute('selected', 'selected');
		        	expandButtons[0].href = dropDownQr.options[queryIndex[2]].value;
		        	iframes[0].src = dropDownQr.options[queryIndex[2]].value;
		        	location.hash = searchValue + "?=/" + tabHash + '/' + dropDownQr.options[queryIndex[2]].text;
		        } else if (queryIndex[1] === 'mtf'){
		        	UTILS.addClass(buttons[2], 'active');
		        	UTILS.multiAddClass(frames, 'hidden');
		        	UTILS.removeClass(frames[2], 'hidden');
		        	UTILS.addClass(popUpMtf,'hidden');
		        	for(var i = 0; i< dropDownMtf.options.length; i++){
		        		dropDownMtf.options[i].removeAttribute('selected');	
		        	}
		        	dropDownMtf.options[queryIndex[2]].setAttribute('selected', 'selected');
		        	expandButtons[2].href = dropDownMtf.options[queryIndex[2]].value;
		        	iframes[2].src = dropDownMtf.options[queryIndex[2]].value;
		        	location.hash = searchValue + "?=/" + tabHash + '/' + dropDownMtf.options[queryIndex[2]].text;
		        }

				return true;	    		
	        }
	    	
	    }, // end of resultFound function for top search box form

	    tabEvents: function(){
		
	      UTILS.addEvent(tabs, 'click', function(e){
	      	e.preventDefault();
	        var target = e.target,
	        	theHref = target.href;

	        if(target.nodeName.toLowerCase() === 'a'){
				// change hash according to the current tab href value
				//helper to prevent hash jump
				UTILS.hashHelper(theHref);
				webApp.tabSelect(target, theHref);	        	
	        }

	      }); 
	    }, // end of tab events
   		
   		tabSelect: function(elm, elmHref){
			if(elm.nodeName.toLowerCase() === 'a' && elm.nodeType === 1){

		        // reset all active li's
		        UTILS.resetClass(buttons, 'active', '');
		        UTILS.resetClass(frames, 'active', 'hidden');

		        // set current tab to be active and change to current frame based on hash
		        elm.parentElement.setAttribute('class', 'active');

		        for(var i = 0; i<frames.length; i++){
		        	// if the frame id if like the window hash or it was loaded from stored data (elmHref.match(re)[0]) 
		        	// --> the [0] is becuase match returns an array and we only want the first child of that array
					if('#'+frames[i].id === elmHref.match(re)[0] || '#'+frames[i].id === location.hash){
						frames[i].setAttribute('class', 'active');
						tabHash = '#'+frames[i].id; // store temporary hash
						// set focus on first input here if the frame has popup-menu
						if(frames[i].firstElementChild.lastElementChild.classList[0] === 'popup-menu'){
							frames[i].firstElementChild.lastElementChild.children[0][1].focus();
						}
					}
				}
			}
		}, // end of tabSelect function 

	    frameEvents: function(){
			
	    	UTILS.addEvent(tabs, 'click', function(e){
		        // [1] reset all frames to defualt on init and set first defualt frame
		        // [2] check local storage or cookies for stored data and update fields and menus

		        e.preventDefault();
		        var target = e.target,
		        	parentElementOfTarget = target.parentElement,

					toggleAction = function(nodeSelect, classSelect, attr, frameName){
			        	if(parentElementOfTarget.nodeName.toLowerCase() === nodeSelect 
			       			&& parentElementOfTarget.className === classSelect 
			       			&& parentElementOfTarget.getAttribute(attr) === frameName){
				        		if(frameName === popUpQr.getAttribute(attr)){
				        			if(popUpQr.classList.length === 1){
				        				UTILS.addClass(popUpQr, 'hidden');
				        			} else {
				        				UTILS.removeClass(popUpQr, 'hidden');
				        				// focus on the first input element when menu is shown
					       				if(popUpQr.children[0][1].tagName.toLowerCase() === 'input'){
					       					popUpQr.children[0][1].focus();
					       				}
				        			}
				        		} else if(frameName === popUpMtf.getAttribute(attr)){
				        			if(popUpMtf.classList.length === 1){
				        				UTILS.addClass(popUpMtf, 'hidden');
				        			} else {
				        				UTILS.removeClass(popUpMtf, 'hidden');
				        				// focus on the first input element when menu is shown
					       				if(popUpMtf.children[0][1].tagName.toLowerCase() === 'input'){
					       					popUpMtf.children[0][1].focus();
					       				}
				        			}
				        		}
				        	};
			        }, // end of toggle action
					
					// expand button actions - popup href to blank page
					expandButton = function(){
						if(parentElementOfTarget.nodeName.toLowerCase() === 'a' && parentElementOfTarget.className === 'expand'){
							var windowObjectReferance;
							var blankPage = 'target = "_blank"';
							function openRequestedPopup (url){
								windowObjectReferance = window.open(url, blankPage);
							}
							openRequestedPopup(parentElementOfTarget.href);
						}
					}, // end of expand button

					// cancel button actions - hide the form
			        cancelButton = function(){
					    if(target.className === 'popup-button' && target.type === 'reset'){
					    	if(target.getAttribute('data') === 'qr'){
					    		UTILS.addClass(popUpQr, 'hidden');	
					    	} else if(target.getAttribute('data') === 'mtf'){
					    		UTILS.addClass(popUpMtf, 'hidden');
					    	}
					    }
			        }, // end of cancel button

		        	// settings button action = toggle form visibility
			        settingsButton = function(){
					    // when user clicks the setting he clicks an image and that is why we need to check that the 
					    // parent is an 'a' tag with the class of 'toggle'
				        if (parentElementOfTarget.nodeName.toLowerCase() === 'a' && parentElementOfTarget.className === 'toggle'){
				        	if(parentElementOfTarget.getAttribute('data') === 'qr' && popUpQr.getAttribute('data') === parentElementOfTarget.getAttribute('data')){
								toggleAction('a', 'toggle', 'data', 'qr');
				        	} else if (parentElementOfTarget.getAttribute('data') === 'mtf' && popUpMtf.getAttribute('data') === parentElementOfTarget.getAttribute('data')){
				        		toggleAction('a', 'toggle', 'data', 'mtf');
				        	}
				        }
			        }, // end of settings button

			        saveButton = function(){
						// [1] check if all fields are valid - V
						// [2] if OK save data to localStorage or cookies and build dropDown menu with names and links - V
						// [3] open in iframe the last report in each tab - V
						// [4] hide popup-menu - V
						// [5] add expand icon to current frame with current window href to target new webpage - V

						// look on inputs and if all filled inputs have valid class than all is ok
						// if there is an invalid class or more dont save and focus on the first invalid input field
						var invalidInputs = UTILS.selectAllElem('.invalid'),
							validInputs = UTILS.selectAllElem('.valid');
			        	if(target.className === 'popup-button' && target.value === 'save'){
			        		console.log('save button clicked');
					    	for(var i = 0; i< popUpMenu.length; i++){
					    		if(popUpMenu[i].getAttribute('data') === target.getAttribute('data')){
					    			
					    			// if there is a input with error log error and focus on the first input field with an error
					    			if(invalidInputs.length > 0){
					    				//console.log('some input fields have errors');
					    				invalidInputs[0].focus();

					    			} else {
					    				// if all valid than 		[1] hide the form - V
					    				// 							[2] show expand button - V
					    				//							[3] build dropdown menu - v
					    				//							[4] set iframe - V
					    				//							[5] save data to local storage or cookies
					    				
					    				// when all fields are valid hide the popup menu
					    				UTILS.addClass(popUpMenu[i], 'hidden');
					    				
					    				// show drop down menu according to valid popup menu data
					    				
					    				if(popUpMenu[i].getAttribute('data') === 'qr'){
					    					if(UTILS.hasClass(dropDownQr, 'hidden') === true){
					    						UTILS.removeClass(dropDownQr, 'hidden');
					    						//console.log('removed hidden class from dropdown');
					    					}
					    				} else if(popUpMenu[i].getAttribute('data') === 'mtf'){
					    					if(UTILS.hasClass(dropDownMtf, 'hidden')){
												UTILS.removeClass(dropDownMtf, 'hidden');
											}
					    				} 
					    									    				
					    				// if qr dropdown chlidern exist remove and update
					    				if(dropDownQr.children.length > 0){
					    					// rough dropdown clear here
					    					dropDownQr.innerHTML ='';
					    					webApp.buildDropDown('qr', frameInputData);
					    				} else if(dropDownQr.children.length === 0){
					    					webApp.buildDropDown('qr', frameInputData);
					    				}
					    				// if mtf dropdown chlidern exist remove and update
					    				if(dropDownMtf.children.length > 0){
											// rough dropdown clear here
					    					dropDownMtf.innerHTML ='';
					    					webApp.buildDropDown('mtf', frameInputData);
					    				} else if(dropDownMtf.children.length === 0){
					    					webApp.buildDropDown('mtf', frameInputData);
					    				}

					    				// save data
					    				// set hash according to target object data
					    				if(target.getAttribute('data') === 'qr'){
					    					// check last filled name and put it to hash
					    					var select = UTILS.selectOneElem('.drop-down[data="qr"]');
					    					for(var i=0; select.children.length>i; i++){
					    						if(select.children[i].selected){
					    							frameInputData.lastHash = location.hash + '/' + select.children[i].textContent;
					    						}
					    					}
				    						console.log(select.children.length);
					    				} else if(target.getAttribute('data') === 'mtf'){
					    					// check last filled name and put it to hash
					    					var select = UTILS.selectOneElem('.drop-down[data="mtf"]');
											for(var i=0; select.children.length>i; i++){
					    						if(select.children[i].selected){
					    							frameInputData.lastHash = location.hash + '/' + select.children[i].textContent;
					    						}
					    					}					    				
					    				}
					    				console.log(frameInputData.lastHash);
					    				var dataString = JSON.stringify(frameInputData);

					    				if(window.localStorage){
					    					// if older data exist clear it and write new data
				    						var data = localStorage.getItem('data');
				    						//console.log(data !== null);		
									    	if(data !== null){
										    	localStorage.removeItem('data');
  										    	localStorage.setItem('data', dataString);
										    	console.log('Local Storage data updated');
									    	} else {
									    		localStorage.setItem('data', dataString);
									    		console.log('data stored to Local Storage');
									    	}
									    	// after data saved update hash to last selection
									    	UTILS.hashHelper(frameInputData.lastHash);
									    } else {
									    	//UTILS.cookieHandler.check();
									    	var data = UTILS.cookieHandler.check();
									    	// if there is data on cookie than data === cookie data
									    	if(data !== null){
									    		UTILS.cookieHandler.set('data', dataString, 365);
									    		console.log('Cookie data updated');
									    	} else {
									    	// if no cookie than data === false
									    		UTILS.cookieHandler.set('data', dataString, 365);
									    		console.log('data stored to Cookie');
									    	}
									    	// after data saved update hash to last selection
									    	UTILS.hashHelper(frameInputData.lastHash);
									    }
									  
					    			}
					    		}
					    	}
					    }
					    
			        }; // end of save button

			    cancelButton();
			    settingsButton();
			    expandButton();
			    saveButton();
	     	}, false); // end of click event
			
			// change event listener
			UTILS.addEvent(tabs, 'change', function(e){
				var target = e.target,
					targetId = target.id,
					parentElementOfTarget = target.parentElement;

				// if change occord on dropdowns
				if(target.tagName.toLowerCase() === 'select'){
					// set the expand button href link occording to the dropdown value
					for(var i = 0; i<expandButtons.length; i++){
						if(expandButtons[i].getAttribute('data') === target.getAttribute('data')){
							expandButtons[i].href = target.value;
						}
					}
					// set the iframe src occording to the dropdown value
					for(var i = 0; i<iframeWindows.length; i++){
						if(iframeWindows[i].getAttribute('data') === target.getAttribute('data')){
							iframeWindows[i].src = target.value;
						}
					}
					// set hash according to selected dropdown
					var selectedOption = target.options[target.selectedIndex].text;
					location.hash = tabHash + "/" + selectedOption;
					// store last tab and report to localstorage
					frameInputData.lastHash = location.hash;
					console.log(frameInputData.lastHash);
					//localStorage.removeItem('data');
			    	localStorage.setItem('data', JSON.stringify(frameInputData));
		    	
				}

				// if change occord on inputs
				if(target.tagName.toLowerCase() === 'input'){

					// store data from the input fields to a temporary object - targetObj
					// targetObj has 4 objects inside
					// [1] formName - the form name - qr or mtf
					// [2] formType - is it a name or a url
					// [3] storePlace - what is its place/order (0, 1, 2)
					// [4] formData - data value to store - this needs to be checked and be valid 
					// 	   (valid name (length > 0) and valid url (copy regex from internet))
					// 
					// after name and url validation need to check if both places are filled 
					// if not mark in red outline

					targetObj.formName = targetId.match(matchRe)[0]; // qr or mtf
					targetObj.formType = targetId.match(matchRe)[1]; // name or url
					targetObj.storePlace = targetId.match(matchRe)[2]; // place in form 1,2,3?
					targetObj.formData = target.value; // written data

					// check validation of name and url and than
					function validateForm(){
						
						// validate name
						if(targetObj.formType === 'name'){
							// if name has more than 0 characters and does not
							// start with a non character than the name is valid
							// (non latin) hebrew characters verified
							if(targetObj.formData.length>0 && targetObj.formData.substr(0,1).match(/[0-9a-zA-Z\u0590-\u05fe]/)){
								// if the name is valid hide error message
								parentElementOfTarget.lastElementChild.setAttribute('class', parentElementOfTarget.lastElementChild.classList[0] + " hidden");
								// and add a green border for valid name! :)
								target.setAttribute('class', 'valid');
								
								// store data to object frameInputData
								frameInputData[targetObj.formName]
											  [targetObj.formType]
											  [targetObj.storePlace-1] = targetObj.formData;
							} else {
								// color border and put error message
								// if the name is invalid show error message
								parentElementOfTarget.lastElementChild.setAttribute('class', parentElementOfTarget.lastElementChild.classList[0]);
								parentElementOfTarget.lastElementChild.textContent = "Please fill a correct name";
								// add red border for invalid name! :(
								target.setAttribute('class', 'invalid');
								target.focus();
							}						
							if(targetObj.formData.length===0 && parentElementOfTarget.lastElementChild.classList.length>0){
								// if input value is empty remove error message and border
								parentElementOfTarget.lastElementChild.setAttribute('class',parentElementOfTarget.lastElementChild.classList[0]);
								parentElementOfTarget.lastElementChild.setAttribute('class',parentElementOfTarget.lastElementChild.classList[0] + " hidden");
								target.setAttribute('class', '');
							}

						// validate url
						} else if(targetObj.formType === 'url') {
							// if url has more than 0 characters
							if(targetObj.formData.length>0) {
								// check if the url hasn't got 'http://' in the start of the url string 
								// and adds the http:// to the start of the url string if required
								if(targetObj.formData.indexOf('http://', 0) === -1){
									targetObj.formData = 'http://' + targetObj.formData;
									// add the http:// to the target value - the url input box (if the user didnt add  http://)
									target.value = targetObj.formData;
									
									if(urlRegExValidate.test(targetObj.formData)){
										// if the url is valid hide message
										target.parentElement.lastElementChild.setAttribute('class', target.parentElement.lastElementChild.classList[0] + " hidden");
										// add green border for valid url! :)
										target.setAttribute('class', 'valid');
										// update the input box after check and add http:// to the url

										// store data to object frameInputData
										frameInputData[targetObj.formName]
													  [targetObj.formType]
													  [targetObj.storePlace-1] = targetObj.formData;
									} else {
										// color border and show error message
										// if the url is invalid show message
										parentElementOfTarget.lastElementChild.setAttribute('class', parentElementOfTarget.lastElementChild.classList[0]);
										// add red border for invalid url! :(
										target.setAttribute('class', 'invalid');
										target.focus();
										parentElementOfTarget.lastElementChild.textContent = "Please fill a correct URL";
									}		
								}
								
							} else {
								// color border and show error message
								// if the url is valid hide it with the help of the class hidden
								parentElementOfTarget.lastElementChild.setAttribute('class', parentElementOfTarget.lastElementChild.classList[0]);
								// add red border for invalid url! :(
								target.setAttribute('class', 'invalid');
								target.focus();
							} 
							if(targetObj.formData.length===0 && parentElementOfTarget.lastElementChild.classList.length>0){
								// if input value is empty remove error message and border
								parentElementOfTarget.lastElementChild.setAttribute('class',parentElementOfTarget.lastElementChild.classList[0]);
								parentElementOfTarget.lastElementChild.setAttribute('class',parentElementOfTarget.lastElementChild.classList[0] + " hidden");
								target.setAttribute('class', '');
							}
						}
						return true;
					}

					// checks if entered field is valid and if its sibling field is valid
					function validatePlace(){
						if(validateForm()){
							// reset the emptyfields tester
							emptyFields = [];
							// check to see if both fields are filled

							if(targetObj.formType === 'name'){
								// check if the url sibling is filled (using the element id tag)
								if(UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).value !== ''){
									// url is filled ans also name
									UTILS.addClass(UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace), 'both');
									UTILS.addClass(UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace), 'both');
									emptyFields = ''; // clear tester
									// check url has error - if true focus on it
									if(UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).parentElement.lastElementChild.classList.length<2){
										UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).focus();
									}
								} else {
									// url is not filled

									// set focus on input with error message
									UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).focus();
									// show error message
									UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).parentElement.lastElementChild
										.setAttribute('class',UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).parentElement.lastElementChild.classList[0]);
									UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).parentElement.lastElementChild.textContent = "Please fill in a URL";
								}
								if(targetObj.formData === '' && UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).value === ''){
									// name and url are empty - remove url message
									UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).parentElement.lastElementChild
										.setAttribute('class',UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).parentElement.lastElementChild.classList[0] + " hidden");
										// remove both url and name values from object
										//console.log('before: ' + frameInputData[targetObj.formName]['name'][targetObj.storePlace-1]);
										frameInputData[targetObj.formName]['name'][targetObj.storePlace-1] = '';
										//console.log('before: ' + frameInputData[targetObj.formName]['url'][targetObj.storePlace-1]);
										frameInputData[targetObj.formName]['url'][targetObj.storePlace-1] = '';
										// console.log(' name and url empty - update object too');
										emptyFields = 'empty';

								} else if(targetObj.formData === '' && UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).value !== '') {
									// name empty but url filled - show name error message
									UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).parentElement.lastElementChild
										.setAttribute('class',UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).parentElement.lastElementChild.classList[0]);
									UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).parentElement.lastElementChild.textContent = "Please fill in a name";
									emptyFields = ''; // clear tester
								}

							} else if(targetObj.formType === 'url'){
								// check if the name sibling is filled (using the element id tag)

								if(UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).value !== ''){
									// name is filled and also url
									UTILS.addClass(UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace), 'both');
									UTILS.addClass(UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace), 'both');
									emptyFields = ''; // clear tester
									// check name has error - if true focus on it
									if(UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).parentElement.lastElementChild.classList.length<2){
										UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).focus();
									}
								} else {
									// name is not filled
									
									// set focus on input with error message
									UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).focus();
									// show error message
									UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).parentElement.lastElementChild
										.setAttribute('class',UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).parentElement.lastElementChild.classList[0]);
									UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).parentElement.lastElementChild.textContent = "Please fill in a name";
								}
								if(targetObj.formData === '' && UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).value === ''){
									// name and url are empty - remove name message
									UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).parentElement.lastElementChild
										.setAttribute('class',UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).parentElement.lastElementChild.classList[0] + " hidden");
										// remove both url and name values from object
										//console.log('before: ' + frameInputData[targetObj.formName]['name'][targetObj.storePlace-1]);
										frameInputData[targetObj.formName]['name'][targetObj.storePlace-1] = '';
										//console.log('before: ' + frameInputData[targetObj.formName]['url'][targetObj.storePlace-1]);
										frameInputData[targetObj.formName]['url'][targetObj.storePlace-1] = '';
										
										//console.log('name and url empty update object too');
										emptyFields = 'empty';

								} else if(targetObj.formData === '' && UTILS.selectOneElem('#' + targetObj.formName + '-name' + targetObj.storePlace).value !== '') {
									// url empty but name filled - show url error message
									UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).parentElement.lastElementChild
										 .setAttribute('class',UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).parentElement.lastElementChild.classList[0]);
									UTILS.selectOneElem('#' + targetObj.formName + '-url' + targetObj.storePlace).parentElement.lastElementChild.textContent = "Please fill in a URL";
									emptyFields = ''; // clear tester
								}
							}

						}
						return emptyFields; // return test resualt -> '' or 'empty'

					} // end of validate form

										
					// run validation on keyboard change event
					webApp.inputsClearTest(validatePlace());

				}
			});
	    }, //end of frameEvents


//-----------------------//
// helper functions here
//-----------------------//

	   
		hidePopUp: function(popUp){
			var popUpRef = popUp.href.match(re)[0];
			if(popUpRef === '#quick-reports'){
				UTILS.addClass(popUpQr, 'hidden');
			} else if(popUpRef === '#my-team-folders'){
				UTILS.addClass(popUpMtf, 'hidden');
			}
		}, // end of hide popup

		setIframe: function(lastTab, lastUrl, lastQr, lastMtf){
	    	for(var i=0; iframeWindows.length>i; i++){
	    		// [1] get url data from object and set both frames
	    		if(iframeWindows[i].parentElement.id === 'quick-reports' && lastQr !== ''){
	    			iframeWindows[i].src = lastQr;
	    		} else if(iframeWindows[i].parentElement.id === 'my-team-folders'  && lastMtf !== ''){
	    			iframeWindows[i].src = lastMtf;
	    		}
	    		// [2] if lastFrame exists replace last index src with lastFrame src lick
	    		if(('#' + iframeWindows[i].parentElement.id) === lastTab.href.match(re)[0]){
	    			iframeWindows[i].src = lastUrl;
	    		}
	    	}
	    }, // end of set iframe

	    setExpand: function(lastTab, lastUrl, lastQr, lastMtf){
	    	for(var i=0; expandButtons.length>i; i++){
	    		// [1] get url data from object and set both frames
	    		if(expandButtons[i].getAttribute('data') === 'qr' && lastQr !== ''){
	    			expandButtons[i].href = lastQr;
	    			UTILS.removeClass(expandButtons[i], 'hidden');
	    		} else if(expandButtons[i].getAttribute('data') === 'mtf'  && lastMtf !== ''){
	    			expandButtons[i].href = lastMtf;
	    			UTILS.removeClass(expandButtons[i], 'hidden');
	    		}
	    		// [2] if lastFrame exists replace last index src with lastFrame src lick
	    		if(expandButtons[i].getAttribute('data') === lastTab.getAttribute('data')){
	    			expandButtons[i].href = lastUrl;
	    		}
	    	}
	    }, // end of set iframe
	    
	    inputsNDropdowns: function(restoredData){
	    	// fill inputs loop here
	    	for(var i = 0; inputs.length>i; i++){
	    		// if the id matches the object than put name value 
	    		// in right place and url value in the other place
	    		// check if object empty and dont insert data in empty input

	    		targetObj.formName = inputs[i].id.match(matchRe)[0]; // qr or mtf
				targetObj.formType = inputs[i].id.match(matchRe)[1]; // name or url
				targetObj.storePlace = inputs[i].id.match(matchRe)[2]; // place in form 1,2,3?
				targetObj.formData = restoredData[targetObj.formName][targetObj.formType][targetObj.storePlace-1];
				// fill input with the right data from the restored object 
				inputs[i].value = targetObj.formData;

				// fill frame inputs data so storage wont clear on dropdown change
				frameInputData[targetObj.formName]
							  [targetObj.formType]
							  [targetObj.storePlace-1] = targetObj.formData;
	    	}

	    	// build dropdowns here
	    	// if qr dropdown chlidern exist remove and update
			if(dropDownQr.children.length === 0){
				webApp.buildDropDown('qr', restoredData);
				if(UTILS.hasClass(dropDownQr, 'hidden')){
					UTILS.removeClass(dropDownQr, 'hidden');
				}
			}
			// if mtf dropdown chlidern exist remove and update
			if(dropDownMtf.children.length === 0){
				webApp.buildDropDown('mtf', restoredData);
				if(UTILS.hasClass(dropDownMtf, 'hidden')){
					UTILS.removeClass(dropDownMtf, 'hidden');
				}
			}

	    }, // end of inputs and dropdowns function

	    expendAndIframeSettings: function(formName, url){
			// show the expand button
			for(var j = 0; j < expandButtons.length; j++){
				//console.log(expandButtons);
				if(expandButtons[j].getAttribute('data') === formName){
					//console.log(expandButtons[j]);
					UTILS.removeClass(expandButtons[j], 'hidden');
					// add last report link to the expand button
					expandButtons[j].href = url;
				}
			}

			// set last report url to iframe
			for(var j = 0; j < iframeWindows.length; j++){
				if(iframeWindows[j].getAttribute('data') === formName){
					// add last report link to the iframe
					iframeWindows[j].src = url;
				}
			}
		}, // end of expand button and iframe settings function

		buildDropDown: function(formName, dataObject){
			if(formName){
				for(var i = 0; i < dataObject[formName].name.length; i++){
					if(dropDownQr.getAttribute('data') === formName){
						//console.log('building qr dropdown');
						webApp.dropDownBuildProccess(dropDownQr, formName, i, dataObject);
					} else if(dropDownMtf.getAttribute('data') === formName){
						//console.log('building mtf dropdown');
						webApp.dropDownBuildProccess(dropDownMtf, formName, i, dataObject);
					}
				}

				if(formName === 'qr'){
					// set selected to last element with content
					for(var i = dropDownQr.children.length-1; i >= 0; i--){
						if(dropDownQr.children[i].textContent !== ''){
							dropDownQr.children[i].setAttribute('selected', 'selected');
							webApp.expendAndIframeSettings('qr', dropDownQr.children[i].value);
							// set hash to form name and selected report
							if(dataObject.lastHash === false){
								location.hash = tabHash + '/' + dropDownQr.children[i].textContent;
								frameInputData.lastHash = location.hash; // store hash to object
							}
							return;
						}
					}
				} 
				if(formName === 'mtf'){
					// set selected to last element with content
					for(var i = dropDownMtf.children.length-1; i >= 0; i--){
						if(dropDownMtf.children[i].textContent !== ''){
							dropDownMtf.children[i].setAttribute('selected', 'selected');
							webApp.expendAndIframeSettings('mtf', dropDownMtf.children[i].value);
							// set hash to form name and selected report
							if(dataObject.lastHash === false){
								location.hash = tabHash + '/' + dropDownQr.children[i].textContent;
								frameInputData.lastHash = location.hash; // store hash to object
							}
							return;
						}
					}
				}
			}
		}, // end of build drop down menu function

		dropDownBuildProccess: function(dropDownElm, form, inc, dataObject){
			var optionElm = document.createElement('option');
			optionElm.value = dataObject[form].url[inc];
			optionElm.textContent = dataObject[form].name[inc];
			dropDownElm.appendChild(optionElm);
		}, // end of dropdown נbuild proccess function

		inputsClearTest: function(test){
			// reset value container array
			inputValueTest = [];
			inputValueForm = [];
			var qrCount = 0, 
				mtfCount = 0;
			// check if all field are empty and reset dropdown and local storage
			if(test === 'empty'){
				for(var i = 0; i<inputs.length; i++){
					inputValueTest.push(inputs[i].value); // insert all values to array
					inputValueForm.push(inputs[i].id.match(matchRe)[0]); // insert form name to array
				}
				//console.log(inputValueTest);
				//console.log(inputValueForm);
				for(var i = 0; i<inputValueTest.length; i++){
					if(inputValueTest[i] !== ''){
						//console.log(inputValueForm[i] + ' form not empty');
						if(inputValueForm[i] === 'qr'){
							qrCount++;
						} else if(inputValueForm[i] === 'mtf'){
							mtfCount++;
						}
					}
					
				}

				/*****
						frameInputData = {
							qr: {	name: ['','',''],
									url: ['','','']
									},
							mtf: {	name: ['','',''],
									url: ['','','']
									}
				*****/

				// case 1 - qr fields all empty
				if(qrCount === 0){
					//console.log('qr all empty update object');
					// clear all data from object frameInputData on qr
					frameInputData.qr.name = ['','',''];
					frameInputData.qr.url = ['','',''];
					
					UTILS.addClass(UTILS.selectOneElem('.expand[data="qr"]'), 'hidden');
					UTILS.selectOneElem('.expand[data="mtf"]').href = '';
					UTILS.selectOneElem('iframe[data="qr"]').src = '';

				} 
				// case 2 - mtf fields all empty
				else if(mtfCount === 0){
					//console.log('mtf all empty update object');
					// clear all data from object frameInputData on mtf
					frameInputData.mtf.name = ['','',''];
					frameInputData.mtf.url = ['','',''];

					UTILS.addClass(UTILS.selectOneElem('.expand[data="mtf"]'), 'hidden');
					UTILS.selectOneElem('.expand[data="mtf"]').href = '';
					UTILS.selectOneElem('iframe[data="mtd"]').src = '';
					
				}
				// case 3 - all empty
				if(inputValueTest.toString() === ''){
					console.log('all inputs are clear');
				}
			}
		}, // end of inputs clear test
	}; // end of webApp
	webApp.init();
};