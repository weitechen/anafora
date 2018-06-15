/*
 * Implement the Stable Marraige pairing algorithm
 */

function relationCompareFunc(relation0, relation1, relationType, propertyWeightList, matchEntityList) {
/*
 * @param {Relation} relation0 - the first relation to compare
 * @param {Relation} relation1 - the first relation to compare
 * @param {RelationType} relationType - the relation type that these two relations belong to
 * @param {float[]} propertyWeightList - list of property weight
 * @param {Entity[]} matchEntityList - the list of pre-link entity in array
 */
for(var pIdx; pIdx < relationType.propertyTypeList.length; pIdx++) {
	if(relationType.propertyTypeList[pIdx].type == InputType.LIST) {
		var propertyType = relationType.propertyTypeList[pIdx];
		var matchScore = 0.0;
		if(propertyType.maxlink == 1) {
			/*
			if(rel
				matchScore =
			*/
		}
		else {
			;
		}

	 }

 }
}

Entity.moveNextCompare = function(entity0, entity1) {
	return entity0.span[0].start >= entity1.span[entity1.span.length-1].end;
}

Entity.stopCompare = function(entity0, entity1) {
	/* Compare 
	 */
	return entity0.span[entity0.span.length-1].end >= entity1.span[0].start;
}

function compareAllAnnotation(annotationList0, annotationList1, sortingFunc, stopCompareFunc, moveNextCompareFunc, comparePairCheck) {
	/* Compare all possible AObj pairs from list0 and list1.
	 * To speed-up, run apply the sortingFunc to both lists, then apply the stopCompareFunc to decide the compare should be stop immediately
	 * @rparam[ [ Identical List ], [ Gold Annotation List ], {'aObj0.id + '-' + aObj1.id': compareResultObj} ]
	 */
	var identicalList = [];
	var goldAnnotationList = [];
	var comparasionDict = {};

	var list0 = Object.keys(annotationList0).map(function(k) {return annotationList0[k]});
	var list1 = Object.keys(annotationList1).map(function(k) {return annotationList1[k]});

	if(sortingFunc != undefined) {
		list0.sort(sortingFunc);
		list1.sort(sortingFunc);
	}


	var listIdx0= 0; listIdx1 = 0;
	var usedAObj1 = {};

	var allGoldIDList = Object.keys(annotationList0).filter(function(aIdx) { return (annotationList0[aIdx].id.indexOf("@gold") >= 0); }).concat(Object.keys(annotationList1).filter(function(aIdx) { return (annotationList1[aIdx].id.indexOf("@gold") >= 0); }));
	allGoldIDList.sort();

	for(var tIdx = 0; tIdx < allGoldIDList.length; tIdx++) {
		if(goldAnnotationList.length == 69)
			console.log(69);
		if(tIdx == allGoldIDList.length - 1 || (allGoldIDList[tIdx] != allGoldIDList[(tIdx + 1)])) {
			if(tIdx in annotationList0)
				goldAnnotationList.push(annotationList0[allGoldIDList[tIdx]]);
			else
				goldAnnotationList.push(annotationList1[allGoldIDList[tIdx]]);
		}
		else {
			goldAnnotationList.push(annotationList0[allGoldIDList[tIdx]]);
			tIdx++;
		}
	}
	var listDecideIdx1 = {};
	for(var tIdx = 0; tIdx < list1.length; tIdx++) {
		if(list1[tIdx].id.indexOf("@gold") >= 0)
			listDecideIdx1[tIdx] = true;
	}

	while(listIdx0 < list0.length) {
		var aObj0 = list0[listIdx0];
		var termList0 = aObj0.id.split("@");
		var annotator0 = termList0[3];
		var aObjIdx0 = parseInt(termList0[0]);

		var listIdxShift1 = 0;
		var undecideAObj1 = [];
		

		if(annotator0 == "gold") {
			;
		}
		else {
	
			// Check the start annotations in list1 should be move
			while((listIdx1 + listIdxShift1 ) < list1.length && moveNextCompareFunc(aObj0, list1[(listIdx1 + listIdxShift1 )])) {
				var aObj1 = list1[(listIdx1 + listIdxShift1 )];
				listIdx1++;
			}
	
			// Go through all possible annotations in list1
			while((listIdx1 + listIdxShift1 ) < list1.length && stopCompareFunc(aObj0, list1[(listIdx1 + listIdxShift1 )])) {
				var currentList1Idx = listIdx1 + listIdxShift1;
				var aObj1 = list1[currentList1Idx];
	
				if(!(currentList1Idx in listDecideIdx1) && aObj0.type === aObj1.type) {
					var termList1 = aObj1.id.split("@");
					var annotator1 = termList1[3];
					var aObjIdx1 = parseInt(termList1[0]);
	
					var compareRObj = comparePairCheck(aObj0, aObj1);

					if(compareRObj.matchScore == 1.0) {
						identicalList.push([aObj0, aObj1]);
						listDecideIdx1[currentList1Idx] = true;
						// clear usedAObj1
						for(var tList1Idx in usedAObj1) {
							var tIdxIdx = usedAObj1[tList1Idx].indexOf(listIdx0);
							if(tIdxIdx >=0) {
								usedAObj1[tList1Idx].splice(tIdxIdx, 1);
								if(usedAObj1[tList1Idx].length == 0)
									delete usedAObj1[tList1Idx];
							}
						}

						if(currentList1Idx in usedAObj1) {
							usedAObj1[currentList1Idx].forEach(function(tList0Idx) {
								if(aObj1.id in comparasionDict[list0[tList0Idx].id]) 
									delete comparasionDict[list0[tList0Idx].id][aObj1.id];
							});
						}
						undecideAObj1 = [];

						break;

					}
					else if(compareRObj.matchScore > 0.0) {
						undecideAObj1.push([aObj1, compareRObj]);
						if(!(currentList1Idx in usedAObj1))
							usedAObj1[currentList1Idx] = [];
						usedAObj1[currentList1Idx].push(listIdx0);
					}
				}
				listIdxShift1++;
			}
	
			// check undecideAObj1 is empty or not
			if(undecideAObj1.length > 0) {

				comparasionDict[aObj0.id] = {};
				undecideAObj1.forEach(function(aObj1ComparasionPair) {
					var tAObj1 = aObj1ComparasionPair[0];
					var tCompareRObj = aObj1ComparasionPair[1];
					comparasionDict[aObj0.id][tAObj1.id] = tCompareRObj;
				});
			}

		}
		listIdx0++;
	}

	// @rparam[ [ Identical List ], [ Gold Annotation List ], {'aObj0.id + '-' + aObj1.id': compareResultObj} ]
	var rComparasionDict = {};
	Object.keys(comparasionDict).forEach(function(aID0) {
		Object.keys(comparasionDict[aID0]).forEach(function(aID1) {
			if(!(aID1 in rComparasionDict))
				rComparasionDict[aID1] = {};
			rComparasionDict[aID1][aID0] = comparasionDict[aID0][aID1];
		});
	});
	
	return [identicalList, goldAnnotationList, [comparasionDict, rComparasionDict]];

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
		var annotator0, annotator1;
		var term0, term1;
		var diffProp;
		var spanEqual;

		while( (idx1 + followIdx) < entityList1.length && (entityList0[idx0].span[entityList0[idx0].span.length-1].end > entityList1[idx1+followIdx].span[0].start ) ) {
			if( entityList0[ idx0 ].type === entityList1[ idx1+followIdx ].type ) {
				entity0 = entityList[idx][ entityListIdx[idx] ];
				entity1 = entityList[xIdx][ entityListIdx[xIdx] + followIdx ];
					
				term0 = entity0.id.split('@');
				term1 = entity1.id.split('@');
				annotator0 = term0[3];
				annotator1 = term1[3];

				needAddAdjudicationEntity = false;
				diffProp = undefined;
				spanEqual = false;
				
				if(annotator0 == "gold" || annotator1 == "gold") {
					if(term0[0] === term1[0]) {
						// same gold data
						var eIdx = parseInt(term0[0]);
						$.each(projectList, function(annotator, aProject) {
							if(aProject.entityList[eIdx] != entity0) {
								aProject.entityList[eIdx] = entity0;
								$.each(entity1.linkingAObjList, function(ttIdx, linkingAObj) {
									$.each(linkingAObj.type.propertyTypeList, function(tttIdx, pType) {
										if(pType.input == InputType.LIST && linkingAObj.propertyList[tttIdx] != undefined) {
											var pIdx = linkingAObj.propertyList[tttIdx].indexOf(entity1);
											if(pIdx > -1)
												linkingAObj.propertyList[tttIdx][pIdx] = entity0;
										}
									});
								});
								// move linkedAObj from entity1 to entity0
								entity0.linkingAObjList = entity0.linkingAObjList.concat(entity1.linkingAObjList);
								if(_self.annotateFrame != undefined)
									_self.annotateFrame.removeEntityPosit(entity0, entity1, true);
								entity0.setAdditionalData("adjudication", "gold");
								
							}
						});
						_self.entityList[eIdx] = entity0

						_self.addTypeCount(entity0.type);
					}

					needAddAdjudicationEntity = false;
				}
				else {
					var compareRObj = comparePairCheck(entity0, entity1);
					needAddAdjudicationEntity = compareRObj.needAddAdjudicationEntity;
					diffProp = compareRObj.diffProp;
					spanEqual = compareRObj.spanEqual;
					if(needAddAdjudicationEntity) 
						needAdjEntityPairList.push([compareRObj, [entity0, entity1]]);
				}

				/*
				if(needAddAdjudicationEntity) {
					var newAdjEntity = undefined;
					
					if(entity0.getAdditionalData("comparePair") != undefined || entity1.getAdditionalData("comparePair") != undefined) {
						var hasAlignedEntity = undefined;
						[entity1, entity0].forEach(function(tEntity) {

							var comparePairList;
							if((comparePairList = tEntity.getAdditionalData("comparePair")) != undefined) {
								;
								
							}
						});

						if(entity0.getAdditionalData("comparePair") != undefined)
							hasAlignedEntity = entity0;
						else
							hasAlignedEntity = entity1;
					}
					else {
						if(spanEqual && diffProp.length == 0 && _self.identicalEntityMarkAsGold) {
							_self.markGold(entity0);
							entity1.setAdditionalData("adjudication", "not gold");
						}
						var newAdjEntity = new AdjudicationEntity(this.getNewEntityId(), entity0.type, [entity0, entity1], diffProp);
						this.addAdjEntityToAdjudicationInCompareEntityPair(entity0, entity1, newAdjEntity);
						this.addAdjEntityToAdjudicationInCompareEntityPair(entity1, entity0, newAdjEntity);
						this.addAdjAObj(newAdjEntity);
						if(_self.annotateFrame != undefined)
							_self.annotateFrame.updatePosIndex(newAdjEntity);
						_self.addTypeCount(newAdjEntity.type);
					}
				}
				*/
			}
			followIdx++;
		}
		entityListIdx[idx]++;
	}
	//======================
}

function stableMarraige(list0, list1, matchDictList) {
/*
 * @param {IAnaforaObj[]} list0 - the first list of annotation objects in array
 * @param {IAnaforaObj[]} list1 - the second list of annotation objects in array
 * @param {function} compareFunc - the list of annotation objects in array
 * @param {String[]} matchDictList - the list of pre-link entity in array
 */
	// Get Identical Pair
	var comparasionDict = matchDictList;
	var yetDecide = {};
	var rYetDecide = {};

	for(var round = 0; round < Object.keys(comparasionDict).length; round++) {
		// Pair un-assign annotation of annotator0 with its highest score annotation of annotator1
		//
		var hasUpdated = false;
		Object.keys(comparasionDict).forEach(function(aID0) {
			if(!(aID0 in yetDecide)) {
				var aObj1IDList = Object.keys(comparasionDict[aID0]);
				if(aObj1IDList.length > 0) {
					var matchScoreList = aObj1IDList.map(function(aID1) { return comparasionDict[aID0][aID1].matchScore;});
					var maxScore = matchScoreList.reduce(function(a,b) {return Math.max(a,b);});
					var maxScoreIdx = matchScoreList.indexOf(maxScore);
					var maxAID1 = aObj1IDList[maxScoreIdx];
	
					if(maxAID1 in rYetDecide) {
						if(maxScore > rYetDecide[maxAID1][1]) {
							// update
							var previousAID0 = rYetDecide[maxAID1][0];
	
							rYetDecide[maxAID1][0] = aID0;
							rYetDecide[maxAID1][1] = maxScore;
	
							// remove previousAID0 from yetDecide and comparasionDict
							delete yetDecide[previousAID0];

							yetDecide[aID0] = maxAID1;
							hasUpdated = true;
						}
					}
					else {
						rYetDecide[maxAID1] = [aID0, maxScore];
						yetDecide[aID0] = maxAID1;
						hasUpdated = true;
					}
				}
			}
		});

		if(!hasUpdated) {
			break;
		}
	}


	return yetDecide;
}
