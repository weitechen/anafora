Array.prototype.repeat = function(value, time) {
	while(time--)
		this.push(value);
}

Array.prototype.max = function() {
	return Math.max.apply(null, this);
}

function SpanType(start, end) {
	this.start = start;
	this.end = end;
}

function invertColor(hexTripletColor) {
    var color = hexTripletColor;
    //color = color.substring(1);           // remove #
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    //color = "#" + color;                  // prepend #
    return color;
}

SpanType.sort = function(spanA, spanB) {
	if(spanA.start == spanB.start) { 
		var endDiff = (spanA.end - spanB.end);
		return endDiff < 0 ? -1 : (endDiff > 0 ? 1: 0);
	}
	else {
		var startDiff = spanA.start - spanB.start ;

		return startDiff < 0 ? -1 : (startDiff > 0 ? 1:0);	
	}
}

SpanType.prototype.clone = function() {
	return new SpanType(this.start, this.end);
}

SpanType.merge = function(span1, span2) {
	var newSpanList = [];
	var listIdx1 = 0, listIdx2 = 0;
	var positIdx1= -1, positIdx2 = -1;
	var tSpan1 = span1[listIdx1], tSpan2 = span2[listIdx2];
	var newSpanStart = -1;
	var newSpanEnd = -1;

	while(listIdx1 < span1.length && listIdx2 < span2.length) {
		if(newSpanStart == -1)
			newSpanStart = Math.min(span1[listIdx1].start, span2[listIdx2].start);

		if(span1[listIdx1].end < span2[listIdx2].end) {
			if(span1[listIdx1].end < span2[listIdx2].start)
				newSpanEnd = span1[listIdx1].end;
			listIdx1++;
		}
		else if(span2[listIdx2].end < span1[listIdx1].end) {
			if(span2[listIdx2].end < span1[listIdx1].start)
				newSpanEnd = span2[listIdx2].end;
			listIdx2++;
		}
		else {
			newSpanEnd = span1[listIdx1].end;
			listIdx1++;
			listIdx2++;
		}

		if(newSpanEnd != -1) {
			newSpanList.push(new SpanType(newSpanStart, newSpanEnd));

			newSpanStart = -1;
			newSpanEnd = -1;
		}
	}


	if(newSpanStart != -1) {
		newSpanList.push(new SpanType(newSpanStart, (listIdx1==span1.length ? span2[listIdx2++].end : span1[listIdx1++].end)));	
	}

	var notCompleteSpan = undefined;
	var notCompleteIdx = undefined;
	if(listIdx1 < span1.length) {
		notCompleteSpan = span1;
		notCompleteIdx = listIdx1;
	}
	else if(listIdx2 < span2.length) {
		notCompleteSpan = span2;
		notCompleteIdx = listIdx2;
	}

	while(notCompleteSpan != undefined && notCompleteIdx < notCompleteSpan.length) {
		newSpanList.push(new SpanType(notCompleteSpan[notCompleteIdx].start, notCompleteSpan[notCompleteIdx].end));
		notCompleteIdx++;
	}
	return newSpanList;
}

function IAnaforaObj(id, type, propertyList, additionalList, comment) {
	if(id != undefined) {
		this.id = id;
		this.type = type;
		this.comment = comment;
		if(propertyList == undefined){
			this.propertyList = [];
			if(type !== undefined)
				this.propertyList.repeat(undefined, type.propertyTypeList.length);
		}
		else
			this.propertyList = propertyList;
		
		this.markElement = [];
		if(additionalList == undefined)
			this.additionalData = {};
		else
			this.additionalData = additionalList;

		this.linkingAObjList = [];
	}
}

IAnaforaObj.prototype.addListProperty = function(aObj, pIdx, lIdx) {
	if(this.type.propertyTypeList.length < pIdx) {
		throw "update property error with property idx: " + pIdx.toString() + " with annotation: " + this.id;
	}

	if(!(aObj instanceof IAnaforaObj)) {
		throw "update LIST type INPUT with non-annotation: " + aObj.toString();
	}

	if(this.propertyList[pIdx] != undefined && this.propertyList[pIdx].indexOf(aObj) != -1)
		return;

	if(this.propertyList[pIdx] == undefined)
		this.propertyList[pIdx] = [];

	if(lIdx == undefined) {
		if(this.propertyList[pIdx].length == this.type.propertyTypeList[pIdx].maxlink) {
			this.propertyList[pIdx][this.propertyList[pIdx].length-1].removeLinkingAObj(this);
			if(this.propertyList[pIdx] == undefined)
				this.propertyList[pIdx] = [];

		}
		this.propertyList[pIdx].push(aObj);
	}
	else
		this.updateListProperty(aObj, pIdx, lIdx);

	aObj.addLinkingAObj(this);

	//this.propertyList[pIdx].sort();
}

IAnaforaObj.prototype.updateListProperty = function(aObj, pIdx, lIdx) {

	this.propertyList[pIdx][lIdx] = aObj;
}

IAnaforaObj.prototype.updateProperty = function(value, pIdx) {
	if(this.type.propertyTypeList.length < pIdx) {
		throw "update property error with property idx: " + pIdx.toString() + " with annotation: " + this.id;
	}
	
	if(this.type.propertyTypeList[pIdx].input == InputType.LIST) {
		this.addListProperty(value, pIdx); 
	}
	else {
		this.propertyList[pIdx] = value;
	}
}

IAnaforaObj.prototype.addMarkElement = function(overlap, skipOrder) {
	if(skipOrder == undefined || !skipOrder) {
		for(var idx=0;idx<this.markElement.length;idx++) {
			if(overlap.span.start == this.markElement[idx].span.start && overlap.span.end == this.markElement[idx].span.end) {
				this.markElement[idx] = overlap;
				return ;
			}
			if(overlap.span.end <= this.markElement[idx].span.start) {
				this.markElement.splice(idx, 0, overlap);
				return ;
			}
		}
	}

	this.markElement.push(overlap);
}

IAnaforaObj.prototype.removeMarkElement = function(overlap) {
	var idx = this.markElement.indexOf(overlap);
	if(idx > -1) {
		this.markElement.splice(idx, 1);
	}
}

IAnaforaObj.prototype.toString = function() {
	return this.id;
}

IAnaforaObj.prototype.toXMLString = function() {
	throw('toXMLString not implement yet');
}

IAnaforaObj.prototype.genElementStr = function() {
	throw('genElementStr not implement yet');
}

IAnaforaObj.prototype.getAdditionalData = function(name) {
	return this.additionalData[name];
}

IAnaforaObj.prototype.setAdditionalData = function(name, data) {
	if(data === undefined)
		delete this.additionalData[name];
	else
		this.additionalData[name] = data;
}

IAnaforaObj.prototype.getSpanRange = function() {
	throw('getSpanRange not implement yet');
}

IAnaforaObj.prototype.isCrossObj = function() {
	var _self = this;
	var isCrossObj = false;
	var taskName = this.getTaskName();
	$.each(this.type.propertyTypeList, function(idx) {
		if(_self.type.propertyTypeList[idx].input == InputType.LIST) {
			if(_self.propertyList[idx] != undefined) {
				$.each(_self.propertyList[idx], function(pIdx) {
					if(_self.propertyList[idx][pIdx].getTaskName() != taskName)
						isCrossObj = true;
						return false ;
				});
				if(isCrossObj)
					return false;
			}
		}
	});

	return isCrossObj;
}

IAnaforaObj.parsePropertyValueFromDOM = function(propertiesDOM, objType) {
	var propertyList = [];
	propertyList.repeat(undefined, objType.propertyTypeList.length);

	$.each(objType.propertyTypeList, function(idx, pType) {
		if(pType.input == InputType.CHOICE && pType.allowedValueList[0] != "" ) {
			propertyList[idx] = pType.allowedValueList[0];
		}
	});

	$(propertiesDOM).children().each( function() {
		var propertyName = this.tagName;
		var matchPropertyList = $.grep(objType.propertyTypeList, function(item) {
			return (item.type == propertyName);
		});
		if (matchPropertyList.length != 1) {
			throw "Parsing property error: " + propertyName;
		}
		var propertyIdx = $(objType.propertyTypeList).index(matchPropertyList[0]);
		
		if($(this).text() != "") {
			if(objType.propertyTypeList[propertyIdx].input == InputType.MULTICHOICE)
				propertyList[propertyIdx] = $(this).text().replace(' ', '').split(',');
			else if(objType.propertyTypeList[propertyIdx].input == InputType.LIST) {
				if(propertyList[propertyIdx] == undefined)
					propertyList[propertyIdx] = [$(this).text()];
				else
					propertyList[propertyIdx].push($(this).text());
			}
			else
				propertyList[propertyIdx] = $(this).text();
		}
	} );


	return propertyList;
}

IAnaforaObj.parseAdditionalDataFromDOM = function(additionalDOM) {
	var additionalList = {};
	$(additionalDOM).children().each( function() {
		additionalList[this.tagName] = $(this).text();
	});

	return additionalList;
}

IAnaforaObj.sort = function(aObjA, aObjB) {
	if(aObjA instanceof Entity && aObjB instanceof Entity)
		return Entity.sort(aObjA, aObjB);
	else if(aObjA instanceof Relation && aObjB instanceof Relation)
		return Relation.sort(aObjA, aObjB);
	else if(aObjA instanceof Entity)
		return -1;
	else
		return 1;
}

IAnaforaObj.prototype.getAdditionalDataXMLStr = function() {

	var rStr = "";
	if(Object.keys(this.additionalData).length > 0) {
		var _self = this;

		$.each(this.additionalData, function(key) {
			rStr += "\t\t\t<" + key + ">" + _self.getAdditionalData(key).toString() + "</" + key + ">\n";
		});

	}

	if(rStr != "")
		rStr = "\t\t<addition>\n" + rStr + "\t\t</addition>\n";


	return rStr;
}

IAnaforaObj.prototype.getPropertyXMLStr = function() {
	var _self = this;
	if(this.propertyList == undefined)
		return "<properties />";

	var rStr = '\t\t<properties>\n';

	$.each(this.propertyList, function(idx, element) {
		var pType = _self.type.propertyTypeList[idx];
		if(pType.input == InputType.LIST) {
			if(element == undefined)
				rStr += '\t\t\t<' + pType.type + '></' + pType.type + '>\n';
			else {
				$.each(element, function(idx, tElement) {
					rStr += '\t\t\t<' + pType.type + '>' + tElement.id + '</' + pType.type + '>\n';
				});
			}
		}
		else {
			rStr += '\t\t\t<' + pType.type + '>' + ((element == undefined) ? "" : element)  + '</' + pType.type + '>\n';
		}
	})

	rStr += '\t\t</properties>\n';
	return rStr;
}

IAnaforaObj.prototype.addLinkingAObj = function(linkingAObj) {
	if(linkingAObj instanceof IAnaforaObj && this.linkingAObjList.indexOf(linkingAObj) == -1) {
		if(linkingAObj instanceof Entity) {
			this.linkingAObjList.splice(0, 0, linkingAObj);
		}
		else {
			this.linkingAObjList.push(linkingAObj);
		}
	}
}

IAnaforaObj.prototype.removeLinkingAObj = function(linkingAObj) {
	var _self = this;
	if(linkingAObj instanceof IAnaforaObj) {
		var idx = this.linkingAObjList.indexOf(linkingAObj);
		if(idx == -1)
			throw "linkingAObj " + linkingAObj.id + " not in linkingAObjList of " + this.id;

		$.each(linkingAObj.type.propertyTypeList, function(pIdx, pType) {
			if(pType.input == InputType.LIST) {
				var aIdx;
				if(linkingAObj.propertyList[pIdx] != undefined && (aIdx = linkingAObj.propertyList[pIdx].indexOf(_self)) != -1) {
					if(linkingAObj.propertyList[pIdx].length == 1)
						linkingAObj.propertyList[pIdx] = undefined;
					else
						linkingAObj.propertyList[pIdx].splice(aIdx, 1);
				}
			}
		});
	}
}

IAnaforaObj.prototype.getTaskName = function() {
	var lastIdx = this.id.lastIndexOf('@');
	var taskName = this.id.substring(this.id.lastIndexOf('@', lastIdx-1) + 1, lastIdx);
	return taskName;
}

IAnaforaObj.prototype.destroy = function() {
	// clear the linking
	var linkingAObj;
	for(var i=0;i<this.linkingAObjList.length;i++) {
		linkingAObj = this.linkingAObjList[i];
		this.removeLinkingAObj(linkingAObj);
	}
}

IAnaforaObj.prototype.getAnnotationAnnotator = function() {
	/*
	 * Get the name of annotator based on annotation id
	 * @rtype: str
	 */
	var termList = this.id.split('@');
	return termList[3];
}

function Entity(id, type, span, propertyList, additionList, comment) {
	IAnaforaObj.call(this, id, type, propertyList, additionList, comment);

	if(id != undefined) {
		this.span = (span == undefined ? undefined : span.sort(SpanType.sort));

		if(propertyList == undefined) {
			if(type !== undefined) {
				for(var idx=0;idx<type.propertyTypeList.length;idx++) {
					if(type.propertyTypeList[idx].input == InputType.CHOICE && type.propertyTypeList[idx].allowedValueList[0] != '') {
						this.propertyList[idx] = type.propertyTypeList[idx].allowedValueList[0];
					}
				}
			}
		}
	}
}


Entity.prototype = new IAnaforaObj();
Entity.prototype.constructor = Entity;

Entity.prototype.genElementStr = function() {
	return '<span><span class="jstreeschema" style="background-color:#' + this.type.color + '"></span>' + getTextFromEntity(this) + '</span>';
}

Entity.prototype.toXMLString = function() {

	var rStr = this.getMetadataXMLStr();
	rStr += this.getPropertyXMLStr();
	rStr += this.getAdditionalDataXMLStr();
	
	rStr += '\t</entity>';

	return rStr;
}

Entity.prototype.getMetadataXMLStr = function() {
	var spanStr = "";
	var _self = this;
	$.each(this.span, function(idx) {
		if(idx > 0)
			spanStr += ';';

		spanStr += this.start.toString() + ',' + this.end.toString();
	});

	return rStr = '\t<entity>\n' +
'		<id>' + this.id + '</id>\n' +
'		<span>' + spanStr + '</span>\n' +
'		<type>' + this.type.type + '</type>\n' +
'		<parentsType>' + this.type.parentType.type + '</parentsType>\n';
}

Entity.sort = function(entityA,entityB) {
	if(entityA instanceof EmptyEntity)
		return -1;
	if(entityB instanceof EmptyEntity)
		return 1;

	if(entityA.getTaskName() != entityB.getTaskName())
		return (entityA.getTaskName() < entityB.getTaskName()) ? -1 : 1;

	var idx, compare;
	for(idx=0; idx<Math.min(entityA.span.length, entityB.span.length); idx++) {
		if((compare = SpanType.sort(entityA.span[idx], entityB.span[idx])) != 0)
			return compare;
	}

	if(entityA.span.length < entityB.span.length)
		return -1;

	else if(entityA.span.length > entityB.span.length)
		return 1;
	return 0;
}

Relation.comparePairCheck = function(relation0, relation1, preDefineScore) {
	var needAddAdjudicationEntity = false;
	var diffProp = [];
	//IAdjudicationAnaforaObj.compareAObjPropertyList(relation0, relation1);
	var diffPropCount = 0;
	//var diffPropCount = diffProp.length;
	var matchScore = 0.0;
	var propertyScore = 0.0;
	var propertyWeight = 0;
	var listScore = 0.0;
	var listWeight = 0;

	/*
	if(!(relation0.id == "249@r@ID185_clinic_543@adwi9965" && relation1.id == "264@r@ID185_clinic_543@reganma"))
		return {"diffProp": diffProp, "matchScore": matchScore };
	*/

	//console.log("preDefineScore: ");
	/*
	Object.keys(preDefineScore).forEach(function(key) {
		console.log("  preDefineScore[" + key + "] = " + preDefineScore[key].toString());
	});
	*/

	var entityCompareFunc = function(entity0, entity1) {
		if(entity0 === entity1)
			return 1.0;
		else {
			var idTerm0 = entity0.id.split("@");
			var idTerm1 = entity1.id.split("@");
			var annotator0 = idTerm0[3];
			var annotator1 = idTerm1[3];

			if(annotator0 == "gold" && annotator1 == "gold" && idTerm0[0] == idTerm1[0])
				return 1.0;
			else if(annotator0 != "gold" && annotator1 != "gold") {
				preDefineKey = entity0.id + "|" + entity1.id;
				if(preDefineKey in preDefineScore) {
					return preDefineScore[preDefineKey];
				}
			}
		}
		return 0.0
	}

	if(relation0.type !== relation1.type)
		throw "The type of relation pair is not match! " + relation0.id + "(" + relation0.type.type + "), " + relation1.id + "(" + relation1.type.type + ")";

	var isFirstOnlyLink = true;
	for(var pTypeIdx = 0; pTypeIdx < relation0.type.propertyTypeList.length; pTypeIdx++) {
		if(relation0.type.propertyTypeList[pTypeIdx].input == InputType.LIST) {
			var pMatchScore = IAdjudicationAnaforaObj.compareProperty(relation0.type.propertyTypeList[pTypeIdx], relation0.propertyList[pTypeIdx], relation1.propertyList[pTypeIdx], entityCompareFunc);
			if(pMatchScore != 1.0)
				diffProp.push(pTypeIdx);

			if(relation0.type.propertyTypeList[pTypeIdx].maxlink == 1 && isFirstOnlyLink) {
				listScore += 4*pMatchScore;
				listWeight += 4;
				isFirstOnlyLink = false;
			}
			else {
				listScore += 2*pMatchScore;
				listWeight += 2;
			}
		}
		else {
			var pMatchScore = IAdjudicationAnaforaObj.compareProperty(relation0.type.propertyTypeList[pTypeIdx], relation0.propertyList[pTypeIdx], relation1.propertyList[pTypeIdx]);
			if(pMatchScore != 1.0)
				diffProp.push(pTypeIdx);
			propertyScore += pMatchScore;
			propertyWeight++;
		}
	}

	if(listScore == 0.0) {
		matchScore = 0.0;
	}
	else {
		matchScore = (listScore + propertyScore) / (listWeight + propertyWeight);
	}
	
	return {"diffProp": diffProp, "matchScore": matchScore };
}

Entity.comparePairCheck = function(entity0, entity1) {
	var spanEqual = false;
	var needAddAdjudicationEntity = false;
	var diffProp = IAdjudicationAnaforaObj.compareAObjPropertyList(entity0, entity1);
	var diffPropCount = diffProp.length;
	var matchScore = 0.0;
	if(entity0.type.propertyTypeList.length == 0)
		matchScore += 0.2;
	else
		matchScore += (0.2 * (1.0 - diffPropCount/entity0.type.propertyTypeList.length));
	
	if(Entity.sort(entity0, entity1) == 0) {
		spanEqual = true;
		needAddAdjudicationEntity = true;
		matchScore += 0.8;
	}
	else {
		var spanIntList = Entity.calSpanUnionAndIntersec(entity0, entity1);
		if(spanIntList[0] == 0)
			matchScore = 0.0;
		else
			matchScore += 0.8 * spanIntList[0]/spanIntList[1];

		//comparePairList0 = this.comparePairEntity[entity0];
		var comparePairList0 = entity0.getAdditionalData("comparePair");
		//comparePairList1 = this.comparePairEntity[entity1];
		var comparePairList1 = entity1.getAdditionalData("comparePair");
		var origAdjEntity0 = (comparePairList0 != undefined && comparePairList0.length > 0 && comparePairList0[comparePairList0.length-1] instanceof AdjudicationEntity) ? comparePairList0[comparePairList0.length-1] : undefined;
		var origAdjEntity1 = (comparePairList1 != undefined && comparePairList1.length > 0 && comparePairList1[comparePairList1.length-1] instanceof AdjudicationEntity) ? comparePairList1[comparePairList1.length-1] : undefined;

		if(origAdjEntity0 == undefined && origAdjEntity1 == undefined && diffPropCount == 0)
			needAddAdjudicationEntity = true;
				
	}

	return {"needAddAdjudicationEntity": needAddAdjudicationEntity, "diffProp": diffProp, "spanEqual": spanEqual, "matchScore": matchScore };
}

Entity.calSpanUnionAndIntersec = function(entity0, entity1) {
	var unionLen = 0;
	var interLen = 0;
	var spanIdx0 = 0, spanIdx1 = 0;
	var span0, span1;

	var spanList0 = entity0.span;
	var spanList1 = entity1.span;
	var span0 = spanList0[0];
	var span1 = spanList1[0];
	var spanShift0 = 0, spanShift1 = 0 ;
	while(span0 != undefined || span1 != undefined) {
		if(span0 == undefined) {
			unionLen += (span1.end - span1.start - spanShift1);
			spanShift1 = 0;
			span1 = spanList1[++spanIdx1];
		}
		else if(span1 == undefined) {
			unionLen += (span0.end - span0.start - spanShift0);
			spanShift0 = 0;
			span0 = spanList0[++spanIdx0]
		}
		else if(span0.end <= (span1.start + spanShift1)) {
			unionLen += (span0.end - span0.start - spanShift0);
			spanShift0 = 0;
			span0 = spanList0[++spanIdx0];
		}
		else if(span0.start >= span1.end) {
			unionLen += (span1.end - span1.start - spanShift1);
			spanShift1 = 0;
			span1 = spanList1[++spanIdx1];
		}
		else {
			if(span0.start + spanShift0 < span1.start + spanShift1) {
				unionLen += (span1.start + spanShift1) - (span0.start + spanShift0);
				spanShift0 += (span1.start + spanShift1) - (span0.start + spanShift0);
			}
			else if(span0.start + spanShift0 > span1.start + spanShift1) {
				unionLen += (span0.start + spanShift0) - (span1.start + spanShift1);
				spanShift1 += (span0.start + spanShift0) - (span1.start + spanShift1);
			}

			var minEnd = Math.min(span0.end, span1.end);
			var sInterLen = (minEnd - span0.start - spanShift0);
			interLen += sInterLen;
			unionLen += sInterLen;

			if(span0.end < span1.end) {
				spanShift1 += sInterLen;
				spanShift0 = 0;
				span0 = spanList0[++spanIdx0];
			}
			else if(span0.end > span1.end) {
				spanShift0 += sInterLen;
				spanShift1 = 0;
				span1 = spanList1[++spanIdx1];
			}
			else {
				spanShift0 = 0;
				spanShift1 = 0;
				span0 = spanList0[++spanIdx0];
				span1 = spanList1[++spanIdx1];
			}
		}
	}

	return [interLen, unionLen];
}

Entity.prototype.addSpan = function(newSpan) {
	var tSpanList = [];
	var tSpanType;
	this.span.push(newSpan);
	this.span.sort(function(a,b) { if(a.start == b.start) { return a.end - b.end} else { return a.start - b.start }});

	tSpanList.push(this.span[0]);
	for(var i=1;i<this.span.length;i++) {
		tSpanType = this.span[i];
		if(tSpanList[tSpanList.length-1].start == tSpanType.start) {
			if(tSpanList[tSpanList.length-1].end >= tSpanType.end) {
				;
			}
			else
				tSpanList[tSpanList.length-1].end = tSpanType.end
		}
		else if(tSpanList[tSpanList.length-1].end >= tSpanType.start) {
			if(tSpanList[tSpanList.length-1].end < tSpanType.end)
				tSpanList[tSpanList.length-1].end = tSpanType.end
		}
		else
			tSpanList.push(tSpanType);
	}
	this.span = tSpanList;
}


Entity.prototype.removeSpan = function(spanIdx) {
	this.span.splice(spanIdx, 1);
}

Entity.prototype.hasOverlap = function(compareEntity) {
	var compare = Entity.sort(this, compareEntity);
	if(compare == 0)
		return true;
	else if(compare > 0)
		return compareEntity.hasOverlap(this);
	
	var idxA=0, idxB=0;
	var spanA, spanB;
	while(idxA < this.span.length && idxB < compareEntity.span.length) {
		spanA = this.span[idxA];
		spanB = compareEntity.span[idxB];

		if(spanA.start == spanB.start)
			return true;
		else if(spanA.start < spanB.start) {
			if(spanA.end <= spanB.start)
				idxA++;
			else
				return true;
		}
		else {
			if(spanB.end <= spanA.start)
				idxB++;
			else
				return true;
		}
	}

	return false;
}

Entity.prototype.getSpanRange = function() {
	return [this.span[0].start, this.span[this.span.length-1].end];
}

Entity.genFromDOM = function(entityDOM, schema) {
	var id = undefined, span = undefined, type = undefined, propertyList=undefined, additionList=undefined, comment=undefined;
	if(entityDOM.tagName == "entity") {
		//type = schema.getTypeByTypeName( entityDOM.getElementsByTagName("type")[0].innerHTML);
		$(entityDOM).children().each( function() {
			switch(this.tagName) {
				case "id":
					id = $(this).text();
					break;
				case "span":
					var tSpan = $(this).text().split(';');
					span = [];
					for(var idx=0;idx< tSpan.length;idx++) {
						var ttSpan = tSpan[idx].split(',');
						span.push(new SpanType(parseInt(ttSpan[0]), parseInt(ttSpan[1])));
					}
					break;
				case "type":
					type = schema.getTypeByTypeName($(this).text());
					break;
				case "parentsType":
					parentType = schema.getTypeByTypeName($(this).text());
					break;
				case "properties":
					propertyList = IAnaforaObj.parsePropertyValueFromDOM(this, type);
					break;
				case "addition":
					additionList = IAnaforaObj.parseAdditionalDataFromDOM(this);
					break;
				case "comment":
					comment = $(this).text();
					break;
				default:
					throw "entity property tag error with " + this.tagName;
			}
		});
	}
	else
		throw "create entity with wrong DOM Element: " + entityDOM.tagName;

	if(parentType != type.parentType)
		throw "parent type error:" + parentType.type + ', ' + type.parentType.type ;
					

	return new Entity(id, type, span, propertyList, additionList, comment);
}

function Relation(id, type, propertyList, additionList, comment) {
	IAnaforaObj.call(this, id, type, propertyList, additionList, comment);

	if(id != undefined) {
		if(propertyList == undefined) {
			if(type !== undefined) {
				for(var idx=0;idx<type.propertyTypeList.length;idx++) {
					if(type.propertyTypeList[idx].input == InputType.CHOICE && type.propertyTypeList[idx].allowedValueList[0] != '') {
						this.propertyList[idx] = type.propertyTypeList[idx].allowedValueList[0];
					}
				}
			}
		}
	}
}

Relation.prototype = new IAnaforaObj();
Relation.prototype.constructor = Relation;

Relation.sort = function(relationA, relationB) {
	if(relationA instanceof EmptyRelation)
		return -1;
	if(relationB instanceof EmptyRelation)
		return 1;

	if(relationA.isCrossObj() && !relationB.isCrossObj()) {
		return -1;
	}
	if(!relationA.isCrossObj() && relationB.isCrossObj()) {
		return 1;
	}
	var idx, compare;
	var firstListA = relationA.getFirstListProperty();
	var firstListB = relationB.getFirstListProperty();

	if(firstListA != undefined && firstListB != undefined)
		return IAnaforaObj.sort(firstListA, firstListB);
	else if(firstListA == undefined && firstListB != undefined)
		return -1;
	else if(firstListA != undefined && firstListB == undefined)
		return 1;
	else {
		var firstPropertyA = relationA.getFirstProperty();
		var firstPropertyB = relationB.getFirstProperty();

		if(firstPropertyA != undefined && firstPropertyB != undefined)
			return (firstPropertyA<firstPropertyB ? -1 : (firstPropertyA > firstPropertyB ? 1 : 0));
		else if(firstPropertyA == undefined && firstPropertyB != undefined)
			return -1;
		else if(firstPropertyA != undefined && firstPropertyB == undefined)
			return 1;	
		else
			return 0;
	}
}

Relation.isComparePair = function(relation0, relation1) {

}

Relation.prototype.getFirstProperty = function() {
	var idx;
	for(idx = 0;idx < this.propertyList.length; idx++) {
		if(this.propertyList[idx] != undefined)
			return this.propertyList[idx];
	}

	return undefined;
}
Relation.prototype.getFirstListProperty = function() {
	var rType = this.type;
	var idx = 0;
	for(idx = 0; idx < this.propertyList.length; idx++) {
		if(this.propertyList[idx] != undefined && rType.propertyTypeList[idx].input == InputType.LIST)
			return this.propertyList[idx][0];
	}
	return undefined;
}

Relation.prototype.genElementStr = function() {
	return '<span>' +  this.genElementHead() + this.genElementProperty() + '</span>';
}

Relation.prototype.genElementHead = function() {
	return rStr = '<span><span class="jstreeschema" style="background-color:#' + this.type.color + ';color:#' + invertColor(this.type.color) + '">' + (this.isCrossObj() ? 'C' : '') + '</span>' + this.type.type + '</span>';
}

Relation.prototype.genElementProperty = function() {
	var rStr = '';
	var _self = this;
	$.each(this.type.propertyTypeList, function(idx, propertyType) {

		if(_self.propertyList[idx] != undefined && _self.propertyList[idx].length != 0) {
			try {
				rStr += '[' + propertyType.type + ':&nbsp;'
				if(propertyType.input == InputType.LIST) {
					$.each(_self.propertyList[idx], function(tIdx, objElement) {
						rStr += objElement.genElementStr() + ", ";
					});
					rStr = rStr.substr(0, rStr.length - 2);
				}
				else {
					 rStr += _self.propertyList[idx];
				}
				rStr += '], ';
			}
			catch(err) {
				console.log("Generate type string element in Relation " + _self.id + " with  property type idx :" + idx.toString());
				errorHandler.handle(err, currentAProject);
				throw err;
			}
		}
	});
	rStr = rStr.substring(0, rStr.length - 2);

	return rStr;
}

Relation.prototype.toXMLString = function() {
	var rStr = this.getMetadataXMLStr();
	rStr += this.getPropertyXMLStr();
	rStr += this.getAdditionalDataXMLStr();
	
	rStr += '\t</relation>';

	return rStr;
}

Relation.prototype.getMetadataXMLStr = function() {

	return rStr = '\t<relation>\n' +
'		<id>' + this.id + '</id>\n' +
'		<type>' + this.type.type + '</type>\n' +
'		<parentsType>' + this.type.parentType.type + '</parentsType>\n';
}

Relation.prototype.getSpanRange = function() {
	var _self = this;
	var taskRangeDict = {};
	$.each(this.propertyList, function(idx) {
		if(_self.type.propertyTypeList[idx].input == InputType.LIST) {
			if(_self.propertyList[idx] != undefined) {
				$.each(_self.propertyList[idx], function(listIdx) {
					var taskName = _self.propertyList[idx][listIdx].getTaskName();
					var tRange = _self.propertyList[idx][listIdx].getSpanRange();
					if(!(taskName in taskRangeDict))
						taskRangeDict[taskName] = [undefined, undefined];
					
					if(taskRangeDict[taskName][0] == undefined || taskRangeDict[taskName][0] > tRange[0])
						taskRangeDict[taskName][0] = tRange[0];
					if(taskRangeDict[taskName][1] == undefined || taskRangeDict[taskName][1] < tRange[1])
						taskRangeDict[taskName][1] = tRange[1];
				});
			}
		}
	});

	return taskRangeDict;
}


Relation.genFromDOM = function(relationDOM, schema ) {
	var id = undefined, type = undefined, propertyList=undefined,additionList=undefined, comment=undefined;
	if(relationDOM.tagName == "relation") {
		$(relationDOM).children().each( function() {
			switch(this.tagName) {
				case "id":
					id = $(this).text();
					break;
				case "type":
					type = schema.getTypeByTypeName($(this).text());
					break;
				case "parentsType":
					parentType = schema.getTypeByTypeName($(this).text());
					break;
				case "properties":
					propertyList = IAnaforaObj.parsePropertyValueFromDOM(this, type);
					break;
				case "addition":
					additionList = IAnaforaObj.parseAdditionalDataFromDOM(this);
					break;
				case "comment":
					comment = $(this).text();
				default:
					throw "relation property tag error with " + this.tagName;
			}
		});
	}
	else {
		throw "relation with wrong DOM Element: " + relationDOM.tagName;
	}

	if(parentType != type.parentType) {
		throw "parent type error:" + parentType.type + ', ' + type.parentType.type ;
	}

	return new Relation(id, type, propertyList, additionList, comment);
}



function EmptyEntity(id, type) {
	Entity.call(this, id, type);
	this.origAObj = undefined;
}


EmptyEntity.prototype = new Entity();
EmptyEntity.prototype.constructor = EmptyEntity;

EmptyEntity.prototype.setOriginalEntity = function(origAObj) {
	this.origAObj = origAObj;
}

function EmptyRelation(id, type) {
	Relation.call(this, id, type);
}

EmptyRelation.prototype = new Relation();
EmptyRelation.prototype.constructor = EmptyRelation;

EmptyRelation.prototype.setOriginalRelation = function(origAObj) {
	this.origAObj = origAObj;
}

function AdjudicationEntity(id, type, compareAObjList, diffProp, span) {
	if(id != undefined) {
		Entity.call(this, id, type, span);
		IAdjudicationAnaforaObj.apply(this, compareAObjList);

		this.markElement = [];
		this.span = span;
		this.spanDiff = undefined;
		this.compareAObj = compareAObjList;
		this.diffProp = diffProp;


		if(diffProp == undefined) {
			AdjudicationEntity.prototype.addCompareAObj.apply(this, compareAObjList);
		}
		else {
			if(this.span == undefined)	
				this.updateSpan();

			if(compareAObjList[0].getAdditionalData("adjudication") == "gold") {
			this.decideIdx = 0;
			}
			else if (compareAObjList[1].getAdditionalData("adjudication") == "gold") {
			this.decideIdx = 1;
			}
		}
		/*
		if(aObj1 != undefined && aObj2 != undefined) {
		}
		*/
	}
}

AdjudicationEntity.prototype = new Entity();
AdjudicationEntity.prototype.constructor = Entity;
AdjudicationEntity.prototype.parent = IAdjudicationAnaforaObj;

AdjudicationEntity.prototype.updateSpan = function() {
	this.span = SpanType.merge(this.compareAObj[0].span, this.compareAObj[1].span);
	this.spanDiff = (Entity.sort(this.compareAObj[0], this.compareAObj[1]) != 0);
}

AdjudicationEntity.prototype.addCompareAObj = function(aObj1, aObj2) {

	if(aObj1 != undefined && aObj2 != undefined && aObj1.type == aObj2.type) {
		var _self = this;
		this.type = aObj1.type;
		this.compareAObj = [aObj1, aObj2];
		this.updateSpan();
		this.diffProp = []
		this.spanDiff = Entity.sort(aObj1, aObj2) != 0;
	
		$.each(this.type.propertyTypeList, function(idx) {
			//if(!IAdjudicationAnaforaObj.compareProperty(_self.type.propertyTypeList[idx], aObj1.propertyList[idx], aObj2.propertyList[idx]) )
			if(IAdjudicationAnaforaObj.compareProperty(_self.type.propertyTypeList[idx], aObj1.propertyList[idx], aObj2.propertyList[idx]) != 1.0 )
				_self.diffProp.push(idx);
		});

		if(aObj1.getAdditionalData("adjudication") == "gold") {
			this.decideIdx = 0;
		}
		else if (aObj2.getAdditionalData("adjudication") == "gold") {
			this.decideIdx = 1;
		}
		else if(aObj1.type == aObj2.type && Entity.sort(aObj1, aObj2) == 0 && this.diffProp.length == 0) {
//(function (a,b) { return !(a<b || b<a); }(aObj1.propertyList,aObj2.propertyList))) {
			this.decideIdx = 0;
			aObj1.setAdditionalData("adjudication", "gold");
			aObj2.setAdditionalData("adjudication", "not gold");
		}
	}
}

AdjudicationEntity.prototype.isCrossObj = function() {
	return this.compareAObj.reduce(function(aObj1, aObj2) { return aObj1.isCrossObj() || aObj2.isCrossObj(); });
}
/*
AdjudicationEntity.prototype.setGold = function(goldEntityIdx) {
	$.each(this.compareAObj, function(idx, element) {
		if(idx == goldEntityIdx)
			element.setAdditionalData("adjudication", "gold");
		else
			element.setAdditionalData("adjudication", "not gold");
	});
	this.decideIdx = goldEntityIdx;
}
AdjudicationEntity.prototype.setCancelGold = function() {
	$.each(this.compareAObj, function(idx, element) {
		element.setAdditionalData("adjudication", undefined);
	});
	this.decideIdx = undefined;
}
*/
AdjudicationEntity.prototype.toXMLString = function() {
	var rStr = this.getMetadataXMLStr();
	rStr += this.getAdditionalDataXMLStr();
	
	rStr += '\t</entity>';

	return rStr;
}

AdjudicationEntity.prototype.getAdditionalDataXMLStr = function() {

	var _self = this;
	rStr = "\t\t<addition>\n";
	if(Object.keys(this.additionalData).length > 0) {

		$.each(this.additionalData, function(key) {
			if(_self.additionalData[key] != undefined)
				rStr += "\t\t\t<" + key + ">" + _self.additionalData[key] + "</" + key + ">\n";
		});

	}

	// print 
	rStr += "\t\t\t<compareEntity>" + this.compareAObj.toString() + "</compareEntity>\n"; 
	rStr += "\t\t\t<diffProp>" + this.diffProp.toString() + "</diffProp>\n";
	rStr += "\t\t</addition>\n";
	return rStr;
}

AdjudicationEntity.genFromDOM = function(adjudicationEntityDOM, schema, projectList ) {
	var entity = Entity.genFromDOM(adjudicationEntityDOM, schema);
	var comparedStr = entity.getAdditionalData("compareEntity");
	var diffPropStr = entity.getAdditionalData("diffProp");
	var comparedList = undefined;

	if(projectList != undefined && comparedStr != undefined) {
		comparedStrList = comparedStr.split(',');
		comparedList = [];
		$.each(comparedStrList, function(idx, item) {
			var idList = item.split('@');
			var eIdx = parseInt(idList[0]);
			var annotator = idList[3];

			comparedList.push(projectList[annotator].entityList[eIdx]);
		});
	}
	else
		comparedList = [undefined, undefined];

	var diffProp = undefined;
	if(diffPropStr != undefined) {
		if(diffPropStr == "")
			diffProp = [];
		else
			diffProp = $.map(diffPropStr.split(','), function(nStr) { return parseInt(nStr); });
	}

	return new AdjudicationEntity(entity.id, entity.type, comparedList, diffProp, entity.span);
}

function AdjudicationRelation(id, type, compareAObjList, diffProp) {
	if(id != undefined) {
		Relation.call(this, id, type);
		IAdjudicationAnaforaObj.apply(this, compareAObjList);
		//AdjuudicationRelation.parent.apply(this, [aObj1, aObj2]);
		this.markElement = [];

		this.diffProp = diffProp;
		this.compareAObj = compareAObjList;

		if(diffProp == undefined) {
			AdjudicationRelation.prototype.addCompareAObj.apply(this, compareAObjList);
		}
		else {
			if(compareAObjList[0].getAdditionalData("adjudication") == "gold") {
				this.decideIdx = 0;
			}
			else if (compareAObjList[1].getAdditionalData("adjudication") == "gold") {
				this.decideIdx = 1;
			}
		}
	}
}

AdjudicationRelation.prototype = new Relation();
AdjudicationRelation.prototype.constructor = Relation;
AdjudicationRelation.prototype.parent = IAdjudicationAnaforaObj;

AdjudicationRelation.prototype.isCrossObj = function() {
	return this.compareAObj.reduce(function(aObj1, aObj2) { return aObj1.isCrossObj() || aObj2.isCrossObj(); });
}
AdjudicationRelation.prototype.addCompareAObj = function(aObj1, aObj2) {
	if(aObj1 == undefined || aObj2 == undefined)
		throw "added aObj is undefined";
	else if(aObj1.type != aObj2.type)
		throw "added aObj types are different";
	else {
		var _self = this;
		this.compareAObj = [aObj1, aObj2];
		this.type = aObj1.type;

		if(this.diffProp == undefined) {
			var tFunc = function(aObj1, aObj2) { return AnaforaAdjudicationProject.adjEntityComparePropertyFunc(aObj1, aObj2, AnaforaAdjudicationProject.adjEntityStrictComparePropertyFunc); }

			//this.diffProp = IAdjudicationAnaforaObj.compareAObjPropertyList(relation0, relation1, tFunc);
			this.diffProp = [];
	
		// compare aObj 
		
		$.each(this.type.propertyTypeList, function(idx) {
			//if(!IAdjudicationAnaforaObj.compareProperty(_self.type.propertyTypeList[idx], aObj1.propertyList[idx], aObj2.propertyList[idx], tFunc) )
			if(IAdjudicationAnaforaObj.compareProperty(_self.type.propertyTypeList[idx], aObj1.propertyList[idx], aObj2.propertyList[idx], tFunc) != 1.0 )
			_self.diffProp.push(idx);});
		
		}

		if(aObj1.getAdditionalData("adjudication") == "gold") {
			this.decideIdx = 0;
		}
		else if (aObj2.getAdditionalData("adjudication") == "gold") {
			this.decideIdx = 1;
		}
		else if(aObj1.type == aObj2.type) {
			if(this.diffProp != undefined && this.diffProp.length == 0) {
				this.decideIdx = 0;
				aObj1.setAdditionalData("adjudication", "gold");
				aObj2.setAdditionalData("adjudication", "not gold");
			}
		}
	}
}

AdjudicationRelation.prototype.genElementProperty = function() {
	var rStr = '';
	var _self = this;

	/*
	if(this.decideIdx != undefined)
		return this.compareAObj[this.decideIdx].genElementProperty();
	*/

	$.each(this.type.propertyTypeList, function(idx, propertyType) {
		if(_self.diffProp.indexOf(idx) != -1) {
			rStr += '<span style="border:2px solid red;padding-left:4px;padding-right:4px;">[' + propertyType.type + ':&nbsp;]</span>';
		}
		else {
			rStr += '[' + propertyType.type  + ':&nbsp;';
			if(propertyType.input == InputType.LIST) {
				if(_self.compareAObj[0].propertyList[idx] == undefined)
					rStr += "EMPTY, ";
				else {
					$.each(_self.compareAObj[0].propertyList[idx], function(idx, objElement) {
						rStr += objElement.genElementStr() + ", ";
					});
				}
				rStr = rStr.substr(0, rStr.length - 2);
			}
			else {
				 rStr += _self.compareAObj[0].propertyList[idx];
			}
			rStr += '], ';
		}
		
	});
	rStr = rStr.substring(0, rStr.length - 2);

	return rStr;
}

AdjudicationRelation.prototype.toXMLString = function() {
	var rStr = this.getMetadataXMLStr();
	rStr += this.getAdditionalDataXMLStr();
	
	rStr += '\t</relation>';

	return rStr;
}

AdjudicationRelation.prototype.getAdditionalDataXMLStr = function() {

	var _self = this;
	rStr = "\t\t<addition>\n";
	if(Object.keys(this.additionalData).length > 0) {

		$.each(this.additionalData, function(key) {

			if(_self.additionalData[key] != undefined)
				rStr += "\t\t\t<" + key + ">" + _self.additionalData[key] + "</" + key + ">\n";
		});

	}

	rStr += "\t\t\t<compareRelation>" + this.compareAObj.toString() + "</compareRelation>\n"; 
	/*
	rStr += "\t\t\t<compareRelation>";
	$.each(this.compareAObj, function(idx, aObj) {
		if(idx > 0)
			rStr += ";";
		rStr += aObj.id;
	});

	rStr += "</compareRelation>\n";
	*/
	rStr += "\t\t\t<diffProp>" + this.diffProp.toString() + "</diffProp>\n";
	rStr += "\t\t</addition>\n";
	return rStr;
}

AdjudicationRelation.genFromDOM = function(adjudicationRelationDOM, schema, projectList ) {
	var relation = Relation.genFromDOM(adjudicationRelationDOM, schema);
	var comparedStr = relation.getAdditionalData("compareRelation");
	var diffPropStr = relation.getAdditionalData("diffProp");
	
	var comparedStr = relation.getAdditionalData("compareRelation");
	var comparedList = undefined;

	if(projectList != undefined && comparedStr != undefined) {
		var comparedStrList;
		if(comparedStr.indexOf(';') >= 0)
			comparedStrList = comparedStr.split(';');
		else
			comparedStrList = comparedStr.split(',');
		comparedList = [];
		$.each(comparedStrList, function(idx, item) {
			var idList = item.split('@');
			var rIdx = parseInt(idList[0]);
			var annotator = idList[3];

			comparedList.push(projectList[annotator].relationList[rIdx]);
		});
	}
	else
		comparedList = [undefined, undefined];

	var diffProp = undefined;
	if(diffPropStr != undefined) {
		if(diffPropStr == "")
			diffProp = [];
		else
			diffProp = $.map(diffPropStr.split(','), function(nStr) { return parseInt(nStr); });
	}

	return new AdjudicationRelation(relation.id, relation.type, comparedList, diffProp);
}

function IAdjudicationAnaforaObj(aObj1, aObj2) {
	this.decideIdx = undefined; /* undefined: not decided yet, -1: all other should be delete */
	this.compareAObj = undefined;
	this.diffProp = undefined;
}

IAdjudicationAnaforaObj.prototype.updateProperty = function(pTypeIdx) {
	var idx = this.diffProp.indexOf(pTypeIdx);
	var needUpdate = false;
	if(this.type.propertyTypeList[pTypeIdx].input == InputType.LIST) {
		var tFunc = function(aObj0, aObj1) { return AnaforaAdjudicationProject.adjEntityComparePropertyFunc(aObj0, aObj1, AnaforaAdjudicationProject.adjEntityStrictComparePropertyFunc);}

		var diff = IAdjudicationAnaforaObj.compareProperty(this.type.propertyTypeList[pTypeIdx], this.compareAObj[0].propertyList[pTypeIdx], this.compareAObj[1].propertyList[pTypeIdx], tFunc);
		//if(idx >=0 && diff) {
		if(idx >=0 && diff == 1.0) {
			needUpdate = true;
			this.diffProp.splice(idx, 1);
		}
		//else if(idx == -1 && !diff) {
		else if(idx == -1 && diff != 1.0) {
			needUpdate = true;
			this.diffProp.push(pTypeIdx);
		}
	}
	else {
		if((this.compareAObj[0].propertyList[pTypeIdx] === this.compareAObj[1].propertyList[pTypeIdx]) && idx >= 0) {
			this.diffProp.splice(idx, 1);
			needUpdate = true;
		}
		else if((this.compareAObj[0].propertyList[pTypeIdx] !== this.compareAObj[1].propertyList[pTypeIdx]) && idx === -1) {
			this.diffProp.push(pTypeIdx);
			needUpdate = true;
		}
	}

	if(needUpdate)
		this.diffProp.sort();

	return needUpdate;
}


IAdjudicationAnaforaObj.prototype.addCompareAObj = function(aObj1, aObj2) {
	throw "Not implement addCompareAObj method yet";
}

IAdjudicationAnaforaObj.compareAObjFunc = function(tAObj1, tAObj2) { return (tAObj1 == tAObj2) || (tAObj1.id == tAObj2.id) || (tAObj1.type == tAObj2.type && IAnaforaObj.sort(tAObj1, tAObj2) == 0 && (function(a,b){return !(a<b || b<a);})(tAObj1.propertyList, tAObj2.propertyList)); };

IAdjudicationAnaforaObj.compareAObjPropertyList = function(aObj0, aObj1, compFunc) {
	// compare two aObj property list is identical, return the index of different property value
	var diffList = [];

	if(aObj0.type !== aObj1.type)
		throw "compare AObj property list error: type is not identical: aObj0 type: " + aObj0.type + ", aObj1 type: " + aObj1.type;


	for(var i=0;i<aObj0.type.propertyTypeList.length;i++) {
		try {
			if(IAdjudicationAnaforaObj.compareProperty(aObj0.type.propertyTypeList[i], aObj0.propertyList[i], aObj1.propertyList[i], compFunc) != 1.0)
				diffList.push(i);
		}
		catch(err)
		{
			console.log(aObj0);
			console.log(aObj1);
			throw err;
		}
	}

	return diffList;
}

IAdjudicationAnaforaObj.compareProperty = function(pType, aObj1prop, aObj2prop, compFunc) {
	/*
	 * Given the property comparasion score (0.0 ~ 1.0)
	 */
	// compare two property value is identical or not
	if(aObj1prop == undefined && aObj2prop == undefined)
		return 1.0;
	if(aObj1prop == undefined && aObj2prop != undefined)
		return 0.0;
	if(aObj1prop != undefined && aObj2prop == undefined)
		return 0.0;

	switch(pType.input) {
		case InputType.CHOICE:
		case InputType.TEXT:
			if(aObj1prop === aObj2prop)
				return 1.0;
			else
				return 0.0;
			break;
		case InputType.MULTICHOICE:
			if(($(aObj1prop).not(aObj2prop).length == 0) && ($(aObj2prop).not(aObj1prop).length == 0))
				return 1.0;
			else
				return 0.0
			break;	
		case InputType.LIST:
			if(compFunc == undefined)
				compFunc = IAdjudicationAnaforaObj.compareAObjFunc;
				
			if(aObj1prop === aObj2prop)
				return 1.0;
			else{
				var matchPairCnt = 0
				for(var objIdx1 = 0; objIdx1 < aObj1prop.length; objIdx1++) {
					for(var objIdx2 = 0; objIdx2 < aObj2prop.length; objIdx2++) {
						var compScore;
						if((compScore = compFunc(aObj1prop[objIdx1], aObj2prop[objIdx2])) > 0.0) {
							matchPairCnt += 2*compScore;
							break
						}
					}
				}
				return (matchPairCnt + 0.0) / (aObj1prop.length + aObj2prop.length);
			}
			/*
			return (aObj1prop === aObj2prop) || ( aObj1prop.length == aObj2prop.length && aObj1prop.every(function(element, idx) { return compFunc(element, aObj2prop[idx]);}));
			*/
			break;
	}
}

IAdjudicationAnaforaObj.prototype.getDecideAObj = function() {
	if(this.decideIdx === undefined)
		throw "extract gold aObj with undecided status";

	return this.compareAObj[this.decideIdx];
}
