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

function onLoad() {
	// read schemaMap in _setting
	var tDiv = document.createElement('div');
	tDiv.innerHTML = _setting.schemaMap;
	var schemaMapStr = tDiv.firstChild.nodeValue;
	_setting.schemaMap = $.parseJSON(schemaMapStr);

	// read annotator in _setting

	$('#account').children("a").text(_setting.remoteUser);
	projectSelector = new ProjectSelector(_setting);
	//projectSelector = undefined;
	

	navMenu = $("#headerWrapper > ul");

	var fileMenu = $(navMenu.children("li").get(0)).children("ul").children("li");
	fileMenu.eq(0).bind("click", function() { if(getIsChanged() && window.confirm("Save Task?")) { saveFile(); } projectSelector.selectProject(); projectSelector.popup(); });
	fileMenu.eq(1).bind("click", function() { saveFile(); });
	fileMenu.eq(3).bind("click", function() { if(_setting.isAdjudication){ currentAProject.adjudicationCompleted();} else{ if(getIsChanged()) {saveFile();} setCompleted();}});

	if(_setting.projectName == "" || _setting.corpusName == "" || _setting.taskName == "" || _setting.schema === undefined)
		projectSelector.popup();
	else
		loadNewProject();
	/*
	if(_setting.projectName == "") {
		projectSelector.selectProject();
	}
	else if(_setting.corpus == "") 
		projectSelector.selectCorpus();
	else
		loadNewProject();
	*/
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
		var schemaJSONStr = $.ajax({ type: "GET", url: _setting.root_url + "/" + _setting.app_name + "/schema/" + _setting.schema +  "/" + schemaIdx.toString(), cache: false, async: false}).responseText;
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
		AnaforaProject.getXML(function(data) { xmlAnaforaText = data;}, _setting);

		if(xmlAnaforaText == "" || xmlAnaforaText == undefined) {

			if (_setting.isAdjudication) {
				xmlAnaforaText = {};
				var adjAnnotator = AnaforaProject.getAdjudicationAnnotator(_setting);
	
				var annotatorName = "";
				var xmlSuccessFunc = function(data) {
					xmlAnaforaText[annotatorName] = data;
				}

				/*
				var adjSrcSchemaModeList = Object.keys(_setting.schemaMap[_setting.schema]).sort();
				var adjIdx = adjSrcSchemaModeList.indexOf("Adjudication");
				var adjSrcSchemaMode = adjSrcSchemaModeList[(adjIdx+1) % adjSrcSchemaModeList.length];
				*/
	
				$.each(adjAnnotator, function(idx, _annotatorName) {
					annotatorName = _annotatorName;
					AnaforaProject.getXML(xmlSuccessFunc, _setting, _annotatorName, false);
				});
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
	//rawText = $("#rawText").text();
	rawText = document.getElementById("rawText").innerHTML;

	var annotatorDiv = $('<div>' + rawText + '</div>');
	rawText = annotatorDiv.text();

	if(_setting.isAdjudication) {
		annotatorDiv.addClass("adjudicationText");
	}
	aProjectWrapper.append(annotatorDiv);

	var annotateFrame = new AnnotateFrame(annotatorDiv, _setting, rawText);
	if(xmlAnaforaText != "") {
		var tXMLText = {};
		if(xmlAnaforaText instanceof Object) 
			tXMLText = xmlAnaforaText;
		else
			tXMLText[_setting.annotator] = xmlAnaforaText;
			
		$.each(tXMLText, function(annotatorName) {
			if(_setting.isAdjudication && annotatorName == _setting.annotator && Object.keys(tXMLText).length == 1)
				currentAProject = new AnaforaAdjudicationProject(schema,  _setting.taskName);	
			else if(annotatorName == "preannotation") {
				currentAProject = new AnaforaProject(schema, _setting.annotator, _setting.taskName);
			}
			else
				currentAProject = new AnaforaProject(schema, annotatorName, _setting.taskName);	
			currentAProject.setAnnotateFrame(annotateFrame);

			var xmlDOM = $.parseXML(tXMLText[annotatorName]);
			currentAProject.readFromXMLDOM(xmlDOM, _setting.isAdjudication);
			aProjectList.push(currentAProject);
		});
	}
	else if(!_setting.isAdjudication) {
		currentAProject = new AnaforaProject(schema, _setting.annotator, _setting.taskName);	
		
		currentAProject.setAnnotateFrame(annotateFrame);
		aProjectList.push(currentAProject);
	}

	if(_setting.isAdjudication) {
		
		if(!(currentAProject instanceof AnaforaAdjudicationProject)) {
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
	else {
		$("#aProjectWrapper").css("margin-right", "270px");
	}

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
	schemaMenuElement.append( $("<li><a href='#'>Display All</a></li>").bind( "click", function() { schemaDiv.jstree("check_all"); schemaCheckedChange(); } ) );
	schemaMenuElement.append( $("<li><a href='#'>Hide All</a></li>").bind( "click", function() { schemaDiv.jstree("uncheck_all"); schemaCheckedChange(); } ) );

	$('#schemaMenu').append(schemaMenuElement);

	$('#account').children("a").text(_setting.remoteUser);


	// load annotation text

	// load property frame
	propertyFrameList.push(new PropertyFrame($("#propertyWrapper").children(".propertyHidden").eq(0), _setting, 0));
	propertyFrameList.push(new PropertyFrame($("#propertyWrapper").children(".propertyHidden").eq(1), _setting, 1));
	aObjSelectionMenu = new AObjSelectionMenu($("#aObjSelection"));

	$.contextMenu.types.entity = function(item, opt, root) {
		var entitySpanElementStr = item.aObj.genElementStr();
		$(entitySpanElementStr).appendTo(this);
        	};

	currentAProject.annotateFrame.updateAnnotateFragement();
	// annotatorDiv.children("span").bind('click', annotateClick);
	// extend entire word
	annotatorDiv.bind("mouseup", function(evt) { if ((window.getSelection && window.getSelection().toString()!=="" ) || (document.selection && document.selection.createRange().text !== "" ) ){ if(evt.altKey || evt.ctrlKey){;}else{ snapSelectionToWord();} }});
	// load relation list
	// relationFrame = new RelationFrame($("#relationFrame"));
	relationFrame = new RelationFrame($("#aProjectWrapper table"));
	var displayRelationList = undefined;
	if(Object.keys(currentAProject.relationList).length > 0) {
		displayRelationList = $.map(currentAProject.relationList, function (value, key) { return value; });
	}
	else if (currentAProject instanceof AnaforaAdjudicationProject) {
		displayRelationList = $.map(currentAProject.adjudicationRelationList, function(value) { return value; });
		$.each( currentAProject.projectList, function(annotator, aProject) {
			$.each(aProject.relationList, function(key, tRelation) {
				//if( currentAProject.comparePairRelation[tRelation] == undefined)
				if(tRelation.getAdditionalData("comparePair") == undefined)
					displayRelationList.push(tRelation);
			});
		});
		if(displayRelationList.length == 0)
			displayRelationList = undefined;
	}

	if(displayRelationList != undefined) {
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
	$('#taskName').children("a").text(_setting.taskName);
}

function saveFile() {
	if(getIsChanged() && editable) {
		$.ajax({type: 'POST', url:  _setting.root_url + "/" + _setting.app_name + "/saveFile/" + _setting.projectName + "/" + _setting.corpusName + "/" + _setting.taskName + "/" + _setting.schema + (_setting.isAdjudication ? ".Adjudication" : "") + "/", data: {'fileContent':localStorage["anafora"]}, cache: false, async: false, headers:{"X-CSRFToken":$.cookie('csrftoken') }, success: function(data) {setIsChanged(false);localStorage.removeItem("anafora");},error: function (xhr, ajaxOptions, thrownError) { console.log(xhr.responseText); }} );
	}
}

function setCompleted() {
	if ( editable ) {
		$.ajax({type: 'POST', url:  _setting.root_url + "/" + _setting.app_name + "/setCompleted/" + _setting.projectName + "/" + _setting.corpusName + "/" + _setting.taskName + "/" + _setting.schema + (_setting.isAdjudication ? ".Adjudication" : "") + "/", cache: false, async: false, headers:{"X-CSRFToken":$.cookie('csrftoken') }, success: function(data) {$(navMenu.children("li").get(0)).children("ul").children("li").eq(3).addClass("disable");currentAProject.completed=false;}});
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
	}
	return rElement;
	
}

function schemaCheckedChange(evt) {

	var schema = currentAProject.schema;
	var checkedType = [];

	schemaDiv.jstree("get_checked",null,true).each(function () {
		checkedType.push(schema.typeDict[this.id.substring(3).replace("_SLASH_", "/")]);
	});
	schema.updateCheckedType(checkedType);
	currentAProject.updateAnnotateDisplay();
	relationFrame.updateRelationFrameDisplay();
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
	if(propertyFrameList[0].isAssignRelation) {
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
	var overlapIdx = currentAProject.annotateFrame.getSpanElementIndex($(this));
	//var aObjList = currentAProject.overlap[overlapIdx].aObjList;
	var aObjList = currentAProject.annotateFrame.overlap[overlapIdx].aObjList;
	var checkedType = currentAProject.schema.checkedType;
	var matchChecked = AnnotateFrame.matchAObjFromOverlap(aObjList, checkedType);
	/*
	var matchChecked = $.grep(aObjList, function(aObj) {
		return checkedType.indexOf(aObj.type) != -1;
	});
	*/

	if(matchChecked.length == 1) {
		aObj = matchChecked[0];
		if(aObj instanceof Relation) {
			relationFrame.relationClick(relationFrame.searchRowFromRelation(aObj));
		}
		selectAObj(aObj);
	}
}

function getTextFromEntity(entity) {
	var _spanText;
	$.each(entity.span, function(idx) {
		// generate display text
		if(idx == 0)
			_spanText = getTextFromSpan(this);
		else
			_spanText += "..." + getTextFromSpan(this);
	});

	return _spanText;
}

function getTextFromSpan(span) {
	return rawText.substring(span.start, span.end);
}

function temporalSave() {
	if(supports_html5_storage() && editable ) {
		
		setIsChanged( true );
		var tStr = currentAProject.writeXML();
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
		}

		// +
		body.bind("keydown", "+", function(evt) {
			alert("+");
		});

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
		}
	}

	// esc
	body.bind("keydown", "esc", function(evt) {
		restore();
	});

	// next, prev annotation (219, 221)
	body.bind("keydown", function(evt) {
		switch(evt.which){
			case 188:
				if(_setting.isAdjudication && evt.ctrlKey)
					moveAnnotation(-1);
				else
					moveAnnotation(-1, true);
				break;
			case 190:
				if(_setting.isAdjudication && evt.ctrlKey)
					moveAnnotation(1);
				else
					moveAnnotation(1, true);
				break;

			default:
				break;
		}
	});

	if(_setting.isAdjudication) {
		var selectMarkable = function(decideIdx) {
			if(currentAProject.selectedAObj instanceof AdjudicationEntity) {
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
		});

		body.bind("keydown", "right", function(evt) {
			selectMarkable(1);
		});
	}
}

function restore() {

	propertyFrameList[0].restore();
	if(propertyFrameList[1].isShow()) {
		propertyFrameList[1].restore();
	}

	schemaDiv.jstree("restore");
	//schemaCheckedChange();

}
function assignEntityToRelation(propIdx) {
	if(currentAProject != undefined && currentAProject.selectedAObj != null) {
		$($(propertyFrameList[0].propertyTable.children("tbody").children("tr").eq(propIdx-1)[0]).children("td").eq(1)).trigger("click");

	}
}

function moveAnnotation(step, adj) {
	if(currentAProject != undefined) {
		var tAObj = currentAProject.annotateFrame.moveAnnotation(step, adj, currentAProject.selectedAObj);
		if(tAObj != undefined) {
			
			if(tAObj instanceof Relation) {
				relationFrame.relationClick(relationFrame.searchRowFromRelation(tAObj));
			}
			selectAObj(tAObj);
		}
	}
}
/*
function moveAnnotation(step, adj) {
	var positIdx = Object.keys(currentAProject.annotateFrame.positIndex);
	var startdx;
	var spanIdx = 0;
	var newEntity;
	if(positIdx.length > 0) {
		startIdx = positIdx[0];
		spanIdx = 0;
		if(currentAProject.selectedAObj == null && !adj) {
			newEntity = currentAProject.positIndex[positIdx[0]][0];
		}
		else {
			var currentStartIdx = (currentAProject.selectedAObj == null ) ? startIdx : currentAProject.selectedAObj.span[0].start;
			startIdx = currentStartIdx;
			var currentSpanIdx = (currentAProject.selectedAObj == null ) ? spanIdx : currentAProject.annotateFrame.positIndex[startIdx].indexOf(currentAProject.selectedAObj);
			spanIdx = currentSpanIdx;
			do {
				if((step == -1 && spanIdx == 0)||(step == 1 && spanIdx == currentAProject.annotateFrame.positIndex[startIdx].length-1)) {
					var tPosIdx = positIdx.indexOf(startIdx.toString());
					if(step == -1){
						if(tPosIdx == 0)
							startIdx = positIdx[positIdx.length-1];
						else
							startIdx = positIdx[tPosIdx-1];
						spanIdx = currentAProject.positIndex[startIdx].length-1;
					}
					else {
						if(tPosIdx == positIdx.length-1)
							startIdx = positIdx[0];
						else
							startIdx = positIdx[tPosIdx+1];
						spanIdx = 0;
					}

				}
				else
					spanIdx += (step);

				newEntity = currentAProject.annotateFrame.positIndex[startIdx][spanIdx];
				if(newEntity.span[0].start == startIdx && (!adj || (adj && ((newEntity instanceof AdjudicationEntity && newEntity.decideIdx == undefined) || (!(newEntity instanceof AdjudicationEntity) && newEntity.getAdditionalData("adjudication") == undefined ) ))))
					break;
			}
			while(currentStartIdx != startIdx || spanIdx != currentSpanIdx);

		}
		if(newEntity != undefined) {
			if(!checkEmptyProperty()) {
				return false;
			}
			selectAObj(newEntity);
		}
		else
			alert("Can't find match annotation");
	}
}
*/

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

function addNewAObj(aType) {
	var newAObj;
	var newID;
	if (editable) {
		
		if( aType instanceof EntityType) {
			var newSpan = currentAProject.annotateFrame.getSelectRangeSpan();
			if(newSpan.start == newSpan.end)
				return ;
			newID = currentAProject.getNewEntityId();
			newAObj = new Entity(newID, aType, [newSpan]);
		}
		else {
			newID = currentAProject.getNewRelationId();
			newAObj = new Relation(newID, aType);
			
		}
		currentAProject.addAObj(newAObj);
		currentAProject.annotateFrame.addAObj(newAObj);

		// update schema tree count
		var tree = $.jstree._reference(schemaDiv);
		//checkedList = tree.get_checked();
		//tree.refresh(currentAProject.schema.typeDict[aType.type]);
		tree.refresh($("#ID_" + aType.type.replace("/", "_SLASH_")));
		/*
		tree.uncheck_all();
		$.each(checkedList, function() {
			tree.change_state($("#" + this.id, false));
		});
		*/
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
