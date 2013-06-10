
function AnaforaAdjudicationProject(schema, task) {
	AnaforaProject.call(this, schema, "gold", task)

	this.projectList = undefined;
	this.completeAdjudication = 0;
	this.totalAdjudication = 0;

	this.progressBar = $("#progress");
	this.adjudicationEntityList = {}; // store the adjudication entity
	this.adjudicationRelationList = {}; // store the adjudication relation

	//this.comparePairEntity = {}; // store which two entities from two project could be comparable
	//this.comparePairRelation = {}; // store which two relations from two project could be comparable
}

AnaforaAdjudicationProject.prototype = new AnaforaProject();
AnaforaAdjudicationProject.prototype.constructor = AnaforaAdjudicationProject;

AnaforaAdjudicationProject.prototype.addAnaforaProjectList = function(projectList) {
	this.projectList = projectList;

	var _self = this;
	var entityList = [];
	var relationList = [];
	var idx=0, entityLength,followIdx=0, xIdx=0 ;
	var relationLength;
	var comparePairEntityList;

	if(projectList == undefined)
		return;

	// compare 
	$.each(projectList, function(annotator, aProject) {
		entityList[idx] = $.map( aProject.entityList, function(value) {return value;});
		entityList[idx].sort(Entity.sort);

		relationList[idx] = $.map( aProject.relationList, function(value) {return value;});
		//relationList[idx].sort(Relation.sort);

		idx++;
	});

	//// check the AdjuidcationEntity
	entityListIdx = [];
	entityListIdx[0] = 0;
	entityListIdx[1] = 0;

	while(entityListIdx[0] < entityList[0].length && entityListIdx[1] < entityList[1].length) {
		idx = (Entity.sort(entityList[0][ entityListIdx[0] ], entityList[1][ entityListIdx[1] ]) <= 0) ? 0 : 1;
		xIdx = (idx==1) ? 0 : 1;
		followIdx = 0;

		var idx0 = entityListIdx[idx];
		var idx1 = entityListIdx[xIdx];
		var entityList0 = entityList[idx];
		var entityList1 = entityList[xIdx];
		var entity0, entity1;
		var adjEntity;
		var comparePariList0, comparePairList1;
		var needAddAdjudicationEntity;

		while( (idx1 + followIdx) < entityList1.length && (entityList0[idx0].span[entityList0[idx0].span.length-1].end > entityList1[idx1+followIdx].span[0].start ) ) {
			if( entityList0[ idx0 ].type === entityList1[ idx1+followIdx ].type ) {
				entity0 = entityList[idx][ entityListIdx[idx] ];
				entity1 = entityList[xIdx][ entityListIdx[xIdx] + followIdx ];

				needAddAdjudicationEntity = false;
				
				if(Entity.sort(entity0, entity1) == 0) {
					needAddAdjudicationEntity = true;
				}
				else {
					var diffPropCount = IAdjudicationAnaforaObj.compareAObjPropertyList(entity0, entity1).length;

					//comparePairList0 = this.comparePairEntity[entity0];
					comparePairList0 = entity0.getAdditionalData("comparePair");
					//comparePairList1 = this.comparePairEntity[entity1];
					comparePairList1 = entity1.getAdditionalData("comparePair");
					var origAdjEntity0 = (comparePairList0 != undefined && comparePairList0.length > 0 && comparePairList0[comparePairList0.length-1] instanceof AdjudicationEntity) ? comparePairList0[comparePairList0.length-1] : undefined;
					var origAdjEntity1 = (comparePairList1 != undefined && comparePairList1.length > 0 && comparePairList1[comparePairList1.length-1] instanceof AdjudicationEntity) ? comparePairList1[comparePairList1.length-1] : undefined;

					if(origAdjEntity0 == undefined && origAdjEntity1 == undefined && diffPropCount == 0)
						needAddAdjudicationEntity = true;
					
				}

				if(needAddAdjudicationEntity) {
					var newAdjEntity = new AdjudicationEntity(this.getNewEntityId(), entity0, entity1);
					this.addAdjEntityToAdjudicationInCompareEntityPair(entity0, entity1, newAdjEntity);
					this.addAdjEntityToAdjudicationInCompareEntityPair(entity1, entity0, newAdjEntity);
					this.addAdjAObj(newAdjEntity);
					if(_self.annotateFrame != undefined)
						_self.annotateFrame.updatePosIndex(newAdjEntity);
					_self.addTypeCount(newAdjEntity.type);
					/*
					if(entity0.getAdditionalData["comparePair"] == undefined)
						entity0.setAdditionalData("comparePair",  function(entity){ return _self.comparePairEntity[entity]; });

					if(entity1.getAdditionalData["comparePair"] == undefined)
						entity1.setAdditionalData("comparePair", function(entity){ return _self.comparePairEntity[entity]; });
					*/
				}
			}
			followIdx++;
		}
		entityListIdx[idx]++;
	/*
	while(idx < entityLength) {
		followIdx = 1;
		while( (idx + followIdx) < (entityLength) && (entityList[idx].span[entityList[idx].span.length-1].end > entityList[idx+followIdx].span[0].start ) ) {
			if( entityList[idx].type === entityList[idx+followIdx].type && (Entity.sort(entityList[idx], entityList[idx+followIdx])==0 || (entityList[idx].hasOverlap(entityList[idx+followIdx]) && (function (a,b) { return !(a<b || b<a); }(entityList[idx].propertyList,entityList[idx+followIdx].propertyList)) )) && entityList[idx].id.split('@')[3] !== entityList[idx+followIdx].id.split('@')[3] ) {
				entityList.splice(idx, 1, new AdjudicationEntity(this.getNewEntityId(), entityList[idx], entityList[idx+followIdx]));
				entityList.splice(idx+followIdx, 1);
				entityLength--;
				this.adjudicationEntityList[this.maxEntityIdx] = entityList[idx];

				break;
			}
			followIdx++;
		}

		this.addTypeCount(entityList[idx].type);
		this.updatePosIndex(entityList[idx]);
		if((entityList[idx] instanceof AdjudicationEntity && (entityList[idx].decideIdx === 0 || entityList[idx].decideIdx === 1)) || (!(entityList[idx] instanceof AdjudicationEntity) && entityList[idx].getAdditionalData("adjudication") === "gold" ))
			this.completeAdjudication++;
		this.totalAdjudication++;

		idx++;
	}
	*/
	}

	//// check the AdjuidcationRelation
	
	relationListIdx = [];
	relationListIdx[0] = 0;
	entityListIdx[1] = 0;
	var comparePairRelationList;

	$.each(relationList[0], function(key0, relation0) {
		$.each(relationList[1], function(key1, relation1) {
			comparePairRelationList = relation1.getAdditionalData("comparePair");
			if(relation0.type == relation1.type && comparePairRelationList == undefined) {
				var tFunc = function(aObj1, aObj2) { return AnaforaAdjudicationProject.adjEntityComparePropertyFunc(aObj1, aObj2, _self); }

				var diffProp = IAdjudicationAnaforaObj.compareAObjPropertyList(relation0, relation1, tFunc);

				if(diffProp.length < 2) {
					var newAdjRelation = new AdjudicationRelation(_self.getNewRelationId(), relation0.type, relation0, relation1, diffProp);

					var adjIdx = parseInt(newAdjRelation.id.split('@')[0]);
					_self.adjudicationRelationList[adjIdx] = newAdjRelation;
					_self.addTypeCount(newAdjRelation.type);

					if(newAdjRelation.decideIdx == 0 || newAdjRelation.decideIdx == 1)
						_self.completeAdjudication++;


					relation0.setAdditionalData("comparePair", [relation1, newAdjRelation]);
					relation1.setAdditionalData("comparePair", [relation0, newAdjRelation]);
					/*
					_self.comparePairRelation[relation0] = [relation1, newAdjRelation];
					_self.comparePairRelation[relation1] = [relation0, newAdjRelation];
					*/
					if(_self.annotateFrame != undefined)
						_self.annotateFrame.updatePosIndex(newAdjRelation);
					return false;
				}
			}
		});
	});

	// recount the adjudicationEntityList, typeCount, update posit index, and count the adjudication complete number
	$.each(this.typeCount, function(tType) {
		_self.typeCount[tType] = -1*_self.typeCount[tType];
	});
	$.each(projectList, function(annotator, aProject) {
		// add type count to adj project
		$.each(aProject.typeCount,function(tType) {
			if(_self.typeCount[tType] == undefined)
				_self.typeCount[tType] = 0;

			_self.typeCount[tType] += aProject.typeCount[tType];
		});

		// update number of total adjudication
		_self.totalAdjudication += Object.keys(aProject.entityList).length;
		_self.totalAdjudication += Object.keys(aProject.relationList).length;

		// update complete adjudication
		$.each(aProject.entityList, function(idx, entity) {
			if(entity.getAdditionalData("adjudication") == "gold")
				_self.completeAdjudication++;
		});
	});

	this.totalAdjudication -= Object.keys(_self.adjudicationEntityList).length;
	this.totalAdjudication -= Object.keys(_self.adjudicationRelationList).length;
	/*
	$.each(projectList, function(annotator, aProject) {
		$.each(aProject.entityList, function(idx, entity) {
			comparePairEntityList = entity.getAdditionalData("comparePair");
			if(comparePairEntityList != undefined && comparePairEntityList[comparePairEntityList.length-1] instanceof AdjudicationEntity) {
				var newAdjEntity = comparePairEntityList[comparePairEntityList.length-1];
				var adjIdx = parseInt(newAdjEntity.id.split('@')[0]);
				if(_self.adjudicationEntityList[adjIdx] == undefined) {
					_self.adjudicationEntityList[adjIdx] = newAdjEntity;
					_self.addTypeCount(newAdjEntity.type);
					if(_self.annotateFrame != undefined)
						_self.annotateFrame.updatePosIndex(newAdjEntity);

					if(newAdjEntity.decideIdx == 0 || newAdjEntity.decideIdx == 1)
						_self.completeAdjudication++;
					_self.totalAdjudication++;

				}
			}
			else {
				_self.addTypeCount(entity.type);
				if(_self.annotateFrame != undefined)
					_self.annotateFrame.updatePosIndex(entity);
				_self.totalAdjudication++;

			}
		});

		$.each(aProject.relationList, function(idx, relation) {
			if(relation.getAdditionalData("comparePair") == undefined) {
				_self.addTypeCount(relation.type);
				_self.totalAdjudication++;
				if(_self.annotateFrame != undefined)
					_self.updatePosIndex(relation);
			}
		});
	});
	*/

	//this.updatePosIndex(entityList[entityLength-1]);

	/*
	var maxIndex = Object.keys(this.positIndex).max()+1;
	if(maxIndex == -Infinity)
		maxIndex = 1;

	this.generateOverlapListFromPosit(0, maxIndex, this.overlap);
	*/

	if(this.annotateFrame != undefined)
		this.annotateFrame.generateAllAnnotateOverlapList();
	this.updateProgressBar();
	temporalSave();
}

AnaforaAdjudicationProject.adjEntityComparePropertyFunc = function(aObj0, aObj1) {
	if(!(aObj0 instanceof IAnaforaObj) || !(aObj1 instanceof IAnaforaObj))
		throw "input object for adjEntityCompareProperty is not IAnaforaObj";
	var comparePairEntityList0 = aObj0.getAdditionalData("comparePair");
	var comparePairEntityList1 = aObj1.getAdditionalData("comparePair");

	if(aObj0 instanceof Entity && aObj1 instanceof Entity) {
		if(comparePairEntityList0 != undefined && comparePairEntityList1 != undefined && comparePairEntityList0.length > 1 && comparePairEntityList1.length > 1) {
			if(comparePairEntityList0[comparePairEntityList0.length -1] instanceof AdjudicationEntity && comparePairEntityList1[comparePairEntityList1.length -1] instanceof AdjudicationEntity && comparePairEntityList0[0] == aObj1 && comparePairEntityList1[0] == aObj0)
				return true;
		}

		return false;
	}
	else {
		return IAnaforaObj.compareAObjFunc(aObj0, aObj1);
	}
}

AnaforaAdjudicationProject.prototype.addAdjEntityToAdjudicationInCompareEntityPair = function(entity, comparedEntity, adjEntity ) {
	if(entity.id.split('@')[3] == comparedEntity.id.split('@')[3]) {
		throw "same annotator name: " + entity.id.split('@')[3] + ", " + comparedEntity.id.split('@')[3];
	}
	// In the compareEntityPair list, remove the adjEntity if exist, set comparedEntity position, and set the adjEntity position
	if(entity.type !== comparedEntity.type)
		throw "add adjudication compare pair error: entity type: " + entity.type + ", comparedEntity type: " + comparedEntity.type;

	if(entity.getAdditionalData("comparePair") == undefined) {
		entity.setAdditionalData("comparePair", []);
	}
		
	var comparePairEntityList = entity.getAdditionalData("comparePair");

	if(comparePairEntityList[comparePairEntityList.length-1] instanceof AdjudicationEntity){
			this.resetFollowEntityInCompareEntityPair(comparePairEntityList[0]);
			comparePairEntityList.pop();
	}

	comparePairEntityList.splice(0, 0, comparedEntity);
	comparePairEntityList.push(adjEntity);
	/*
	if(this.comparePairEntity[entity] == undefined)
		this.comparePairEntity[entity] = [];

	if(this.comparePairEntity[entity][this.comparePairEntity[entity].length-1] instanceof AdjudicationEntity){
			this.resetFollowEntityInCompareEntityPair(this.comparePairEntity[entity][0]);
			this.comparePairEntity[entity].pop();
	}

	this.comparePairEntity[entity].splice(0, 0, comparedEntity);
	this.comparePairEntity[entity].push(adjEntity);
	*/
}

AnaforaAdjudicationProject.prototype.resetFollowEntityInCompareEntityPair = function(resetEntity) {
	// remove the original adjudicationEntity that contain resetEntity, find out the next possible compareentityPair from the compareEntityPair list
	var idx;
	var tEntity = undefined;
	var tComparePairEntityList;
	var resetComparePairEntityList = resetEntity.getAdditionalData("comparePair");

	if(resetComparePairEntityList != undefined && resetComparePairEntityList.length >= 2 && resetComparePairEntityList[resetComparePairEntityList.length -1] instanceof AdjudicationEntity && resetComparePairEntityList[resetComparePairEntityList.length -1].decideIdx == undefined) {
		for(idx=1;idx<resetComparePairEntityList.length-1;idx++) {
			var tEntity = resetComparePairEntityList[idx];
			tComparePairEntityList = tEntity.getAdditionalData("comparePair");
			if(!(tComparePairEntityList[tComparePairEntityList.length-1 ] instanceof AdjudicationEntity) && IAdjudicationAnaforaObj.compareAObjPropertyList(resetEntity, tEntity).length == 0) {
				break;
			}
			tEntity = undefined;
		}

		var removeAdjEntity = resetComparePairEntityList.pop();
		if(tEntity != undefined) {
			resetComparePairEntityList.push(new AdjudicationEntity(this.getNewEntityId(), resetEntity, tEntity));
			resetComparePairEntityList[0] = resetComparePairEntityList.splice(idx, 1, resetComparePairEntityList[0])[0];
		}
		this.removeAdjAObj(removeAdjEntity);
	}
	/*
	if(this.comparePairEntity[resetEntity] != undefined && this.comparePairEntity[resetEntity].length >= 2 && this.comparePairEntity[resetEntity][this.comparePairEntity[resetEntity].length -1] instanceof AdjudicationEntity && this.comparePairEntity[resetEntity][this.comparePairEntity[resetEntity].length -1].decideIdx == undefined) {
		for(idx=1;idx<this.comparePairEntity[resetEntity].length-1;idx++) {
			tEntity = this.comparePairEntity[resetEntity][idx];
			if(!(this.comparePairEntity[tEntity][this.comparePairEntity[tEntity].length-1 ] instanceof AdjudicationEntity) && IAdjudicationAnaforaObj.compareAObjPropertyList(resetEntity, tEntity).length == 0) {
				break;
			}
			tEntity = undefined;
		}

		this.comparePairEntity[resetEntity].pop();
		if(tEntity != undefined) {
			this.comparePairEntity[resetEntity].push(new AdjudicationEntity(this.getNewEntityId(), resetEntity, tEntity));
			this.comparePairEntity[resetEntity][0] = this.comparePairEntity[resetEntity].splice(idx, 1, this.comparePairEntity[resetEntity][0])[0];
		}
	}
	*/
}

AnaforaAdjudicationProject.prototype.removeAdjAObj = function(delAdjAObj) {
	var id = parseInt(delAdjAObj.id.split('@')[0]);
	if(delAdjAObj instanceof AdjudicationEntity) {
		delete this.adjudicationEntityList[id];
	}
	else if(delAdjAObj instanceof AdjudicationRelation) {
		delete this.adjudicationRelationList[id];
	}
}
AnaforaAdjudicationProject.prototype.addAdjAObj = function(addAdjAObj) {
	var id = parseInt(addAdjAObj.id.split('@')[0]);
	if(addAdjAObj instanceof AdjudicationEntity) {
		this.adjudicationEntityList[id] = addAdjAObj;
	}
	else if(addAdjAObj instanceof AdjudicationRelation) {
		this.adjudicationRelationList[id] = addAdjAObj;
	}
}

AnaforaAdjudicationProject.prototype.removeAObj = function(delAObj) {

	var terms = delAObj.id.split('@');
	var idx = parseInt(terms[0]);
	var annotator = terms[3];

	var comparePairList = delAObj.getAdditionalData("comparePair");
	/*
	if(currentAProject.selectedAObj instanceof AdjudicationEntity) {
		var adjEntityIdx = parseInt(currentAProject.selectedAObj.id.split('@')[0]);
		var remainEntity = currentAProject.selectedAObj.compareAObj[(comparedIdx+1)%2];

		//AnaforaProject.prototype.removeAObj.call(this,currentAProject.selectedAObj);
		delete this.adjudicationEntityList[adjEntityIdx];
		
		this.removePosIndex(currentAProject.selectedAObj);
		if(this.annotateFrame != undefined)
			this.annotateFrame.updatePosIndex(remainEntity);

		annotator = delAObj.id.split('@')[3];
		this.projectList[annotator].removeAObj(delAObj);

		if(currentAProject.selectedAObj.decideIdx != undefined) {
			
			if(currentAProject.selectedAObj.decideIdx == comparedIdx) {
				remainEntity.setAdditionalData("adjudication", undefined);
				this.completeAdjudication--;
			}
			else
				remainEntity.setAdditionalData("adjudication", "gold");
		}
		this.updateOverlap(currentAProject.selectedAObj);
		selectAObj(remainEntity);

	}
	*/
	//else {
	if(comparePairList == undefined)
	{
		if(annotator == "gold") {
			AnaforaProject.prototype.removeAObj.call(delAObj);
		}
		else {
			this.projectList[annotator].removeAObj(delAObj);
	
			if(this.annotateFrame != undefined) {
				this.annotateFrame.removePosIndex(delAObj);
				this.annotateFrame.updateOverlap(delAObj);
			}
	
			this.delTypeCount(delAObj.type);
	
			this.totalAdjudication--;
			if(delAObj.getAdditionalData("adjudication") === "gold")
				this.completeAdjudication--;
		}
	}
	else {
		// remove adjudicationAObj
		if(this.annotateFrame != undefined) {
			this.annotateFrame.removePosIndex(this.comparePairList[1]);
			this.annotateFrame.removePosIndex(delAObj);

		}

		if(this.comparePairList[1].getAdditionalData("adjudication") !== "gold") {
			this.markGold(this.comparePairList[1]);
		}
		this.removeAdjAObj(this.comparePairList[1]);

		if(this.annotateFrame != undefined) {
			this.annotateFrame.updateOverlap(this.comparePairList[1]);
		}
		
	}
	this.updateProgressBar();
	temporalSave();
}

AnaforaAdjudicationProject.prototype.updateProgressBar = function() {
	this.progressBar.children("progress").attr("value", this.completeAdjudication ); 
	this.progressBar.children("progress").attr("max", this.totalAdjudication ); 
	this.progressBar.children("span").text(this.completeAdjudication.toString() + " / " + this.totalAdjudication.toString() ); 


	$("#schemaWrapper").css("bottom", (this.progressBar.height() + 5).toString() + "px");
	this.progressBar.show();
}

AnaforaAdjudicationProject.prototype.getXMLEntityList = function() {
	var rStr = "";
	
	if(this.projectList != undefined) {
	$.each(this.projectList, function(accountName, aProject) {
		rStr += aProject.getXMLEntityList();
	});
	}

	rStr += AnaforaProject.prototype.getXMLEntityList.call(this);

	return rStr;
}

AnaforaAdjudicationProject.prototype.getXMLRelationList = function() {
	var rStr = "";

	if(this.projectList != undefined) {
	$.each(this.projectList, function(accountName, aProject) {
		rStr += aProject.getXMLRelationList();
	});
	}

	return rStr;
}

AnaforaAdjudicationProject.prototype.getXMLAdjudicationList = function() {
	var rStr = "";
	var _self = this;
	$.each(this.adjudicationEntityList, function(idx) {
		rStr += _self.adjudicationEntityList[idx].toXMLString() + '\n\n';
	});
	$.each(this.adjudicationRelationList, function(idx) {
		rStr += _self.adjudicationRelationList[idx].toXMLString() + '\n\n';
	});
	return rStr;
}

AnaforaAdjudicationProject.prototype.markGold = function(goldAObj) {
	var _self = this;
	if(goldAObj.getAdditionalData("adjudication") == "gold")
		return ;

	var compareList = goldAObj.getAdditionalData("comparePair");
	if(compareList != undefined && compareList.length >= 2 && compareList[compareList.length-1].__proto__.parent !== undefined && compareList[compareList.length-1].__proto__.parent == IAdjudicationAnaforaObj ) {
		var adjAObj = compareList[compareList.length-1];
		var goldIdx = adjAObj.compareAObj.indexOf(goldAObj);
		var notGoldIdx = (goldIdx == 0) ? 1 : 0 ;

		if(adjAObj.decideIdx == undefined) {
			this.completeAdjudication++;
		}
		adjAObj.compareAObj[notGoldIdx].setAdditionalData("adjudication", "not gold");
		adjAObj.decideIdx = goldIdx;
	}
	else
		this.completeAdjudication++;

	goldAObj.setAdditionalData("adjudication", "gold");

	// mark all linked aObj as gold
	$.each(goldAObj.type.propertyTypeList, function(idx, propType) {
		if(propType.input == InputType.LIST) {
			if(goldAObj.propertyList[idx] != undefined) {
				$.each(goldAObj.propertyList[idx], function(aIdx, aObj) {
					_self.markGold(aObj);
				});
			}
		}
	});
}

AnaforaAdjudicationProject.prototype.cancelGold = function(cancelAObj) {
	var _self = this;
	if(cancelAObj.getAdditionalData("adjudication") === undefined)
		return ;

	var compareList = cancelAObj.getAdditionalData("comparePair");
	if(compareList != undefined && compareList.length >= 2 && compareList[compareList.length-1].__proto__.parent !== undefined && compareList[compareList.length-1].__proto__.parent == IAdjudicationAnaforaObj ) {
		var adjAObj = compareList[compareList.length-1];
		if(adjAObj.decideIdx !== undefined) {
			this.completeAdjudication--;
			adjAObj.decideIdx = undefined;
		}

		adjAObj.compareAObj[0].setAdditionalData("adjudication");
		adjAObj.compareAObj[1].setAdditionalData("adjudication");
	}
	else {
		if(cancelAObj.getAdditionalData("adjudication") == "gold")
			this.completeAdjudication--;
		cancelAObj.setAdditionalData("adjudication");
	}
}

AnaforaAdjudicationProject.prototype.addAObj = function(newAObj) {
	AnaforaProject.prototype.addAObj.call(this, newAObj);
	this.totalAdjudication++;
	this.updateProgressBar();
}

AnaforaAdjudicationProject.prototype.adjudicationCompleted = function() {
	var _self = this;
	if((this.completeAdjudication < this.totalAdjudication) && !window.confirm("Still some entities not been adjudicated. Confirm to mark completed?") )
		return ;

	$.each(Object.keys(this.entityList), function(i, idx) {
		var entity = _self.entityList[idx];
		if(entity instanceof AdjudicationEntity) {
			if(entity.decideIdx == undefined) {
				delete _self.entityList[idx];
			}
			else {
				entity.compareAObj[entity.decideIdx].id = entity.id;
				_self.entityList[idx] = entity.compareAObj[entity.decideIdx];
				_self.entityList[idx];
			}
		}
		else {
			if(entity.getAdditionalData("adjudication") !== "gold")
				delete _self.entityList[idx];
			else {
				entity.setAdditionalData("adjudication", undefined);
			}
		}
	});

	$.each(this.projectList, function(annotatorName) {
		$.each(_self.projectList[annotatorName].entityList, function(idx) {
			var entity = _self.projectList[annotatorName].entityList[idx];
			if(entity.getAdditionalData("adjudication") === "gold") {
				entity.setAdditionalData("adjudication", undefined);
				var newID = _self.getNewEntityId();
				var idx = parseInt( newID.split("@")[0] );
				entity.id = newID;
				
				_self.entityList[idx] = entity;
			}
		});
	});

	this.adjudicationEntityList = [];
	this.projectList = undefined;

	temporalSave();
	saveFile();
	setCompleted();
	window.location.reload();
}

AnaforaAdjudicationProject.prototype.readFromXMLDOM = function(xml) {
	var xmlDOM = $(xml);
	var infoDOM = xmlDOM.find("info");
	var tInfoDOM = infoDOM.clone();
	tInfoDOM.find("progress").each( function() { $(this).text("completed"); });
	this.completed = (infoDOM.find("progress").text() == "completed");
	var schemaDOM = xmlDOM.find("schema");
	var annotationDOM = xmlDOM.find("annotations");
	var adjudicationDOM = xmlDOM.find("adjudication");
	var _self = this;
	var idx, annotatorName, entity, relation;
	var aObj;
	var projectXMLList = {};
	
	// parse annotations from
	$(annotationDOM).children().each( function() {
		if (this.tagName == "entity") 
			aObj = Entity.genFromDOM(this, _self.schema);
		else
			aObj = Relation.genFromDOM(this, _self.schema);

		idx = parseInt(aObj.id.split('@')[0]);
		annotatorName = aObj.id.split('@')[3];
			
		if(annotatorName == "gold") {
			if(aObj instanceof Entity)
				_self.entityList[idx] = aObj;
			else
				_self.relationList[idx] = aObj;

			_self.addTypeCount(aObj.type);
			if(_self.annotateFrame != undefined)
				_self.annotateFrame.updatePosIndex(aObj);
			_self.totalAdjudication++;
			if(aObj.getAdditionalData("adjudication") == "gold")
				_self.completeAdjudication++;
		}
		else {
			if(!(annotatorName in projectXMLList)) {
				var newXML = $($.parseXML('<?xml version="1.0" encoding="UTF-8"?><data></data>'));
				newXML.children(0).append($(tInfoDOM).children(0));
				newXML.children(0).append($(schemaDOM).children(0));
				newXML.children(0).append($($.parseXML("<annotations></annotations>")).children(0));
				projectXMLList[annotatorName] = newXML;

			}

			var projectXML = projectXMLList[annotatorName];
			projectXML.find("annotations").append(this);
		}
			/*
			idx = parseInt(entity.id.split('@')[0]);
			annotatorName = entity.id.split('@')[3];
			
			if(annotatorName == "gold") {
				_self.entityList[idx] = entity;
				_self.addTypeCount(entity.type);
				_self.updatePosIndex(entity);
				_self.totalAdjudication++;
				if(entity.getAdditionalData("adjudication") == "gold")
					_self.completeAdjudication++;
			}
			else {
				if(!(annotatorName in projectXMLList)) {
					var newXML = $($.parseXML('<?xml version="1.0" encoding="UTF-8"?><data></data>'));
					newXML.children(0).append($(tInfoDOM).children(0));
					newXML.children(0).append($(schemaDOM).children(0));
					newXML.children(0).append($($.parseXML("<annotations></annotations>")).children(0));
					projectXMLList[annotatorName] = newXML;

				}

				var projectXML = projectXMLList[annotatorName];
				projectXML.find("annotations").append(this);
			}
			*/
	});

	if(Object.keys(projectXMLList).length > 0) {
		this.projectList = {};
		$.each(projectXMLList, function(annotatorName, projectXML) {
			_self.projectList[annotatorName] = new AnaforaProject(_self.schema, annotatorName, _self.task);
			_self.projectList[annotatorName].setAnnotateFrame(_self.annotateFrame);
			_self.projectList[annotatorName].readFromXMLDOM(projectXML, true); 
		});
	}

	// reading <adjudication> dom
	if(this.projectList != undefined) {
	
		$(adjudicationDOM).children().each( function() {
			if (this.tagName == "entity") 
				aObj = AdjudicationEntity.genFromDOM(this, _self.schema, _self.projectList);
			else
				aObj = AdjudicationRelation.genFromDOM(this, _self.schema, _self.projectList);
			idx = parseInt(aObj.id.split('@')[0]);
			if (aObj instanceof Entity)
				_self.adjudicationEntityList[idx] = aObj;
			else
				_self.adjudicationRelationList[idx] = aObj;

			if(_self.annotateFrame != undefined)
				_self.annotateFrame.updatePosIndex(aObj);

			_self.addTypeCount(aObj.type);
			_self.totalAdjudication++;
	
			if(aObj.compareAObj != undefined) {
				$.each(aObj.compareAObj, function(idx, tObj) {
					var _idx = parseInt(tObj.id.split('@')[0]);
					var _accountName = tObj.id.split('@')[3];
	
				});
	
				if(aObj.decideIdx === 0 ||aObj.decideIdx === 1)
					_self.completeAdjudication++;
						
			}
			/*
			if (this.tagName == "entity") {
				entity = AdjudicationEntity.genFromDOM(this, _self.schema, _self.projectList);
				idx = parseInt(entity.id.split('@')[0]);
				_self.adjudicationEntityList[idx] = entity;
				_self.updatePosIndex(entity);
				_self.addTypeCount(entity.type);
				_self.totalAdjudication++;
	
				if(entity.compareAObj != undefined) {
					$.each(entity.compareAObj, function(idx, aObj) {
						var _idx = parseInt(aObj.id.split('@')[0]);
						var _accountName = aObj.id.split('@')[3];
	
						adjudicationComparedID[_accountName][_idx] = undefined;
					});
	
					if(entity.decideIdx === 0 ||entity.decideIdx === 1)
						_self.completeAdjudication++;
						
				}
			}
			else if (this.tagName == "relation") {
				relation = AdjudicationRelation.genFromDOM(this, _self.schema);
				idx = parseInt(relation.id.split('@')[0]);
				_self.relationList[idx] = relation;
				_self.addTypeCount(relation.type);
				_self.totalAdjudication++;
			}
			*/
		});
	}

	this.maxEntityIdx = Math.max(this.maxEntityIdx, Object.keys(this.entityList).max(), Object.keys(this.adjudicationEntityList).max() );
	this.maxRelationIdx = Math.max(this.maxRelationIdx, Object.keys(this.relationList).max(), Object.keys(this.adjudicationRelationList).max() );
	
	// linking and re-count entity and relation
	if(this.projectList != undefined) {
		$.each(this.projectList, function(annotatorName, aProject) {
			$.each(aProject.entityList, function(idx, entity) {
				var comparePairEntityListStr = entity.getAdditionalData("comparePair");
				if(comparePairEntityListStr != undefined) {
					var comparePairEntityList = [];
					$.each(comparePairEntityListStr.split(','), function(idx, id) {
						var terms = id.split('@');
						var tIdx = parseInt(terms[0]);
						var tAnnotator = terms[3];
						var tEntity = undefined;
						if(tAnnotator == "gold") {
							tEntity = _self.adjudicationEntityList[tIdx];
						}
						else {
							tEntity = _self.projectList[tAnnotator].entityList[tIdx];
						}
						if(tEntity == undefined)
							throw "find back comparePairEntityList error: " + id;

						comparePairEntityList.push(tEntity);
					});
					entity.setAdditionalData("comparePair", comparePairEntityList);
				}

				var comparePairEntityList = entity.getAdditionalData("comparePair");
				if(comparePairEntityList == undefined || !(comparePairEntityList[comparePairEntityList.length - 1] instanceof AdjudicationEntity)) {
					_self.addTypeCount(entity.type);
					if(_self.annotateFrame != undefined)
						_self.annotateFrame.updatePosIndex(entity);
					_self.totalAdjudication++;
					if(entity.getAdditionalData("adjudication") == "gold")
						_self.completeAdjudication++;
						
				}
			});

			$.each(aProject.relationList, function(idx, relation) {
				var comparePairRelationListStr = relation.getAdditionalData("comparePair");
				if(comparePairRelationListStr != undefined) {
					var comparePairRelationList = [];
					$.each(comparePairRelationListStr.split(','), function(idx, id) {
						var terms = id.split('@');
						var tIdx = parseInt(terms[0]);
						var tAnnotator = terms[3];
						var tRelation = undefined;
						if(tAnnotator == "gold") {
							tRelation = _self.adjudicationRelationList[tIdx];
						}
						else {
							tRelation = _self.projectList[tAnnotator].relationList[tIdx];
						}
						if(tRelation == undefined)
							throw "find back comparePairRelationList error: " + id;

						comparePairRelationList.push(tRelation);
					});
					relation.setAdditionalData("comparePair", comparePairRelationList);
				}

				var comparePairRelationList = relation.getAdditionalData("comparePair");
				if(comparePairRelationList == undefined || !(comparePairRelationList[comparePairRelationList.length - 1] instanceof AdjudicationRelation)) {
					_self.addTypeCount(relation.type);
					if(_self.annotateFrame != undefined)
						_self.annotateFrame.updatePosIndex(relation);
					_self.totalAdjudication++;
					if(relation.getAdditionalData("adjudication") == "gold")
						_self.completeAdjudication++;
						
				}
			});
		});
	}

	/*
	maxIndex = this.annotateFrame.getMaxPosintIndex();
	var maxIndex = Object.keys(this.positIndex).max()+1;
	this.generateOverlapListFromPosit(0, maxIndex, this.overlap);
	*/
	if(this.annotateFrame != undefined)
		this.annotateFrame.generateAllAnnotateOverlapList();
	this.updateProgressBar();
}
