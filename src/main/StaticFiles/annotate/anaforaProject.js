function AnaforaProject(schema, annotator, task) {
	this.schema = schema
	this.entityList = {};
	this.relationList = {};
	// this.positIndex = {};
	// this.overlap = [];
	this.typeCount = {};
	this.annotateFrame = null
	this.maxEntityIdx = 0;
	this.maxRelationIdx = 0;
	this.annotator = annotator;
	this.task = task;
	this.selectedAObj = null;
	this.completed = false;
	this.annotateFrame = undefined;
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
AnaforaProject.prototype.setAnnotateFrame = function(annotateFrame) {
	this.annotateFrame = annotateFrame;
}

AnaforaProject.prototype.getNewEntityId = function() {
	this.maxEntityIdx++;
	return this.maxEntityIdx.toString() + '@e@' + this.task + '@' + this.annotator;
}

AnaforaProject.prototype.getNewRelationId = function() {
	this.maxRelationIdx++;
	return this.maxRelationIdx.toString() + '@r@' + this.task + '@' + this.annotator;
}

AnaforaProject.prototype.writeXML = function() {
	var rStr = this.getXMLFileHead();

	rStr += '<annotations>\n';

	rStr += this.getXMLEntityList();
	rStr += this.getXMLRelationList();

	rStr += '</annotations>\n\n' +
'<adjudication>\n';
	
	rStr += this.getXMLAdjudicationList();

	rStr += '</adjudication>\n\n';

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
	var rStr = "";
	$.each(this.entityList, function() {
		rStr += this.toXMLString() + '\n\n';
	});
	return rStr;
}

AnaforaProject.prototype.getXMLRelationList = function() {
	var rStr = "";
	$.each(this.relationList, function() {
		rStr += this.toXMLString() + '\n\n';
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
}

AnaforaProject.prototype.entitySelect = function(entity) {
	//var spanElement = _self.annotateFrame.updateAnnotateFragement(entity.markElement, checkedType);
	var spanElement;
	var _self = this;
	var spanList = this.annotateFrame.frameDiv.find("span");
	$.each(entity.markElement, function() {
			
		//var idx = _self.overlap.indexOf(this);
		var idx = _self.annotateFrame.overlap.indexOf(this);
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
						if(selectedAObj.compareAObj[0].propertyList[idx] == undefined && selectedAObj.compareAObj[1].propertyList[idx] == undefined)
							;
						else if(selectedAObj.compareAObj[0].propertyList[idx] !== undefined && selectedAObj.compareAObj[1].propertyList[idx] == undefined)
							propertyListCont = selectedAObj.compareAObj[0].propertyList[idx];
						else if(selectedAObj.compareAObj[0].propertyList[idx] == undefined && selectedAObj.compareAObj[1].propertyList[idx] !== undefined)
							propertyListCont = selectedAObj.compareAObj[1].propertyList[idx];
						else
							propertyListCont = selectedAObj.compareAObj[1].propertyList[idx].concat(selectedAObj.compareAObj[1].propertyList[idx]);
					}
				else
					propertyListCont = selectedAObj.propertyList[idx];

				console.log(aType.type);
				console.log(propertyListCont);
				if(propertyListCont != undefined) {
					$.each(propertyListCont, function(listIdx) {
						lastSpanElement = _self.entitySelect(propertyListCont[listIdx]);
					});
				}
			}
		});
	}

	var aProjectDiv = aProjectWrapper.children("div");
	if( lastSpanElement != undefined &&( lastSpanElement.position().top < 0 || lastSpanElement.position().top > aProjectDiv.height()) )
		aProjectDiv.scrollTop(aProjectDiv.scrollTop() + lastSpanElement.position().top);

	this.selectedAObj = selectedAObj;
}

AnaforaProject.prototype.drawAObj = function(aObj) {
	var checkedType = this.schema.checkedType;
	var spanList = this.annotateFrame.frameDiv.find("span");
	var _self = this;

	var overlapList = {};
	var drawEntityFunc = function(entity) {
		$.each(entity.markElement, function(mIdx) {
			var overlap = entity.markElement[mIdx];
			//var idx = _self.overlap.indexOf(overlap);
			var idx = _self.annotateFrame.overlap.indexOf(overlap);
			//overlapList[idx] = _self.overlap[idx];
			overlapList[idx] = _self.annotateFrame.overlap[idx];

		});
		_self.annotateFrame.updateOverlapList(overlapList, checkedType); 
		/*
		$.each(entity.markElement, function() {
			var idx = _self.overlap.indexOf(this);
			var spanElement = $(spanList[idx]);
			var matchChecked = $.grep(this.aObjList, function(aObj) {
				return checkedType.indexOf(entity.type) != -1;
			});
	
			if(matchChecked.length == 0 || !(matchChecked[0] instanceof Entity)) {
				spanElement.css("background-color", "");
				spanElement.removeClass("overlap").removeClass("entity").removeClass("highLight").removeClass("multipleAObj").addClass("filterOut");
				spanElement.unbind();
			}
			else if( matchChecked.length == 1 || !(matchChecked[1] instanceof Entity)) {
				spanElement.css("background-color", "#"+entity.type.color);
				spanElement.removeClass("overlap").removeClass("filterOut").removeClass("highLight").addClass("entity");
				if(_setting.schema_mode == "Adjudication") {
					spanElement.removeClass("adjRemove").removeClass("adjDone").removeClass("adjConflict").removeClass("multipleAObj");
	
					if(entity instanceof AdjudicationEntity) {
						if(entity.decideIdx == undefined)
							spanElement.addClass("adjConflict");
						else if(entity.decideIdx == -1)
							spanElement.addClass("adjRemove");
						else
							spanElement.addClass("adjDone");
					}
					else{
						if(entity.getAdditionalData("adjudication") === undefined)
							spanElement.addClass("adjConflict");
						else if(entity.getAdditionalData("adjudication") === "gold")
							spanElement.addClass("adjDone");
						else if(entity.getAdditionalData("adjudication") === "not gold")
							spanElement.addClass("adjRemove");
					}
				}
	
				if(matchChecked.length > 1)
					spanElement.addClass("multipleAObj");
	
				spanElement.unbind();
				spanElement.bind('click', annotateClick);
			}
			else {
				spanElement.css("background-color", "");
				spanElement.removeClass("filterOut").removeClass("entity").removeClass("highLight").addClass("overlap").addClass("multipleAObj");
				spanElement.unbind();
				spanElement.bind('click', annotateClick);
			}
		});
		*/
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
		if (this.tagName == "entity") {
			var entity = Entity.genFromDOM(this, _self.schema);
			idx = parseInt(entity.id.split('@')[0]);
			_self.entityList[idx] = entity;

			if(!isAdjudication)
				_self.addTypeCount(entity.type);
		}
		else if (this.tagName == "relation") {
			var relation = Relation.genFromDOM(this, _self.schema);
			idx = parseInt(relation.id.split('@')[0]);
			_self.relationList[idx] = relation;
			if(!isAdjudication)
				_self.addTypeCount(relation.type);
		}
	});

	this.maxEntityIdx = Object.keys(_self.entityList).max();
	this.maxRelationIdx = Object.keys(_self.relationList).max();

	if(this.maxEntityIdx == -Infinity)
		this.maxEntityIdx = 0;

	if(this.maxRelationIdx == -Infinity)
		this.maxRelationIdx = 0;

	$.each(this.entityList, function(idx, entity) {
		// update link
		if ($.inArray(entity.type, _self.schema.linkingType) != -1) 
			_self.updateLinking(entity.type, entity);

		// update posindex
		//if(!isAdjudication)
		if(_self.annotateFrame != undefined)
			_self.annotateFrame.updatePosIndex(entity);
			//_self.updatePosIndex(entity);
	});

	$.each(this.relationList, function(idx, relation) {
		// update relation list link
		if ($.inArray(relation.type, _self.schema.linkingType) != -1)
			_self.updateLinking(relation.type, relation);

		// update posindex
		//if(!isAdjudication)
		if(_self.annotateFrame != undefined)
			_self.annotateFrame.updatePosIndex(relation);
	});

	// update overlap
	if(!isAdjudication && this.annotateFrame != undefined)
		this.annotateFrame.generateAllAnnotateOverlapList();
	//if(!isAdjudication) {
	/*
	if(this.annotateFrame != undefined) {
		var maxIndex = this.annotateFrame.getMaxPositIndex();
		this.annotateFrame.generateOverlapListFromPosit(0, maxIndex, this.annotateFrame.overlap)
		//var maxIndex =  Object.keys(this.positIndex).max()+1;
		//this.generateOverlapListFromPosit(0, maxIndex, this.overlap);
	}
	//}
	*/
}

AnaforaProject.getXML = function(successFunc, setting, annotator, isAdjudication) {
	$.ajax({ type: "GET", url: setting.root_url + "/" + setting.app_name + "/xml/" + setting.projectName + "/" + setting.corpusName + "/" + setting.taskName + "/" + setting.schema + (isAdjudication == undefined ? ( setting.isAdjudication ? ".Adjudication" : "" ) : ( isAdjudication ? ".Adjudication" : "")) + "/" + (annotator==undefined ? (setting.annotator) : (annotator)) + "/", success: successFunc, cache: false, async: false});
}

AnaforaProject.getAdjudicationAnnotator = function(setting) {
	var annotatorJsonStr = "";
	$.ajax({ type: "GET", url: setting.root_url + "/" + setting.app_name + "/annotator/" + setting.projectName + "/" + setting.corpusName + "/" + setting.taskName + "/" + setting.schema + "/", success: function(data) {annotatorJsonStr = data;}, cache: false, async: false});

	if(annotatorJsonStr == "")
		return [];
	else {
		
		var tDiv = document.createElement('div');
		tDiv.innerHTML = annotatorJsonStr;
		var annotatorStr = tDiv.firstChild.nodeValue;
		return $.parseJSON(annotatorStr);
	}
	
}

AnaforaProject.prototype.updateAnnotateDisplay = function() {
	var checkedType = this.schema.checkedType;
	var diffCheckedType = this.schema.getDiffCheckedType();
	var _self = this;

	//this.annotateFrame.generateAnnotateText(_self.overlap, checkedType);
	//this.annotateFrame.updateAnnotateFragement(this.overlap, checkedType);
	this.annotateFrame.updateOverlapList(undefined, this.schema.checkedType, diffCheckedType);
}

	
/*
	this.annotateFrame.frameDiv.find("span").each( function(idx) {
		var overlap = _self.overlap[idx];
		var filterArray = $.grep(overlap.entityList, function(entity) { return ($.inArray(entity.type, checkedType))!=-1; });
		$(this).unbind();
		switch(filterArray.length) {
			case 0:
				
				$(this).removeClass("entity").removeClass("overlap").removeClass("highLight").addClass("filterOut");
				$(this).css("background-color", "");
				break;
			case 1:
				$(this).removeClass("overlap").removeClass("filterOut").removeClass("highLight").addClass("entity");
				$(this).css("background-color", "#" + filterArray[0].type.color);
				$(this).bind('click', annotateClick);
				break;
			default:
				$(this).css("background-color", "");
				$(this).removeClass("entity").removeClass("filterOut").removeClass("highLight").addClass("overlap");
				$(this).bind('click', annotateClick);
				break;
		}
	});
}
*/

/*
AnaforaProject.prototype.generateOverlapListFromPosit = function(overlapIdxStart, overlapIdxEnd, overlapList) {

	var start=-1, end=-1;
	var compare = false;
	var overlapIdx = -1;
	var _self = this;
	for(var idx=overlapIdxStart;idx<overlapIdxEnd;idx++) {
		if(this.positIndex[idx]	!= undefined) {
			if(idx == 0 || ((this.positIndex[idx -1] != undefined && !($(this.positIndex[idx-1]).not(this.positIndex[idx]).length==0 && $(this.positIndex[idx]).not(this.positIndex[idx-1]).length==0 )) || (this.positIndex[idx-1] == undefined)))
				compare = false;
			else
				compare = true;
			
			if(!compare) {
				if(idx > overlapIdxStart && this.positIndex[idx-1] != undefined) {
					end = idx;
					overlapList.push(new Overlap(new SpanType(start, end), jQuery.extend([], this.positIndex[idx-1])));

					overlapIdx++;
					$.each(overlapList[overlapIdx].aObjList, function() { this.addMarkElement(overlapList[overlapIdx]); });
				}
				start = idx;
			}
		}
		else if(idx > 0 && this.positIndex[idx -1] != undefined) {
			end = idx;
			overlapList.push(new Overlap(new SpanType(start, end), jQuery.extend([], this.positIndex[idx-1])));
			overlapIdx++;
			$.each(overlapList[overlapIdx].aObjList, function() { this.addMarkElement(overlapList[overlapIdx]); });
			start = -1;
		}
	}

	if(start != -1) {
		end = overlapIdxEnd;
		overlapList.push(new Overlap(new SpanType(start, end), jQuery.extend([], this.positIndex[overlapIdxEnd-1])));
		overlapIdx++;
		$.each(overlapList[overlapIdx].aObjList, function() { this.addMarkElement(overlapList[overlapIdx]); });
	}
}
*/

AnaforaProject.prototype.updateLinking = function(aType, aObj) {

	var idx;
	var _self = this;
	for(idx=0;idx<aType.propertyTypeList.length;idx++) {
		if (aType.propertyTypeList[idx].input == InputType.LIST) {
			var valueList = aObj.propertyList[idx];
			if(valueList != undefined) {
				$.each(valueList, function(linkIdx, val) {
					var valList = val.split('@');
					var linkedAObj = undefined;
					if(valList[1] == 'e') 
						linkedAObj = _self.entityList[parseInt(valList[0])];
					else if(valList[1] == 'r')
						linkedAObj = _self.relationList[parseInt(valList[0])];
					if(aObj.propertyList[idx][linkIdx]==undefined)
						throw aObj.id + " links to empty annotation: " + val;
					aObj.propertyList[idx][linkIdx] = linkedAObj;
					linkedAObj.addLinkingAObj(aObj);
				});
				aObj.propertyList[idx].sort(IAnaforaObj.sort);
			}
		}
	}
}

/*
AnaforaProject.prototype.updatePosIndex = function(aObj) {

	var _self = this;

	if(aObj instanceof Entity)
		this.addEntityPosit(aObj, aObj);
	else{
		for(var i=0;i<aObj.type.propertyTypeList.length;i++) {
			if(aObj.type.propertyTypeList[i].input == InputType.LIST && aObj.propertyList[i] != undefined) {
				$.each(aObj.propertyList[i], function(listIdx) {
					if(aObj.propertyList[i][listIdx] instanceof Entity)
						_self.addEntityPosit(aObj.propertyList[i][listIdx], aObj);
					else
						_self.updatePosIndex(aObj.propertyList[i][listIdx]);
				});
			}
		}
	}
}
*/

/*
AnaforaProject.prototype.addEntityPosit = function(entity, addedAObj) {
	var _self = this;
	
	if(entity.id == "1@e@workshop_AFP_ENG_20040211.0147@gold") {
	console.log("before added, posit=");
	console.log(this.positIndex[14]);
	}
	$.each(entity.span, function(idx, span) {
		for(var spanIdx = span.start; spanIdx < span.end; spanIdx++) {
			if(!(spanIdx in _self.positIndex)) {
				_self.positIndex[spanIdx] = [];
			}

			if(_self.positIndex[spanIdx].indexOf(addedAObj) == -1) {
				if(addedAObj instanceof Entity) {
					if(entity.id == "1@e@workshop_AFP_ENG_20040211.0147@gold")
						console.log("1@gold, with addedAObj is Entity: " + addedAObj.id );
					_self.positIndex[spanIdx].splice(0, 0, addedAObj);
				}
				else {
					_self.positIndex[spanIdx].push(addedAObj);
				}
			}
		}
	});
					if(entity.id == "1@e@workshop_AFP_ENG_20040211.0147@gold") {
	console.log("after added, posit=");
	console.log(this.positIndex[14]);
	}
	
}

AnaforaProject.prototype.addRelationPosit = function(relation, addedAObj) {
	var _self = this;
	$.each(relation.propertyList, function(idx) {
		if(relation.type.propertyTypeList[idx].input == InputType.LIST) {
			$.each(relation.propertyList[idx], function(listIdx) {
				if(relation.propertyList[idx][listIdx] instanceof Entity)
					_self.addEntityPosit(relation.propertyList[idx][listIdx], addedAObj);
				else
					_self.addRelationPosit(relation.propertyList[idx][listIdx], addedAObj);
			});
		}
	});
}
*/

/*
AnaforaProject.prototype.removeEntityPosit = function(entity, removeAObj) {
	var _self = this;
	$.each(entity.span, function(idx, span) {
		for(var spanIdx = span.start; spanIdx < span.end; spanIdx++) {
			if(spanIdx in _self.positIndex) {
				var aObjIdx = _self.positIndex[spanIdx].indexOf(removeAObj);
				if(aObjIdx > -1){
					_self.positIndex[spanIdx].splice(aObjIdx, 1);
					if(_self.positIndex[spanIdx].length == 0)
						delete _self.positIndex[spanIdx];
				}

			}
		}
	});
}

AnaforaProject.prototype.removeRelationPosit = function(relation, removeAObj) {
	var _self = this;
	$.each(relation.propertyList, function(idx) {
		if(relation.type.propertyTypeList[idx].input == InputType.LIST) {
			if(relation.propertyList[idx] != undefined) {
				$.each(relation.propertyList[idx], function(listIdx) {
					if(relation.propertyList[idx][listIdx] instanceof Entity)
						_self.removeEntityPosit(relation.propertyList[idx][listIdx], removeAObj);
					else {
						_self.removeRelationPosit(relation.propertyList[idx][listIdx], removeAObj);
					}
				});
			}
		}
	});
}

AnaforaProject.prototype.removePosIndex = function(entity) {
	this.removeEntityPosit(entity, entity);
}
*/

/*
AnaforaProject.prototype.updateOverlap = function(aObj) {
	this.updateOverlapRange(aObj.span[0].start, aObj.span[aObj.span.length-1].end);
}


AnaforaProject.prototype.updateOverlapRange = function(firstSpanStart, lastSpanEnd) {
	var affectedOverlapIdx = this.findOverlapRange(firstSpanStart, lastSpanEnd);
	var affectedOverlap;
	var affectedPosit;
	var newOverlap = [];
	var checkedType = this.schema.checkedType;

	if(affectedOverlapIdx[0] == -1 && affectedOverlapIdx[1] == null) {
		affectedPosit = [firstSpanStart, lastSpanEnd];

		if(this.entityList.length == 0)
			affectedOverlapIdx = [null, null];
		else
			affectedOverlapIdx = [this.entityList[this.entityList.length-1], null];
	}
	else {
		affectedPosit = [affectedOverlapIdx[0]==null ? 0 : this.overlap[affectedOverlapIdx[0]].span.start, affectedOverlapIdx[1]==null ? lastSpanEnd : this.overlap[affectedOverlapIdx[1]].span.start ];
	}

	if(affectedOverlapIdx[0] == null)
		affectedOverlap = [null, -1];
	else
		affectedOverlap = [this.overlap[affectedOverlapIdx[0]], -1];

	if(affectedOverlapIdx[1] == null)
		affectedOverlap[1] = null
	else
		affectedOverlap[1] = this.overlap[affectedOverlapIdx[1]];
		
	this.generateOverlapListFromPosit(affectedPosit[0], affectedPosit[1], newOverlap);
	
	this.annotateFrame.updateAnnotateFragement(newOverlap, checkedType, affectedOverlapIdx, affectedOverlap);

	// update overlap
	var anchorIdx = affectedOverlapIdx[0], removeOverlapLength;
	if(affectedOverlapIdx[0] == null)
		anchorIdx = 0;

	if(affectedOverlapIdx[1] == null)
		removeOverlapLength = this.overlap.length - anchorIdx;
	else
		removeOverlapLength = affectedOverlapIdx[1] - anchorIdx;
	
	for(var idx=anchorIdx;idx<anchorIdx+removeOverlapLength;idx++) {
		var overlap = this.overlap[idx];
		$.each(overlap.aObjList, function() {
			this.removeMarkElement(overlap);
		});
	}
	this.overlap.splice(anchorIdx, removeOverlapLength);

	for(var idx=0;idx<newOverlap.length;idx++)
		this.overlap.splice(anchorIdx+idx, 0, newOverlap[idx]);
}
*/

/*
AnaforaProject.prototype.findOverlapRange = function(spanStart, spanEnd) {
	var affectedOverlap;
	var firstOverlapIdx = this.searchMatchOverlap(spanStart);
	var overlapIdx = firstOverlapIdx;


	// find all the overlap obj 
	if(overlapIdx == null) {
		affectedOverlap = [this.overlap.length-1, null];
	}
	else {
		while(overlapIdx < this.overlap.length && this.overlap[overlapIdx].span.start < spanEnd)
				overlapIdx++;

		if(firstOverlapIdx != 0 || (this.overlap[firstOverlapIdx].span.start < spanStart))
			affectedOverlap = [firstOverlapIdx, overlapIdx];
		else
			affectedOverlap = [null, overlapIdx];
		
		if(affectedOverlap[1] == this.overlap.length)
			affectedOverlap[1] = null;
	}

	return affectedOverlap;
}

AnaforaProject.prototype.searchMatchOverlap = function(pos) {
	var startIdx = 0;
	var endIdx = this.overlap.length-1;
	var pivot;
	var tOverlap;

	while(startIdx <= endIdx) {
		pivot = Math.round((endIdx + startIdx)/2);
		tOverlap = this.overlap[pivot];
		if(pos >= tOverlap.span.start && pos < tOverlap.span.end) {
			return pivot;
	}

		else if(pos < tOverlap.span.start) {
			endIdx = pivot-1;
		}
		else if(pos >= tOverlap.span.end) {
			startIdx = pivot + 1;
		}
	}

	if(endIdx == this.overlap.length -1)
		return null;

	if(pivot ==0)
		return 0;
	if(pos < tOverlap.span.start) 
		return pivot-1;

	return pivot;
}
*/

AnaforaProject.prototype.addAObj = function(newAObj) {
	var idx = parseInt(newAObj.id.split('@')[0]);
	if (newAObj instanceof Entity) {
		this.entityList[idx] = newAObj;

		// update link
		if ($.inArray(newAObj.type, this.schema.linkingType) != -1) 
			this.updateLinking(newAObj.type, newAObj);

		// update posindex
		if(this.annotateFrame != undefined)
		this.annotateFrame.updatePosIndex(newAObj);
		
		// update overlap
		this.annotateFrame.updateOverlap(newAObj);

	}
	else {
		this.relationList[idx] = newAObj;
		// update link
		if ($.inArray(newAObj.type, this.schema.linkingType) != -1) 
			this.updateLinking(newAObj.type, newAObj);

		// update posindex
		if(this.annotateFrame != undefined)
			this.annotateFrame.updatePosIndex(newAObj);
		// update overlap
		//this.updateOverlap(newAObj);
	}
	this.addTypeCount(newAObj.type);
}

AnaforaProject.prototype.removeAObj = function(delAObj) {
	var terms = delAObj.id.split('@');
	var idx = parseInt(terms[0]);
	var annotator = terms[3];
	if(delAObj instanceof Entity) {
		delete this.entityList[idx];

		//if(!_setting.isAdjudication) {
			this.annotateFrame.removeEntity(delAObj);
			// remove posindex
			//this.annotateFrame.removePosIndex(delAObj);

			// update overlap
			//this.annotateFrame.updateOverlap(delAObj);
		//}
	}
	else {
		delete this.relationList[idx];

		//if(!_setting.isAdjudication)
			this.annotateFrame.removeRelation(delAObj)
		/*
		this.annotateFrame.removeRelationPosit(delAObj, delAObj);
		var tRange = delAObj.getSpanRange();
		if(tRange[0] != undefined && tRange[1] != undefined)
			this.annotateFrame.updateOverlapRange(tRange[0], tRange[1]);
		*/
	}

	// update type count
	if(!_setting.isAdjudication)
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

