function AnnotateFrame(frameElement, setting, rawText) {
	this.frameDiv = frameElement;
	this.spanElementList = this.frameDiv.find('span');
	this.positIndex = {};
	this.overlap = [];
	this.overlapIdx = [];
	this.setting = setting;
	this.rawText = rawText;
	//this.rawText = $('<div>' + rawText + '</div>').text();

	var _self = this;

	this.contextMenu = $.contextMenu({
	        selector: '.multipleAObj', 
		trigger: 'left',
		build: function($trigger, e) {
			
			var overlapSpan = e.target;
			var subTaskName = $(overlapSpan).parent().attr('id');
			var _self = currentAProject.getAnnotateFrameByTaskName(subTaskName);
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
				returnContextItem["item_" + idx.toString()] = {type:"annotation", aObj: this, callback: function() {var _this=_self;  selectAObj(_this); if(currentAProject.selectedAObj instanceof Relation) { relationFrame.relationClick(relationFrame.searchRowFromRelation(currentAProject.selectedAObj)); } if(_setting.isLogging) {eventLogging.addNewEvent(new EventLog(EventType.SPAN_MENU_CLICK, _this.id));} }};
			});

			return { items: returnContextItem};
		},
		
		position: function(opt, x, y){
		        opt.$menu.css({bottom:y, left: x, "max-height": "500px" });
		        //opt.$menu.css({bottom:y, left: x});
		}
		
	});
}

AnnotateFrame.prototype.updatePosIndex = function(aObj, annotateFrameList) {
	// given anaforaObj, update the posit (add new aObj to the posit index, add span)

	var _self = this;

	if(aObj instanceof Entity)
		this.addEntityPosit(aObj, aObj, annotateFrameList);
	else if(aObj instanceof Relation){
		this.addRelationPosit(aObj, aObj, annotateFrameList);
	}
	else {
		
		throw new ErrorException("aObj: " + aObj.toString() + " is not an IAnaforaObj");
	}
}

AnnotateFrame.prototype.addSpanToOverlapList = function(span, addedAObj) {
	// Update overlap list based on one span. Add addedAObj to aObjList
	var _self = this;
	var spanIdx = this.searchMatchOverlap(span.start);
	var currentStart = span.start;
	
	var pivotOverlap = spanIdx == null ? undefined : this.overlap[spanIdx];

	while(spanIdx != null && (pivotOverlap != undefined && pivotOverlap.span.end <= span.end)) {
		if(pivotOverlap.end <= currentStart) {
			spanIdx++;
			if(spanIdx < this.overlap.length)
				pivotOverlap = this.overlap[spanIdx];
			else
				pivotOverlap = undefined;
		}
		else {
			if(currentStart == pivotOverlap.span.start) {
				if(span.end >= pivotOverlap.span.end) {
					// just append
					pivotOverlap.aObjList.push(addedAObj);
					spanIdx++;
				}
				else {
					// Split current overlap, add addedAObj to the first part
					var newOverlap = new Overlap(new SpanType(pivotOverlap.span.start, span.end), pivotOverlap.aObjList.slice(0), _self);
					newOverlap.aObjList.push(addedAObj);
					pivotOverlap.span.start = span.end;
					this.overlap.splice(spanIdx, 0, newOverlap);
					this.overlapIdx.splice(spanIdx, 0, newOverlap.start);
					this.overlapIdx[spanIdx+1].start = span.end;
					spanIdx++;
				}
				currentStart = pivotOverlap.span.end;
			}
			else if(currentStart < pivotOverlap.span.start) {
				// add new Overlap
				var newOverlap = new Overlap(new SpanType(currentStart, pivotOverlap.span.end), [addedAObj], _self);
				this.overlap.splice(spanIdx, 0, newOverlap);
				this.overlapIdx.splice(spanIdx, 0, currentStart);
				
				currentStart = pivotOverlap.span.start;
				spanIdx++;
			}
			else if(currentStart < pivotOverlap.span.end) {
				// split current overlap, add addedAObj to the second part
				var newOverlap = new Overlap(new SpanType(currentStart, pivotOverlap.span.end), pivotOverlap.aObjList.slice(0), _self);
				newOverlap.aObjList.push(addedAObj);
				pivotOverlap.span.end = currentStart;
				this.overlap.splice(spanIdx+1, 0, newOverlap);
				this.overlapIdx.splice(spanIdx+1, 0, newOverlap.start);
				this.overlapIdx[spanIdx].end = currentStart;
				spanIdx++;
				currentStart = pivotOverlap.span.end;
			}

			pivotOverlap = this.overlap[spanIdx];
		}
	}

	if(spanIdx == null || this.overlap[this.overlap.length-1].end < span.end) {
		var newOverlap = new Overlap(new SpanType(this.overlap[this.overlap.length-1].end, span.end), [addedAObj], _self);
		this.overlap.push(newOverlap);
		this.overlapIdx.push(newOverlap.span.start);
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

AnnotateFrame.prototype.addAObjOnEntity = function(entity, addedAObj) {
	var _self = this;
	if(entity instanceof Entity) {
		entity.span.forEach(function(subSpan) {
			_self.addSpanToOverlapList(subSpan, addedAObj);
		});
	}
}

AnnotateFrame.prototype.addRelation = function(newRelation, annotateFrameList) {
	if(newRelation instanceof Relation) {
		this.updatePosIndex(newRelation, annotateFrameList);
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
	var _self = this;
	if(removeRelation instanceof Relation) {
		this.removeRelationPosit(removeRelation);
		var tRangeDict = removeRelation.getSpanRange();
		$.each(tRangeDict, function(subTaskName, tRange) {
			var annotFrame = currentAProject.getAnnotateFrameByTaskName(subTaskName);
			if(annotFrame != undefined)
				annotFrame.updateOverlapRange(tRange[0], tRange[1]);
		});
	}
}

AnnotateFrame.prototype.addSpan = function(newSpan, aObj) {
	var annotFrame = currentAProject.getAnnotateFrame(aObj);
	if(annotFrame != this)
		currentAProject.projectList[aObj.getTaskName()].annotateFrame.addSpan(newSpan, aObj);
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
		throw new ErrorException( "adding AObj is undefined");

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

	/*
	if(addedAObj == addingAObj) {
		$.each(addingAObj.linkingAObjList, function(idx, linkingAObj) {
			_self.addSpanPosit(span, addingAObj, linkingAObj );
		});
	}
	*/
}

AnnotateFrame.prototype.removeSpanPosit = function(span, removingAObj, removedAObj, directRemove) {
	// removingAObj: the anafora obj which removes span
	// removedAObj: the anafora obj which need to be updated inside the positList
	if(removingAObj == undefined)
		throw new ErrorException( "removing AObj is undefined");

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

AnnotateFrame.prototype.addEntityPosit = function(entity, addedAObj, annotateFrameList) {
	var _self = this;

	if(annotateFrameList != undefined) {
		var taskName = entity.getTaskName();
		var annotFrame = annotateFrameList[taskName];
	}
	else
		var annotFrame = _self;
	
	if(_self != annotFrame && annotFrame != undefined )
		annotFrame.addEntityPosit(entity, addedAObj);
	else {
		if(addedAObj instanceof EmptyEntity)
			return ;
		if(addedAObj == undefined)
			addedAObj = entity;
		
		$.each(entity.span, function(idx, span) {
			_self.addSpanPosit(span, entity, addedAObj);
		});
	}
	
}

AnnotateFrame.prototype.addRelationPosit = function(relation, addedAObj, annotateFrameList) {
	var _self = this;

	if(annotateFrameList != undefined) {
		var taskName = relation.getTaskName();
		var annotFrame = annotateFrameList[taskName];
	}
	else
		var annotFrame = _self;

	if(_self != annotFrame && annotFrame != undefined)
		annotFrame.addRelationPosit(relation, addedAObj);
	else {
		if(relation instanceof AdjudicationRelation) {
			if(relation.diffProp.length == 0)
				_self.addRelationPosit(relation.compareAObj[0], relation, annotateFrameList);
			else {
				relation.type.propertyTypeList.forEach(function (propertyType, pIdx) {
					if(propertyType.input == InputType.LIST) {
						// Might be crossDoc AdjudicationRelation
						if(relation.diffProp.indexOf(pIdx) >= 0) {
							for(var aObjIdx = 0; aObjIdx < 2; aObjIdx++) {
								if(relation.compareAObj[aObjIdx].propertyList[pIdx] != undefined) {
									relation.compareAObj[aObjIdx].propertyList[pIdx].forEach(function(aObj) {
										if(aObj instanceof Entity)
											_self.addEntityPosit(aObj, relation, annotateFrameList);
										else
											_self.addRelationPosit(aObj, relation, annotateFrameList);
									});
								}
							}
							//_self.addRelationPosit(relation.compareAObj[0], relation);
	
							/*
	
							var unionSpanList = undefined;
							if(relation.compareAObj[0].propertyList[pIdx] != undefined && relation.compareAObj[1].propertyList[pIdx] != undefined) 
								unionSpanList = SpanType.merge(relation.compareAObj[0].propertyList[pIdx].map(function(tEntity) {return tEntity.span;}).reduce(function(a,b) {return a.concat(b);}), relation.compareAObj[1].propertyList[pIdx].map(function(tEntity) {return tEntity.span;}).reduce(function(a,b) {return a.concat(b);}));
							else
								if(relation.compareAObj[0].propertyList[pIdx] != undefined)
									unionSpanList = relation.compareAObj[0].propertyList[pIdx].map(function(tEntity) {return tEntity.span;}).reduce(function(a,b) {return a.concat(b);})
								else if (relation.compareAObj[1].propertyList[pIdx] != undefined)
									unionSpanList = relation.compareAObj[1].propertyList[pIdx].map(function(tEntity) {return tEntity.span;}).reduce(function(a,b) {return a.concat(b);})
	
							if(unionSpanList != undefined) {
								unionSpanList.forEach(function(tSpan) {
									_self.addSpanPosit(tSpan, relation.compareAObj[0], relation);
								});
							}
							*/
						}
						else {
							_self.addRelationPosit(relation.compareAObj[0], relation, annotateFrameList);
						}
					}
				});
			}
		}
		else {
			$.each(relation.propertyList, function(idx) {
				if(relation.type.propertyTypeList[idx].input == InputType.LIST && relation.propertyList[idx] != undefined) {
					$.each(relation.propertyList[idx], function(listIdx) {
						if(relation.propertyList[idx][listIdx] instanceof EmptyEntity || relation.propertyList[idx][listIdx] instanceof EmptyRelation)
							return true;
						else if(relation.propertyList[idx][listIdx] instanceof Entity)
							_self.addEntityPosit(relation.propertyList[idx][listIdx], addedAObj, annotateFrameList);
						else if(relation.propertyList[idx][listIdx] instanceof Relation)
							_self.addRelationPosit(relation.propertyList[idx][listIdx], addedAObj, annotateFrameList);
						else {
							throw new ErrorException("Linked object " + String(relation.propertyList[idx][listIdx]) + " in Relation Object: " + relation.id + " is not a regular object (the " + String(listIdx) + "-th item in property " + relation.type.propertyTypeList[idx].type);
						}
					});
				}
			});
		}
	}
}

AnnotateFrame.prototype.removeEntityPosit = function(entity, removeAObj, directRemove) {
	if(removeAObj == undefined)
		removeAObj = entity;

	if(directRemove == undefined)
		directRemove = false;

	var _self = this;
	var annotFrame = currentAProject.getAnnotateFrame(entity);
	if(annotFrame != this && annotFrame != undefined) {
		currentAProject.projectList[entity.getTaskName()].annotateFrame.removeEntityPosit(entity, removeAObj, directRemove);
	}
	else {
		$.each(entity.span, function(idx, span) {
			_self.removeSpanPosit(span, entity, removeAObj, directRemove);
		});
	}
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
		throw new ErrorException( "spanElement not found in spanElementList");
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

AnnotateFrame.prototype.updateOverlapList = function(overlapList, checkedType, diffCheckedType, overlapStartIdx) {
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

AnnotateFrame.matchAObjFromOverlap = function(aObjList, checkedType, skipAObjList) {
	
	var matchedAObj = $.grep(aObjList, function(aObj) {
		var comparePair = aObj.getAdditionalData("comparePair");

		return (propertyFrameList.length == 0 || propertyFrameList.reduce(function (p0, p1) { return p0.isAssignRelation == false && p1.isAssignRelation == false;}) || currentAProject.selectedAObj != aObj) && (checkedType == undefined || checkedType.indexOf(aObj.type) != -1) && (aObj instanceof AdjudicationEntity || aObj instanceof AdjudicationRelation || (comparePair == undefined || !(comparePair[comparePair.length-1] instanceof AdjudicationEntity || comparePair[comparePair.length-1] instanceof AdjudicationRelation))) && (skipAObjList == undefined || skipAObjList.indexOf(aObj) == -1);
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
			spanIdx = 0;
			spanAObjIdx = -1;
			//spanIdx = this.overlap.length-1;
			//spanAObjIdx = this.overlap[spanIdx].aObjList.length-1;
		}
		else {
			spanIdx = this.overlap.length-1;
			spanAObjIdx = this.overlap[spanIdx].aObjList.length-1;
		}
		currentAObj = this.overlap[spanIdx].aObjList[spanAObjIdx];
	}
	else {
		for(var markIdx in currentAObj.markElement) {
			overlap = currentAObj.markElement[markIdx];
			spanIdx = this.overlap.indexOf(overlap);
			if(spanIdx != -1)
				break
		}
		spanAObjIdx = overlap.aObjList.indexOf(currentAObj);
	}

	if(spanIdx != -1) {
		var basicFilterFunc = function(checkedAObj, overlap) {
			var idx = checkedAObj.markElement.indexOf(overlap);

			if(idx == -1)
				throw new ErrorException( "find overlap error in AObj:" + checkedAObj.id);
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

					if(spanIdx == this.overlap.length) {
						if(_setting.isCrossDoc) {
							var currentSubTaskName = this.frameDiv[0].id;
							var currentSubTaskIdx = Object.keys(currentAProject.projectList).indexOf(currentSubTaskName);
							currentSubTaskIdx++;
							if(currentSubTaskIdx == Object.keys(currentAProject.projectList).length)
								currentSubTaskIdx = 0;
							var nextSubTaskName = Object.keys(currentAProject.projectList)[currentSubTaskIdx];
							var nextAnnotateFrame = currentAProject.projectList[nextSubTaskName].annotateFrame;
							return nextAnnotateFrame.moveAnnotation(step, adj);
						}
						else
							spanIdx = 0;
					}
				}
			}
			else if(step == -1) {
				spanAObjIdx--;
				if(spanAObjIdx == -1) {
					spanIdx--;

					if(spanIdx == -1) {
						if(_setting.isCrossDoc) {
							var currentSubTaskName = this.frameDiv[0].id;
							rAObj.id.split('@')[2];
							var currentSubTaskIdx = Object.keys(currentAProject.projectList).indexOf(currentSubTaskName);
							currentSubTaskIdx--;
							if(currentSubTaskIdx == -1)
								currentSubTaskIdx = Object.keys(currentAProject.projectList).length - 1;
							var nextSubTaskName = Object.keys(currentAProject.projectList)[currentSubTaskIdx];
							var nextAnnotateFrame = currentAProject.projectList[nextSubTaskName].annotateFrame;
							return nextAnnotateFrame.moveAnnotation(step, adj);
						}
						else
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

function Overlap(span, aObjList, annotateFrame) {
	this.span = span;
	this.aObjList = aObjList;
	this.annotateFrame = annotateFrame;
}
