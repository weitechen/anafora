var annotatorDiv;
var schemaDiv;
var navMenu = undefined;
var rawText;
var aProjectList = [];
var currentAProject = undefined;
var aProjectWrapper = undefined;
var aObjSelectionMenu = undefined;
var projectSelector = undefined;
var editable = false;
var propertyFrameList = [];
var relationFrame = undefined;
var isChanged = false;
var errorHandler = undefined;
var eventLogging = undefined;
var currentScrollTask = 0;
var subTaskNameList = undefined;
var subTaskElemList = undefined;
var previousPosition = undefined;

function onLoad() {
	// Setting errorHAndler;

	if(_setting.isLogging)
		eventLogging = new EventLogging();
	// read schemaMap in _setting
	var tDiv = document.createElement('div');
	tDiv.innerHTML = _setting.schemaMap;
	var schemaMapStr = tDiv.firstChild.nodeValue;
	_setting.schemaMap = $.parseJSON(schemaMapStr);

	// read annotator in _setting

	$('#account').children("a").text(_setting.remoteUser);
	$('#taskName').children("a").text($("#rawText > div:nth-child(1)").attr('id'));
	if(_setting.isCrossDoc) {
		subTaskElemList = $("#rawText > div");
		subTaskNameList = $.map(subTaskElemList, function(taskElem) { return taskElem.id; });
		subTaskCnt = subTaskNameList.length;
				
		$('#rawText').scroll(function() {
		var newSubTaskIdx = subTaskNameList.length -1;

		for(var elementIdx = 0;elementIdx < subTaskNameList.length - 1;elementIdx++) {
			if($(subTaskElemList[elementIdx]).position().top <=0 && $(subTaskElemList[elementIdx+1]).position().top >0){
				newSubTaskIdx = elementIdx;
				break
			}
		}

		if(newSubTaskIdx != currentScrollTask) {
			currentScrollTask = newSubTaskIdx;
			$('#taskName').children("a").text(subTaskNameList[currentScrollTask]);
		}
		});
		$('#taskName').addClass("dropdown");
		$('#taskName').append("<ul></ul>");
		$.each(subTaskNameList, function(idx, subTaskName ) {
			var liElem = $('<li><a href="#">' + subTaskName + '</a></li>');
			liElem.bind('click', function() {$("#rawText").scrollTop($("#rawText").scrollTop() + $('#' + $(this).text()).position().top + 1);});
			$('#taskName ul').append(liElem);
		});
	}
	projectSelector = undefined;

	// set menu
	navMenu = $("#headerWrapper > ul");

	// set file menu
	var fileMenu = $(navMenu.children("li").get(0)).children("ul").children("li");
	fileMenu.eq(0).bind("click", function() { if(getIsChanged() && window.confirm("Save Task?")) { saveFile(); } if(projectSelector == undefined) {projectSelector = new ProjectSelector(_setting);} projectSelector.selectProject(); projectSelector.popup(); });
	fileMenu.eq(1).bind("click", function() { saveFile(); });
	fileMenu.eq(3).bind("click", function() { if(_setting.isAdjudication){ currentAProject.adjudicationCompleted();} else{ temporalSave();saveFile();setCompleted();} });
	
	if(_setting.isLogging) {
		fileMenu.bind("click", function() { var liItem = this; eventLogging.addNewEvent(new EventLog(EventType.MENU_CLICK, liItem.innerHTML)); } );
	}
	
	if(_setting.projectName == "" || _setting.corpusName == "" || _setting.taskName == "" || _setting.schema === undefined)
		projectSelector = new ProjectSelector(_setting);
	else
		loadNewProject();

	if(_setting.isLogging) {
		setInterval(saveLogging, 1000 * 60 * 2);
	}

}

function saveLogging() {
	if(_setting.isLogging && eventLogging.logList.length > 0) {
		$.ajax({type: 'POST', url:  _setting.root_url + "/" + _setting.app_name + "/logging/" + _setting.projectName + "/" + _setting.corpusName + "/" + _setting.taskName + "/" + _setting.schema + (_setting.isAdjudication ? ".Adjudication" : "") + "/", data: {'logContent': eventLogging.logList.reduce(function(a,b) {return a + '\n' + b.toString();}) + '\n' , }, cache: false, async: false, headers:{"X-CSRFToken":$.cookie('csrftoken') }, success: function(data) {console.log("success"); eventLogging.clear();}, error: function (xhr, ajaxOptions, thrownError) { errorHandler.handle(new ErrorException("Logging Error"), currentAProject); console.log("Save Logging Error");  }});
	}
}

function confirmLeave(evt) {
	return 'Your task has not been saved yet. You sure you want to leave?';
}

function snapSelectionToWord() {
    var sel;

    // Check for existence of window.getSelection() and that it has a
    // modify() method. IE 9 has both selection APIs but no modify() method.
    if (window.getSelection && (sel = window.getSelection()).modify) {
        sel = window.getSelection();
        if (!sel.isCollapsed) {

            // Detect if selection is backwards
            var range = document.createRange();
            range.setStart(sel.anchorNode, sel.anchorOffset);
            range.setEnd(sel.focusNode, sel.focusOffset);

            var backwards = range.collapsed;
            range.detach();

            // modify() works on the focus of the selection
            var endNode = sel.focusNode, endOffset = sel.focusOffset;
            sel.collapse(sel.anchorNode, sel.anchorOffset);

            var direction = [];
            if (backwards) {
                direction = ['backward', 'forward'];
            } else {
                direction = ['forward', 'backward'];
            }

            sel.modify("move", direction[0], "character");
            sel.modify("move", direction[1], "word");
            sel.extend(endNode, endOffset);
            sel.modify("extend", direction[1], "character");
            sel.modify("extend", direction[0], "word");

        }
    } else if ( (sel = document.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        if (textRange.text) {
            textRange.expand("word");
            // Move the end back to not include the word's trailing space(s),
            // if necessary
            while (/\s$/.test(textRange.text)) {
                textRange.moveEnd("character", -1);
            }
            textRange.select();
        }
    }
}

function loadNewProject() {
	// set editable
	editable = (_setting.annotator === _setting.remoteUser);

	// load schema tree
	$.jstree._themes = _setting.root_url + "/static/themes/";

	// load schema
	var schemaIdx = 0;
	var schemaJSON;
	var schema = new Schema();
	var schemaStr;

	do {
		var schemaJSONStr = $.ajax({ type: "GET", url: _setting.root_url + "/" + _setting.app_name + "/schema/" + _setting.schema +  "/" + schemaIdx.toString(), cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { errorHandler.handle(new ErrorException("Get Schema File: " + _setting.schema + " Error"), currentAProject); console.log(xhr.responseText);  }}).responseText;
		var schemaJSON = $.parseJSON(schemaJSONStr);
		var schemaXMLStr = schemaJSON.schemaXML;
		var xmlDom = $.parseXML( schemaXMLStr ) ;
		schema.parseSchemaXML(xmlDom);
		schemaIdx++;
		
	} while(schemaJSON.moreSchema)

	var xmlAnaforaText = "";
	var path = "";
	if(supports_html5_storage() && (path = localStorage["path"]) != null && path == window.location.pathname && (xmlAnaforaText = localStorage["anafora"]) != undefined && window.confirm("Load data file from local?")) {
		
		setIsChanged(true);
	}
	else {

		xmlAnaforaText = "";
		try {
			AnaforaProject.getXML(function(data) { xmlAnaforaText = data;}, _setting);
		}
		catch(err) {
			alert(err + "\n Please contact the administrator.");
			throw err;
		}

		if(xmlAnaforaText == "" || xmlAnaforaText == undefined) {

			if (_setting.isAdjudication) {
				xmlAnaforaText = {};
				var adjAnnotator = undefined;
				if(_setting.annotator.indexOf(";") != -1)
					adjAnnotator = _setting.annotator.split(";");
				else
					adjAnnotator = AnaforaProject.getAdjudicationAnnotator(_setting);
	
				var annotatorName = "";
				var xmlSuccessFunc = function(data) {
					xmlAnaforaText[annotatorName] = data;
				}

				$.each(adjAnnotator, function(idx, _annotatorName) {
					if(_annotatorName != "preannotation" && _annotatorName != "gold") {
						annotatorName = _annotatorName;
						AnaforaProject.getXML(xmlSuccessFunc, _setting, _annotatorName, false);
					}
				});
			}
			else if(_setting.isCrossDoc) {
				xmlAnaforaText = {};
				if(Object.keys(xmlAnaforaText).length == 0) {
					var subTaskList = AnaforaCrossProject.getSubTaskList(_setting);
					$.each(subTaskList, function(idx, subTaskName) {
						xmlAnaforaText[subTaskName] = "";
						AnaforaCrossProject.getXML(function(data) {xmlAnaforaText[subTaskName] = data;}, _setting, "preannotation", false, subTaskName);
					});
				}
			}
			else {
				// try to load preannotation project	
				xmlAnaforaText = {};
				AnaforaProject.getXML(function(data) { xmlAnaforaText["preannotation"] = data;}, _setting, "preannotation");

				if(xmlAnaforaText["preannotation"] == undefined)
					xmlAnaforaText = "";
			}
		}
		setIsChanged(false);
	}


	// load anafora data
	aProjectWrapper = $("#aProjectWrapper");

	//rawText = document.getElementById("rawText").outerHTML.replace(' id="rawText"', '') ;
	//rawText = document.getElementById("rawText").innerHTML;

	//var annotatorDiv = $('<div>' + rawText + '</div>');
	//var annotatorDiv = $("#rawText").clone().attr('id', '');
	var annotatorDiv = $("#rawText");
	//rawText = document.getElementById("rawText").innerHTML;
	rawText = annotatorDiv.text();
	//annotatorDiv.css("display", "inline");
	//rawText = annotatorDiv.text();
	//var annotatorDiv = $("#rawText");
	//annotatorDiv.css("display", "inline");

	if(_setting.isAdjudication) {
		annotatorDiv.addClass("adjudicationText");
	}
	aProjectWrapper.append(annotatorDiv);

	var annotateFrame = undefined;
	if (!_setting.isCrossDoc)
		annotateFrame = new AnnotateFrame(annotatorDiv, _setting, rawText);

	var subAnnotateFrameList = {};
	if(xmlAnaforaText != "") {
		var tXMLText = {};
		if(xmlAnaforaText instanceof Object) 
			tXMLText = xmlAnaforaText;
		else
			if(_setting.isCrossDoc && !_setting.isAdjudication)
				tXMLText[_setting.taskName] = xmlAnaforaText;
			else
				tXMLText[_setting.annotator] = xmlAnaforaText;
			

		if(_setting.isCrossDoc) {
			$.each(subTaskElemList, function(stIdx, divElement) {
				subAnnotateFrameList[divElement.id] = new AnnotateFrame($(divElement), _setting, $(divElement).text());
				//subTaskDiv[divElement.id] = divElement;
			});
		}

		$.each(tXMLText, function(annotatorName) {
			if(_setting.isAdjudication && annotatorName == _setting.annotator && Object.keys(tXMLText).length == 1) {
				// read from exist .Adjudication.inprogress/completed.xml file
				if(_setting.schema == "Coreference")
					currentAProject = new AnaforaAdjudicationProjectCoreference(schema,  _setting.taskName);	
				else if(_setting.isCrossDoc) {
					currentAProject = new AnaforaCrossAdjudicationProject(schema, _setting.annotator,  _setting.taskName);
				}
				else
					currentAProject = new AnaforaAdjudicationProject(schema,  _setting.taskName);
			}
			else if(_setting.isCrossDoc) {
				// read from crossDoc file. tXMLTest will use taskName as key
				if(annotatorName == _setting.taskName) {
					currentAProject = new AnaforaCrossProject(schema, _setting.annotator, _setting.taskName);
				}
				else if(_setting.isAdjudication) {
					// is Anafora Cross Adjudication task. USe AnaforaCrossProject to read first
					currentAProject = new AnaforaCrossProject(schema, annotatorName, _setting.taskName);
				}
				else {
					// Read read from all sub task
					currentAProject = new AnaforaProject(schema, _setting.annotator, annotatorName);
					annotateFrame = new AnnotateFrame($("#" + annotatorName), _setting, $("#" + annotatorName).text());
				}
			}
			else if(annotatorName == "preannotation") {
				currentAProject = new AnaforaProject(schema, _setting.annotator, _setting.taskName);
			}
			else
				currentAProject = new AnaforaProject(schema, annotatorName, _setting.taskName);	

			currentAProject.setAnnotateFrame(annotateFrame);

			var xmlDOM;
			//try{
			{
				xmlDOM = $.parseXML(tXMLText[annotatorName]);
				if(currentAProject instanceof AnaforaCrossAdjudicationProject) {
					currentAProject.readFromXMLDOM(xmlDOM, subTaskNameList, subAnnotateFrameList);
				}
				else if(currentAProject instanceof AnaforaCrossProject) {
					
					currentAProject.readFromXMLDOM(xmlDOM, subTaskNameList, subAnnotateFrameList);
				}
				else if(currentAProject instanceof AnaforaAdjudicationProject) {
					currentAProject.readFromXMLDOM(xmlDOM);
				}
				else {
					currentAProject.readFromXMLDOM(xmlDOM, _setting.isAdjudication);
				}
			}
			/*
			catch (e) {
				if (e instanceof ErrorException) {
					errorHandler.handle(e, currentAProject);
					throw e;
				}
				else if(e instanceof WarningException) {
					console.log("Warning Exception");
					console.log(e);
				}
				else {
					err = new ErrorException(e)
					errorHandler.handle(err);
					throw err;
				}
			}
			*/
			
			aProjectList.push(currentAProject);
			if(annotatorName == "preannotation") {
				currentAProject.completed = false;
			}
		});
	}
	else if(!_setting.isAdjudication) {
		currentAProject = new AnaforaProject(schema, _setting.annotator, _setting.taskName);	
		
		currentAProject.setAnnotateFrame(annotateFrame);
		aProjectList.push(currentAProject);
	}

	if(_setting.isAdjudication) {
		
		if(currentAProject instanceof AnaforaCrossAdjudicationProject) {
			;
		}
		else if(currentAProject instanceof AnaforaCrossProject) {
			// split current crossProject to AnaforaAdjudicationProject
			var subTaskList = new Set(Object.keys(aProjectList[0].projectList).concat(Object.keys(aProjectList[1].projectList)));
			/*
			var newProjectList = {};
			for (subTask of subTaskList) {
				var newAdjProject = new AnaforaAdjudicationProject(schema, subTask);
				var subProjectList = {};
				for(tProject of aProjectList) {
					subProjectList[tProject.annotator] = tProject.projectList[subTask];
				}

				newAdjProject.addAnaforaProjectList(subProjectList);
				newAdjProject.setAnnotateFrame(aProjectList[0].projectList[subTask].annotateFrame);
				newProjectList[subTask] = newAdjProject;
			}
			*/

			/*
			$.each(subTaskElemList, function(stIdx, divElement) {
				subAnnotateFrameList[divElement.id] = new AnnotateFrame($(divElement), _setting, $(divElement).text());
				//subTaskDiv[divElement.id] = divElement;
			});
			*/
		
			currentAProject = new AnaforaCrossAdjudicationProject(schema, _setting.annotator, _setting.taskName);
			var tProjectList = {};
			for(tProject of aProjectList)
				tProjectList[tProject.annotator] = tProject;
			currentAProject.addAnaforaProjectList(tProjectList, subTaskList, subAnnotateFrameList);
		}
		else if(!(currentAProject instanceof AnaforaAdjudicationProject)) {
		
			if(_setting.schema == "Coreference")
				currentAProject = new AnaforaAdjudicationProjectCoreference(schema, _setting.taskName);
			else
				currentAProject = new AnaforaAdjudicationProject(schema, _setting.taskName);
			currentAProject.setAnnotateFrame(annotateFrame);
			var tAProjectList = {};
			$.each(aProjectList, function(idx, aProject) {
				tAProjectList[aProject.annotator] = aProject;
			});
			currentAProject.addAnaforaProjectList(tAProjectList);
			}
		$("#aProjectWrapper").css("margin-right", "540px");
	}
	else if(_setting.isCrossDoc) {
		if(!(currentAProject instanceof AnaforaCrossProject)) {
			currentAProject = new AnaforaCrossProject(schema, _setting.annotator, _setting.taskName);
		
		//currentAProject.setAnnotateFrame(annotateFrame);
			var tAProjectList = {};
			$.each(aProjectList, function(idx, aProject) {
				tAProjectList[aProject.task] = aProject;
			});
			currentAProject.addAnaforaProjectList(tAProjectList);
		}
		$("#aProjectWrapper").css("margin-right", "270px");
	}
	else {
		$("#aProjectWrapper").css("margin-right", "270px");
	}

	currentAProject.renderAnnotateFrame(_setting.isCrossDoc ?subAnnotateFrameList :undefined);

	if(!( _setting.isAdjudication && currentAProject.completed ))
		temporalSave();

	//currentAProject.annotateFrame.generateAnnotateText(currentAProject.overlap);
	//currentAProject.annotateFrame.updateAnnotateFragement(currentAProject.overlap);

	// load schema tree
	schemaDiv = $("#schema");
	schemaDiv.jstree({ 
		"json_data" : {
			"data" : [].concat(schema.rootEntityTypeList, schema.rootRelationTypeList)
		},
		"themes" : {
			"theme" : "default",
			"dots" : true,
			"icons" : false
		},
		"plugins" : [ "themes", "json_data", "checkbox", "schema", "ui"]
	})
	.bind("check_node.jstree", schemaCheckedChange)
	.bind("uncheck_node.jstree", schemaCheckedChange);

	registerHotkey(schema);

	// load schema tree to menu
	var schemaMenuElement = $("<ul>");
	for(var idx in schema.rootEntityTypeList) {
		if(!$.isFunction(schema.rootEntityTypeList[idx]))
			schemaMenuElement.append( processSchemaMenu(schema.rootEntityTypeList[idx]) );
	}
	for(var idx in schema.rootRelationTypeList) {
		if(!$.isFunction(schema.rootRelationTypeList[idx]))
			schemaMenuElement.append( processSchemaMenu(schema.rootRelationTypeList[idx]) );
	}

	schemaMenuElement.append( $("<li></li>").addClass("separator") );
	schemaMenuElement.append( $("<li><a href='#'>Display All</a></li>").bind( "click", function() { schemaDiv.jstree("check_all"); schemaCheckedChange(); } ) ) ;
	schemaMenuElement.append( $("<li><a href='#'>Hide All</a></li>").bind( "click", function() { schemaDiv.jstree("uncheck_all"); schemaCheckedChange(); } ) );
	$('#schemaMenu').append(schemaMenuElement);

	$('#account').children("a").text(_setting.remoteUser);


	// load annotation text

	// load property frame
	propertyFrameList.push(new PropertyFrame($("#propertyWrapper").children(".propertyHidden").eq(0), _setting, 0));
	propertyFrameList.push(new PropertyFrame($("#propertyWrapper").children(".propertyHidden").eq(1), _setting, 1));
	aObjSelectionMenu = new AObjSelectionMenu($("#aObjSelection"));

	$.contextMenu.types.annotation = function(item, opt, root) {
		var entitySpanElementStr;
		if(item.aObj.__proto__.parent == IAdjudicationAnaforaObj && item.aObj.decideIdx != undefined) {
			entitySpanElementStr = item.aObj.compareAObj[item.aObj.decideIdx].genElementStr();
		}
		else
			entitySpanElementStr = item.aObj.genElementStr();
		$(entitySpanElementStr).appendTo(this);
       	};

	currentAProject.updateAllFrameFragement();
	// extend entire word
	annotatorDiv.bind("mouseup", function(evt) { if ((window.getSelection && window.getSelection().toString()!=="" ) || (document.selection && document.selection.createRange().text !== "" ) ){ if(evt.altKey || evt.ctrlKey){;}else{ snapSelectionToWord();} }});
	// load relation list
	// relationFrame = new RelationFrame($("#relationFrame"));
	relationFrame = new RelationFrame($("#aProjectWrapper table"));
	var displayRelationList = [];
	if(Object.keys(currentAProject.relationList).length > 0) {
		displayRelationList = displayRelationList.concat( $.map(currentAProject.relationList, function (value, key) { return value; }) );
	}

	if (currentAProject instanceof AnaforaAdjudicationProject || currentAProject instanceof AnaforaCrossProject) {
		displayRelationList = displayRelationList.concat( $.map(currentAProject.adjudicationRelationList, function(value) { return value; }) );
		if(currentAProject.projectList != undefined) {
			$.each( currentAProject.projectList, function(annotator, aProject) {
				displayRelationList = displayRelationList.concat( $.map(aProject.adjudicationRelationList, function(value) { return value; }) );
				$.each(aProject.relationList, function(key, tRelation) {
					if(tRelation.getAdditionalData("comparePair") == undefined && !(key in currentAProject.relationList))
						displayRelationList.push(tRelation);
				});

				if(aProject.projectList != undefined) {
					$.each( aProject.projectList, function(annotator, taProject) {
						displayRelationList = displayRelationList.concat( $.map(taProject.adjudicationRelationList, function(value) { return value; }) );
						$.each(taProject.relationList, function(key, tRelation) {
							if(tRelation.getAdditionalData("comparePair") == undefined && !(key in currentAProject.relationList))
								displayRelationList.push(tRelation);
						});
					});
				}
			});
		}
	}

	if(displayRelationList != undefined && displayRelationList.length > 0) {
		relationFrame.displayRelations(displayRelationList);
		showRelationFrame();
	}
	

	$($("#viewMenu > ul").children("li").get(4)).bind( "click", function() {if($(this).children("a").hasClass('selected')) hideRelationFrame(); else showRelationFrame();} );

	if(!currentAProject.completed && editable) {
		$(navMenu.children("li").get(0)).children("ul").children("li").eq(3).removeClass("disable");
	}

	// set timer
	if(editable)
		setInterval( saveFile, 120000);

	// set task name on nav menu	
}

function saveFile() {
	if(getIsChanged() && editable) {
		$.ajax({type: 'POST', url:  _setting.root_url + "/" + _setting.app_name + "/saveFile/" + _setting.projectName + "/" + _setting.corpusName + "/" + _setting.taskName + "/" + _setting.schema + (_setting.isAdjudication ? ".Adjudication" : "") + "/", data: {'fileContent':localStorage["anafora"]}, cache: false, async: false, headers:{"X-CSRFToken":$.cookie('csrftoken') }, success: function(data) {setIsChanged(false);localStorage.removeItem("anafora");},error: function (xhr, ajaxOptions, thrownError) { errorHandler.handle(new ErrorException("Save File Error"), currentAProject); console.log(xhr.responseText);  }} );
	}
}

function setCompleted() {
	if ( editable ) {
		$.ajax({type: 'POST', url:  _setting.root_url + "/" + _setting.app_name + "/setCompleted/" + _setting.projectName + "/" + _setting.corpusName + "/" + _setting.taskName + "/" + _setting.schema + (_setting.isAdjudication ? ".Adjudication" : "") + "/", cache: false, async: false, headers:{"X-CSRFToken":$.cookie('csrftoken') }, success: function(data) {$(navMenu.children("li").get(0)).children("ul").children("li").eq(3).addClass("disable");currentAProject.completed=true;}, error: function (xhr, ajaxOptions, thrownError) { errorHandler.handle(new ErrorException("Set Completed Error"), currentAProject); console.log(xhr.responseText);  }});
	}
}

function setIsChanged(_isChanged) {
	var fileMenu = $(navMenu.children("li").get(0)).children("ul").children("li");
	if(_isChanged) {
		fileMenu.eq(1).removeClass("disable");
		window.onbeforeunload = confirmLeave;
	}
	else {
		fileMenu.eq(1).addClass("disable");
		window.onbeforeunload = null;
	}

	isChanged = _isChanged;
}

function getIsChanged() {
	return isChanged;
}

function processSchemaMenu(aType) {
	var rStr = '<li><a href="#">' + aType.type;
	var rElement;
	if (aType.hotkey != undefined)
		rStr += ' - (' + aType.hotkey + ')';
	rStr += '</a>';

	if(aType.childTypeList.length > 0) {
		rStr += '<ul></ul></li>';
		rStr = '<li class="dropdown">' + rStr.substring(4);
		rElement = $(rStr);
		for(idx in aType.childTypeList) {
			if(!$.isFunction(aType.childTypeList[idx]))
				rElement.children("ul").append( processSchemaMenu(aType.childTypeList[idx]) );
		}
	}
	else {
		rStr += '</li>';
		rElement = $(rStr);
	}

	if(aType.parentType != undefined) {
		rElement.bind('click', function(evt) { var _aType=aType; addNewAObj(_aType); });
		if(_setting.isLogging) {
			rElement.bind("click", function() { var liItem = this; eventLogging.addNewEvent(new EventLog(EventType.MENU_CLICK, liItem.innerHTML)); } );
		}
	}
	return rElement;
	
}

function schemaCheckedChange(evt, skipAObjList) {

	var schema = currentAProject.schema;
	var checkedType = [];

	schemaDiv.jstree("get_checked",null,true).each(function () {
		checkedType.push(schema.typeDict[this.id.substring(3).replace("_SLASH_", "/")]);
	});
	schema.updateCheckedType(checkedType);
	currentAProject.updateAnnotateDisplay(skipAObjList)
	relationFrame.updateRelationFrameDisplay(skipAObjList);
}

function checkEmptyProperty() {
	var aObj, aType;
	var emptyExist = false;

	if(currentAProject.selectedAObj != null) {
		aObj = currentAProject.selectedAObj;
		if(aObj instanceof AdjudicationEntity) {
			$.each(aObj.compareAObj, function(idx, entity) {
				emptyExist = emptyExist | (!checkEntityEmptyProperty(entity));
			});
		}
		else
			emptyExist = !checkEntityEmptyProperty(aObj);

		if(emptyExist)
			return false;
	}

	return true;
}
	
function checkEntityEmptyProperty(aObj) {
	//if (currentAProject.selectedAObj != null) {
		//aObj = currentAProject.selectedAObj;
		var aType = aObj.type;
		var emptyExist = false;

		if(currentAProject.schema.defaultAttribute["required"]) {
			if(aObj instanceof Entity) {
				$.each(aType.propertyTypeList, function(pIdx) {
					if(this.required && aObj.propertyList[pIdx] == undefined) {
						emptyExist = true;
						alert("Please fill in the empty property " + this.type + " first");
						return false;
					}
				});
	
			}
		}

		if(emptyExist) {
			return false;
		}
	//}

	return true;
}

function selectAObj(aObj) {
	if(aObj == null) {
		propertyFrameList[0].hide();
		propertyFrameList[1].hide();
	}
	else if(propertyFrameList[0].isAssignRelation) {
		propertyFrameList[0].modifyCurrentProperty(aObj);
	}
	else if(propertyFrameList[1].isAssignRelation) {
		propertyFrameList[1].modifyCurrentProperty(aObj);
	}
	else {
		currentAProject.selectAObj(aObj);
		showAObjProperty(aObj);
	}
}

function annotateClick(evt) {
	if(!checkEmptyProperty()) {
			return false;
	}
	var aObj;
	var subTaskName = $(this).parent().attr('id');
	var annotFrame = currentAProject.getAnnotateFrameByTaskName(subTaskName);
	var overlapIdx = annotFrame.getSpanElementIndex($(this));
	//var aObjList = currentAProject.overlap[overlapIdx].aObjList;
	var aObjList = annotFrame.overlap[overlapIdx].aObjList;
	var checkedType = currentAProject.schema.checkedType;
	var matchChecked = AnnotateFrame.matchAObjFromOverlap(aObjList, checkedType);

	if(matchChecked.length == 1) {
		aObj = matchChecked[0];
		if(aObj instanceof Relation) {
			relationFrame.relationClick(relationFrame.searchRowFromRelation(aObj));
		}
		selectAObj(aObj);

		if(_setting.isLogging) {
			eventLogging.addNewEvent(new EventLog(EventType.SPAN_CLICK, aObj.id));
		}
	}


}

function getTextFromEntity(entity) {
	var _spanText;
	var taskName = entity.getTaskName();
	$.each(entity.span, function(idx) {
		// generate display text
		if(idx == 0)
			_spanText = getTextFromSpan(this, taskName);
		else
			_spanText += "..." + getTextFromSpan(this, taskName);
	});

	return _spanText;
}

function getTextFromSpan(span, taskName) {
	var annotFrame = currentAProject.getAnnotateFrameByTaskName(taskName);

	return annotFrame.rawText.substring(span.start, span.end);
}

function temporalSave() {
	if(supports_html5_storage() && editable ) {
		
		setIsChanged( true );
		try {
			var tStr = currentAProject.writeXML();
		}
		catch(err) {
			alert("write xmlfile error!");
			throw err;
		}
		localStorage["anafora"] = tStr;
		localStorage["path"] = window.location.pathname;
	}
}

function showAObjProperty(aObj) {
	propertyFrameList[0].rootDiv.removeClass("propertyHidden").addClass("property");
	propertyFrameList[1].rootDiv.removeClass("propertyHidden").addClass("property");

	if(aObj instanceof Entity) {
		if(aObj instanceof AdjudicationEntity) {
			propertyFrameList[0].show();
			propertyFrameList[1].show();
			propertyFrameList[0].displayEntity(aObj.compareAObj[0]);
			propertyFrameList[1].displayEntity(aObj.compareAObj[1]);
	
		}
		else{
			propertyFrameList[0].show();
			propertyFrameList[1].hide();
			propertyFrameList[0].displayEntity(aObj);
		}
	}
	else {
		if(aObj instanceof AdjudicationRelation) {
			propertyFrameList[0].show();
			propertyFrameList[1].show();
			propertyFrameList[0].displayRelation(aObj.compareAObj[0]);
			propertyFrameList[1].displayRelation(aObj.compareAObj[1]);

		}
		else {
			propertyFrameList[0].show();
			propertyFrameList[1].hide();
			propertyFrameList[0].displayRelation(aObj);
		}
	}
}

function updatePropertyFrameProperty(pTypeIdx) {
	if(currentAProject.selectedAObj instanceof AdjudicationEntity || currentAProject.selectedAObj instanceof AdjudicationRelation) {
		var adjAObj = currentAProject.selectedAObj;
		var diff = adjAObj.diffProp.indexOf(pTypeIdx) >= 0;
		propertyFrameList[0].highlightDiffProp(pTypeIdx, diff);
		propertyFrameList[1].highlightDiffProp(pTypeIdx, diff);
	}
}

function updatePropertyFrameSpan() {
	if(currentAProject.selectedAObj instanceof AdjudicationEntity) {
		var adjEntity = currentAProject.selectedAObj;
		propertyFrameList[0].highlightDiffSpan(adjEntity.spanDiff);
		propertyFrameList[1].highlightDiffSpan(adjEntity.spanDiff);
	}
}

function registerHotkey(schema) {
	var body = $("body");
	body.unbind("keydown");

	if( editable ) {
		// add new annotation
		for(key in schema.hotkeyDict ) {
			body.bind("keydown", key, function(evt) {if(!checkEmptyProperty()) return false; addNewAObj(schema.hotkeyDict[evt.data]);});

			if(_setting.isLogging) {
				body.bind("keydown", key, function(evt) { eventLogging.addNewEvent(new EventLog(EventType.HOTKEY_PRESS, evt.data)); } );
			}
		}

		// space
		body.bind("keydown", function(evt) {
			switch(evt.which){
				case 32:
					selectedType = [];
					schemaDiv.jstree("get_selected").each(function () {
					selectedType.push(schema.typeDict[this.id.substring(3).replace("_SLASH_", "/")]);
					});

					if(selectedType.length == 1 && selectedType[0].childTypeList.length == 0) {
						restore();
						addNewAObj(selectedType[0]);
					}
					break;
			}
		});
			

		// 0 - 9
		for(var i=1; i<10; i++) {
			body.bind("keydown", i.toString(), function(evt) {
  if(currentAProject != undefined && currentAProject.selectedAObj != null) {
			var idx = parseInt(evt.data); 
			assignEntityToRelation(idx);
  }
  });

			if(_setting.isLogging) {
				body.bind("keydown", i.toString(), function(evt) { eventLogging.addNewEvent(new EventLog(EventType.PROP_PRESS, evt.data)); } );
			}
		}
	}

	// esc
	body.bind("keydown", "esc", function(evt) {
		restore();
		if(_setting.isLogging) {
			body.bind("keydown", "esc", function(evt) { eventLogging.addNewEvent(new EventLog(EventType.ESC_PRESS, evt.data)); });
		}
	});

	// next, prev annotation (219, 221)
	body.bind("keydown", function(evt) {
		switch(evt.which){
			case 188:	// comma
				if(_setting.isAdjudication && evt.ctrlKey)
					moveAnnotation(-1);
				else
					moveAnnotation(-1, true);
				if(_setting.isLogging) {
					eventLogging.addNewEvent(new EventLog(EventType.MOVE_PRESS, ","));
				}
				break;
			case 190:	// period
				if(_setting.isAdjudication && evt.ctrlKey)
					moveAnnotation(1);
				else
					moveAnnotation(1, true);
				if(_setting.isLogging) {
					eventLogging.addNewEvent(new EventLog(EventType.MOVE_PRESS, "."));
				}
				break;

			default:
				break;
		}
	});

	if(_setting.isAdjudication) {
		var selectMarkable = function(decideIdx) {
			if(currentAProject.selectedAObj instanceof AdjudicationEntity || currentAProject.selectedAObj instanceof AdjudicationRelation) {
				var aObj = currentAProject.selectedAObj;
				if(aObj.decideIdx == ((decideIdx+1)%2)) {
					aObj.decideIdx = undefined;
					currentAProject.completeAdjudication--;
				}

				if(aObj.decideIdx == undefined) {
					var tEvent = {};
					tEvent.data = {};
					tEvent.data._self = propertyFrameList[decideIdx];
					propertyFrameList[decideIdx].markGoldBtnClick(tEvent);
				}
			}
			else if(decideIdx == 1) {
				var aObj = currentAProject.selectedAObj;
				var tEvent = {};
				tEvent.data = {};
				tEvent.data._self = propertyFrameList[0];
				propertyFrameList[0].markGoldBtnClick(tEvent);
			}
		}

		body.bind("keydown", "left", function(evt) {
			selectMarkable(0);
			if(_setting.isLogging)
				eventLogging.addNewEvent(new EventLog(EventType.ADJ_PRESS, "left"));
		});

		body.bind("keydown", "right", function(evt) {
			selectMarkable(1);
			if(_setting.isLogging)
				eventLogging.addNewEvent(new EventLog(EventType.ADJ_PRESS, "right"));
		});

		body.bind("keydown", function(evt) {
			switch(evt.which) {
				case 220:
					splitAdjAObj();
					if(_setting.isLogging)
						eventLogging.addNewEvent(new EventLog(EventType.ADJ_PRESS, "split"));
					break;
				default:
					break;
			}
		});
	}
}

function restore() {
	propertyFrameList[0].restore();
	if(propertyFrameList[1].isShow()) {
		propertyFrameList[1].restore();
	}

	if(currentAProject.selectedAObj != null)
		currentAProject.selectAObj(currentAProject.selectedAObj);
	schemaDiv.jstree("restore");
}
function assignEntityToRelation(propIdx) {
	if(currentAProject != undefined && currentAProject.selectedAObj != null) {
		if((currentAProject.selectedAObj instanceof AdjudicationEntity || currentAProject.selectedAObj instanceof AdjudicationRelation) && currentAProject.selectedAObj.decideIdx !== undefined ) {
			$($(propertyFrameList[currentAProject.selectedAObj.decideIdx].propertyTable.children("tbody").children("tr").eq(propIdx-1)[0]).children("td").eq(1)).trigger("click");
		}
		else
			$($(propertyFrameList[0].propertyTable.children("tbody").children("tr").eq(propIdx-1)[0]).children("td").eq(1)).trigger("click");
	}
}

function moveAnnotation(step, adj) {
	if(currentAProject != undefined) {
		if(currentAProject.selectedAObj == null)
			var annotFrame = currentAProject.getAnnotateFrame();
		else
			var annotFrame = currentAProject.getAnnotateFrame(currentAProject.selectedAObj);
		var tAObj = annotFrame.moveAnnotation(step, adj, currentAProject.selectedAObj);
		if(tAObj != undefined) {
			if(tAObj instanceof Relation) {
				relationFrame.relationClick(relationFrame.searchRowFromRelation(tAObj));
			}
			selectAObj(tAObj);
		}
		else {
			alert("Could not find any more annotation");
		}
	}
}

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function showRelationFrame() {
	
	aProjectWrapper.css("padding-bottom", (relationFrame.getHeight() + 10).toString() + "px");
	relationFrame.show();
	$($("#viewMenu > ul").children("li").get(4)).children("a").addClass("selected");
}

function hideRelationFrame() {
	aProjectWrapper.css("padding-bottom", "10px");
	relationFrame.hide();
	$($("#viewMenu > ul").children("li").get(4)).children("a").removeClass("selected");
}

function splitAdjAObj() {
	var adjAObj = null;
	if(_setting != undefined && _setting.isAdjudication && currentAProject !== undefined && ((adjAObj = currentAProject.selectedAObj) !== null) && (adjAObj instanceof AdjudicationEntity || adjAObj instanceof AdjudicationRelation)) {
		currentAProject.splitAdjAObj(adjAObj);
		currentAProject.selectedAObj = adjAObj.compareAObj[0];
		if(adjAObj instanceof AdjudicationRelation) {
			relationFrame.removeRelationRow();
			relationFrame.insertRelationRow(adjAObj.compareAObj[0]);
			relationFrame.insertRelationRow(adjAObj.compareAObj[1]);
			relationFrame.relationClick(relationFrame.searchRowFromRelation(currentAProject.selectedAObj));
		}
		temporalSave();
		selectAObj(currentAProject.selectedAObj);
	}
}

function addNewAObj(aType) {
	var newAObj;
	var newID;
	var taskName;
	if(_setting.isCrossDoc) {

		var subTaskElemList = $("#rawText > div");
		var subTaskNameList = $.map(subTaskElemList, function(taskElem) { return taskElem.id; });
				
		var newSubTaskIdx = subTaskNameList.length -1;

		for(var elementIdx = 0;elementIdx < subTaskNameList.length - 1;elementIdx++) {
			if($(subTaskElemList[elementIdx]).position().top <=0 && $(subTaskElemList[elementIdx+1]).position().top >0){
				newSubTaskIdx = elementIdx;
				break
			}
		}
		taskName = subTaskNameList[newSubTaskIdx];
	}
	else {
		taskName = _setting.taskName;
	}

	if($("#taskName").children("a").text() != taskName)
		$('#taskName').children("a").text(taskName);
	
	var annotFrame = currentAProject.getAnnotateFrameByTaskName(taskName);
	if (editable) {
		
		if( aType instanceof EntityType) {
			try{
				var newSpan = annotFrame.getSelectRangeSpan();
				if(newSpan.start == newSpan.end)
					return ;
				newID = currentAProject.getNewEntityId(taskName);
				newAObj = new Entity(newID, aType, [newSpan]);
			}
			catch(err) {
				return ;
			}
		}
		else {
			newID = currentAProject.getNewRelationId(taskName);
			newAObj = new Relation(newID, aType);
		}
		currentAProject.addAObj(newAObj);
		annotFrame.addAObj(newAObj);

		// update schema tree count
		var tree = $.jstree._reference(schemaDiv);
		tree.refresh($("#ID_" + aType.type.replace("/", "_SLASH_")));
		temporalSave();
		currentAProject.selectAObj(newAObj);
		showAObjProperty(newAObj)

		// update relation frame
		if(newAObj instanceof Relation) {
			relationFrame.unHighlight();
			relationFrame.insertRelationRow(newAObj);

			// check if relation frame is shown
			if(!relationFrame.isShown)			
				showRelationFrame();
		}
	}
}
