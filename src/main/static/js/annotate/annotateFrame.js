function AnnotateFrame(frameElement, setting, rawText) {
	this.frameDiv = frameElement;
	this.spanElementList = this.frameDiv.find('span');
	this.positIndex = {};
	this.overlap = [];
	this.setting = setting;
	this.rawText = rawText;
	//this.rawText = $('<div>' + rawText + '</div>').text();

	var _self = this;

	this.contextMenu = $.contextMenu({
	        selector: '.multipleAObj', 
		trigger: 'left',
		build: function($trigger, e) {
			var overlapSpan = e.target;
			var overlapIdx = _self.frameDiv.find("span").index(overlapSpan);
			var aObjList = _self.overlap[overlapIdx].aObjList;
			var checkedType = currentAProject.schema.checkedType;
			var returnContextItem = {};
			var matchChecked = AnnotateFrame.matchAObjFromOverlap(aObjList, checkedType);
			if((propertyFrameList[0].isAssignRelation || propertyFrameList[1].isAssignRelation) && (currentAProject.selectedAObj instanceof AdjudicationEntity || currentAProject.selectedAObj instanceof AdjudicationRelation)) {
				matchChecked = $.grep(matchChecked, function(aObj) {
					return (aObj instanceof AdjudicationEntity || aObj instanceof AdjudicationRelation || aObj.id.split('@')[3] == "gold" || aObj.getAdditionalData("adjudication") === "gold");
				});
			}

			$.each(matchChecked, function(idx) {
				var _self = this;
				returnContextItem["item_" + idx.toString()] = {type:"entity", aObj: this, callback: function() {var _this=_self;  selectAObj(_this); if(currentAProject.selectedAObj instanceof Relation) { relationFrame.relationClick(relationFrame.searchRowFromRelation(currentAProject.selectedAObj)); }}};
			});

			return { items: returnContextItem};
		}
	});
}

AnnotateFrame.prototype.updatePosIndex = function(aObj) {
	// given anaforaObj, update the posit (add new aObj to the posit index, add span)

	var _self = this;

	if(aObj instanceof Entity)
		this.addEntityPosit(aObj, aObj);
	else if(aObj instanceof Relation){
		this.addRelationPosit(aObj, aObj);
	}
	else {
		
		throw  "aObj: " + aObj.toString() + " is not an IAnaforaObj";
	}
}

AnnotateFrame.prototype.generateAllAnnotateOverlapList = function() {
	var maxIndex = this.getMaxPositIndex();
	if(maxIndex != undefined) {
		this.overlap = [];
		this.generateOverlapListFromPosit(0, maxIndex, this.overlap);
	}
}

AnnotateFrame.prototype.generateOverlapListFromPosit = function(overlapIdxStart, overlapIdxEnd, overlapList) {
	// given position range, generate new overlapList and store to the overlapList variable

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
		else if(idx != overlapIdxStart && this.positIndex[idx -1] != undefined) {
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

AnnotateFrame.prototype.addAObj = function(newAObj) {
	if(newAObj instanceof Entity)
		this.addEntity(newAObj);
	else
		this.addRelation(newAObj);
}

AnnotateFrame.prototype.addEntity = function(newEntity) {
	if(newEntity instanceof Entity) {
		this.updatePosIndex(newEntity);
		this.updateOverlap(newEntity);
	}
}

AnnotateFrame.prototype.addRelation = function(newRelation) {
	if(newRelation instanceof Relation) {
		this.updatePosIndex(newRelation);
	}
}

AnnotateFrame.prototype.removeAObj = function(removeAObj) {
	if(removeAObj instanceof Entity)
		this.removeEntity(removeAObj);
	else
		this.removeRelation(removeAObj);
}

AnnotateFrame.prototype.removeEntity = function(removeEntity) {
	if(removeEntity instanceof Entity) {
		
		this.removeEntityPosit(removeEntity);
		this.updateOverlap(removeEntity);
	}
}

AnnotateFrame.prototype.removeRelation = function(removeRelation) {
	if(removeRelation instanceof Relation) {

		this.removeRelationPosit(removeRelation);
		var tRange = removeRelation.getSpanRange();
		this.updateOverlapRange(tRange[0], tRange[1]);
	}
}

AnnotateFrame.prototype.addSpan = function(newSpan, aObj) {
	this.addSpanPosit(newSpan, aObj);

	var comparePairList = aObj.getAdditionalData("comparePair");
	if(comparePairList != undefined) {
		comparePairList[1].updateSpan();
		this.addSpanPosit(newSpan, comparePairList[1]);
	}
	this.updateOverlapRange(newSpan.start-1, newSpan.end+1);
}

AnnotateFrame.prototype.removeSpan = function(removeSpan, aObj) {
	this.removeSpanPosit(removeSpan, aObj);

	var comparePairList = aObj.getAdditionalData("comparePair");
	if(comparePairList != undefined) {
		comparePairList[1].updateSpan();
		this.removeSpanPosit(removeSpan, comparePairList[1]);
	}
	//else
	this.updateOverlapRange(removeSpan.start-1, removeSpan.end+1);
}

AnnotateFrame.prototype.addSpanPosit = function(span, addingAObj, addedAObj) {
	// addingAObj: the anafora obj which changes the span
	// addedAObj: the anafora obj which need to be updated inside the positList
	if(addingAObj == undefined)
		throw "adding AObj is undefined";

	if(addedAObj == undefined)
		addedAObj = addingAObj;

	var _self = this;
	for(var spanIdx = span.start; spanIdx < span.end; spanIdx++) {
		if(!(spanIdx in this.positIndex)) {
			this.positIndex[spanIdx] = [];
		}

		if(this.positIndex[spanIdx].indexOf(addedAObj) == -1) {
			if(addedAObj instanceof Entity) {
				this.positIndex[spanIdx].splice(0, 0, addedAObj);
			}
			else {
				this.positIndex[spanIdx].push(addedAObj);
			}
		}
	}

	if(addedAObj == addingAObj) {
		$.each(addingAObj.linkingAObjList, function(idx, linkingAObj) {
			_self.addSpanPosit(span, addingAObj, linkingAObj );
		});
	}
}

AnnotateFrame.prototype.removeSpanPosit = function(span, removingAObj, removedAObj, directRemove) {
	// removingAObj: the anafora obj which removes span
	// removedAObj: the anafora obj which need to be updated inside the positList
	if(removingAObj == undefined)
		throw "removing AObj is undefined";

	if(removedAObj == undefined)
		removedAObj = removingAObj;

	var _self = this;
	for(var spanIdx = span.start; spanIdx < span.end; spanIdx++) {
		if(spanIdx in this.positIndex) {
			var aObjIdx = this.positIndex[spanIdx].indexOf(removedAObj);

			if(aObjIdx > -1){
				if(removedAObj != removingAObj && !directRemove) {
				// check removedAObj is linking to other obj in the same posit list
					var needSkip = false;
					$.each(this.positIndex[spanIdx], function(tAObjIdx, tAObj) {
						if(tAObjIdx != aObjIdx && tAObj != removingAObj) {
							if(tAObj.linkingAObjList.indexOf(removedAObj) != -1) {
								needSkip = true;
								return false;
							}
						}

						if((removedAObj instanceof AdjudicationEntity || removedAObj instanceof AdjudicationRelation) && (tAObj === removedAObj.compareAObj[0] || tAObj === removedAObj.compareAObj[1])) {
							needSkip = true;
							return false;
						}
					});

					if(needSkip)
						continue;
				}

				this.positIndex[spanIdx].splice(aObjIdx, 1);
				if(this.positIndex[spanIdx].length == 0)
					delete this.positIndex[spanIdx];
				}
		}
	}

	if(removedAObj == removingAObj) {
		$.each(removingAObj.linkingAObjList, function(idx, linkingAObj) {
			_self.removeSpanPosit(span, removingAObj, linkingAObj);
		});
	}
}

AnnotateFrame.prototype.addEntityPosit = function(entity, addedAObj) {
	var _self = this;

	if(addedAObj instanceof EmptyEntity)
		return ;

	if(addedAObj == undefined)
		addedAObj = entity;
	
	$.each(entity.span, function(idx, span) {
		_self.addSpanPosit(span, entity, addedAObj);
	});

	
}

AnnotateFrame.prototype.addRelationPosit = function(relation, addedAObj) {
	var _self = this;
	if(relation instanceof AdjudicationRelation) {
		this.addRelationPosit(relation.compareAObj[0], relation);
		this.addRelationPosit(relation.compareAObj[1], relation);
	}
	else {
		$.each(relation.propertyList, function(idx) {
			if(relation.type.propertyTypeList[idx].input == InputType.LIST && relation.propertyList[idx] != undefined) {
				$.each(relation.propertyList[idx], function(listIdx) {
					if(relation.propertyList[idx][listIdx] instanceof EmptyEntity || relation.propertyList[idx][listIdx] instanceof EmptyRelation)
						return true;
					else if(relation.propertyList[idx][listIdx] instanceof Entity)
						_self.addEntityPosit(relation.propertyList[idx][listIdx], addedAObj);
					else if(relation.propertyList[idx][listIdx] instanceof Relation)
						_self.addRelationPosit(relation.propertyList[idx][listIdx], addedAObj);
					else {
						console.log("error ");
						console.log(relation.propertyList[idx]);
						console.log(relation.propertyList[idx][listIdx]);
						throw " object is not aObj";
					}
				});
			}
		});
	}
}

AnnotateFrame.prototype.removeEntityPosit = function(entity, removeAObj, directRemove) {
	if(removeAObj == undefined)
		removeAObj = entity;

	if(directRemove == undefined)
		directRemove = false;

	var _self = this;
	$.each(entity.span, function(idx, span) {
		_self.removeSpanPosit(span, entity, removeAObj, directRemove);
	});

}

AnnotateFrame.prototype.removeRelationPosit = function(relation, removeAObj, directRemove) {
	if(removeAObj == undefined)
		removeAObj = relation;
	var _self = this;
	$.each(relation.propertyList, function(idx) {
		if(relation.type.propertyTypeList[idx].input == InputType.LIST) {
			if(relation.propertyList[idx] != undefined) {
				$.each(relation.propertyList[idx], function(listIdx) {
					if(relation.propertyList[idx][listIdx] instanceof Entity)
						_self.removeEntityPosit(relation.propertyList[idx][listIdx], removeAObj, true);
					else {
						_self.removeRelationPosit(relation.propertyList[idx][listIdx], removeAObj, true);
					}
				});
			}
		}
	});
}

AnnotateFrame.prototype.removePosIndex = function(entity) {
	this.removeEntityPosit(entity, entity);
}

AnnotateFrame.prototype.getMaxPositIndex = function() {
	if(Object.keys(this.positIndex).length == 0)
		return undefined;
	return Object.keys(this.positIndex).max() + 1;
}

AnnotateFrame.prototype.updateOverlap = function(aObj) {
	this.updateOverlapRange(aObj.span[0].start-1, aObj.span[aObj.span.length-1].end+1);
}

AnnotateFrame.prototype.updateOverlapRange = function(firstSpanStart, lastSpanEnd) {
	// Given the start and end span, fined out the affected Overlap, and modify the overlap list

	if(firstSpanStart == undefined || lastSpanEnd == undefined)
		return ;

	if(firstSpanStart < 0)
		firstSpanStart = 0;

	if(lastSpanEnd > this.rawText.length)
		lastSpanEnd = this.rawText.length;


	var affectedOverlapIdx = this.findOverlapRange(firstSpanStart, lastSpanEnd);
	var affectedPosit = [null, null];
	var newOverlap = [];

	if(affectedOverlapIdx[0] == undefined)
		if(this.overlap.length == 0)
			affectedPosit[0] = firstSpanStart;
		else
			affectedPosit[0] = Math.min(firstSpanStart, this.overlap[0].span.start );
	else
		affectedPosit[0] = this.overlap[affectedOverlapIdx[0]].span.end;

	if(affectedOverlapIdx[1] == undefined)
		if(this.overlap.length == 0)
			affectedPosit[1] = lastSpanEnd;
		else
			affectedPosit[1] = Math.max(lastSpanEnd, this.overlap[this.overlap.length-1].span.end);
	else
		affectedPosit[1] = this.overlap[affectedOverlapIdx[1]].span.start;
	this.generateOverlapListFromPosit(affectedPosit[0], affectedPosit[1], newOverlap);
	
	this.updateAnnotateFragement(newOverlap, undefined, affectedOverlapIdx);

	// update overlap
	var anchorIdx = affectedOverlapIdx[0], removeOverlapLength;
	if(affectedOverlapIdx[0] == undefined)
		anchorIdx = 0;
	else
		anchorIdx += 1;

	if(affectedOverlapIdx[1] == undefined)
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

AnnotateFrame.prototype.findOverlapRange = function(spanStart, spanEnd) {
	// given the span start and end position, return the affected overlap index in the overlap list

	// return [a, b]: change should be done from the end of span_a to the start of span_b
	// return [undefined, b]: change should be done from the start of the document to the start of span_b
	// return [a, undefined]: change should be done from the end of span_b to the end of document
	// return [undefined, undefined]: whole document
	var affectedOverlap;
	var firstOverlapIdx = this.searchMatchOverlap(spanStart);
	var overlapIdx = firstOverlapIdx;

	// find all the overlap obj 
	if(overlapIdx == null)  {
		affectedOverlap = [undefined, null];
		overlapIdx = 0;
	}
	else
		affectedOverlap = [firstOverlapIdx, null];
	
	while(overlapIdx < this.overlap.length && this.overlap[overlapIdx].span.start < spanEnd)
		overlapIdx++;

	if(overlapIdx == this.overlap.length)
		affectedOverlap[1] = undefined;
	else
		affectedOverlap[1] = overlapIdx;

	return affectedOverlap;
}

AnnotateFrame.prototype.searchMatchOverlap = function(pos) {
	// given the position, return the idx of overlap which is the most closed one which is before to the pos
	// return null if the pos is before the first span
	var startIdx = 0;
	var endIdx = this.overlap.length-1;
	var pivot;
	var tOverlap;

	if(endIdx == -1)
		return null;

	if(pos >= this.overlap[endIdx].span.end)
		return endIdx;

	if(pos <= this.overlap[0].span.end)
		return null;

	while(startIdx <= endIdx) {
		pivot = Math.round((endIdx + startIdx)/2);
		tOverlap = this.overlap[pivot];
		nextOverlap = this.overlap[pivot+1];
		if(pos >= tOverlap.span.end && pos < nextOverlap.span.end)
			return pivot;
		else if(pos < tOverlap.span.end) {
			endIdx = pivot-1;
		}
		else if(pos > tOverlap.span.end) {
			startIdx = pivot + 1;
		}
	}

	return null;
}

AnnotateFrame.prototype.getSelectRangeSpan = function() {
var startOffset = 0, endOffset = 0;
    if (typeof window.getSelection != "undefined") {
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        //preCaretRange.selectNodeContents(this.frameDiv.get(0));
        //preCaretRange.selectNodeContents(this.frameDiv(0));

        preCaretRange.selectNodeContents(this.frameDiv.get(0));

        preCaretRange.setEnd(range.startContainer, range.startOffset);
        startOffset = preCaretRange.toString().length;
        endOffset = startOffset + range.toString().length;
    } else if (typeof document.selection != "undefined" &&
               document.selection.type != "Control") {
        var textRange = document.selection.createRange();
        var preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(this.frameDiv.get(0));
        preCaretTextRange.setEndPoint("EndToStart", textRange);
        startOffset = preCaretTextRange.text.length;
        endOffset = startOffset + textRange.text.length;
    }
    return new SpanType(startOffset, endOffset);
    // return current mouse select text range span
    /*
    var caretStart, caretEnd;
    var tSpan = null;
    var range = window.getSelection().getRangeAt(0);
    var preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(this.frameDiv.get(0));
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    caretStart = preCaretRange.toString().length;

    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretEnd = preCaretRange.toString().length;

    tSpan = new SpanType(caretStart, caretEnd);

    return tSpan;
    */
}

AnnotateFrame.prototype.getSpanElementIndex = function(spanElement) {
	// given span element, return the index
	var overlapIdx = this.spanElementList.index(spanElement);
	if(overlapIdx == -1)
		throw "spanElement not found in spanElementList";
	return overlapIdx;
}

AnnotateFrame.prototype.updateAnnotateFragement = function(overlapList, checkedType, removeOverlapIdx) {
	var startShift = 0;
	var span, spanTag;
	var aObjList;
	var spanList = this.frameDiv.children('span');
	var matchChecked;
	var range=document.createRange();
	range.selectNode(this.frameDiv.get(0));
	//var rawTextFragementStr = this.rawText;
	
	if(overlapList == undefined) {
		overlapList = this.overlap;
	}

	if(removeOverlapIdx != undefined && removeOverlapIdx[0] != undefined) {
		span = spanList.eq(removeOverlapIdx[0]);
		startShift = this.overlap[removeOverlapIdx[0]].span.end;
		range.setStartAfter(span.get(0), 0);
	}
	else {
		range.setStartBefore(this.frameDiv.get(0).childNodes[0]);
	}

	if(removeOverlapIdx != undefined && removeOverlapIdx[1] != undefined) {
		span = spanList.eq(removeOverlapIdx[1]);
		range.setEndBefore(span.get(0), 0);
	}
	else {
		range.setEndAfter(this.frameDiv.get(0).childNodes[this.frameDiv.get(0).childNodes.length-1]);
	}
	//var rawTextFragementStr = $('<div>' + range.toString() + '</div>').text();

	rawTextFragementStr = range.toString().replace("/\&lt;/g", "<").replace("/\&gt;/g", ">").replace("/\&amp;/g", "&");
	range.deleteContents();


	for(var idx=overlapList.length-1;idx >=0; idx--) {
		span = overlapList[idx].span;


		rawTextFragementStr = rawTextFragementStr.substring(0, span.start - startShift) + '<span>' + rawTextFragementStr.substring(span.start - startShift, span.end - startShift) + '</span>' + rawTextFragementStr.substring(span.end - startShift);
	}

	rawTextFragementStr = rawTextFragementStr.replace(/<span>/g, "@@##SPAN##@@");
	rawTextFragementStr = rawTextFragementStr.replace(/<\/span>/g, "##@@SPAN@@##");
	rawTextFragementStr = rawTextFragementStr.replace(/&/g, "&amp;");
	rawTextFragementStr = rawTextFragementStr.replace(/</g, "&lt;");
	rawTextFragementStr = rawTextFragementStr.replace(/>/g, "&gt;");
	rawTextFragementStr = rawTextFragementStr.replace(/##@@SPAN@@##/g, "</span>")
	rawTextFragementStr = rawTextFragementStr.replace(/@@##SPAN##@@/g, "<span>");

	rawTextFragementStr = rawTextFragementStr.replace(/\r/g, "&#13;");
	rawTextFragementStr = rawTextFragementStr.replace(/\n/g, "&#10;");
	var rawTextFragement = range.createContextualFragment(rawTextFragementStr);
	//this.frameDiv.html(rawTextFragementStr);
	range.insertNode(rawTextFragement);
	this.spanElementList = this.frameDiv.find('span');

	if(removeOverlapIdx==undefined || removeOverlapIdx[0] == undefined)
		removeOverlapIdx = [-1]
	this.updateOverlapList(overlapList, undefined, undefined, removeOverlapIdx[0]+1);
}

AnnotateFrame.prototype.updateOverlapList = function(overlapList, checkedType, diffCheckedType, overlapStartIdx ) {
	var _self = this;
	if(overlapList == undefined)
		overlapList = this.overlap;

	if(checkedType == undefined && currentAProject != undefined)
		checkedType = currentAProject.schema.checkedType;

	if(overlapStartIdx == undefined)
		overlapStartIdx = 0;

	$.each(overlapList, function(spanIdx) {
		spanIdx = parseInt(spanIdx);
		var overlap = overlapList[spanIdx];

		var matchChecked = AnnotateFrame.matchAObjFromOverlap(overlap.aObjList, checkedType);

		
		var spanElement = $(_self.spanElementList[overlapStartIdx + spanIdx]);

		if(matchChecked.length == 0 || !(matchChecked[0] instanceof Entity)) {
			spanElement.css("background-color", "");
			spanElement.removeClass("overlap entity highLight multipleAObj adjRemove adjDone adjConflict").addClass("filterOut");
			spanElement.unbind();
		}
		else if( matchChecked.length == 1 || !(matchChecked[1] instanceof Entity)) {
			var entity = matchChecked[0];

			spanElement.css("background-color", "#"+entity.type.color);
			spanElement.removeClass("overlap filterOut highLight multipleAObj adjRemove adjDone adjConflict").addClass("entity");

			if(_self.setting.isAdjudication) {
	
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
	
			if(matchChecked.length > 1) {
				spanElement.addClass("multipleAObj");
			}
	
			spanElement.unbind();
			spanElement.bind('click', annotateClick);

		}
		else {
			spanElement.css("background-color", "");
			spanElement.removeClass("filterOut entity highLight adjRemove adjDone adjConflict").addClass("overlap").addClass("multipleAObj");
			spanElement.unbind();
		}
		
	});
}

AnnotateFrame.matchAObjFromOverlap = function(aObjList, checkedType) {
	
	var matchedAObj = $.grep(aObjList, function(aObj) {
		var comparePair = aObj.getAdditionalData("comparePair");
		return (checkedType == undefined || checkedType.indexOf(aObj.type) != -1) && (aObj instanceof AdjudicationEntity || aObj instanceof AdjudicationRelation || (comparePair == undefined || !(comparePair[comparePair.length-1] instanceof AdjudicationEntity || comparePair[comparePair.length-1] instanceof AdjudicationRelation)));
	});

	// is assign relation in adjudication mode
	if(this.setting != undefined && this.setting.isAdjudication && propertyFrameList != undefined && propertyFrameList.length >=2 && (propertyFrameList[0].isAssignRelation || propertyFrameList[1].isAssignRelation)) {
		matchedAObj = $.grep(matchedAObj, function(aObj) {
			return (aObj instanceof AdjudicationEntity || aObj instanceof AdjudicationRelation || aObj.id.split('@')[3] == "gold" || aObj.getAdditionalData("adjudication") === "gold");
		});
	}


	
	return matchedAObj;
}

AnnotateFrame.prototype.moveAnnotation = function(step, adj, currentAObj) {

	// step = 1 => forward, step = -1 => backward
	var spanIdx = 0;
	var spanAObjIdx = 0;
	var rAObj = undefined;
	var overlap = undefined;

	if(currentAObj == undefined) {
		if(step == 1) {
			spanIdx = this.overlap.length-1;
			spanAObjIdx = this.overlap[spanIdx].aObjList.length-1;
		}
		currentAObj = this.overlap[spanIdx].aObjList[spanAObjIdx];
	}
	else {
		overlap = currentAObj.markElement[0];
		spanIdx = this.overlap.indexOf(overlap);
		spanAObjIdx = overlap.aObjList.indexOf(currentAObj);
	}

	if(spanIdx != -1) {
		var basicFilterFunc = function(checkedAObj, overlap) {
			var idx = checkedAObj.markElement.indexOf(overlap);

			if(idx == -1)
				throw "find overlap error in AObj:" + checkedAObj.id;
			if( checkedAObj == currentAObj && idx==0)
				return false;

			if(idx > 0)
				return false;

			if( checkedAObj instanceof AdjudicationEntity || checkedAObj instanceof AdjudicationRelation) {
				return true;
			}
			else {
				if(checkedAObj.getAdditionalData("comparePair") === undefined)
					return true;
			}

			return false;
		};

		var adjFilterFunc = function(checkedAObj, overlap) {
			if(!basicFilterFunc(checkedAObj, overlap))
				return false;

			if( checkedAObj instanceof AdjudicationEntity || checkedAObj instanceof AdjudicationRelation) {
				if(checkedAObj.decideIdx === undefined )
					return true;
			}
			else {
				if(checkedAObj.getAdditionalData("adjudication") === undefined)
					return true;
			}
			return false;
		};	

		var filterFunc = undefined;
		if(adj)
			filterFunc = adjFilterFunc;
		else
			filterFunc = basicFilterFunc;

		do {
			if(step == 1) {
				spanAObjIdx++;
				if(spanAObjIdx == this.overlap[spanIdx].aObjList.length) {
					spanAObjIdx = 0;
					spanIdx++;

					if(spanIdx == this.overlap.length)
						spanIdx = 0;
				}
			}
			else if(step == -1) {
				spanAObjIdx--;
				if(spanAObjIdx == -1) {
					spanIdx--;

					if(spanIdx == -1) {
						spanIdx = this.overlap.length-1;
					}
					spanAObjIdx = this.overlap[spanIdx].aObjList.length-1;
				}
			}

			overlap = this.overlap[spanIdx];
			rAObj = this.overlap[spanIdx].aObjList[spanAObjIdx];
		}
		while(!filterFunc(rAObj, overlap));
	}

	if (rAObj == currentAObj) {
		return undefined;
	}
	return rAObj;
}

function Overlap(span, aObjList, spanElement) {
	this.span = span;
	this.aObjList = aObjList;
}
