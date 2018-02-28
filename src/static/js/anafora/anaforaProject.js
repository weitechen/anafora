function AnaforaProject(schema, annotator, task) {
	this.schema = schema
	this.entityList = {};
	this.relationList = {};
	this.typeCount = {};
	this.maxEntityIdx = 0;
	this.maxRelationIdx = 0;
	this.annotator = annotator;
	this.task = task;
	this.selectedAObj = null;
	this.completed = false;
	this.annotateFrame = undefined;
	this.parentProject = undefined;

	this.tEntityList = {};
	this.tRelationList = {};
}

AnaforaProject.prototype.setParentProject = function(parentProject) {
	this.parentProject = parentProject;
}

AnaforaProject.prototype.setAnnotateFrame = function(annotateFrame) {
	this.annotateFrame = annotateFrame;
}

AnaforaProject.prototype.moveOutPreannotation = function(aObj) {
	if(aObj == undefined)
		aObj = this.selectedAObj;
	var term = aObj.id.split("@");
	if(term[3] == "preannotation") {
		var oldIdx = parseInt( term[0] );
		var newID;
		if(aObj instanceof Entity)
			newID = this.getNewEntityId();
		else
			newID = this.getNewRelationId();

		var newIdx = parseInt( newID.split("@")[0] );
		aObj.id = newID;
		
		if(aObj instanceof Entity) {
			delete this.entityList[oldIdx];
			this.entityList[newIdx] = aObj;
		}
		else {
			delete this.relationList[oldIdx];
			this.relationList[newIdx] = aObj;
		}

		propertyFrameList[0].displayPropertyAType(currentAProject.selectedAObj);
	}
}

AnaforaProject.prototype.updateAllFrameFragement = function() {
	this.annotateFrame.updateAnnotateFragement();
}
AnaforaProject.prototype.updateProperty = function(aObj, pIdx, value) {
	if(aObj.type.propertyTypeList[pIdx].input == InputType.LIST) {
		aObj.addListProperty(value, pIdx);
		aObj.propertyList[pIdx].sort(IAnaforaObj.sort);
		var annotFrame = currentAProject.getAnnotateFrame(value);
		if(annotFrame == undefined)
			currentAProject.getAnnotateFrameByTaskName(subTaskNameList[0]);


		if(annotFrame != undefined ) {
			if(value instanceof Entity) {
				annotFrame.addEntityPosit(value, aObj);
				if(aObj !== this.selectedAObj)
					annotFrame.addEntityPosit(value, this.selectedAObj);
			}
			else {
				annotFrame.addRelationPosit(value, aObj);
				if(aObj !== this.selectedAObj)
					annotFrame.addRelationPosit(value, currentAProject.selectedAObj);
			}
		
			var updateRange = value.getSpanRange();
			annotFrame.updateOverlapRange(updateRange[0], updateRange[1]);
		}
	}
	else {
		aObj.updateProperty(value, pIdx);
	}
}

AnaforaProject.prototype.setAnnotateFrame = function(annotateFrame) {
	this.annotateFrame = annotateFrame;
}

AnaforaProject.prototype.getNewEntityId = function(taskName) {
	this.maxEntityIdx++;
	return this.maxEntityIdx.toString() + '@e@' + this.task + '@' + this.annotator;
}

AnaforaProject.prototype.getNewRelationId = function(taskName) {
	this.maxRelationIdx++;
	return this.maxRelationIdx.toString() + '@r@' + this.task + '@' + this.annotator;
}

AnaforaProject.prototype.writeXML = function() {
	var rStr = this.getXMLFileHead();

	rStr += '<annotations>\n';

	rStr += this.getXMLEntityList();
	rStr += this.getXMLRelationList();

	rStr += '</annotations>\n\n';
	
	var tAdjudicationStr = this.getXMLAdjudicationList();
	if(tAdjudicationStr != "") {

		rStr += '<adjudication>\n';
		rStr += tAdjudicationStr;
		rStr += '</adjudication>\n\n';
	}
	rStr +=	this.getXMLFileTail();

	return rStr;
}

AnaforaProject.prototype.getXMLFileHead = function() {
	var now = new Date();
	return '<?xml version="1.0" encoding="UTF-8"?>\n' + 
'\n' + 
'<data>\n' +
'<info>\n' + 
'  <savetime>' + ('0'+now.getHours()).substr(-2,2) + ':' + ('0'+now.getMinutes()).substr(-2,2) + ':' + ('0'+now.getSeconds()).substr(-2,2) + ' ' + ('0'+now.getDate()).substr(-2,2)+'-'+('0'+now.getMonth()).substr(-2,2)+'-'+(now.getFullYear()) + '</savetime>\n' +
'  <progress>' + (this.completed ? "completed" : "in-progress") + '</progress>\n' +
'</info>\n' + 
'\n' +
'<schema path="./" protocol="file">temporal.schema.xml</schema>\n' +
'\n';
}

AnaforaProject.prototype.getXMLFileTail = function() {
	return '</data>';
}

AnaforaProject.prototype.getXMLEntityList = function() {
	var _self = this;
	var rStr = "";
	$.each(this.entityList, function(idx, entity) {
		if(_setting == undefined || !_setting.isAdjudication || (_setting.isAdjudication && _self instanceof AnaforaAdjudicationProject))
			rStr += entity.toXMLString() + '\n\n';
		else {
			var annotator = entity.id.split('@')[3];
			if(annotator !== "gold")
				rStr += entity.toXMLString() + '\n\n';
				
		}
	});
	return rStr;
}

AnaforaProject.prototype.getXMLRelationList = function() {
	var rStr = "";
	var _self = this;
	$.each(this.relationList, function(idx, relation) {
		if(_setting == undefined || !_setting.isAdjudication || _setting.isAdjudication && _self instanceof AnaforaAdjudicationProject)
			rStr += relation.toXMLString() + '\n\n';
		else {
			var annotator = relation.id.split('@')[3];
			if(annotator !== "gold")
				rStr += relation.toXMLString() + '\n\n';

		}
	});
	return rStr;
}

AnaforaProject.prototype.getXMLAdjudicationList = function() {
	return "";
}

AnaforaProject.prototype.temporaryHighlight = function(highlightAObj) {
	if(this.selectedAObj) {
		this.drawAObj(this.selectedAObj);
	}

	lastSpanElement = this.entitySelect(highlightAObj);

	var aProjectDiv = aProjectWrapper.children("div");
	if( lastSpanElement != undefined &&( lastSpanElement.position().top < 0 || lastSpanElement.position().top > aProjectDiv.height()) )
		aProjectDiv.scrollTop(aProjectDiv.scrollTop() + lastSpanElement.position().top);
}

AnaforaProject.prototype.getAnnotateFrameByTaskName = function(taskName) {
	return this.annotateFrame;
}

AnaforaProject.prototype.getAnnotateFrame = function(aObj) {
	return this.annotateFrame;
}

AnaforaProject.prototype.entitySelect = function(entity, annotFrame) {
	var spanElement;
	var _self = this;
	var annotFrame = this.getAnnotateFrame(entity);
	var spanList = annotFrame.frameDiv.find("span");

	$.each(entity.markElement, function() {
		var idx = annotFrame.overlap.indexOf(this);
		spanElement = $(spanList[idx]);
		spanElement.css("background-color", "#" + entity.type.color);
		spanElement.removeClass("filterOut").removeClass("entity").addClass("highLight");
	});

	return spanElement;
}

AnaforaProject.prototype.selectAObj = function(selectedAObj) {
	var _self = this;
	var checkedType = this.schema.checkedType;
	var lastSpanElement = undefined;

	if(this.selectedAObj) {
		this.drawAObj(this.selectedAObj);

		this.selectedAObj = undefined;
	}

	if(selectedAObj instanceof Entity) {
		lastSpanElement = this.entitySelect(selectedAObj);

		// un-highlight relation frame
		relationFrame.unHighlight();
	}
	else {
		$.each(selectedAObj.type.propertyTypeList, function(idx, aType) {
			if(aType.input == InputType.LIST) {
				var propertyList = undefined;
				if(selectedAObj instanceof AdjudicationRelation)
					if (selectedAObj.decideIdx !== undefined) 
						propertyListCont = selectedAObj.compareAObj[selectedAObj.decideIdx].propertyList[idx];
					else {
						if(selectedAObj.compareAObj[0].propertyList[idx] == undefined && selectedAObj.compareAObj[1].propertyList[idx] == undefined) {
							;
						}
						else if(selectedAObj.compareAObj[0].propertyList[idx] !== undefined && selectedAObj.compareAObj[1].propertyList[idx] == undefined)
							propertyListCont = selectedAObj.compareAObj[0].propertyList[idx];
						else if(selectedAObj.compareAObj[0].propertyList[idx] == undefined && selectedAObj.compareAObj[1].propertyList[idx] !== undefined)
							propertyListCont = selectedAObj.compareAObj[1].propertyList[idx];
						else
							propertyListCont = selectedAObj.compareAObj[1].propertyList[idx].concat(selectedAObj.compareAObj[1].propertyList[idx]);
					}
				else
					propertyListCont = selectedAObj.propertyList[idx];

				if(propertyListCont != undefined) {
					$.each(propertyListCont, function(listIdx) {
						lastSpanElement = _self.entitySelect(propertyListCont[listIdx]);
					});
				}
			}
		});
	}

	var aProjectDiv = aProjectWrapper.children("div");
	/*
	if( lastSpanElement != undefined &&( lastSpanElement.position().top < 0 || lastSpanElement.position().top > aProjectDiv.height()) )
		aProjectDiv.scrollTop(aProjectDiv.scrollTop() + lastSpanElement.position().top);
	*/

	this.selectedAObj = selectedAObj;
}

AnaforaProject.prototype.drawAObj = function(aObj) {
	var checkedType = this.schema.checkedType;
	var _self = this;

	var drawEntityFunc = function(entity) {
		var annotFrame = _self.getAnnotateFrame(entity);
		var overlapList = {};
		$.each(entity.markElement, function(mIdx) {
			var overlap = entity.markElement[mIdx];
			//var idx = _self.overlap.indexOf(overlap);
			var idx = annotFrame.overlap.indexOf(overlap);
			//overlapList[idx] = _self.overlap[idx];
			if(idx >= 0)
				overlapList[idx] = annotFrame.overlap[idx];
		});

		annotFrame.updateOverlapList(overlapList, checkedType); 
	}

	if(aObj instanceof Entity)
		drawEntityFunc(aObj);
	else {
		$.each(aObj.type.propertyTypeList, function(idx, aType) {
			if(aType.input == InputType.LIST && aObj.propertyList[idx] != undefined) {
				$.each(aObj.propertyList[idx], function(listIdx) {

					drawEntityFunc(aObj.propertyList[idx][listIdx]);
				});
			}
		});
	}
}

AnaforaProject.prototype.readFromXMLDOM = function(xml, isAdjudication) {

	var xmlDOM = $(xml);
	var infoDOM = xmlDOM.find("info");
	this.completed = (infoDOM.find("progress").text() == "completed");
	var schemaDOM = xmlDOM.find("schema");
	var annotationDOM = xmlDOM.find("annotations");
	var _self = this;

	var idx;
	// parse annotations

	$(annotationDOM).children().each( function() {
		try {
			if (this.tagName == "entity") {
				var entity = Entity.genFromDOM(this, _self.schema);
				idx = parseInt(entity.id.split('@')[0]);
				_self.entityList[idx] = entity;
	
				_self.addTypeCount(entity.type);
			}
			else if (this.tagName == "relation") {
				var relation = Relation.genFromDOM(this, _self.schema);
				idx = parseInt(relation.id.split('@')[0]);
				_self.relationList[idx] = relation;
				_self.addTypeCount(relation.type);
			}
		}
		catch(err) {
			err += "\nwith XMLDOM: \n" + this.innerHTML;
			throw err;
		}
	});

	this.maxEntityIdx = Object.keys(this.entityList).max();
	this.maxRelationIdx = Object.keys(this.relationList).max();

	if(this.maxEntityIdx == -Infinity)
		this.maxEntityIdx = 0;

	if(this.maxRelationIdx == -Infinity)
		this.maxRelationIdx = 0;

	$.each(this.entityList, function(idx, entity) {
		// update link
		if ($.inArray(entity.type, _self.schema.linkingType) != -1) 
			_self.updateLinking(entity.type, entity);
	});

	$.each(this.relationList, function(idx, relation) {
		// update relation list link
		if ($.inArray(relation.type, _self.schema.linkingType) != -1)
			_self.updateLinking(relation.type, relation);
	});
}

AnaforaProject.getXML = function(successFunc, setting, annotator, isAdjudication) {
	$.ajax({ type: "GET", url: setting.root_url + "/" + setting.app_name + "/xml/" + setting.projectName + "/" + setting.corpusName + "/" + setting.taskName  + "/" + setting.schema + (isAdjudication == undefined ? ( setting.isAdjudication ? ".Adjudication" : "" ) : ( isAdjudication ? ".Adjudication" : "")) + "/" + (annotator==undefined ? (setting.annotator == setting.remoteUser ? "" :(setting.annotator + "/") ) : (annotator + "/")), success: successFunc, cache: false, async: false, statusCode: {403: function() {throw "Permission Deny"; }, 404: function() { ;} }});
}

AnaforaProject.getAdjudicationAnnotator = function(setting) {
	var annotatorJsonStr = "";
	$.ajax({ type: "GET", url: setting.root_url + "/" + setting.app_name + "/completeAnnotator/" + setting.projectName + "/" + setting.corpusName + "/" + setting.taskName + "/" + setting.schema + "/", success: function(data) {annotatorJsonStr = data;}, cache: false, async: false});

	if(annotatorJsonStr == "")
		return [];
	else {
		
		var tDiv = document.createElement('div');
		tDiv.innerHTML = annotatorJsonStr;
		var annotatorStr = tDiv.firstChild.nodeValue;
		return $.parseJSON(annotatorStr);
	}
}

AnaforaProject.prototype.updateAnnotateDisplay = function(skipAObjList) {
	var checkedType = this.schema.checkedType;
	var diffCheckedType = this.schema.getDiffCheckedType();
	var _self = this;

	if(this.annotateFrame == undefined) {
		$.each(this.projectList, function(subTaskName, aProject) {
			aProject.annotateFrame.updateOverlapList(undefined, this.schema.checkedType, diffCheckedType, skipAObjList);
		});
	}
	else
		this.annotateFrame.updateOverlapList(undefined, this.schema.checkedType, diffCheckedType, skipAObjList);
}

AnaforaProject.prototype.findEntityByIdx = function(idx) {
	return this.entityList[idx];
}

AnaforaProject.prototype.findRelationByIdx = function(idx) {
	return this.relationList[idx];
}

AnaforaProject.prototype.getAObjFromID = function(id) {
	var valList = id.split("@");
	if(valList[2]  == this.task) {
		var sID =parseInt(valList[0]);
		if(valList[1] == "e")
			return this.entityList[sID];
		else if(valList[1] == "r")
			return this.relationList[sID];
		else
			throw new ErrorException("Invalid id ''" + id + "''");
	}
	else {
		if(this.parentProject == undefined) {
			throw new ErrorException("Can not find subTaskName ``" + valList[2] + "'' when searching annotation ``" + id + "'' without parent project");
		}
		return this.parentProject.projectList[valList[2]].getAObjFromID(id);
	}
}

AnaforaProject.prototype.updateLinking = function(aType, aObj) {

	var idx;
	var _self = this;

	for(idx=0;idx<aType.propertyTypeList.length;idx++) {
		if (aType.propertyTypeList[idx].input == InputType.LIST) {
			var valueList = aObj.propertyList[idx];
			if(valueList != undefined) {
				$.each(valueList, function(linkIdx, val) {
					if(!(val instanceof IAnaforaObj)) {
						var valList = val.split('@');
						var linkedAObj = undefined;
	
						if(valList[2] != _self.task) {
							linkedAObj = _self.getAObjFromID(val);

						}
						else if(valList[3] == "gold" || valList[3] == _self.annotator) {
							if(valList[1] == 'e')
								linkedAObj = AnaforaProject.prototype.findEntityByIdx.call(_self, parseInt(valList[0]));
							else if(valList[1] == 'r')
								linkedAObj = AnaforaProject.prototype.findRelationByIdx.call(_self, parseInt(valList[0]));
						}
						else {
							var tAObj = undefined;
							if(valList[1] == 'e')
								tAObj = _self.entityList[parseInt(valList[0])];
							else if(valList[1] == 'r')
								tAObj = _self.relationList[parseInt(valList[0])];
	
							if(tAObj != undefined) {
								if(tAObj.id.split('@')[3] === valList[3])
									linkedAObj = tAObj;
							}
						}
	
						if(linkedAObj == undefined) {
							if(_setting != undefined && _setting.isAdjudication) {
								if(valList[1] == "e") {
									linkedAObj = new EmptyEntity(val, undefined);
									if(valList[3] == _self.annotator)
										_self.entityList[parseInt(valList[0])] = linkedAObj;
									else
										_self.tEntityList[parseInt(valList[0])] = linkedAObj;
								}
								else {
									linkedAObj = new EmptyRelation(val, undefined);
									if(valList[3] == _self.annotator)
										_self.relationList[parseInt(valList[0])] = linkedAObj;
									else
										_self.tRelationList[parseInt(valList[0])] = linkedAObj;
								}
							}
							else
								throw new ErrorException(aObj.id + " link to empty val: " + val);
						}
	
						if(aObj.propertyList[idx][linkIdx]==undefined)
							throw new ErrorException( aObj.id + " links to empty annotation: " + val);
						aObj.addListProperty(linkedAObj, idx, linkIdx);
						//aObj.updateListProperty(linkedAObj, idx, linkIdx);

					}
				});
				aObj.propertyList[idx].sort(IAnaforaObj.sort);
			}
		}
	}
}

AnaforaProject.prototype.addAObj = function(newAObj) {
	var idx = parseInt(newAObj.id.split('@')[0]);
	if (newAObj instanceof Entity) {
		this.entityList[idx] = newAObj;

		// update link
		if ($.inArray(newAObj.type, this.schema.linkingType) != -1) 
			this.updateLinking(newAObj.type, newAObj);

		if(this.annotateFrame != undefined) {
			// update posindex
			this.annotateFrame.updatePosIndex(newAObj);
		
			// update overlap
			this.annotateFrame.updateOverlap(newAObj);
		}

	}
	else {
		this.relationList[idx] = newAObj;
		// update link
		if ($.inArray(newAObj.type, this.schema.linkingType) != -1) 
			this.updateLinking(newAObj.type, newAObj);

		// update posindex
		if(this.annotateFrame != undefined)
			this.annotateFrame.updatePosIndex(newAObj);
	}
	this.addTypeCount(newAObj.type);
}

AnaforaProject.prototype.removeAObj = function(delAObj) {
	var terms = delAObj.id.split('@');
	var idx = parseInt(terms[0]);
	var annotator = terms[3];
	if(delAObj instanceof Entity) {
		delete this.entityList[idx];

		if(this.annotateFrame != undefined)
			this.annotateFrame.removeEntity(delAObj);

		delAObj.destroy();
		
	}
	else {
		delete this.relationList[idx];

		if(this.annotateFrame != undefined)
			this.annotateFrame.removeRelation(delAObj)
		delAObj.destroy();
	}

	// update type count
	this.delTypeCount(delAObj.type);
}

AnaforaProject.prototype.addTypeCount = function(type) {
	if(this.typeCount[type.type] == undefined)
		this.typeCount[type.type] = 0;

	this.typeCount[type.type]++;
}

AnaforaProject.prototype.delTypeCount = function(type) {
	if(this.typeCount[type.type] != undefined)
		this.typeCount[type.type]--;

	if (this.typeCount[type.type] == 0)
		delete this.typeCount[type.type];
}

try {
	module.exports = AnaforaProject;
}
catch(err) {
	if(err instanceof ReferenceError)
		;
	else
		console.log(err);
}

AnaforaProject.prototype.addAllAnnotationToAnnotateFrame = function(annotateFrameList) {
	var _self = this;
	if(_self.annotateFrame == undefined)
		return ;

	for(var eIdx in this.entityList) {
		var entity = this.entityList[eIdx];
		_self.annotateFrame.updatePosIndex(entity, annotateFrameList);
	}

	for(var rIdx in this.relationList) {
		var relation = this.relationList[rIdx];
		_self.annotateFrame.updatePosIndex(relation, annotateFrameList);
	}
}

AnaforaProject.prototype.renderAnnotateFrame = function() {
	/* update all entity and relation annotation to whole new annotateFrame
	 */
	this.addAllAnnotationToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
}
