
function AnaforaAdjudicationProjectCoreference(schema, task) {
	AnaforaAdjudicationProject.call(this, schema, task);

	this.identicalEntityMarkAsGold = false;
}

AnaforaAdjudicationProjectCoreference.prototype = new AnaforaAdjudicationProject();
AnaforaAdjudicationProjectCoreference.prototype.constructor = AnaforaAdjudicationProjectCoreference;

AnaforaAdjudicationProjectCoreference.prototype.setCompletedProcess = function() {

	var _self = this;
	// mark all entity as non-gold
	
	$.each(this.entityList, function(idx, entity) {
		entity.setAdditionalData("adjudication");
	});

	/*
	$.each(this.projectList, function(annotatorName, aProject) {
		$.each(aProject.entityList, function(idx, entity) {
			entity.setAdditionalData("adjudication");
		});
	});
	*/

	$.each(this.projectList, function(annotatorName, aProject) {
		aProject.entityList = {};
	});

	// go through gold relation
	$.each(this.relationList, function(idx, relation) {

		if(relation.getAdditionalData("adjudication") == "gold") {
			$.each(relation.type.propertyTypeList, function(pIdx, pType) {
				if(pType.input == InputType.LIST) {
					$.each(relation.propertyList[pIdx], function(plIdx, aObj) {
						var replaceEntity = _self.moveGoldEntity(aObj);
						if(replaceEntity !== undefined)
							relation.propertyList[pIdx][plIdx] = replaceEntity;
					});
				}
			});
		}
	});

	// go through separate relation
	$.each(this.projectList, function(annotatorName, aProj) {
		$.each(aProj.relationList, function(idx, relation) {
			if(relation.getAdditionalData("adjudication") == "gold") {
				$.each(relation.type.propertyTypeList, function(pIdx, pType) {
					if(pType.input == InputType.LIST) {
						$.each(relation.propertyList[pIdx], function(plIdx, aObj) {
							var replaceEntity = _self.moveGoldEntity(aObj);
							if(replaceEntity !== undefined)
								relation.propertyList[pIdx][plIdx] = replaceEntity;
						});
					}
				});
			}
		});

		aProj.entityList = {};
		//aProj.relationList = {};
	});

	this.adjudicationEntityList = {};
	//this.adjudicationRelationList = {};

	AnaforaAdjudicationProject.prototype.setCompletedProcess.call(this);
}

AnaforaAdjudicationProjectCoreference.prototype.moveGoldEntity = function(entity) {
	var val = entity.id.split('@');
	var annotator = val[3];
	var idx = parseInt(val[0]);
	if(entity instanceof AdjudicationEntity) {
		if(entity.decideIdx == undefined)
			entity.decideIdx = 0;

		if(this.entityList[idx] == undefined) {
			entity.compareAObj[entity.decideIdx].id = entity.id;
			entity.compareAObj[entity.decideIdx].setAdditionalData("adjudication", "gold");
			this.entityList[idx] = entity.compareAObj[entity.decideIdx]
		}

		return entity.compareAObj[entity.decideIdx];
		//this.moveGoldEntity(entity.compareAObj[0]);
	}
	else{
		if( annotator != "gold") {
			var comparePair;
			if((comparePair = entity.getAdditionalData("comparePair")) !== undefined) {
				return this.moveGoldEntity(comparePair[comparePair.length-1]);
			}
			else {
				var newID = this.getNewEntityId();
				var newIdx = parseInt(newID.split('@')[0]);
				entity.id = newID;
				this.entityList[newIdx] = entity;
				entity.setAdditionalData("adjudication", "gold");

				return entity;
			}
		}
		else {
			entity.setAdditionalData("adjudication", "gold");
			return undefined;
		}
	}
}

AnaforaAdjudicationProjectCoreference.prototype.relationAdjFilter = function(diffProp) {
	if(diffProp.indexOf(0) > -1)
		return false;

	return true;
}

Entity.coreferenceComparePairCheck = function(entity0, entity1) {
	var needAddAdjudicationEntity = (Entity.sort(entity0, entity1) == 0);
	return {"needAddAdjudicationEntity": needAddAdjudicationEntity, "diffProp":[], "spanEqual": needAddAdjudicationEntity, "matchScore": (needAddAdjudicationEntity ? 0.8 : 0.2) };
}

Entity.comparePairCheck = Entity.coreferenceComparePairCheck;
