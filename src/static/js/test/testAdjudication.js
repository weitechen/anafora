/* UnitTest for Anafora Adjudication Project */

QUnit.module( "Test Anafora", function(hooks) {
	hooks.before( function() {
		var schemaPath = _setting.root_url + "/anafora/schema/Thyme2v1.Coreference/0";
		var schemaJSONStr = $.ajax({ type: "GET", url: schemaPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get schema File: " + schemaPath + " Error");  console.log(xhr.responseText);  }}).responseText;

		var schemaJSON = $.parseJSON(schemaJSONStr);
		var schemaXMLStr = schemaJSON.schemaXML;
		var xmlDom = $.parseXML( schemaXMLStr ) ;
		hooks.schema = new Schema();
		hooks.schema.parseSchemaXML(xmlDom);

		//var rawTextPath = _setting.root_url + "/static/THYMEColonFinal/Train/ID185_clinic_543/ID185_clinic_543";
		//hooks.rawTextStr = $.ajax({ type: "GET", url: rawTextPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Raw Text: " + rawTextPath + " Error");  console.log(xhr.responseText);  }}).responseText;
		var annotator0XMLPath = _setting.root_url + "/static/THYMEColonFinal/Train/ID185_clinic_543/ID185_clinic_543.Thyme2v1-Coreference.adwi9965.completed.xml";
		var annotator0XMLStr = $.ajax({ type: "GET", url: annotator0XMLPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Anafora XML File: " + annotator0XMLPath + " Error");  console.log(xhr.responseText);  }}).responseText;
		annotator0XMLDOM = $.parseXML(annotator0XMLStr);
		hooks.anaforaProject0 = new AnaforaProject(hooks.schema, "adwi9965", "ID185_clinic_543");
		hooks.anaforaProject0.readFromXMLDOM(annotator0XMLDOM, true);

		var annotator1XMLPath = _setting.root_url + "/static/THYMEColonFinal/Train/ID185_clinic_543/ID185_clinic_543.Thyme2v1-Coreference.reganma.completed.xml";
		var annotator1XMLStr = $.ajax({ type: "GET", url: annotator1XMLPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Answer Annotator File: " + annotator1XMLPath + " Error");  console.log(xhr.responseText);  }}).responseText;
		annotator1XMLDOM = $.parseXML(annotator1XMLStr);
		hooks.anaforaProject1 = new AnaforaProject(hooks.schema, "reganma", "ID185_clinic_543");
		hooks.anaforaProject1.readFromXMLDOM(annotator1XMLDOM, true);
		var ansCSVPath = _setting.root_url + "/static/adjudication//ID185_clinic_543.csv";
		var ansCSVStr = $.ajax({ type: "GET", url: ansCSVPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Answer CSV File: " + ansCSVPath + " Error");  console.log(xhr.responseText);  }}).responseText;
		hooks.ansCSVDict = parseAnsCSV(ansCSVStr);
	});

	QUnit.checkInitialAdjProject = function(assert, adjudicationAnaforaProject) {
		assert.equal(Object.keys(adjudicationAnaforaProject.entityList).length, hooks.ansCSVDict.numOfGoldEntity);
		assert.equal(Object.keys(adjudicationAnaforaProject.relationList).length, hooks.ansCSVDict.numOfGoldRelation);

		assert.equal(Object.keys(adjudicationAnaforaProject.adjudicationEntityList).length, hooks.ansCSVDict.numOfComparePairEntity + hooks.ansCSVDict.numOfIdenticalEntity);

		assert.equal(Object.keys(adjudicationAnaforaProject.adjudicationRelationList).length, hooks.ansCSVDict.numOfComparePairRelation + hooks.ansCSVDict.numOfIdenticalRelation);

		assert.equal(Object.keys(adjudicationAnaforaProject.projectList["adwi9965"].entityList).length, hooks.ansCSVDict.numOfStandaloneEntity0 + hooks.ansCSVDict.numOfComparePairEntity + hooks.ansCSVDict.numOfIdenticalEntity);
		assert.equal(Object.keys(adjudicationAnaforaProject.projectList["adwi9965"].relationList).length, hooks.ansCSVDict.numOfStandaloneRelation0 + hooks.ansCSVDict.numOfComparePairRelation + hooks.ansCSVDict.numOfIdenticalRelation);
		assert.equal(Object.keys(adjudicationAnaforaProject.projectList["reganma"].entityList).length, hooks.ansCSVDict.numOfStandaloneEntity1 + hooks.ansCSVDict.numOfComparePairEntity + hooks.ansCSVDict.numOfIdenticalEntity);
		assert.equal(Object.keys(adjudicationAnaforaProject.projectList["reganma"].relationList).length, hooks.ansCSVDict.numOfStandaloneRelation1 + hooks.ansCSVDict.numOfComparePairRelation + hooks.ansCSVDict.numOfIdenticalRelation);

		for(var ansKey in hooks.ansCSVDict.ansDict) {
			if(ansKey.indexOf("|") >= 0) {
				var aObjTerms = ansKey.split("|");
				var aObjID0 = aObjTerms[0];
				var aObjID1 = aObjTerms[1];

				var aObj0Terms = aObjID0.split("@");
				var aObj1Terms = aObjID1.split("@");

				var isEntity = (aObj0Terms[1] == "e");

				var aObjIdx0 = parseInt(aObj0Terms[0]);
				var aObjIdx1 = parseInt(aObj1Terms[0]);

				var annotator0 = aObj0Terms[3];
				var annotator1 = aObj1Terms[3];

				var aObj0 = undefined;
				var aObj1 = undefined;

				assert.equal(annotator0, "adwi9965");
				assert.equal(annotator1, "reganma");

				if(isEntity) {
					assert.ok(aObjIdx0 in adjudicationAnaforaProject.projectList["adwi9965"].entityList);
					assert.ok(aObjIdx1 in adjudicationAnaforaProject.projectList["reganma"].entityList);
					aObj0 = adjudicationAnaforaProject.projectList["adwi9965"].entityList[aObjIdx0];
					aObj1 = adjudicationAnaforaProject.projectList["reganma"].entityList[aObjIdx1];
					
				}
				else {
					assert.ok(aObjIdx0 in adjudicationAnaforaProject.projectList["adwi9965"].relationList);
					assert.ok(aObjIdx1 in adjudicationAnaforaProject.projectList["reganma"].relationList);
					aObj0 = adjudicationAnaforaProject.projectList["adwi9965"].relationList[aObjIdx0];
					aObj1 = adjudicationAnaforaProject.projectList["reganma"].relationList[aObjIdx1];
				}

				assert.ok(aObj0.getAdditionalData("comparePair")[0] === aObj1);
				assert.ok(aObj1.getAdditionalData("comparePair")[0] === aObj0);
				var adjAObj = aObj0.getAdditionalData("comparePair")[1];
				assert.ok(aObj1.getAdditionalData("comparePair")[1] === adjAObj);

				var adjIdx = parseInt(adjAObj.id.split("@")[0]);

				if(isEntity) {
					assert.ok(adjudicationAnaforaProject.adjudicationEntityList[adjIdx] === adjAObj);
					assert.ok(adjAObj.compareAObj[0] === aObj0);
					assert.ok(adjAObj.compareAObj[1] === aObj1);
					assert.ok(adjAObj instanceof AdjudicationEntity);
				}
				else {
					assert.ok(adjudicationAnaforaProject.adjudicationRelationList[adjIdx] === adjAObj);
					assert.ok(adjAObj.compareAObj[0] === aObj0);
					assert.ok(adjAObj.compareAObj[1] === aObj1);
					assert.ok(adjAObj instanceof AdjudicationRelation);
				}
			}
			else if(ansKey.indexOf("@gold") >= 0) {
				var goldAnnotationTerms = ansKey.split("@");
				var goldIdx0 = parseInt(goldAnnotationTerms[0]);
				var isEntity = (goldAnnotationTerms[1] == "e");
				var goldObj = undefined;
				var annotator = goldAnnotationTerms[3];

				assert.equal(annotator, "gold");

				if(isEntity) {
					assert.ok(goldIdx0 in adjudicationAnaforaProject.entityList);
					goldObj = adjudicationAnaforaProject.entityList[goldIdx0];

					assert.notOk(goldIdx0 in adjudicationAnaforaProject.projectList["adwi9965"].entityList);
					assert.notOk(goldIdx0 in adjudicationAnaforaProject.projectList["reganma"].entityList);
				}
				else {
					assert.ok(goldIdx0 in adjudicationAnaforaProject.relationList);
					goldObj = adjudicationAnaforaProject.relationList[goldIdx0];

					assert.notOk(goldIdx0 in adjudicationAnaforaProject.projectList["adwi9965"].relationList);
					assert.notOk(goldIdx0 in adjudicationAnaforaProject.projectList["reganma"].relationList);
				}
			}
			else {
				// standalone
				var aObjTerms = ansKey.split("@");
				var aObjIdx = parseInt(aObjTerms[0]);
				var isEntity = (aObjTerms[1] == "e");
				var annotator = aObjTerms[3];
				var aObj = undefined;
				assert.notEqual(annotator, "gold");
				if(isEntity) {
					assert.ok(aObjIdx in adjudicationAnaforaProject.projectList[annotator].entityList);
					aObj = adjudicationAnaforaProject.projectList[annotator].entityList[aObjIdx];
				}
				else {
					assert.ok(aObjIdx in adjudicationAnaforaProject.projectList[annotator].relationList);
					aObj = adjudicationAnaforaProject.projectList[annotator].relationList[aObjIdx];
				}
				assert.equal(aObj.getAdditionalData("comparePair"), undefined);
			}
		}	assert.ok(true);
	};

	QUnit.test("Test Add project List", function(assert) {
		var adjudicationAnaforaProject = new AnaforaAdjudicationProject(hooks.schema, "ID185_clinic_543");
		adjudicationAnaforaProject.addAnaforaProjectList({'adwi9965': hooks.anaforaProject0, 'reganma': hooks.anaforaProject1});
		QUnit.checkInitialAdjProject(assert, adjudicationAnaforaProject);

		var adjXMLStr = adjudicationAnaforaProject.writeXML();

		var adjXMLDom = $.parseXML( adjXMLStr ) ;
		var newAdjudicationAnaforaProject = new AnaforaAdjudicationProject(hooks.schema, "ID185_clinic_543");
		newAdjudicationAnaforaProject.readFromXMLDOM(adjXMLDom, ["adwi9965", "reganma"]);

		QUnit.checkInitialAdjProject(assert, newAdjudicationAnaforaProject);

	});

	//QUnit.test("Test save and re-read anaforaProject", function(assert) {
});
