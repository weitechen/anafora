function calculateAnnotateFrame(anaforaProject) {
	var rDict = {};
	var positIndex = {};

	var addEntityFunc = function(entity, addedAObj) {
		if(addedAObj == undefined)
			addedAObj = entity;

		if(entity instanceof AdjudicationEntity) {
			entity.compareAObj.forEach(function(compEntity) {
				addEntityFunc(compEntity, entity);
			});
		}
		else {
			entity.span.forEach(function(subSpan) {
				for(var spanIdx = subSpan.start; spanIdx < subSpan.end; spanIdx++) {
					if(!(spanIdx in positIndex))
						positIndex[spanIdx] = [];
					if(positIndex[spanIdx].indexOf(addedAObj) < 0)
						positIndex[spanIdx].push(addedAObj);
				}
			});
		}
	};

	var addRelationFunc = function(relation, addedAObj) {
		if(addedAObj == undefined)
			addedAObj = relation;

		if(relation instanceof AdjudicationRelation) {
			relation.compareAObj.forEach(function(compRelation) {
				addRelationFunc(compRelation, relation);
			});
		}
		else {
			relation.type.propertyTypeList.forEach(function(propertyType, pIdx) {
				if(propertyType.input == InputType.LIST) {
					relation.propertyList[pIdx].forEach(function(aObj, aObjIdx) {
						if(aObj instanceof Entity)
							addEntityFunc(aObj, addedAObj);
						else
							addRelationFunc(aObj, addedAObj);
					});
				}
			});
		}
	};

	for(var eIdx in anaforaProject.entityList) {
		var lEntity = anaforaProject.entityList[eIdx];
		addEntityFunc(lEntity);
	}


	for(var rIdx in anaforaProject.relationList) {
		var lRelation = anaforaProject.relationList[rIdx];
		addRelationFunc(lRelation);
	}

	if(anaforaProject instanceof AnaforaAdjudicationProject) {
		for(var annotator in anaforaProject.projectList) {
			var subProject = anaforaProject.projectList[annotator];

			for(var eIdx in subProject.entityList) {
				var subEntity = subProject.entityList[eIdx];
				addEntityFunc(subEntity);
			}
		
			for(var rIdx in subProject.relationList) {
				var subRelation = subProject.relationList[rIdx];
				addRelationFunc(subRelation);
			}
		}
		
		for(var eIdx in anaforaProject.adjudicationEntityList) {
			var adjEntity = anaforaProject.adjudicationEntityList[eIdx];
			addEntityFunc(adjEntity);
		}
	
		for(var rIdx in anaforaProject.adjudicationRelationList) {
			var adjRelation = anaforaProject.adjudicationRelationList[rIdx];
			addRelationFunc(adjRelation);
		}
	}

	var positIdxKey = Object.keys(positIndex);

	var minPosit = positIdxKey.reduce(function(cMin, v) { return Math.min(cMin, v); });
	var maxPosit = positIdxKey.reduce(function(cMax, v) { return Math.max(cMax, v); });


	var prevPositListStr = undefined;
	var overlapList = [];
	var startIdx = -1;
	for(var posit = minPosit; posit <= maxPosit; posit++) {
		if(posit in positIndex) {
			var aList = positIndex[posit];
			aList.sort();
			var aListStr = aList.map(function(aObj) { return aObj.id; }).reduce(function(accumStr, aObjStr) {
				return accumStr + "-" + aObjStr;
			});

			if(prevPositListStr == undefined) {
				prevPositListStr = aListStr;
				startIdx = posit;
			}
			else {
				if(aListStr != prevPositListStr) {
					overlapList.push({'start': startIdx, 'end': posit, 'aList': prevPositListStr});
					prevPositListStr = aListStr;
					startIdx = posit;
				}
			}
		}
		else {
			if(prevPositListStr != undefined) {
				overlapList.push({'start': startIdx, 'end': posit, 'aList': prevPositListStr});
				prevPositListStr = undefined;
				startIdx = -1;
			}
		}
	}

	if(prevPositListStr != undefined)
		overlapList.push({'start': startIdx, 'end': maxPosit+1, 'aList': prevPositListStr});
	return overlapList;
}

QUnit.module( "Test AnnotateFrame", function(hooks) {
	hooks.before( function() {
		var schemaPath = _setting.root_url + "/anafora/schema/Thyme2v1.Coreference/0";
		var schemaJSONStr = $.ajax({ type: "GET", url: schemaPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get schema File: " + schemaPath + " Error");  console.log(xhr.responseText);  }}).responseText;

		var schemaJSON = $.parseJSON(schemaJSONStr);
		var schemaXMLStr = schemaJSON.schemaXML;
		var xmlDom = $.parseXML( schemaXMLStr ) ;
		hooks.schema = new Schema();
		hooks.schema.parseSchemaXML(xmlDom);

		var rawTextPath = _setting.root_url + "/static/THYMEColonFinal/Train/ID185_clinic_543/ID185_clinic_543";
		hooks.rawTextStr = $.ajax({ type: "GET", url: rawTextPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Raw Text: " + rawTextPath + " Error");  console.log(xhr.responseText);  }}).responseText;

	});

	QUnit.module( "Test regular anafora project", function(subhooks) {
		subhooks.before( function() {
			var annotator0XMLPath = _setting.root_url + "/static/THYMEColonFinal/Train/ID185_clinic_543/ID185_clinic_543.Thyme2v1-Coreference.adwi9965.completed.xml";
			var annotator0XMLStr = $.ajax({ type: "GET", url: annotator0XMLPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Anafora XML File: " + annotator0XMLPath + " Error");  console.log(xhr.responseText);  }}).responseText;
			subhooks.annotator0XMLDOM = $.parseXML(annotator0XMLStr);
			subhooks.anaforaProject0 = new AnaforaProject(hooks.schema, "adwi9965", "ID185_clinic_543");


			var annotator1XMLPath = _setting.root_url + "/static/THYMEColonFinal/Train/ID185_clinic_543/ID185_clinic_543.Thyme2v1-Coreference.reganma.completed.xml";
			var annotator1XMLStr = $.ajax({ type: "GET", url: annotator1XMLPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Answer Annotator File: " + annotator1XMLPath + " Error");  console.log(xhr.responseText);  }}).responseText;
			subhooks.annotator1XMLDOM = $.parseXML(annotator1XMLStr);
			subhooks.anaforaProject1 = new AnaforaProject(hooks.schema, "reganma", "ID185_clinic_543");
			/*
			var ansCSVPath = _setting.root_url + "/static/adjudication//ID185_clinic_543.csv";
			var ansCSVStr = $.ajax({ type: "GET", url: ansCSVPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Answer CSV File: " + ansCSVPath + " Error");  console.log(xhr.responseText);  }}).responseText;
			subhooks.ansCSVDict = parseAnsCSV(ansCSVStr);
			*/
		});

		subhooks.beforeEach( function() {
			var htmlElement = $('<div>' + hooks.rawTextStr + '</div>');
			//.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\&/g, "&amp;") + '</div>');
			$("#attachElement").empty();
			$("#attachElement").append(htmlElement);
			subhooks.htmlElement = htmlElement;

			subhooks.annotateFrame = new AnnotateFrame(subhooks.htmlElement, _setting, subhooks.htmlElement.text());
		});

		QUnit.skip("Test Basic AnaforaProject0 AnnotateFrame", function(assert) {
			subhooks.anaforaProject0.setAnnotateFrame(subhooks.annotateFrame);
			subhooks.anaforaProject0.readFromXMLDOM(subhooks.annotator0XMLDOM, false);
			subhooks.anaforaProject0.renderAnnotateFrame();

			var positIndex = {};
			var overlapList = calculateAnnotateFrame(subhooks.anaforaProject0);
			assert.equal(subhooks.annotateFrame.overlap.length, overlapList.length);

			for(var oIdx = 0; oIdx < subhooks.annotateFrame.overlap.length; oIdx++) {
				var targetOverlap = subhooks.annotateFrame.overlap[oIdx];
				var goldOverlap = overlapList[oIdx];

				assert.equal(targetOverlap.span.start, goldOverlap.start);
				assert.equal(targetOverlap.span.end, goldOverlap.end);

				var goldAObjId = goldOverlap.aList.split("-");
				assert.equal(targetOverlap.aObjList.length, goldAObjId.length, "span range from " + goldOverlap.start.toString() + " to " + goldOverlap.end.toString() + ", " + targetOverlap.aObjList.toString() + " vs. " + goldOverlap.aList);

			}
		});

		QUnit.skip("Test Basic AnaforaProject1 AnnotateFrame", function(assert) {
			subhooks.anaforaProject1.setAnnotateFrame(subhooks.annotateFrame);
			subhooks.anaforaProject1.readFromXMLDOM(subhooks.annotator1XMLDOM, false);
			subhooks.anaforaProject1.renderAnnotateFrame();

			var positIndex = {};
			var overlapList = calculateAnnotateFrame(subhooks.anaforaProject1);
			assert.equal(subhooks.annotateFrame.overlap.length, overlapList.length);

			for(var oIdx = 0; oIdx < subhooks.annotateFrame.overlap.length; oIdx++) {
				var targetOverlap = subhooks.annotateFrame.overlap[oIdx];
				var goldOverlap = overlapList[oIdx];

				assert.equal(targetOverlap.span.start, goldOverlap.start);
				assert.equal(targetOverlap.span.end, goldOverlap.end);

				var goldAObjId = goldOverlap.aList.split("-");
				assert.equal(targetOverlap.aObjList.length, goldAObjId.length, "span range from " + goldOverlap.start.toString() + " to " + goldOverlap.end.toString() + ", " + targetOverlap.aObjList.toString() + " vs. " + goldOverlap.aList);

			}
		});

		QUnit.skip("Test Basic AdjudicationProject AnnotateFrame", function(assert) {
			subhooks.anaforaProject0.setAnnotateFrame(subhooks.annotateFrame);
			subhooks.anaforaProject0.readFromXMLDOM(subhooks.annotator0XMLDOM, true);
			subhooks.anaforaProject1.setAnnotateFrame(subhooks.annotateFrame);
			subhooks.anaforaProject1.readFromXMLDOM(subhooks.annotator1XMLDOM, true);
			var adjudicationAnaforaProject = new AnaforaAdjudicationProject(hooks.schema, "ID185_clinic_543");
			adjudicationAnaforaProject.setAnnotateFrame(subhooks.annotateFrame);
			adjudicationAnaforaProject.addAnaforaProjectList({'adwi9965': subhooks.anaforaProject0, 'reganma': subhooks.anaforaProject1});
			adjudicationAnaforaProject.renderAnnotateFrame(undefined);

			var overlapList = calculateAnnotateFrame(adjudicationAnaforaProject);
			assert.equal(subhooks.annotateFrame.overlap.length, overlapList.length, "Compare Overlap Length");

			for(var oIdx = 0; oIdx < subhooks.annotateFrame.overlap.length; oIdx++) {
				var targetOverlap = subhooks.annotateFrame.overlap[oIdx];
				var goldOverlap = overlapList[oIdx];

				assert.equal(targetOverlap.span.start, goldOverlap.start, "Compare overlap span start");
				assert.equal(targetOverlap.span.end, goldOverlap.end, "Compare overlap span end");

				var goldAObjId = goldOverlap.aList.split("-");
				targetOverlap.aObjList.sort();

				assert.equal(targetOverlap.aObjList.length, goldAObjId.length, "span range from " + goldOverlap.start.toString() + " to " + goldOverlap.end.toString() + ", \n" + targetOverlap.aObjList.reduce(function (a,b) { return a.toString() + "-" + b.toString(); }) + " vs. \n" + goldOverlap.aList.toString());

			}
		});

		QUnit.test("Test Re-read AdjudicationProject AnnotateFrame", function(assert) {
			//subhooks.anaforaProject0.setAnnotateFrame(subhooks.annotateFrame);
			subhooks.anaforaProject0.readFromXMLDOM(subhooks.annotator0XMLDOM, true);
			//subhooks.anaforaProject1.setAnnotateFrame(subhooks.annotateFrame);
			subhooks.anaforaProject1.readFromXMLDOM(subhooks.annotator1XMLDOM, true);
			var adjudicationAnaforaProject = new AnaforaAdjudicationProject(hooks.schema, "ID185_clinic_543");
			//adjudicationAnaforaProject.setAnnotateFrame(subhooks.annotateFrame);
			adjudicationAnaforaProject.addAnaforaProjectList({'adwi9965': subhooks.anaforaProject0, 'reganma': subhooks.anaforaProject1});

			var adjXMLStr = adjudicationAnaforaProject.writeXML();
			var adjXMLDom = $.parseXML( adjXMLStr ) ;
			var newAdjudicationAnaforaProject = new AnaforaAdjudicationProject(hooks.schema, "ID185_clinic_543");
			newAdjudicationAnaforaProject.setAnnotateFrame(subhooks.annotateFrame);
			newAdjudicationAnaforaProject.readFromXMLDOM(adjXMLDom, ["adwi9965", "reganma"]);

			newAdjudicationAnaforaProject.renderAnnotateFrame(undefined);

			var overlapList = calculateAnnotateFrame(adjudicationAnaforaProject);
			assert.equal(subhooks.annotateFrame.overlap.length, overlapList.length, "Compare Overlap Length");

			for(var oIdx = 0; oIdx < subhooks.annotateFrame.overlap.length; oIdx++) {
				var targetOverlap = subhooks.annotateFrame.overlap[oIdx];
				var goldOverlap = overlapList[oIdx];

				assert.equal(targetOverlap.span.start, goldOverlap.start, "Compare overlap span start");
				assert.equal(targetOverlap.span.end, goldOverlap.end, "Compare overlap span end");

				var goldAObjId = goldOverlap.aList.split("-");
				targetOverlap.aObjList.sort();

				assert.equal(targetOverlap.aObjList.length, goldAObjId.length, "span range from " + goldOverlap.start.toString() + " to " + goldOverlap.end.toString() + ", \n" + targetOverlap.aObjList.reduce(function (a,b) { return a.toString() + "-" + b.toString(); }) + " vs. \n" + goldOverlap.aList.toString());

			}
		});
	});
});
