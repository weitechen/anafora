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
		var rawTextStr = $.ajax({ type: "GET", url: rawTextPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Raw Text: " + rawTextPath + " Error");  console.log(xhr.responseText);  }}).responseText;

		var htmlElement = $('<div>' + rawTextStr + '</div>');
		//.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\&/g, "&amp;") + '</div>');
		$("#attachElement").empty();
		$("#attachElement").append(htmlElement);
		hooks.htmlElement = htmlElement;
	});

	QUnit.module( "Test regular anafora project", function(subhooks) {
		subhooks.before( function() {
			var annotator0XMLPath = _setting.root_url + "/static/THYMEColonFinal/Train/ID185_clinic_543/ID185_clinic_543.Thyme2v1-Coreference.adwi9965.completed.xml";
			var annotator0XMLStr = $.ajax({ type: "GET", url: annotator0XMLPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Anafora XML File: " + annotator0XMLPath + " Error");  console.log(xhr.responseText);  }}).responseText;
			subhooks.annotator0XMLDOM = $.parseXML(annotator0XMLStr);
			subhooks.anaforaProject0 = new AnaforaProject(hooks.schema, "adwi9965", "ID185_clinic_543");

			subhooks.annotateFrame = new AnnotateFrame(hooks.htmlElement, _setting, hooks.htmlElement.text());
			subhooks.anaforaProject0.setAnnotateFrame(subhooks.annotateFrame);
			subhooks.anaforaProject0.readFromXMLDOM(subhooks.annotator0XMLDOM, true);
			subhooks.anaforaProject0.renderAnnotateFrame();

			/*
			var ansCSVPath = _setting.root_url + "/static/adjudication//ID185_clinic_543.csv";
			var ansCSVStr = $.ajax({ type: "GET", url: ansCSVPath, cache: false, async: false, error: function (xhr, ajaxOptions, thrownError) { console.log("Get Answer CSV File: " + ansCSVPath + " Error");  console.log(xhr.responseText);  }}).responseText;
			subhooks.ansCSVDict = parseAnsCSV(ansCSVStr);
			*/
		});

		QUnit.test("Test Basic AnnotateFrame", function(assert) {
			var positIndex = {};
			for(var eIdx in subhooks.anaforaProject0.entityList) {
				var entity = subhooks.anaforaProject0.entityList[eIdx];
				entity.span.forEach(function(subSpan) {
					for(var spanIdx = subSpan.start; spanIdx < subSpan.end; spanIdx++) {
						if(!(spanIdx in positIndex))
							positIndex[spanIdx] = [];
						positIndex[spanIdx].push(entity.id);
					}
				});

			}
			assert.equal(subhooks.annotateFrame.overlap.length, 30);
		});
	});
});
