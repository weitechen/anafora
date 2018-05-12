function AnaforaCrossAdjudicationProject(schema, annotatorName, task) {
	AnaforaProject.call(this, schema, annotatorName, task);
	this.projectList = undefined;
	this.subTaskNameList = undefined;
	this.subTaskCharLength = undefined;
	this.progressBar = $("#progress");
}

AnaforaCrossAdjudicationProject.prototype = new AnaforaCrossProject();
AnaforaCrossAdjudicationProject.prototype.constructor = AnaforaCrossAdjudicationProject;

AnaforaCrossAdjudicationProject.prototype.addAnaforaProjectList = function(projectList, taskList, subAnnotateFrameList) {
	/* Input: an Object of AnaforaCrossDocProject with annotator as key
	 * I
	 */
	var annotatorList = Object.keys(projectList);
	var crossProject0 = projectList[annotatorList[0]], crossProject1 = projectList[annotatorList[1]];
	var newProjectList = {};

	// Make sure that the first linked element and the relation belongs to the same task. If not, change relation ID
	for (var annotatorName in projectList) {
		for (var subTaskName in projectList[annotatorName].projectList) {
			$.each(projectList[annotatorName].projectList[subTaskName].relationList, function(rID, relation) {
				var rTerm = relation.id.split("@");
				var firstTerm = undefined;
				$.each(relation.type.propertyTypeList, function(tIdx, pType) {
					if(pType.input == InputType.LIST && relation.propertyList[tIdx] != undefined) {
						firstTerm = relation.propertyList[tIdx][0];
						return false;
					}
				});

				if(firstTerm != undefined) {
					var tTerm = firstTerm.id.split("@");
					if(rTerm[2] != tTerm[2]) {
						var newRelID = projectList[annotatorName].projectList[tTerm[2]].getNewRelationId();
						var newRelIdx = projectList[annotatorName].projectList[tTerm[2]].maxRelationIdx;
						relation.id = newRelID;
						projectList[annotatorName].projectList[tTerm[2]].relationList[newRelIdx] = relation;
						delete projectList[annotatorName].projectList[rTerm[2]].relationList[parseInt(rTerm[0])];
					}
				}
			});
		}
	}

	// change all gold annotation in crossProject1 to the one in crossProject0
	for (var taskName in crossProject0.projectList) {
		newProjectList[taskName] = crossProject0.projectList[taskName];
	}

	AnaforaCrossProject.prototype.addAnaforaProjectList.call(this, newProjectList);

	newProjectList = {};
	for (var subTaskName in crossProject0.projectList) {
		var newAdjProject = new AnaforaAdjudicationProject(this.schema, subTaskName);
		newAdjProject.setAnnotateFrame(subAnnotateFrameList[subTaskName]);
		var _self = newAdjProject;
		$.each(projectList, function(annotator, crossProject) {
			var aProject = crossProject.projectList[subTaskName];
			$.each(aProject.entityList, function(eID, entity) {
				var tAnnotator =  entity.id.substring(entity.id.lastIndexOf('@')+1);
				entity.additionalData = {};
				if(tAnnotator == "gold") {
					if(eID in _self.entityList) {
						var originEntity = _self.entityList[eID];
						// go through all the linkingAObj in entity, replace with originEntity
						$.each(entity.linkingAObjList, function(ttIdx, linkingAObj) {
							$.each(linkingAObj.type.propertyTypeList, function(tttIdx, pType) {
								if(pType.input == InputType.LIST && linkingAObj.propertyList[tttIdx] != undefined) {
									var pIdx = linkingAObj.propertyList[tttIdx].indexOf(entity);
									if(pIdx > -1)
										linkingAObj.propertyList[tttIdx][pIdx] = originEntity;
										originEntity.linkingAObjList.push(linkingAObj);
								}
							});
						});
						// move linkedAObj from entity1 to entity0
						originEntity.linkingAObjList = originEntity.linkingAObjList.concat(entity.linkingAObjList);
						if(_self.annotateFrame != undefined)
							_self.annotateFrame.removeEntityPosit(originEntity, entity, true);
					}
					else {
						_self.entityList[eID] = entity;
						entity.setAdditionalData("adjudication", "gold");
					}
					delete aProject.entityList[eID];
					//delete _self.projectList[annotator].entityList[eID];
				}
			});
			//entityList[idx] = $.map( aProject.entityList, function(value) {return value;});
			//entityList[idx].sort(Entity.sort);
	
			//relationList[idx] = [];
			$.each(aProject.relationList, function(rID, relation) {
				var relation = aProject.relationList[rID];
				relation.additionalData = {};
				var tAnnotator =  relation.id.substring(relation.id.lastIndexOf('@')+1);
				if(tAnnotator == "gold") {
					if(rID in _self.relationList) {
						var originRelation = _self.relationList[rID];
						// go through all the linkingAObj in relation, replace with originRelation
						$.each(relation.linkingAObjList, function(ttIdx, linkingAObj) {
							$.each(linkingAObj.type.propertyTypeList, function(tttIdx, pType) {
								if(pType.input == InputType.LIST && linkingAObj.propertyList[tttIdx] != undefined) {
									var pIdx = linkingAObj.propertyList[tttIdx].indexOf(relation);
									if(pIdx > -1)
										linkingAObj.propertyList[tttIdx][pIdx] = originRelation;
								}
							});
						});
						// move linkedAObj from relation1 to relation0
						originRelation.linkingAObjList = originRelation.linkingAObjList.concat(relation.linkingAObjList);
						//if(_self.annotateFrame != undefined)
						//	_self.annotateFrame.removeEntityPosit(originRelation, relation, true);
					}
					else {
						_self.relationList[rID] = relation;
						relation.setAdditionalData("adjudication", "gold");
					}
					delete aProject.relationList[rID];
					//delete _self.projectList[annotator].relationList[rID];
				}
			});
			//relationList[idx] = $.map( aProject.relationList, function(value) {return value;});
			//relationList[idx].sort(Relation.sort);
	
			// update maxEntityIdx and maxRelationIdx
			//_self.maxEntityIdx = Math.max(aProject.maxEntityIdx, _self.maxEntityIdx);
			//_self.maxRelationIdx = Math.max(aProject.maxRelationIdx, _self.maxRelationIdx);
		});

		newProjectList[subTaskName] = newAdjProject;
	}
	//var crossAdjProjectList = {};
	for(var subTaskName of taskList) {
		var subProjectList = {};
		for(var annotatorName of annotatorList) {
			var crossProject = projectList[annotatorName];
			subProjectList[annotatorName] = projectList[annotatorName].projectList[subTaskName];
		}
		var newAdjProject = newProjectList[subTaskName]; //new AnaforaAdjudicationProject(this.schema, subTaskName);
		//newAdjProject.setAnnotateFrame(subAnnotateFrameList[subTaskName]);
		newAdjProject.addAnaforaProjectList(subProjectList);
		//newAdjProject.setAnnotateFrame(projectList[annotatorList[0]].projectList[subTaskName].annotateFrame);
		//crossAdjProjectList[subTaskName] = newAdjProject;
	}

	AnaforaCrossProject.prototype.addAnaforaProjectList.call(this, newProjectList);

	for(var subTaskName in this.projectList) {
		this.projectList[subTaskName].annotateFrame.generateAllAnnotateOverlapList();
	}

	// Update markElement in every aObj
	
	for (var subTaskName in this.projectList) {
		var currentAdjProject = this.projectList[subTaskName];
		$.each(currentAdjProject.entityList, function(eIdx, entity) {
			entity.markElement = [];
		});

		$.each(currentAdjProject.relationList, function(rIdx, relation) {
			relation.markElement = [];
		});

		$.each(currentAdjProject.adjudicationEntityList, function(eIdx, entity) {
			entity.markElement = [];
		});

		$.each(currentAdjProject.adjudicationRelationList, function(rIdx, relation) {
			relation.markElement = [];
		});

		for (var annotatorName in currentAdjProject.projectList) {
			var aProject = currentAdjProject.projectList[annotatorName];
			$.each(aProject.entityList, function(eIdx, entity) {
				entity.markElement = [];
			});
	
			$.each(aProject.relationList, function(rIdx, relation) {
				relation.markElement = [];
			});
		}
	}
		
	for (var subTaskName in this.projectList) {
		var isFirstSubTask = (Object.keys(this.projectList).indexOf(subTaskName) == 0);
		var currentAdjProject = this.projectList[subTaskName];
		for(var tOverlap of currentAdjProject.annotateFrame.overlap) {
			for (var tAObj of tOverlap.aObjList) {

				tAObj.addMarkElement(tOverlap, !isFirstSubTask);
			}
		}
	}
	this.updateProgressBar();
}

AnaforaCrossAdjudicationProject.prototype.markGold = function(goldAObj) {
	var gTerm = goldAObj.id.split('@');
	var subTask = gTerm[2];
	this.projectList[subTask].markGold(goldAObj);
}

AnaforaCrossAdjudicationProject.prototype.cancelGold = function(cancelAObj) {
	var cTerm = cancelAObj.id.split('@');
	var subTask = cTerm[2];
	this.projectList[subTask].cancelGold(cancelAObj);
}

AnaforaCrossAdjudicationProject.prototype.updateProgressBar = function() {
	var totalCompleteAdjudication = Object.keys(this.projectList).map( subTaskName => this.projectList[subTaskName].completeAdjudication ).reduce(function(sum, value) { return sum + value; }, 0);
	var totalAdjudication = Object.keys(this.projectList).map( subTaskName => this.projectList[subTaskName].totalAdjudication ).reduce(function(sum, value) { return sum + value; }, 0);
	this.progressBar.children("progress").attr("value", totalCompleteAdjudication);
	this.progressBar.children("progress").attr("max", totalAdjudication)
	this.progressBar.children("span").text(totalCompleteAdjudication.toString() + " / " + totalAdjudication.toString() ); 


	$("#schemaWrapper").css("bottom", (this.progressBar.height() + 5).toString() + "px");
	this.progressBar.show();
}

AnaforaCrossAdjudicationProject.prototype.getXMLEntityList = function() {
	var rStr;
	rStr = AnaforaProject.prototype.getXMLEntityList.call(this);
	$.each(this.projectList, function(subTaskName, aProject) {
		rStr += aProject.getXMLEntityList();
	});

	return rStr;
}

AnaforaCrossAdjudicationProject.prototype.getXMLRelationList = function() {
	var rStr;
	rStr = AnaforaProject.prototype.getXMLRelationList.call(this);
	$.each(this.projectList, function(subTaskName, aProject) {
		rStr += aProject.getXMLRelationList();
	});

	return rStr;
}

AnaforaCrossAdjudicationProject.prototype.getXMLAdjudicationList = function() {
	var rStr = "";
	var _self = this;
	$.each(this.projectList, function(subTaskName, aProject) {
		rStr += aProject.getXMLAdjudicationList();
	});
	return rStr;
}

AnaforaCrossAdjudicationProject.prototype.readFromXMLDOM = function(xml, subTaskNameList, annotateFrameList) {
	var xmlDOM = $(xml);
	var infoDOM = xmlDOM.find("info");
	this.completed = (infoDOM.find("progress").text() == "completed");
	var schemaDOM = xmlDOM.find("schema");
	var annotationDOM = xmlDOM.find("annotations");
	var adjudicationDOM = xmlDOM.find("adjudication");
	var _self = this;
	var projectXMLList = {};
	var annotatorList = [];

	if(this.completed) {
		AnaforaCrossProject.prototype.readFromXMLDOM.call(this,xml, subTaskNameList, annotateFrameList);
		$.each(this.projectList, function(aIdx, aProject) {
			aProject.annotateFrame.generateAllAnnotateOverlapList();
		});
		return ;
	}
	this.projectList = {};

	$.each(subTaskNameList, function(sTaskIdx, subTaskName) {
		_self.projectList[subTaskName] = new AnaforaAdjudicationProject(_self.schema, subTaskName);
		_self.projectList[subTaskName].setParentProject(_self);
		_self.projectList[subTaskName].setAnnotateFrame(annotateFrameList[subTaskName]);
	});

	for(var subTaskName of subTaskNameList) {
		var newXML = $($.parseXML('<?xml version="1.0" encoding="UTF-8"?><data><info></info></data>'));
		newXML.children(0).children(0).append($(infoDOM).children(0));
		newXML.children(0).append($(schemaDOM).children(0));
		newXML.children(0).append($($.parseXML("<annotations></annotations>")).children(0));
		newXML.children(0).append($($.parseXML("<adjudication></adjudication>")).children(0));
		projectXMLList[subTaskName] = newXML;
	}

	$(annotationDOM).children().each( function() {
		var id = this.getElementsByTagName("id")[0].childNodes[0].nodeValue;
		var subTaskName = id.split('@')[2];
		var annotator = id.split('@')[3];

		if(annotator == "gold") {
			var aObj = undefined;
			var idx = parseInt(id.split('@')[0]);
			if (this.tagName == "entity") {
				aObj = Entity.genFromDOM(this, _self.schema);
				_self.projectList[subTaskName].entityList[idx] = aObj;
			}
			else {
				aObj = Relation.genFromDOM(this, _self.schema);
				_self.projectList[subTaskName].relationList[idx] = aObj;
			}
		}
		else {
			if(annotatorList.indexOf(annotator) == -1)
				annotatorList.push(annotator);
			var projectXML = projectXMLList[subTaskName];
			projectXML.find("annotations").append(this);
		}
	});

	$(adjudicationDOM).children().each( function() {
		var id = this.getElementsByTagName("id")[0].childNodes[0].nodeValue;
		var subTaskName = id.split('@')[2];
		var annotator = id.split('@')[3];

		var projectXML = projectXMLList[subTaskName];
		projectXML.children(0).find("> adjudication").append(this);
	});


	$.each(subTaskNameList, function(sTaskIdx, subTaskName) {
		_self.projectList[subTaskName].readFromXMLDOM(projectXMLList[subTaskName], annotatorList);
	});

	$.each(subTaskNameList, function(sTaskIdx, subTaskName) {
		_self.projectList[subTaskName].totalAdjudication = 0;
		$.each(_self.projectList[subTaskName].projectList, function(annotatorName, aProject) {
			$.each(aProject.entityList, function(eID, entity) {
				if(entity.id.split('@')[3] == "gold")
					delete aProject.entityList[eID];
			});

			_self.projectList[subTaskName].totalAdjudication += Object.keys(aProject.entityList).length;
			$.each(aProject.relationList, function(rID, relation) {
				if(relation.id.split('@')[3] == "gold")
					delete aProject.relationList[rID];
			});
			_self.projectList[subTaskName].totalAdjudication += Object.keys(aProject.relationList).length;
		});
			
		_self.projectList[subTaskName].completeAdjudication += (Object.keys(_self.projectList[subTaskName].entityList).length + Object.keys(_self.projectList[subTaskName].relationList).length);

		_self.projectList[subTaskName].totalAdjudication -= Object.keys(_self.projectList[subTaskName].adjudicationEntityList).length;
		_self.projectList[subTaskName].totalAdjudication += Object.keys(_self.projectList[subTaskName].entityList).length; 
		_self.projectList[subTaskName].totalAdjudication -= Object.keys(_self.projectList[subTaskName].adjudicationRelationList).length;
		_self.projectList[subTaskName].totalAdjudication += Object.keys(_self.projectList[subTaskName].relationList).length;
	});
	

	for(var subTaskName in this.projectList)
		this.projectList[subTaskName].annotateFrame.generateAllAnnotateOverlapList();
	this.updateProgressBar();
}

AnaforaCrossAdjudicationProject.prototype.adjudicationCompleted = function() {
	var _self = this;
	
	var totalCompleteAdjudication = Object.keys(this.projectList).map( subTaskName => this.projectList[subTaskName].completeAdjudication ).reduce(function(sum, value) { return sum + value; }, 0);
	var totalAdjudication = Object.keys(this.projectList).map( subTaskName => this.projectList[subTaskName].totalAdjudication ).reduce(function(sum, value) { return sum + value; }, 0);
	if((totalAdjudication < totalCompleteAdjudication) && !window.confirm("Still some annotations not been adjudicated. Confirm to mark completed?") )
		return ;

	$.each(_self.projectList, function(subTaskName, aProject) {
		aProject.setCompletedProcess();
	});

	temporalSave();
	saveFile();
	setCompleted();
	window.location.reload();
}

AnaforaCrossAdjudicationProject.prototype.drawAObj = AnaforaAdjudicationProject.prototype.drawAObj;

AnaforaCrossAdjudicationProject.prototype.addAllAnnotationToAnnotateFrame = function(annotateFrameList) {
	/*
	if(this.annotateFrame == undefined)
		return ;
	*/

	var _self = this;

	Object.keys(_self.projectList).forEach(function(taskName) {
		//_self.projectList[tasnName].renderAnnotateFrame();
		_self.projectList[taskName].addAllAnnotationToAnnotateFrame(annotateFrameList);
	});
}
