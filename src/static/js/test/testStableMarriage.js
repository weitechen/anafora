QUnit.module( "Test Module for stable marriage algorithm", function(hooks) {
	hooks.before( function() {
		// 
		var schemaPath = _setting.root_url + "/anafora/schema/Thyme2v1.Coreference/0";
		var schemaJSONStr = $.ajax({ type: "GET", url: schemaPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get schema File: " + schemaPath + " Error");  console.log(xhr.responseText);  }}).responseText;

		var schemaJSON = $.parseJSON(schemaJSONStr);
		var schemaXMLStr = schemaJSON.schemaXML;

		var xmlDom = $.parseXML( schemaXMLStr ) ;

		hooks.schema = new Schema();
		hooks.schema.parseSchemaXML(xmlDom);
	});

	QUnit.test("Test Adjudication Entity/Relation", function(assert) {
		var entity1 = new Entity("1@e@task@annot1", hooks.schema.typeDict["EVENT"], [new SpanType(94, 99)], ["BEFORE", "N/A", "N/A", "POS", "ACTUAL", "N/A", "FINITE"]);
		var entity2 = new Entity("2@e@task@annot2", hooks.schema.typeDict["EVENT"], [new SpanType(88,92), new SpanType(94, 98)], ["BEFORE", "N/A", "N/A", "POS", "ACTUAL", "N/A", "UNDETERMINED"]);

		assert.ok( !entity1.isCrossObj() );
		assert.ok( !entity2.isCrossObj() );
		var adjEntity = new AdjudicationEntity("3@e@task@gold", entity1.type, [entity1, entity2], [6]);
		assert.equal( adjEntity.toXMLString(), "\t<entity>\n\t\t<id>3@e@task@gold</id>\n\t\t<span>88,92;94,99</span>\n\t\t<type>EVENT</type>\n\t\t<parentsType>TemporalEntities</parentsType>\n\t\t<addition>\n\t\t\t<compareEntity>1@e@task@annot1,2@e@task@annot2</compareEntity>\n\t\t\t<diffProp>6</diffProp>\n\t\t</addition>\n\t</entity>", "test adjudication entity toXMLString")
		assert.equal( adjEntity.id, "3@e@task@gold");
		assert.equal( adjEntity.span.length, 2, "check number of distinct span");
		assert.equal( adjEntity.span[0].start, 88, "check the start of first span");
		assert.equal( adjEntity.span[0].end, 92, "check the end of first span");
		assert.equal( adjEntity.span[1].start, 94, "check the start of second span");
		assert.equal( adjEntity.span[1].end, 99, "check the end of second span");
		assert.equal( adjEntity.compareAObj.length, 2);
		assert.equal( adjEntity.compareAObj[0], entity1);
		assert.equal( adjEntity.compareAObj[1], entity2);
		assert.deepEqual( adjEntity.diffProp, [6], "check adjudication property differences");
		assert.equal( adjEntity.decideIdx, undefined);
		assert.ok( !adjEntity.isCrossObj() );

		entity1.setAdditionalData("adjudication", "gold");
		entity2.setAdditionalData("adjudication", "not gold");
		var adjEntity2 = new AdjudicationEntity("4@e@task@gold", entity1.type, [entity1, entity2], [6]);
		assert.ok( !adjEntity2.isCrossObj() );
		assert.equal( adjEntity2.id, "4@e@task@gold");
		assert.equal( adjEntity2.decideIdx, 0);
		assert.equal( adjEntity2.toXMLString(), "\t<entity>\n\t\t<id>4@e@task@gold</id>\n\t\t<span>88,92;94,99</span>\n\t\t<type>EVENT</type>\n\t\t<parentsType>TemporalEntities</parentsType>\n\t\t<addition>\n\t\t\t<compareEntity>1@e@task@annot1,2@e@task@annot2</compareEntity>\n\t\t\t<diffProp>6</diffProp>\n\t\t</addition>\n\t</entity>", "test adjudication entity toXMLString")

		// setting entity compare func
		var relation1 = new Relation("1@r@task@stylerw", hooks.schema.typeDict["Identical"], [[entity1], [entity1, entity2]]);
		var relation2 = new Relation("2@r@task@crooksk", hooks.schema.typeDict["Identical"], [[entity2], [entity1, entity2]]);
		assert.ok( !relation1.isCrossObj() );
		assert.ok( !relation2.isCrossObj() );
		var adjRelation = new AdjudicationRelation("3@r@task@adj", relation1.type, [relation1, relation2], [0]);

		assert.equal( adjRelation.compareAObj.length, 2);
		assert.equal( adjRelation.compareAObj[0], relation1);
		assert.equal( adjRelation.compareAObj[1], relation2);
		assert.equal( adjRelation.decideIdx, undefined);
		assert.ok( !adjRelation.isCrossObj() );
		assert.equal( adjRelation.toXMLString(), "\t<relation>\n\t\t<id>3@r@task@adj</id>\n\t\t<type>Identical</type>\n\t\t<parentsType>CorefChains</parentsType>\n\t\t<addition>\n\t\t\t<compareRelation>1@r@task@stylerw,2@r@task@crooksk</compareRelation>\n\t\t\t<diffProp>0</diffProp>\n\t\t</addition>\n\t</relation>", "test adjudication relation toXMLString")

		relation1.setAdditionalData("adjudication", "not gold");
		relation2.setAdditionalData("adjudication", "gold");
		assert.deepEqual( adjRelation.diffProp, [0] );

		var adjRelation2 = new AdjudicationRelation("4@r@task@adj", relation1.type, [relation1, relation2], [0]);

		assert.equal( adjRelation2.decideIdx, 1);
		assert.ok( !adjRelation2.isCrossObj() );
		assert.equal( adjRelation2.toXMLString(), "\t<relation>\n\t\t<id>4@r@task@adj</id>\n\t\t<type>Identical</type>\n\t\t<parentsType>CorefChains</parentsType>\n\t\t<addition>\n\t\t\t<compareRelation>1@r@task@stylerw,2@r@task@crooksk</compareRelation>\n\t\t\t<diffProp>0</diffProp>\n\t\t</addition>\n\t</relation>", "test adjudication relation toXMLString")
	});

	QUnit.test("Test Entity Comparasion", function(assert) {
		var entity1 = new Entity("1@e@task@annot1", hooks.schema.typeDict["EVENT"], [new SpanType(94, 98)], ["BEFORE", "N/A", "N/A", "POS", "ACTUAL", "N/A", "FINITE"]);
		var entity2 = new Entity("2@e@task@annot1", hooks.schema.typeDict["EVENT"], [new SpanType(94, 98)], ["BEFORE", "N/A", "N/A", "POS", "ACTUAL", "N/A", "UNDETERMINED"]);

		assert.equal( IAdjudicationAnaforaObj.compareProperty(entity1.type.propertyTypeList[0], entity1.propertyList[0], entity2.propertyList[0]), 1.0, "check property compare with CHOICE" );
		assert.equal( IAdjudicationAnaforaObj.compareProperty(entity1.type.propertyTypeList[6], entity1.propertyList[6], entity2.propertyList[6]), 0.0, "check property compare with CHOICE" );
		assert.deepEqual( IAdjudicationAnaforaObj.compareAObjPropertyList(entity1, entity2), [6], "check property list compare"); ;
		assert.deepEqual( IAdjudicationAnaforaObj.compareAObjPropertyList(entity1, entity1), [], "check property list compare"); ;
		assert.equal( IAdjudicationAnaforaObj.compareProperty(hooks.schema.typeDict["Identical"].propertyTypeList[1], [entity1, entity2], [entity1, entity2]), 1.0, "check property compare with LIST - Identical List");
		assert.equal( IAdjudicationAnaforaObj.compareProperty(hooks.schema.typeDict["Identical"].propertyTypeList[0], [entity1], [entity2]), 0.0, "check property compare with LIST - Different element");
		assert.equal( IAdjudicationAnaforaObj.compareProperty(hooks.schema.typeDict["Identical"].propertyTypeList[1], [entity1, entity2], [entity1, entity2, entity1]), 0.8, "check property compare with LIST - different list length");
	});

	QUnit.test("Test Relation Comparasion", function(assert) {
		assert.ok(true, "dummy test");
	});

	QUnit.module( "Sub module", function(subhooks) {
		subhooks.before( function() {
			var ansCSVPath = _setting.root_url + "/static/adjudication//ID185_clinic_543.csv";
			var ansCSVStr = $.ajax({ type: "GET", url: ansCSVPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Answer CSV File: " + ansCSVPath + " Error");  console.log(xhr.responseText);  }}).responseText;
			subhooks.ansCSVDict = parseAnsCSV(ansCSVStr);
			/*
			subhooks.ansDict = {};
			var ansLineList = ansCSVStr.split("\n");
			subhooks.numOfGoldEntity = 0;
			subhooks.numOfComparePairEntity = 0;
			subhooks.numOfIdenticalEntity = 0;
			subhooks.numOfStandaloneEntity0 = 0;
			subhooks.numOfStandaloneEntity1 = 0;
			subhooks.numOfGoldRelation = 0;
			subhooks.numOfComparePairRelation = 0;
			subhooks.numOfIdenticalRelation = 0;
			subhooks.numOfStandaloneRelation0 = 0;
			subhooks.numOfStandaloneRelation1 = 0;

			subhooks.preDefineScore = {};
			
			ansLineList.forEach(function(ansLine) {
				ansLine = ansLine.trim();
				if(ansLine != "") {
					var ansTerm = ansLine.split(",");
					if(ansTerm[0] != "") {
						subhooks.ansDict[ansTerm[0]] = 1.0;
						if(ansTerm[0].indexOf("@e@") >=0)
							subhooks.numOfGoldEntity++;
						else
							subhooks.numOfGoldRelation++;
					}
					else if(ansTerm[1] != "" && ansTerm[2] != "") {
						if(ansTerm[3] == "") {
							subhooks.ansDict[ansTerm[1] + "-" + ansTerm[2]] = undefined;
							if(ansTerm[1].indexOf("@e@") >=0)
								subhooks.numOfComparePairEntity++;
							else
								subhooks.numOfComparePairRelation++;
						}
						else {
							subhooks.ansDict[ansTerm[1] + "-" + ansTerm[2]] = parseFloat(ansTerm[3]);
							if(ansTerm[1].indexOf("@e@") >=0) {
								if(subhooks.ansDict[ansTerm[1] + "-" + ansTerm[2]] == 1.0)
									subhooks.numOfIdenticalEntity++;
								else
									subhooks.numOfComparePairEntity++;
								subhooks.preDefineScore[ansTerm[1] + "-" + ansTerm[2]] = subhooks.ansDict[ansTerm[1] + "-" + ansTerm[2]];
							}
							else {
								if(subhooks.ansDict[ansTerm[1] + "-" + ansTerm[2]] == 1.0)
									subhooks.numOfIdenticalRelation++;
								else
									subhooks.numOfComparePairRelation++;
							}
						}
					}
					else if(ansTerm[1] != "") {
						if(ansTerm[3] == "")
							subhooks.ansDict[ansTerm[1]] = undefined;
						else
							subhooks.ansDict[ansTerm[1]] = parseFloat(ansTerm[3]);
						if(ansTerm[1].indexOf("@e@") >=0)
							subhooks.numOfStandaloneEntity0++;
						else
							subhooks.numOfStandaloneRelation0++;

					}
					else if(ansTerm[2] != "") {
						if(ansTerm[3] == "")
							subhooks.ansDict[ansTerm[2]] = undefined;
						else
							subhooks.ansDict[ansTerm[2]] = parseFloat(ansTerm[3]);
						if(ansTerm[2].indexOf("@e@") >=0)
							subhooks.numOfStandaloneEntity1++;
						else
							subhooks.numOfStandaloneRelation1++;
					}
				}
			});
			*/

			var annotator0XMLPath = _setting.root_url + "/static/THYMEColonFinal/Train/ID185_clinic_543/ID185_clinic_543.Thyme2v1-Coreference.adwi9965.completed.xml";
			var annotator0XMLStr = $.ajax({ type: "GET", url: annotator0XMLPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Answer Annotator File: " + annotator0XMLPath + " Error");  console.log(xhr.responseText);  }}).responseText;
			var annotator0XMLDOM = $.parseXML(annotator0XMLStr);
			subhooks.anaforaProject0 = new AnaforaProject(hooks.schema, "adwi9965", "ID185_clinic_543");
			subhooks.anaforaProject0.readFromXMLDOM(annotator0XMLDOM, true);

			var annotator1XMLPath = _setting.root_url + "/static/THYMEColonFinal/Train/ID185_clinic_543/ID185_clinic_543.Thyme2v1-Coreference.reganma.completed.xml";
			var annotator1XMLStr = $.ajax({ type: "GET", url: annotator1XMLPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Answer Annotator File: " + annotator1XMLPath + " Error");  console.log(xhr.responseText);  }}).responseText;
			var annotator1XMLDOM = $.parseXML(annotator1XMLStr);
			subhooks.anaforaProject1 = new AnaforaProject(hooks.schema, "reganma", "ID185_clinic_543");
			subhooks.anaforaProject1.readFromXMLDOM(annotator1XMLDOM, true);
		});

		QUnit.test("Test Entity comparePairCheck", function(assert) {
			var entity0_0 = subhooks.anaforaProject0.entityList[467];
			var entity0_1 = subhooks.anaforaProject1.entityList[466];
			var compareObj0 = Entity.comparePairCheck(entity0_0, entity0_1);
			assert.deepEqual(compareObj0["diffProp"], []);
			assert.ok(compareObj0["spanEqual"]);
			assert.equal(compareObj0["matchScore"], 1.0);

			var entity1_0 = subhooks.anaforaProject0.entityList[482];
			var entity1_1 = subhooks.anaforaProject1.entityList[477];
			var compareObj1 = Entity.comparePairCheck(entity1_0, entity1_1);
			assert.deepEqual(compareObj1["diffProp"], []);
			assert.notOk(compareObj1["spanEqual"]);
			assert.equal(compareObj1["matchScore"].toFixed(5), subhooks.ansCSVDict.ansDict["482@e@ID185_clinic_543@adwi9965|477@e@ID185_clinic_543@reganma"].toFixed(5));

			var entity2_0 = subhooks.anaforaProject0.entityList[533];
			var entity2_1 = subhooks.anaforaProject1.entityList[527];
			var compareObj2 = Entity.comparePairCheck(entity2_0, entity2_1);
			assert.deepEqual(compareObj2["diffProp"], []);
			assert.notOk(compareObj2["spanEqual"]);
			assert.equal(compareObj2["matchScore"].toFixed(5), subhooks.ansCSVDict.ansDict["533@e@ID185_clinic_543@adwi9965|527@e@ID185_clinic_543@reganma"].toFixed(5));
		});

		QUnit.test("Test Relation comparePairCheck", function(assert) {
			
			var relation0_0 = subhooks.anaforaProject0.relationList[258];
			var relation0_1 = subhooks.anaforaProject1.relationList[243];
			var compareObj0 = Relation.comparePairCheck(relation0_0, relation0_1, subhooks.ansCSVDict.preDefineScore);
			assert.deepEqual(compareObj0["diffProp"], []);
			assert.equal(compareObj0["matchScore"], 1.0);

			var relation1_0 = subhooks.anaforaProject0.relationList[260];
			var relation1_1 = subhooks.anaforaProject1.relationList[245];
			var compareObj1 = Relation.comparePairCheck(relation1_0, relation1_1, subhooks.ansCSVDict.preDefineScore);
			assert.deepEqual(compareObj1["diffProp"], [1]);
			assert.equal(compareObj1["matchScore"].toFixed(5), subhooks.ansCSVDict.ansDict["260@r@ID185_clinic_543@adwi9965|245@r@ID185_clinic_543@reganma"].toFixed(5));

			var relation2_0 = subhooks.anaforaProject0.relationList[244];
			var relation2_1 = subhooks.anaforaProject1.relationList[254];
			var compareObj2 = Relation.comparePairCheck(relation2_0, relation2_1, subhooks.ansCSVDict.preDefineScore);
			assert.deepEqual(compareObj2["diffProp"], [0]);
			assert.equal(compareObj2["matchScore"].toFixed(5), subhooks.ansCSVDict.ansDict["244@r@ID185_clinic_543@adwi9965|254@r@ID185_clinic_543@reganma"].toFixed(5));

			var relation3_0 = subhooks.anaforaProject0.relationList[259];
			var relation3_1 = subhooks.anaforaProject1.relationList[242];
			var compareObj2 = Relation.comparePairCheck(relation3_0, relation3_1, subhooks.ansCSVDict.preDefineScore);
			assert.deepEqual(compareObj2["diffProp"], [1]);
			assert.equal(compareObj2["matchScore"].toFixed(5), subhooks.ansCSVDict.ansDict["259@r@ID185_clinic_543@adwi9965|242@r@ID185_clinic_543@reganma"].toFixed(5));

			var relation4_0 = subhooks.anaforaProject0.relationList[280];
			var relation4_1 = subhooks.anaforaProject1.relationList[261];
			var compareObj2 = Relation.comparePairCheck(relation4_0, relation4_1, subhooks.ansCSVDict.preDefineScore);
			assert.deepEqual(compareObj2["diffProp"], [2]);
			assert.equal(compareObj2["matchScore"].toFixed(5), subhooks.ansCSVDict.ansDict["280@r@ID185_clinic_543@adwi9965|261@r@ID185_clinic_543@reganma"].toFixed(5));
		});

		QUnit.test("Test compareAllAnnotation for both Entity and Relation List", function(assert) {
			var compareAllEntityResultList = compareAllAnnotation(subhooks.anaforaProject0.entityList, subhooks.anaforaProject1.entityList, Entity.sort, Entity.stopCompare, Entity.moveNextCompare, Entity.comparePairCheck);
			var identicalEntityList = compareAllEntityResultList[0];
			var goldEntityList = compareAllEntityResultList[1];
			var compareEntityDict = compareAllEntityResultList[2];

			var matchEntityPairList = stableMarraige(subhooks.anaforaProject0.entityList, subhooks.anaforaProject1.entityList, compareEntityDict[0]);
			preDefineDict = {};
			identicalEntityList.forEach(function(identicalPair) {
				var entity0 = identicalPair[0];
				var entity1 = identicalPair[1];
				preDefineDict[entity0.id + "|" + entity1.id] = 1.0;
			});

			for(var aID0 in matchEntityPairList) {
				var aID1 = matchEntityPairList[aID0];
				preDefineDict[aID0 + "|" + aID1] = compareEntityDict[0][aID0][aID1].matchScore;
			}

			var compareAllRelationResultList = compareAllAnnotation(subhooks.anaforaProject0.relationList, subhooks.anaforaProject1.relationList, undefined, function() { return true;}, function() { return false;}, function(relation0, relation1) { return Relation.comparePairCheck(relation0, relation1, preDefineDict);});
			var identicalRelationList = compareAllRelationResultList[0];
			var goldRelationList = compareAllRelationResultList[1];
			var compareRelationDict = compareAllRelationResultList[2];
			var matchRelationPairList = stableMarraige(subhooks.anaforaProject0.entityList, subhooks.anaforaProject1.entityList, compareRelationDict[0]);

			// Check identicalEntityList
			identicalEntityID = {};
			identicalEntityList.forEach(function(identicalEntityPair) {
				var entity0 = identicalEntityPair[0];
				var entity1 = identicalEntityPair[1];
				assert.equal(subhooks.ansCSVDict.ansDict[entity0.id + "|" + entity1.id], 1.0);
				identicalEntityID[entity0.id + "|" + entity1.id] = true;
			});
			
			assert.equal(Object.keys(identicalEntityID).length, Object.keys(identicalEntityList).length);
			assert.equal(Object.keys(identicalEntityID).length, subhooks.ansCSVDict.numOfIdenticalEntity);

			// Check identicalRelationList
			identicalRelationID = {};
			identicalRelationList.forEach(function(identicalRelationPair) {
				var relation0 = identicalRelationPair[0];
				var relation1 = identicalRelationPair[1];
				assert.equal(subhooks.ansCSVDict.ansDict[relation0.id + "|" + relation1.id], 1.0);
				identicalRelationID[relation0.id + "|" + relation1.id] = true;
			});
			
			assert.equal(Object.keys(identicalRelationID).length, Object.keys(identicalRelationList).length);
			assert.equal(Object.keys(identicalRelationID).length, subhooks.ansCSVDict.numOfIdenticalRelation);

			// Check goldEntityList
			goldEntityID = {};
			goldEntityList.forEach(function(goldEntity) {
				assert.ok(goldEntity.id in subhooks.ansCSVDict.ansDict);
				assert.equal(subhooks.ansCSVDict.ansDict[goldEntity.id], 1.0);
				goldEntityID[goldEntity.id] = true;
			});
			assert.equal(Object.keys(goldEntityID).length, goldEntityList.length);
			assert.equal(Object.keys(goldEntityID).length, subhooks.ansCSVDict.numOfGoldEntity);

			// Check goldRelationList
			goldRelationID = {};
			goldRelationList.forEach(function(goldRelation) {
				assert.ok(goldRelation.id in subhooks.ansCSVDict.ansDict);
				assert.equal(subhooks.ansCSVDict.ansDict[goldRelation.id], 1.0);
				goldRelationID[goldRelation.id] = true;
			});
			assert.equal(Object.keys(goldRelationID).length, goldRelationList.length);
			assert.equal(Object.keys(goldRelationID).length, subhooks.ansCSVDict.numOfGoldRelation);

			for(var aID0 in matchEntityPairList) {
				var aID1 = matchEntityPairList[aID0];
				assert.ok(aID0 + "|" + aID1, subhooks.ansCSVDict.ansDict, "Checking " + aID0 + "|" + aID1 + " in ansDict");
			}

			for(var aID0 in matchRelationPairList) {
				var aID1 = matchRelationPairList[aID0];
				assert.ok(aID0 + "|" + aID1 in subhooks.ansCSVDict.ansDict, "Checking " + aID0 + "|" + aID1 + " in ansDict");
			}

			for(var ansKey in subhooks.ansCSVDict.ansDict) {
				if(ansKey.indexOf("|") > 0) {
					var aIDTerms = ansKey.split("|");
					var aID0 = aIDTerms[0];
					var aID1 = aIDTerms[1];
					var entityTerms = aID0.split("@");
					if(entityTerms[1] == "e") {
						if (subhooks.ansCSVDict.ansDict[ansKey] == 1.0) {
							assert.ok(ansKey in identicalEntityID, "Checking answer pair " + ansKey + " in identical list");
						}
						else {
							assert.ok(aID0 in matchEntityPairList, "Checking " + aID0 + " in matchEntityPairList");
							assert.equal(matchEntityPairList[aID0], aID1, "Check the match pair of " + aID0 + "|" + aID1 + " is correct");
						}
					}
					else {
						if (subhooks.ansCSVDict.ansDict[ansKey] == 1.0) {
							assert.ok(ansKey in identicalRelationID, "Checking answer pair " + ansKey + " in identical list");
						}
						else {
							assert.ok(aID0 in matchRelationPairList, "Checking " + aID0 + " in matchRelationPairList");
							assert.equal(matchRelationPairList[aID0], aID1, "Check the match pair of " + aID0 + "|" + aID1 + " is correct");
						}
					}
				}
				else {
					;
				}
			}
		});
	});
});
