module( "annotateFrame module", {
  setup: function() {
        this.schema = new Schema();

        var xmlSchemaText0 = $.ajax({
                type: "GET",
                url: "https://verbs.colorado.edu/~wech5560/anafora/annotate/schema/EVENTCoref/0/",
                cache: false,
                async: false}).responseText;

	var schemaJSON0 = $.parseJSON(xmlSchemaText0);
	var schemaXMLStr0 = schemaJSON0.schemaXML;
        var xmlSchemaDom0 = $.parseXML( schemaXMLStr0 );
        this.schema.parseSchemaXML(xmlSchemaDom0);

        var xmlSchemaText1 = $.ajax({
                type: "GET",
                url: "https://verbs.colorado.edu/~wech5560/anafora/annotate/schema/EVENTCoref/1/",
                cache: false,
                async: false}).responseText;

	var schemaJSON1 = $.parseJSON(xmlSchemaText1);
	var schemaXMLStr1 = schemaJSON1.schemaXML;
        var xmlSchemaDom1 = $.parseXML( schemaXMLStr1 );
        this.schema.parseSchemaXML(xmlSchemaDom1);

	var rawText = getRawText();
	var htmlElement = $('<div>' + rawText + '</div>');
//.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\&/g, "&amp;") + '</div>');
	$("#attachElement").empty();
	$("#attachElement").append(htmlElement);
	this.htmlElement = htmlElement

	this._setting = {
	
		schemaMap: "{&quot;PropBank&quot;: 0, &quot;Temporal&quot;: [&quot;Relation&quot;, &quot;Entity&quot;], &quot;EVENTCoref&quot;: 0, &quot;SHARPn&quot;: 0, &quot;Coreference&quot;: 0}",
		app_name: "annotate",
		isAdjudication: false,
		remoteUser: "wech5560",
		projectName: "Temporal",
		taskName: "ID005_clinic_013",
		schema: "Temporal.Entity",
		annotator: "wech5560",
		corpusName: "ColonCancer",
		root_url: "/~wech5560/anafora"
		};

	this.annotateFrame = new AnnotateFrame(htmlElement, this._setting, rawText);

	this.entityList = {};
	this.entityList[1] = new Entity("1@e@testtask@annotator", this.schema.getTypeByTypeName("EVENT"), [new SpanType(94,119)]);
	this.entityList[2] = new Entity("2@e@testtask@annotator", this.schema.getTypeByTypeName("TIMEX3"), [new SpanType(109,130)]);
	this.entityList[3] = new Entity("3@e@testtask@annotator", this.schema.getTypeByTypeName("EVENT"), [new SpanType(114,127)]);
	this.entityList[4] = new Entity("4@e@testtask@annotator", this.schema.getTypeByTypeName("EVENT"), [new SpanType(137,143)]);
	this.entityList[5] = new Entity("5@e@testtask@annotator", this.schema.getTypeByTypeName("EVENT"), [new SpanType(65,71)]);
	this.entityList[6] = new Entity("6@e@testtask@annotator", this.schema.getTypeByTypeName("EVENT"), [new SpanType(144,162)]);
	this.entityList[7] = new Entity("7@e@testtask@annotator", this.schema.getTypeByTypeName("EVENT"), [new SpanType(163, 168), new SpanType(177, 180)]);


	this.relationList = {};
	this.relationList[1] = new Relation("1@r@testtask@annotator", this.schema.getTypeByTypeName("Reporting"), [[this.entityList[1]], [this.entityList[3], this.entityList[4]]]);
	this.entityList[1].addLinkingAObj(this.relationList[1]);
	this.entityList[3].addLinkingAObj(this.relationList[1]);
	this.entityList[4].addLinkingAObj(this.relationList[1]);
  },
  loadAllAObjListToAnnotateFrame: function() {
	var _self = this;
	$.each(this.entityList, function(idx, entity) {
		_self.annotateFrame.updatePosIndex(entity);
	});

	$.each(this.relationList, function(idx, relation) {
		_self.annotateFrame.updatePosIndex(relation);
	});
  },
});

test( "add new annotation", function() {
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();

	
	// add annotation after the last annotation
	this.entityList[8] = new Entity("8@e@testtask@annotator", this.schema.getTypeByTypeName("TIMEX3"), [new SpanType(184, 188)]);

	this.annotateFrame.addEntity(this.entityList[8]);
	//this.annotateFrame.updatePosIndex(this.entityList[8]);
	//this.annotateFrame.updateOverlap(this.entityList[8]);

	equal(this.annotateFrame.spanElementList.length, 11);
	equal(this.annotateFrame.spanElementList[10].innerHTML, "Arab");
	equal(this.annotateFrame.spanElementList[10].className, "entity");
	equal($(this.annotateFrame.spanElementList[10]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("TIMEX3").color );
	equal(this.annotateFrame.overlap.length, 11);
	equal(this.annotateFrame.overlap[10].span.start, 184);
	equal(this.annotateFrame.overlap[10].span.end, 188);
	equal(this.annotateFrame.overlap[10].aObjList.length, 1);
	ok(this.annotateFrame.overlap[10].aObjList[0] == this.entityList[8]);
	equal(this.entityList[8].markElement.length, 1);
	ok(this.entityList[8].markElement[0] === this.annotateFrame.overlap[10]);

	// add one more annotation after the last annotation
	this.entityList[9] = new Entity("9@e@testtask@annotator", this.schema.getTypeByTypeName("TIMEX3"), [new SpanType(438, 446)]);
	this.annotateFrame.addEntity(this.entityList[9]);


	equal(this.annotateFrame.spanElementList.length, 12);
	equal(this.annotateFrame.spanElementList[11].innerHTML, "Al-Qaeda");
	equal(this.annotateFrame.spanElementList[11].className, "entity");
	equal($(this.annotateFrame.spanElementList[11]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("TIMEX3").color );
	equal(this.annotateFrame.overlap.length, 12);
	equal(this.annotateFrame.overlap[11].span.start, 438);
	equal(this.annotateFrame.overlap[11].span.end, 446);
	equal(this.annotateFrame.overlap[11].aObjList.length, 1);
	ok(this.annotateFrame.overlap[11].aObjList[0] == this.entityList[9]);
	equal(this.entityList[9].markElement.length, 1);
	ok(this.entityList[9].markElement[0] === this.annotateFrame.overlap[11]);

	// add the last word as annotation
	this.entityList[10] = new Entity("10@e@testtask@annotator", this.schema.getTypeByTypeName("TIMEX3"), [new SpanType(1742, 1747)]);
	this.annotateFrame.addEntity(this.entityList[10]);

	//this.annotateFrame.updatePosIndex(this.entityList[10]);
	//this.annotateFrame.updateOverlap(this.entityList[10]);

	equal(this.annotateFrame.spanElementList.length, 13);
	equal(this.annotateFrame.spanElementList[12].innerHTML, "year.");
	equal(this.annotateFrame.spanElementList[12].className, "entity");
	equal($(this.annotateFrame.spanElementList[12]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("TIMEX3").color );
	equal(this.annotateFrame.overlap.length, 13);
	equal(this.annotateFrame.overlap[12].span.start, 1742);
	equal(this.annotateFrame.overlap[12].span.end, 1747);
	equal(this.annotateFrame.overlap[12].aObjList.length, 1);
	ok(this.annotateFrame.overlap[12].aObjList[0] == this.entityList[10]);
	equal(this.entityList[10].markElement.length, 1);
	ok(this.entityList[10].markElement[0] === this.annotateFrame.overlap[12]);

	// add one annotation before the last annotation
	this.entityList[11] = new Entity("11@e@testtask@annotator", this.schema.getTypeByTypeName("TIMEX3"), [new SpanType(1731, 1736)]);
	this.annotateFrame.addEntity(this.entityList[11]);

	//this.annotateFrame.updatePosIndex(this.entityList[11]);
	//this.annotateFrame.updateOverlap(this.entityList[11]);

	equal(this.annotateFrame.spanElementList.length, 14);
	equal(this.annotateFrame.spanElementList[12].innerHTML, "March");
	equal(this.annotateFrame.spanElementList[12].className, "entity");
	equal($(this.annotateFrame.spanElementList[12]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("TIMEX3").color );
	equal(this.annotateFrame.overlap.length, 14);
	equal(this.annotateFrame.overlap[12].span.start, 1731);
	equal(this.annotateFrame.overlap[12].span.end, 1736);
	equal(this.annotateFrame.overlap[12].aObjList.length, 1);
	ok(this.annotateFrame.overlap[12].aObjList[0] == this.entityList[11]);
	equal(this.entityList[11].markElement.length, 1);
	ok(this.entityList[11].markElement[0] === this.annotateFrame.overlap[12]);

	// add one annotation before the first annotation
	this.entityList[12] = new Entity("12@e@testtask@annotator", this.schema.getTypeByTypeName("TIMEX3"), [new SpanType(53, 59)]);
	this.annotateFrame.addEntity(this.entityList[12]);

	//this.annotateFrame.updatePosIndex(this.entityList[12]);
	//this.annotateFrame.updateOverlap(this.entityList[12]);

	equal(this.annotateFrame.spanElementList.length, 15);
	equal(this.annotateFrame.spanElementList[0].innerHTML, "blasts");
	equal(this.annotateFrame.spanElementList[0].className, "entity");
	equal($(this.annotateFrame.spanElementList[0]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("TIMEX3").color );
	equal(this.annotateFrame.overlap.length, 15 );
	equal(this.annotateFrame.overlap[0].span.start, 53);
	equal(this.annotateFrame.overlap[0].span.end, 59);
	equal(this.annotateFrame.overlap[0].aObjList.length, 1);
	ok(this.annotateFrame.overlap[0].aObjList[0] == this.entityList[12]);
	equal(this.entityList[12].markElement.length, 1);
	ok(this.entityList[12].markElement[0] === this.annotateFrame.overlap[0]);

	// add one annotation at the first world
	this.entityList[13] = new Entity("13@e@testtask@annotator", this.schema.getTypeByTypeName("TIMEX3"), [new SpanType(0, 7)]);
	this.annotateFrame.addEntity(this.entityList[13]);

	//this.annotateFrame.updatePosIndex(this.entityList[13]);
	//this.annotateFrame.updateOverlap(this.entityList[13]);

	equal(this.annotateFrame.spanElementList.length, 16);
	equal(this.annotateFrame.spanElementList[0].innerHTML, "Kurdish");
	equal(this.annotateFrame.spanElementList[0].className, "entity");
	equal($(this.annotateFrame.spanElementList[0]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("TIMEX3").color );
	equal(this.annotateFrame.overlap.length, 16);
	equal(this.annotateFrame.overlap[0].span.start, 0);
	equal(this.annotateFrame.overlap[0].span.end, 7);
	equal(this.annotateFrame.overlap[0].aObjList.length, 1);
	ok(this.annotateFrame.overlap[0].aObjList[0] == this.entityList[13]);
	equal(this.entityList[13].markElement.length, 1);
	ok(this.entityList[13].markElement[0] === this.annotateFrame.overlap[0]);

	// create overlap annotation
	//// exact match current overlap span
	this.entityList[14] = new Entity("14@e@testtask@annotator", this.schema.getTypeByTypeName("TIMEX3"), [new SpanType(109, 113)]);
	this.annotateFrame.addEntity(this.entityList[14]);


	//this.annotateFrame.updatePosIndex(this.entityList[14]);
	//this.annotateFrame.updateOverlap(this.entityList[14]);

	equal(this.annotateFrame.spanElementList.length, 17);
	equal(this.annotateFrame.spanElementList[4].innerHTML, "that");
	equal(this.annotateFrame.spanElementList[4].className, "overlap multipleAObj");
	equal(this.annotateFrame.overlap.length, 17);
	equal(this.annotateFrame.overlap[4].span.start, 109);
	equal(this.annotateFrame.overlap[4].span.end, 113);
	equal(this.annotateFrame.overlap[4].aObjList.length, 4);
	ok(this.annotateFrame.overlap[4].aObjList[0] == this.entityList[14]);
	ok(this.annotateFrame.overlap[4].aObjList[1] == this.entityList[2]);
	ok(this.annotateFrame.overlap[4].aObjList[2] == this.entityList[1]);
	ok(this.annotateFrame.overlap[4].aObjList[3] == this.relationList[1]);
	equal(this.entityList[14].markElement.length, 1);
	ok(this.entityList[14].markElement[0] === this.annotateFrame.overlap[4]);
	
	equal(this.annotateFrame.spanElementList[5].innerHTML, " ");
	equal(this.annotateFrame.spanElementList[5].className, "overlap multipleAObj");
	equal(this.annotateFrame.overlap[5].span.start, 113);
	equal(this.annotateFrame.overlap[5].span.end, 114);
	equal(this.annotateFrame.overlap[5].aObjList.length, 3);
	ok(this.annotateFrame.overlap[5].aObjList[0] == this.entityList[2]);
	ok(this.annotateFrame.overlap[5].aObjList[1] == this.entityList[1]);
	ok(this.annotateFrame.overlap[5].aObjList[2] == this.relationList[1]);

	// across multiple overlap span
	this.entityList[15] = new Entity("15@e@testtask@annotator", this.schema.getTypeByTypeName("TIMEX3"), [new SpanType(116, 122)]);
	this.annotateFrame.addEntity(this.entityList[15]);

	//this.annotateFrame.updatePosIndex(this.entityList[15]);
	//this.annotateFrame.updateOverlap(this.entityList[15]);

	equal(this.annotateFrame.spanElementList.length, 19);
	equal(this.annotateFrame.spanElementList[7].innerHTML, "aqi");
	equal(this.annotateFrame.spanElementList[7].className, "overlap multipleAObj");
	equal(this.annotateFrame.overlap.length, 19);
	equal(this.annotateFrame.overlap[7].span.start, 116);
	equal(this.annotateFrame.overlap[7].span.end, 119);
	equal(this.annotateFrame.overlap[7].aObjList.length, 5);
	ok(this.annotateFrame.overlap[7].aObjList[0] == this.entityList[15]);
	ok(this.annotateFrame.overlap[7].aObjList[1] == this.entityList[3]);
	ok(this.annotateFrame.overlap[7].aObjList[2] == this.entityList[2]);
	ok(this.annotateFrame.overlap[7].aObjList[3] == this.entityList[1]);
	ok(this.annotateFrame.overlap[7].aObjList[4] == this.relationList[1]);
	equal(this.entityList[15].markElement.length, 2);
	ok(this.entityList[15].markElement[0] === this.annotateFrame.overlap[7]);
	ok(this.entityList[15].markElement[1] === this.annotateFrame.overlap[8]);
	
	equal(this.annotateFrame.spanElementList[8].innerHTML, " me");
	equal(this.annotateFrame.spanElementList[8].className, "overlap multipleAObj");
	equal(this.annotateFrame.overlap[8].span.start, 119);
	equal(this.annotateFrame.overlap[8].span.end, 122);
	equal(this.annotateFrame.overlap[8].aObjList.length, 4);
	ok(this.annotateFrame.overlap[8].aObjList[0] == this.entityList[15]);
	ok(this.annotateFrame.overlap[8].aObjList[1] == this.entityList[3]);
	ok(this.annotateFrame.overlap[8].aObjList[2] == this.entityList[2]);
	ok(this.annotateFrame.overlap[8].aObjList[3] == this.relationList[1]);

	equal(this.annotateFrame.spanElementList[6].innerHTML, "Ir");
	equal(this.annotateFrame.spanElementList[6].className, "overlap multipleAObj");
	equal(this.annotateFrame.overlap[6].span.start, 114);
	equal(this.annotateFrame.overlap[6].span.end, 116);
	equal(this.annotateFrame.overlap[6].aObjList.length, 4);

	equal(this.annotateFrame.spanElementList[9].innerHTML, "mbers");
	equal(this.annotateFrame.spanElementList[9].className, "overlap multipleAObj");
	equal(this.annotateFrame.overlap[9].span.start, 122);
	equal(this.annotateFrame.overlap[9].span.end, 127);
	equal(this.annotateFrame.overlap[9].aObjList.length, 3);
});

test( "delete annotation", function() {
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();

	//delete relation

	//this.annotateFrame.removeRelationPosit(this.relationList[1]);
	//var tRange = this.relationList[1].getSpanRange();
	//this.annotateFrame.updateOverlapRange(tRange[0], tRange[1]);
	this.annotateFrame.removeRelation(this.relationList[1]);
	this.relationList[1].destroy();

	
	equal(this.annotateFrame.overlap.length, 10);
	equal(this.annotateFrame.overlap[1].aObjList.length, 1);
	ok(this.annotateFrame.overlap[1].aObjList[0] === this.entityList[1]);
	equal(this.annotateFrame.overlap[2].aObjList.length, 2);
	ok(this.annotateFrame.overlap[2].aObjList[0] === this.entityList[2]);
	ok(this.annotateFrame.overlap[2].aObjList[1] === this.entityList[1]);
	equal(this.annotateFrame.overlap[3].aObjList.length, 3);
	ok(this.annotateFrame.overlap[3].aObjList[0] === this.entityList[3]);
	ok(this.annotateFrame.overlap[3].aObjList[1] === this.entityList[2]);
	ok(this.annotateFrame.overlap[3].aObjList[2] === this.entityList[1]);
	equal(this.annotateFrame.overlap[4].aObjList.length, 2);
	ok(this.annotateFrame.overlap[4].aObjList[0] === this.entityList[3]);
	ok(this.annotateFrame.overlap[4].aObjList[1] === this.entityList[2]);
	equal(this.annotateFrame.overlap[6].aObjList.length, 1);
	ok(this.annotateFrame.overlap[6].aObjList[0] === this.entityList[4]);

	// delete first annotation
	//this.annotateFrame.removeEntityPosit(this.entityList[5]);
	//this.annotateFrame.updateOverlap(this.entityList[5]);
	this.annotateFrame.removeEntity(this.entityList[5]);
	this.entityList[5].destroy();

	equal(this.annotateFrame.overlap.length, 9);
	equal(this.annotateFrame.overlap[0].aObjList.length, 1);
	ok(this.annotateFrame.overlap[0].aObjList[0] === this.entityList[1]);
	equal(this.annotateFrame.spanElementList.length, 9);
	equal(this.annotateFrame.spanElementList[0].innerHTML, "said Wednesday ");

	// delete last annotation
	//this.annotateFrame.removeEntityPosit(this.entityList[7]);
	//this.annotateFrame.updateOverlap(this.entityList[7]);
	this.annotateFrame.removeEntity(this.entityList[7]);
	this.entityList[7].destroy();

	equal(this.annotateFrame.overlap.length, 7);
	equal(this.annotateFrame.overlap[6].aObjList.length, 1);
	ok(this.annotateFrame.overlap[6].aObjList[0] === this.entityList[6]);
	equal(this.annotateFrame.spanElementList.length, 7);
	equal(this.annotateFrame.spanElementList[6].innerHTML, "&amp;quot;linked&amp;quot;");

	// delete overlap annotation
	//this.annotateFrame.removeEntityPosit(this.entityList[2]);
	//this.annotateFrame.updateOverlap(this.entityList[2]);
	this.annotateFrame.removeEntity(this.entityList[2]);
	this.entityList[2].destroy();

	equal(this.annotateFrame.overlap.length, 5);
	equal(this.annotateFrame.overlap[0].aObjList.length, 1);
	ok(this.annotateFrame.overlap[0].aObjList[0] === this.entityList[1]);
	equal(this.annotateFrame.overlap[0].span.start, 94);
	equal(this.annotateFrame.overlap[0].span.end, 114);
	equal(this.annotateFrame.overlap[1].aObjList.length, 2);
	ok(this.annotateFrame.overlap[1].aObjList[0] === this.entityList[3]);
	ok(this.annotateFrame.overlap[1].aObjList[1] === this.entityList[1]);
	equal(this.annotateFrame.overlap[1].span.start, 114);
	equal(this.annotateFrame.overlap[1].span.end, 119);
	equal(this.annotateFrame.overlap[2].aObjList.length, 1);
	ok(this.annotateFrame.overlap[2].aObjList[0] === this.entityList[3]);
	equal(this.annotateFrame.overlap[2].span.start, 119);
	equal(this.annotateFrame.overlap[2].span.end, 127);
	equal(this.annotateFrame.overlap[3].span.start, 137);
	equal(this.annotateFrame.overlap[3].span.end, 143);
	equal(this.annotateFrame.overlap[3].aObjList.length, 1);
	ok(this.annotateFrame.overlap[3].aObjList[0] == this.entityList[4]);
	equal(this.annotateFrame.spanElementList.length, 5);
	equal(this.annotateFrame.spanElementList[0].innerHTML, "said Wednesday that ");
});

test( "delete annotation with updating relation", function() {
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();

	// delete 3@e
	//this.annotateFrame.removeEntityPosit(this.entityList[3]);
	//this.annotateFrame.updateOverlap(this.entityList[3]);
	this.annotateFrame.removeEntity(this.entityList[3]);
	this.entityList[3].destroy();

	equal(this.annotateFrame.overlap.length, 8);
	equal(this.annotateFrame.overlap[1].aObjList.length, 2);
	ok(this.annotateFrame.overlap[1].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[1].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[1].span.start, 94);
	equal(this.annotateFrame.overlap[1].span.end, 109);
	equal(this.annotateFrame.overlap[2].aObjList.length, 3);
	ok(this.annotateFrame.overlap[2].aObjList[0] === this.entityList[2]);
	ok(this.annotateFrame.overlap[2].aObjList[1] === this.entityList[1]);
	ok(this.annotateFrame.overlap[2].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[2].span.start, 109);
	equal(this.annotateFrame.overlap[2].span.end, 119);
	equal(this.annotateFrame.overlap[3].aObjList.length, 1);
	ok(this.annotateFrame.overlap[3].aObjList[0] === this.entityList[2]);
	equal(this.annotateFrame.overlap[3].span.start, 119);
	equal(this.annotateFrame.overlap[3].span.end, 130);
	equal(this.annotateFrame.overlap[4].aObjList.length, 2);
	ok(this.annotateFrame.overlap[4].aObjList[0] === this.entityList[4]);
	ok(this.annotateFrame.overlap[4].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[4].span.start, 137);
	equal(this.annotateFrame.overlap[4].span.end, 143);
	equal(this.annotateFrame.spanElementList.length, 8);
	equal(this.annotateFrame.spanElementList[1].innerHTML, "said Wednesday ");
	equal(this.annotateFrame.spanElementList[2].innerHTML, "that Iraqi");
	equal(this.annotateFrame.spanElementList[3].innerHTML, " members of");
	equal(this.annotateFrame.spanElementList[4].innerHTML, "Qaeda-");

	equal(this.relationList[1].propertyList[1].length, 1);
	ok(this.relationList[1].propertyList[1][0] === this.entityList[4]);
});

test( "add entity span", function() {
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();

	// add span before first annotation
	var span0 = new SpanType(47, 52);
	this.entityList[1].addSpan(span0);
	this.annotateFrame.addSpan(span0, this.entityList[1]);
	//this.annotateFrame.updatePosIndex(this.entityList[1]);
	//this.annotateFrame.updateOverlap(this.entityList[1]);
	
	equal(this.annotateFrame.overlap.length, 11);
	equal(this.annotateFrame.overlap[0].aObjList.length, 2);
	ok(this.annotateFrame.overlap[0].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[0].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[0].span.start, 47);
	equal(this.annotateFrame.overlap[0].span.end, 52);
	
	equal(this.annotateFrame.spanElementList.length, 11);
	equal(this.annotateFrame.spanElementList[0].innerHTML, "Arbil");
	equal(this.annotateFrame.spanElementList[1].innerHTML, "Iraqis");
	equal(this.annotateFrame.spanElementList[2].innerHTML, "said Wednesday ");
	equal(this.annotateFrame.spanElementList[0].className, "entity multipleAObj");

	equal(this.entityList[1].markElement.length, 4);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[0])>=0);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[2])>=0);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[3])>=0);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[4])>=0);

	// add span after the last annotation
	var span1 = new SpanType(184, 188);
	this.entityList[2].addSpan(span1);
	this.annotateFrame.addSpan(span1, this.entityList[2]);
	//this.annotateFrame.updatePosIndex(this.entityList[2]);
	//this.annotateFrame.updateOverlap(this.entityList[2]);

	equal(this.annotateFrame.overlap.length, 12);
	equal(this.annotateFrame.overlap[11].aObjList.length, 1);
	ok(this.annotateFrame.overlap[11].aObjList[0] === this.entityList[2]);
	equal(this.annotateFrame.overlap[10].span.start, 177);
	equal(this.annotateFrame.overlap[10].span.end, 180);
	equal(this.annotateFrame.overlap[11].span.start, 184);
	equal(this.annotateFrame.overlap[11].span.end, 188);
	
	equal(this.annotateFrame.spanElementList.length, 12);
	equal(this.annotateFrame.spanElementList[10].innerHTML, "and");
	equal(this.annotateFrame.spanElementList[11].innerHTML, "Arab");
	equal(this.annotateFrame.spanElementList[11].className, "entity");
	equal(this.entityList[2].markElement.length, 5);
	ok(this.entityList[2].markElement[0] === this.annotateFrame.overlap[3]);
	ok(this.entityList[2].markElement[1] === this.annotateFrame.overlap[4]);
	ok(this.entityList[2].markElement[2] === this.annotateFrame.overlap[5]);
	ok(this.entityList[2].markElement[3] === this.annotateFrame.overlap[6]);
	ok(this.entityList[2].markElement[4] === this.annotateFrame.overlap[11]);

	// add span between annotation

	var span2 = new SpanType(125, 129);
	this.entityList[1].addSpan(span2);
	this.annotateFrame.addSpan(span2, this.entityList[1]);
	//this.annotateFrame.updatePosIndex(this.entityList[1]);
	//this.annotateFrame.updateOverlap(this.entityList[1]);
	equal(this.annotateFrame.overlap.length, 14);
	equal(this.annotateFrame.overlap[5].aObjList.length, 3);
	ok(this.annotateFrame.overlap[5].aObjList[0] === this.entityList[3]);
	ok(this.annotateFrame.overlap[5].aObjList[1] === this.entityList[2]);
	ok(this.annotateFrame.overlap[5].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[5].span.start, 119);
	equal(this.annotateFrame.overlap[5].span.end, 125);
	equal(this.annotateFrame.overlap[6].aObjList.length, 4);
	ok(this.annotateFrame.overlap[6].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[6].aObjList[1] === this.entityList[3]);
	ok(this.annotateFrame.overlap[6].aObjList[2] === this.entityList[2]);
	ok(this.annotateFrame.overlap[6].aObjList[3] === this.relationList[1]);
	equal(this.annotateFrame.overlap[6].span.start, 125);
	equal(this.annotateFrame.overlap[6].span.end, 127);
	equal(this.annotateFrame.overlap[7].aObjList.length, 3);
	ok(this.annotateFrame.overlap[7].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[7].aObjList[1] === this.entityList[2]);
	ok(this.annotateFrame.overlap[7].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[7].span.start, 127);
	equal(this.annotateFrame.overlap[7].span.end, 129);
	equal(this.annotateFrame.overlap[8].aObjList.length, 1);
	ok(this.annotateFrame.overlap[8].aObjList[0] === this.entityList[2]);
	equal(this.annotateFrame.overlap[8].span.start, 129);
	equal(this.annotateFrame.overlap[8].span.end, 130);
	equal(this.annotateFrame.spanElementList.length, 14);
	equal(this.annotateFrame.spanElementList[5].innerHTML, " membe")
	equal(this.annotateFrame.spanElementList[5].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[6].innerHTML, "rs");
	equal(this.annotateFrame.spanElementList[6].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[7].innerHTML, " o")
	equal(this.annotateFrame.spanElementList[7].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[8].innerHTML, "f");
	equal(this.annotateFrame.spanElementList[8].className, "entity");
	equal(this.entityList[1].markElement.length, 6);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[0])>=0);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[2])>=0);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[3])>=0);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[4])>=0);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[6])>=0);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[7])>=0);
	equal(this.entityList[2].markElement.length, 7);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[3])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[4])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[5])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[6])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[7])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[8])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[13])>=0);
	equal(this.entityList[3].markElement.length, 3);
	ok(this.entityList[3].markElement.indexOf(this.annotateFrame.overlap[4])>=0);
	ok(this.entityList[3].markElement.indexOf(this.annotateFrame.overlap[5])>=0);
	ok(this.entityList[3].markElement.indexOf(this.annotateFrame.overlap[6])>=0);
	equal(this.relationList[1].markElement.length, 8);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[0])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[2])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[3])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[4])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[5])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[6])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[9])>=0);

	var span3 = new SpanType(140, 150);
	this.entityList[2].addSpan(span3);
	this.annotateFrame.addSpan(span3, this.entityList[2]);
	//this.annotateFrame.updatePosIndex(this.entityList[2]);
	//this.annotateFrame.updateOverlap(this.entityList[2]);
	equal(this.annotateFrame.overlap.length, 17);
	equal(this.annotateFrame.overlap[9].aObjList.length, 2);
	ok(this.annotateFrame.overlap[9].aObjList[0] === this.entityList[4]);
	ok(this.annotateFrame.overlap[9].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[9].span.start, 137);
	equal(this.annotateFrame.overlap[9].span.end, 140);
	equal(this.annotateFrame.overlap[10].aObjList.length, 3);
	ok(this.annotateFrame.overlap[10].aObjList[0] === this.entityList[2]);
	ok(this.annotateFrame.overlap[10].aObjList[1] === this.entityList[4]);
	ok(this.annotateFrame.overlap[10].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[10].span.start, 140);
	equal(this.annotateFrame.overlap[10].span.end, 143);
	equal(this.annotateFrame.overlap[11].aObjList.length, 1);
	ok(this.annotateFrame.overlap[11].aObjList[0] === this.entityList[2]);
	equal(this.annotateFrame.overlap[11].span.start, 143);
	equal(this.annotateFrame.overlap[11].span.end, 144);
	equal(this.annotateFrame.overlap[12].aObjList.length, 2);
	ok(this.annotateFrame.overlap[12].aObjList[0] === this.entityList[2]);
	ok(this.annotateFrame.overlap[12].aObjList[1] === this.entityList[6]);
	equal(this.annotateFrame.overlap[12].span.start, 144);
	equal(this.annotateFrame.overlap[12].span.end, 150);
	equal(this.annotateFrame.overlap[13].aObjList.length, 1);
	ok(this.annotateFrame.overlap[13].aObjList[0] === this.entityList[6]);
	equal(this.annotateFrame.overlap[13].span.start, 150);
	equal(this.annotateFrame.overlap[13].span.end, 162);
	equal(this.annotateFrame.spanElementList.length, 17);
	equal(this.annotateFrame.spanElementList[9].innerHTML, "Qae");
	equal(this.annotateFrame.spanElementList[9].className, "entity multipleAObj");
	equal(this.annotateFrame.spanElementList[10].innerHTML, "da-");
	equal(this.annotateFrame.spanElementList[10].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[11].innerHTML, " ");
	equal(this.annotateFrame.spanElementList[11].className, "entity");
	equal(this.annotateFrame.spanElementList[12].innerHTML, "&amp;quot;");
	equal(this.annotateFrame.spanElementList[12].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[13].innerHTML, "linked&amp;quot;");
	equal(this.annotateFrame.spanElementList[13].className, "entity");
	equal(this.entityList[2].markElement.length, 10);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[3])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[4])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[5])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[6])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[7])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[8])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[10])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[11])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[12])>=0);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[16])>=0);
	equal(this.entityList[4].markElement.length, 2);
	ok(this.entityList[4].markElement.indexOf(this.annotateFrame.overlap[9])>=0);
	ok(this.entityList[4].markElement.indexOf(this.annotateFrame.overlap[10])>=0);
	equal(this.entityList[6].markElement.length, 2);
	ok(this.entityList[6].markElement.indexOf(this.annotateFrame.overlap[12])>=0);
	ok(this.entityList[6].markElement.indexOf(this.annotateFrame.overlap[13])>=0);
	equal(this.relationList[1].markElement.length, 9);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[0])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[2])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[3])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[4])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[5])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[6])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[7])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[9])>=0);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[10])>=0);
});

test( "remove entity span", function() {
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();

	// remove first entity span
	var span0 = new SpanType(47, 52);
	this.entityList[1].addSpan(span0);
	this.annotateFrame.addSpan(span0, this.entityList[1]);
	
	var removeSpan = this.entityList[1].span[0];
	this.entityList[1].removeSpan(0);
	this.annotateFrame.removeSpan(removeSpan, this.entityList[1]);

	equal(this.annotateFrame.overlap.length, 10);
	equal(this.annotateFrame.overlap[0].aObjList.length, 1);
	ok(this.annotateFrame.overlap[0].aObjList[0] === this.entityList[5]);
	equal(this.annotateFrame.overlap[0].span.start, 65);
	equal(this.annotateFrame.overlap[0].span.end, 71);
	
	equal(this.annotateFrame.spanElementList.length, 10);
	equal(this.annotateFrame.spanElementList[0].innerHTML, "Iraqis");
	equal(this.annotateFrame.spanElementList[0].className, "entity");

	equal(this.entityList[1].markElement.length, 3);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[1])>=0);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[2])>=0);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[3])>=0);

	// remove the last annotation
	var span1 = new SpanType(184, 188);
	this.entityList[2].addSpan(span1);
	this.annotateFrame.addSpan(span1, this.entityList[2]);

	removeSpan = this.entityList[2].span[1];
	this.entityList[2].removeSpan(1);
	this.annotateFrame.removeSpan(removeSpan, this.entityList[2]);

	equal(this.annotateFrame.overlap.length, 10);
	equal(this.annotateFrame.overlap[9].aObjList.length, 1);
	ok(this.annotateFrame.overlap[9].aObjList[0] === this.entityList[7]);
	
	equal(this.annotateFrame.spanElementList.length, 10);
	equal(this.annotateFrame.spanElementList[9].innerHTML, "and");
	equal(this.annotateFrame.spanElementList[9].className, "entity");
	equal(this.entityList[2].markElement.length, 4);
	ok(this.entityList[2].markElement[0] === this.annotateFrame.overlap[2]);
	ok(this.entityList[2].markElement[1] === this.annotateFrame.overlap[3]);
	ok(this.entityList[2].markElement[2] === this.annotateFrame.overlap[4]);
	ok(this.entityList[2].markElement[3] === this.annotateFrame.overlap[5]);

	removeSpan = this.entityList[7].span[1];
	this.entityList[7].removeSpan(1);
	this.annotateFrame.removeSpan(removeSpan, this.entityList[7]);
	equal(this.annotateFrame.spanElementList.length, 9);
	equal(this.annotateFrame.spanElementList[8].innerHTML, "group");
	equal(this.annotateFrame.spanElementList[8].className, "entity");
	equal(this.entityList[7].markElement.length, 1);
	ok(this.entityList[7].markElement[0] === this.annotateFrame.overlap[8]);

	// remove overlap annotation
	var span2 = new SpanType(125, 129);
	this.entityList[1].addSpan(span2);
	this.annotateFrame.addSpan(span2, this.entityList[1]);
	removeSpan = this.entityList[1].span[0];
	this.entityList[1].removeSpan(0);
	this.annotateFrame.removeSpan(removeSpan, this.entityList[1]);

	equal(this.annotateFrame.overlap.length, 9);
	equal(this.annotateFrame.overlap[1].aObjList.length, 1);
	ok(this.annotateFrame.overlap[1].aObjList[0] === this.entityList[2]);
	equal(this.annotateFrame.overlap[1].span.start, 109);
	equal(this.annotateFrame.overlap[1].span.end, 114);
	equal(this.annotateFrame.overlap[2].aObjList.length, 3);
	ok(this.annotateFrame.overlap[2].aObjList[0] === this.entityList[3]);
	ok(this.annotateFrame.overlap[2].aObjList[1] === this.entityList[2]);
	ok(this.annotateFrame.overlap[2].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[2].span.start, 114);
	equal(this.annotateFrame.overlap[2].span.end, 125);
	equal(this.annotateFrame.overlap[3].aObjList.length, 4);
	ok(this.annotateFrame.overlap[3].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[3].aObjList[1] === this.entityList[3]);
	ok(this.annotateFrame.overlap[3].aObjList[2] === this.entityList[2]);
	ok(this.annotateFrame.overlap[3].aObjList[3] === this.relationList[1]);
	equal(this.annotateFrame.overlap[3].span.start, 125);
	equal(this.annotateFrame.overlap[3].span.end, 127);
	equal(this.annotateFrame.overlap[4].aObjList.length, 3);
	ok(this.annotateFrame.overlap[4].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[4].aObjList[1] === this.entityList[2]);
	ok(this.annotateFrame.overlap[4].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[4].span.start, 127);
	equal(this.annotateFrame.overlap[4].span.end, 129);
	equal(this.annotateFrame.overlap[5].aObjList.length, 1);
	ok(this.annotateFrame.overlap[5].aObjList[0] === this.entityList[2]);
	equal(this.annotateFrame.overlap[5].span.start, 129);
	equal(this.annotateFrame.overlap[5].span.end, 130);
	equal(this.annotateFrame.spanElementList.length, 9);
	equal(this.annotateFrame.spanElementList[1].innerHTML, "that ");
	equal(this.annotateFrame.spanElementList[1].className, "entity");
	equal(this.annotateFrame.spanElementList[2].innerHTML, "Iraqi membe");
	equal(this.annotateFrame.spanElementList[2].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[3].innerHTML, "rs");
	equal(this.annotateFrame.spanElementList[3].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[4].innerHTML, " o");
	equal(this.annotateFrame.spanElementList[4].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[5].innerHTML, "f");
	equal(this.annotateFrame.spanElementList[5].className, "entity");

	equal(this.entityList[1].markElement.length, 2);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[4]) > -1);
	
	var span3 = new SpanType(140, 150);
	this.entityList[2].addSpan(span3);
	this.annotateFrame.addSpan(span3, this.entityList[2]);
	removeSpan = this.entityList[2].span[0];
	this.entityList[2].removeSpan(0);
	this.annotateFrame.removeSpan(removeSpan, this.entityList[2]);

	equal(this.annotateFrame.overlap.length, 10);
	equal(this.annotateFrame.overlap[1].aObjList.length, 2);
	ok(this.annotateFrame.overlap[1].aObjList[0] === this.entityList[3]);
	ok(this.annotateFrame.overlap[1].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[1].span.start, 114);
	equal(this.annotateFrame.overlap[1].span.end, 125);
	equal(this.annotateFrame.overlap[2].aObjList.length, 3);
	ok(this.annotateFrame.overlap[2].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[2].aObjList[1] === this.entityList[3]);
	ok(this.annotateFrame.overlap[2].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[2].span.start, 125);
	equal(this.annotateFrame.overlap[2].span.end, 127);
	equal(this.annotateFrame.overlap[3].aObjList.length, 2);
	ok(this.annotateFrame.overlap[3].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[3].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[3].span.start, 127);
	equal(this.annotateFrame.overlap[3].span.end, 129);
	equal(this.annotateFrame.overlap[4].aObjList.length, 2);
	ok(this.annotateFrame.overlap[4].aObjList[0] === this.entityList[4]);
	ok(this.annotateFrame.overlap[4].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[4].span.start, 137);
	equal(this.annotateFrame.overlap[4].span.end, 140);
	equal(this.annotateFrame.overlap[5].aObjList.length, 3);
	ok(this.annotateFrame.overlap[5].aObjList[0] === this.entityList[2]);
	ok(this.annotateFrame.overlap[5].aObjList[1] === this.entityList[4]);
	ok(this.annotateFrame.overlap[5].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[5].span.start, 140);
	equal(this.annotateFrame.overlap[5].span.end, 143);
	equal(this.annotateFrame.overlap[6].aObjList.length, 1);
	ok(this.annotateFrame.overlap[6].aObjList[0] === this.entityList[2]);
	equal(this.annotateFrame.overlap[6].span.start, 143);
	equal(this.annotateFrame.overlap[6].span.end, 144);
	equal(this.annotateFrame.overlap[7].aObjList.length, 2);
	ok(this.annotateFrame.overlap[7].aObjList[0] === this.entityList[2]);
	ok(this.annotateFrame.overlap[7].aObjList[1] === this.entityList[6]);
	equal(this.annotateFrame.overlap[7].span.start, 144);
	equal(this.annotateFrame.overlap[7].span.end, 150);
	equal(this.annotateFrame.overlap[8].aObjList.length, 1);
	ok(this.annotateFrame.overlap[8].aObjList[0] === this.entityList[6]);
	equal(this.annotateFrame.overlap[8].span.start, 150);
	equal(this.annotateFrame.overlap[8].span.end, 162);

	equal(this.annotateFrame.spanElementList.length, 10);
	equal(this.annotateFrame.spanElementList[1].innerHTML, "Iraqi membe");
	equal(this.annotateFrame.spanElementList[1].className, "entity multipleAObj");
	equal(this.annotateFrame.spanElementList[2].innerHTML, "rs");
	equal(this.annotateFrame.spanElementList[2].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[3].innerHTML, " o");
	equal(this.annotateFrame.spanElementList[3].className, "entity multipleAObj");
	equal(this.annotateFrame.spanElementList[4].innerHTML, "Qae");
	equal(this.annotateFrame.spanElementList[4].className, "entity multipleAObj");
	equal(this.annotateFrame.spanElementList[5].innerHTML, "da-");
	equal(this.annotateFrame.spanElementList[5].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[6].innerHTML, " ");
	equal(this.annotateFrame.spanElementList[6].className, "entity");
	equal(this.annotateFrame.spanElementList[7].innerHTML, "&amp;quot;");
	equal(this.annotateFrame.spanElementList[7].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[8].innerHTML, "linked&amp;quot;");
	equal(this.annotateFrame.spanElementList[8].className, "entity");

	equal(this.entityList[2].markElement.length, 3);
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[5]) > -1 );
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[6]) > -1 );
	ok(this.entityList[2].markElement.indexOf(this.annotateFrame.overlap[7]) > -1);
});

test( "modify span range", function() {
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();
	
	// 3@entity step ahead one position
	this.entityList[3].span[0].start = 113;
	var addSpan = new SpanType(113, 114);
	this.annotateFrame.addSpan(addSpan, this.entityList[3]);

	equal(this.annotateFrame.overlap.length, 10);
	equal(this.annotateFrame.overlap[2].aObjList.length, 3);
	ok(this.annotateFrame.overlap[2].aObjList[0] === this.entityList[2]);
	ok(this.annotateFrame.overlap[2].aObjList[1] === this.entityList[1]);
	ok(this.annotateFrame.overlap[2].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[2].span.start, 109);
	equal(this.annotateFrame.overlap[2].span.end, 113);
	equal(this.annotateFrame.overlap[3].aObjList.length, 4);
	ok(this.annotateFrame.overlap[3].aObjList[0] === this.entityList[3]);
	ok(this.annotateFrame.overlap[3].aObjList[1] === this.entityList[2]);
	ok(this.annotateFrame.overlap[3].aObjList[2] === this.entityList[1]);
	ok(this.annotateFrame.overlap[3].aObjList[3] === this.relationList[1]);
	equal(this.annotateFrame.overlap[3].span.start, 113);
	equal(this.annotateFrame.overlap[3].span.end, 119);

	equal(this.annotateFrame.spanElementList.length, 10);
	equal(this.annotateFrame.spanElementList[2].innerHTML, "that");
	equal(this.annotateFrame.spanElementList[2].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[3].innerHTML, " Iraqi");
	equal(this.annotateFrame.spanElementList[3].className, "overlap multipleAObj");

	equal(this.entityList[3].markElement.length, 2);
	ok(this.entityList[3].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );
	ok(this.entityList[3].markElement.indexOf(this.annotateFrame.overlap[4]) > -1 );

	equal(this.relationList[1].markElement.length, 5);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[2]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[4]) > -1 );

	// 4@entity step ahead one position
	this.entityList[4].span[0].end = 144;
	var addSpan = new SpanType(143, 144);
	this.annotateFrame.addSpan(addSpan, this.entityList[4]);
	equal(this.annotateFrame.overlap.length, 10);
	equal(this.annotateFrame.overlap[6].aObjList.length, 2);
	ok(this.annotateFrame.overlap[6].aObjList[0] === this.entityList[4]);
	ok(this.annotateFrame.overlap[6].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[6].span.start, 137);
	equal(this.annotateFrame.overlap[6].span.end, 144);
	equal(this.annotateFrame.overlap[7].aObjList.length, 1);
	ok(this.annotateFrame.overlap[7].aObjList[0] === this.entityList[6]);
	equal(this.annotateFrame.overlap[7].span.start, 144);
	equal(this.annotateFrame.overlap[7].span.end, 162);
	equal(this.annotateFrame.spanElementList.length, 10);
	equal(this.annotateFrame.spanElementList[6].innerHTML, "Qaeda- ");
	equal(this.annotateFrame.spanElementList[6].className, "entity multipleAObj");
	equal(this.annotateFrame.spanElementList[7].innerHTML, "&amp;quot;linked&amp;quot;");
	equal(this.annotateFrame.spanElementList[7].className, "entity");

	equal(this.entityList[4].markElement.length, 1);
	ok(this.entityList[4].markElement.indexOf(this.annotateFrame.overlap[6]) > -1 );

	equal(this.relationList[1].markElement.length, 5);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[2]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[4]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[6]) > -1 );
	
	// 4@e step back one more
	this.entityList[4].span[0].end = 145;
	var addSpan = new SpanType(144, 145);
	this.annotateFrame.addSpan(addSpan, this.entityList[4]);
	equal(this.annotateFrame.overlap.length, 11);
	equal(this.annotateFrame.overlap[6].aObjList.length, 2);
	ok(this.annotateFrame.overlap[6].aObjList[0] === this.entityList[4]);
	ok(this.annotateFrame.overlap[6].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[6].span.start, 137);
	equal(this.annotateFrame.overlap[6].span.end, 144);
	equal(this.annotateFrame.overlap[7].aObjList.length, 3);
	ok(this.annotateFrame.overlap[7].aObjList[0] === this.entityList[4]);
	ok(this.annotateFrame.overlap[7].aObjList[1] === this.entityList[6]);
	ok(this.annotateFrame.overlap[7].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[7].span.start, 144);
	equal(this.annotateFrame.overlap[7].span.end, 145);
	equal(this.annotateFrame.overlap[8].aObjList.length, 1);
	ok(this.annotateFrame.overlap[8].aObjList[0] === this.entityList[6]);
	equal(this.annotateFrame.overlap[8].span.start, 145);
	equal(this.annotateFrame.overlap[8].span.end, 162);
	equal(this.annotateFrame.spanElementList.length, 11);
	equal(this.annotateFrame.spanElementList[6].innerHTML, "Qaeda- ");
	equal(this.annotateFrame.spanElementList[6].className, "entity multipleAObj");
	equal(this.annotateFrame.spanElementList[7].innerHTML, "&amp;");
	equal(this.annotateFrame.spanElementList[7].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[8].innerHTML, "quot;linked&amp;quot;");
	equal(this.annotateFrame.spanElementList[8].className, "entity");

	equal(this.entityList[4].markElement.length, 2);
	ok(this.entityList[4].markElement.indexOf(this.annotateFrame.overlap[6]) > -1 );
	ok(this.entityList[4].markElement.indexOf(this.annotateFrame.overlap[7]) > -1 );

	equal(this.relationList[1].markElement.length, 6);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[2]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[4]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[6]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[7]) > -1 );

	equal(this.entityList[6].markElement.length, 2);
	ok(this.entityList[6].markElement.indexOf(this.annotateFrame.overlap[7]) > -1 );
	ok(this.entityList[6].markElement.indexOf(this.annotateFrame.overlap[8]) > -1 );

	// 1@e step ahead
	for(var i=93;i>=64;i--) {

		this.entityList[1].span[0].start = i;
		addSpan = new SpanType(i, i+1);
		this.annotateFrame.addSpan(addSpan, this.entityList[1]);
	}

	equal(this.annotateFrame.overlap.length, 12);
	equal(this.annotateFrame.overlap[0].aObjList.length, 2);
	ok(this.annotateFrame.overlap[0].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[0].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[0].span.start, 64);
	equal(this.annotateFrame.overlap[0].span.end, 65);
	equal(this.annotateFrame.overlap[1].aObjList.length, 3);
	ok(this.annotateFrame.overlap[1].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[1].aObjList[1] === this.entityList[5]);
	ok(this.annotateFrame.overlap[1].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[1].span.start, 65);
	equal(this.annotateFrame.overlap[1].span.end, 71);
	equal(this.annotateFrame.overlap[2].aObjList.length, 2);
	ok(this.annotateFrame.overlap[2].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[2].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[2].span.start, 71);
	equal(this.annotateFrame.overlap[2].span.end, 109);

	equal(this.annotateFrame.spanElementList[0].innerHTML, " ");
	equal(this.annotateFrame.spanElementList[0].className, "entity multipleAObj");
	equal(this.annotateFrame.spanElementList[1].innerHTML, "Iraqis");
	equal(this.annotateFrame.spanElementList[1].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[2].innerHTML, "\n\n\nA Kurdish newspaper said Wednesday ");
	equal(this.annotateFrame.spanElementList[2].className, "entity multipleAObj");
	equal(this.relationList[1].markElement.length, 8);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[0]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[2]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[4]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[5]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[7]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[8]) > -1 );

	equal(this.entityList[1].markElement.length, 5);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[0]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[2]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[4]) > -1 );

	equal(this.entityList[5].markElement.length, 1);
	ok(this.entityList[5].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );

	// 1@e step back
	this.entityList[1].span[0].start = 65;
	var removeSpan = new SpanType(64, 65);
	this.annotateFrame.removeSpan(removeSpan, this.entityList[1]);

	equal(this.annotateFrame.overlap.length, 11);
	equal(this.annotateFrame.overlap[0].aObjList.length, 3);
	ok(this.annotateFrame.overlap[0].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[0].aObjList[1] === this.entityList[5]);
	ok(this.annotateFrame.overlap[0].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[0].span.start, 65);
	equal(this.annotateFrame.overlap[0].span.end, 71);
	equal(this.annotateFrame.overlap[1].aObjList.length, 2);
	ok(this.annotateFrame.overlap[1].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[1].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[1].span.start, 71);
	equal(this.annotateFrame.overlap[1].span.end, 109);

	equal(this.annotateFrame.spanElementList[0].innerHTML, "Iraqis");
	equal(this.annotateFrame.spanElementList[0].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[1].innerHTML, "\n\n\nA Kurdish newspaper said Wednesday ");
	equal(this.annotateFrame.spanElementList[1].className, "entity multipleAObj");
	equal(this.relationList[1].markElement.length, 7);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[0]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[2]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[4]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[6]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[7]) > -1 );

	equal(this.entityList[1].markElement.length, 4);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[0]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[2]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );

	equal(this.entityList[5].markElement.length, 1);
	ok(this.entityList[5].markElement.indexOf(this.annotateFrame.overlap[0]) > -1 );

	// 1@e step back
	this.entityList[1].span[0].start = 66;;
	var removeSpan = new SpanType(65, 66);
	this.annotateFrame.removeSpan(removeSpan, this.entityList[1]);

	equal(this.annotateFrame.overlap[0].aObjList.length, 1);
	ok(this.annotateFrame.overlap[0].aObjList[0] === this.entityList[5]);
	equal(this.annotateFrame.overlap[0].span.start, 65);
	equal(this.annotateFrame.overlap[0].span.end, 66);
	equal(this.annotateFrame.overlap[1].aObjList.length, 3);
	ok(this.annotateFrame.overlap[1].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[1].aObjList[1] === this.entityList[5]);
	ok(this.annotateFrame.overlap[1].aObjList[2] === this.relationList[1]);
	equal(this.annotateFrame.overlap[1].span.start, 66);
	equal(this.annotateFrame.overlap[1].span.end, 71);
	equal(this.annotateFrame.overlap[2].aObjList.length, 2);
	ok(this.annotateFrame.overlap[2].aObjList[0] === this.entityList[1]);
	ok(this.annotateFrame.overlap[2].aObjList[1] === this.relationList[1]);
	equal(this.annotateFrame.overlap[2].span.start, 71);
	equal(this.annotateFrame.overlap[2].span.end, 109);

	equal(this.annotateFrame.spanElementList[0].innerHTML, "I");
	equal(this.annotateFrame.spanElementList[0].className, "entity");
	equal(this.annotateFrame.spanElementList[1].innerHTML, "raqis");
	equal(this.annotateFrame.spanElementList[1].className, "overlap multipleAObj");
	equal(this.annotateFrame.spanElementList[2].innerHTML, "\n\n\nA Kurdish newspaper said Wednesday ");
	equal(this.annotateFrame.spanElementList[2].className, "entity multipleAObj");
	equal(this.relationList[1].markElement.length, 7);
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[2]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[4]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[5]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[7]) > -1 );
	ok(this.relationList[1].markElement.indexOf(this.annotateFrame.overlap[8]) > -1 );

	equal(this.entityList[1].markElement.length, 4);
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[2]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[3]) > -1 );
	ok(this.entityList[1].markElement.indexOf(this.annotateFrame.overlap[4]) > -1 );

	equal(this.entityList[5].markElement.length, 2);
	ok(this.entityList[5].markElement.indexOf(this.annotateFrame.overlap[0]) > -1 );
	ok(this.entityList[5].markElement.indexOf(this.annotateFrame.overlap[1]) > -1 );
});

test( "test updateAnnotateFragement", function() {
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();

	var newOverlapList = this.annotateFrame.overlap.slice(3,5);

	this.annotateFrame.updateAnnotateFragement(newOverlapList, undefined, [2, 5]);

	equal(this.annotateFrame.overlap[2].span.start, 109);
	equal(this.annotateFrame.overlap[2].span.end, 114);
	equal(this.annotateFrame.overlap[2].aObjList.length, 3);
	ok(this.annotateFrame.overlap[2].aObjList[0] == this.entityList[2]);
	ok(this.annotateFrame.overlap[2].aObjList[1] == this.entityList[1]);
	ok(this.annotateFrame.overlap[2].aObjList[2] == this.relationList[1]);
	equal(this.annotateFrame.overlap[3].span.start, 114);
	equal(this.annotateFrame.overlap[3].span.end, 119);
	equal(this.annotateFrame.overlap[3].aObjList.length, 4);
	ok(this.annotateFrame.overlap[3].aObjList[0] == this.entityList[3]);
	ok(this.annotateFrame.overlap[3].aObjList[1] == this.entityList[2]);
	ok(this.annotateFrame.overlap[3].aObjList[2] == this.entityList[1]);
	ok(this.annotateFrame.overlap[3].aObjList[3] == this.relationList[1]);
	equal(this.annotateFrame.overlap[4].span.start, 119);
	equal(this.annotateFrame.overlap[4].span.end, 127);
	equal(this.annotateFrame.overlap[4].aObjList.length, 3);
	ok(this.annotateFrame.overlap[4].aObjList[0] == this.entityList[3]);
	ok(this.annotateFrame.overlap[4].aObjList[1] == this.entityList[2]);
	ok(this.annotateFrame.overlap[4].aObjList[2] == this.relationList[1]);

	equal(this.annotateFrame.spanElementList[2].innerHTML, "that ");
	equal(this.annotateFrame.spanElementList[2].className, "overlap multipleAObj");
	equal($(this.annotateFrame.spanElementList[2]).getHexBackgroundColor(), "#000000");
	equal(this.annotateFrame.spanElementList[3].innerHTML, "Iraqi");
	equal(this.annotateFrame.spanElementList[3].className, "overlap multipleAObj");
	equal($(this.annotateFrame.spanElementList[3]).getHexBackgroundColor(), "#000000");
	equal(this.annotateFrame.spanElementList[4].innerHTML, " members");
	equal(this.annotateFrame.spanElementList[4].className, "overlap multipleAObj");
	equal($(this.annotateFrame.spanElementList[4]).getHexBackgroundColor(), "#000000");
	equal(this.annotateFrame.spanElementList[5].innerHTML, " of");
	equal(this.annotateFrame.spanElementList[5].className, "entity");
	equal($(this.annotateFrame.spanElementList[5]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("TIMEX3").color );
});

test( "test findOverlapRange", function() {
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();

	// involve one overlap
	var or = this.annotateFrame.findOverlapRange(94, 108);

	or = this.annotateFrame.findOverlapRange(94, 109);
	deepEqual(or, [0, 2]);

	or = this.annotateFrame.findOverlapRange(93, 109);
	deepEqual(or, [0, 2]);

	or = this.annotateFrame.findOverlapRange(93, 109);
	deepEqual(or, [0, 2]);
	or = this.annotateFrame.findOverlapRange(93, 110);
	deepEqual(or, [0, 3]);

	// involve before the first span
	or = this.annotateFrame.findOverlapRange(65, 71);
	deepEqual(or, [undefined, 1]);
	or = this.annotateFrame.findOverlapRange(65, 72);
	deepEqual(or, [undefined, 1]);
	or = this.annotateFrame.findOverlapRange(65, 73);
	deepEqual(or, [undefined, 1]);
	or = this.annotateFrame.findOverlapRange(64, 71);
	deepEqual(or, [undefined, 1]);
	or = this.annotateFrame.findOverlapRange(64, 93);
	deepEqual(or, [undefined, 1]);
	or = this.annotateFrame.findOverlapRange(64, 94);
	deepEqual(or, [undefined, 1]);
	or = this.annotateFrame.findOverlapRange(64, 95);
	deepEqual(or, [undefined, 2]);
	or = this.annotateFrame.findOverlapRange(64, 109);
	deepEqual(or, [undefined, 2]);
	or = this.annotateFrame.findOverlapRange(35, 40);
	deepEqual(or, [undefined, 0]);
	or = this.annotateFrame.findOverlapRange(35, 65);
	deepEqual(or, [undefined, 0]);

	// involve after the last span
	or = this.annotateFrame.findOverlapRange(145, 163);
	deepEqual(or, [6, 8]);
	or = this.annotateFrame.findOverlapRange(165, 177);
	deepEqual(or, [7, 9]);
	or = this.annotateFrame.findOverlapRange(163, 178);
	deepEqual(or, [7, undefined]);
	or = this.annotateFrame.findOverlapRange(135, 181);
	deepEqual(or, [5, undefined]);
	or = this.annotateFrame.findOverlapRange(135, 180);
	deepEqual(or, [5, undefined]);
	or = this.annotateFrame.findOverlapRange(175, 180);
	deepEqual(or, [8, undefined]);
	or = this.annotateFrame.findOverlapRange(161, 181);
	deepEqual(or, [6, undefined]);

	// whole document
	or = this.annotateFrame.findOverlapRange(64, 180);
	deepEqual(or, [undefined, undefined]);
});

test( "test update the whole frame", function() {
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();

	equal(this.annotateFrame.spanElementList.length, 10);
	equal(this.annotateFrame.spanElementList[0].innerHTML, "Iraqis");
	equal(this.annotateFrame.spanElementList[0].className, "entity");
	equal($(this.annotateFrame.spanElementList[0]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("EVENT").color );
	equal(this.annotateFrame.spanElementList[1].innerHTML, "said Wednesday ");
	equal(this.annotateFrame.spanElementList[1].className, "entity multipleAObj");
	equal($(this.annotateFrame.spanElementList[1]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("EVENT").color );
	equal(this.annotateFrame.spanElementList[2].innerHTML, "that ");
	equal(this.annotateFrame.spanElementList[2].className, "overlap multipleAObj");
	equal($(this.annotateFrame.spanElementList[2]).getHexBackgroundColor(), "#000000");
	equal(this.annotateFrame.spanElementList[3].innerHTML, "Iraqi");
	equal(this.annotateFrame.spanElementList[3].className, "overlap multipleAObj");
	equal($(this.annotateFrame.spanElementList[3]).getHexBackgroundColor(), "#000000");
	equal(this.annotateFrame.spanElementList[4].innerHTML, " members");
	equal(this.annotateFrame.spanElementList[4].className, "overlap multipleAObj");
	equal($(this.annotateFrame.spanElementList[4]).getHexBackgroundColor(), "#000000");
	equal(this.annotateFrame.spanElementList[5].innerHTML, " of");
	equal(this.annotateFrame.spanElementList[5].className, "entity");
	equal($(this.annotateFrame.spanElementList[5]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("TIMEX3").color );

	equal(this.annotateFrame.spanElementList[7].innerHTML, "&amp;quot;linked&amp;quot;");
	equal(this.annotateFrame.spanElementList[7].className, "entity");
	equal($(this.annotateFrame.spanElementList[7]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("EVENT").color );

	equal(this.annotateFrame.spanElementList[8].innerHTML, "group");
	equal(this.annotateFrame.spanElementList[8].className, "entity");
	equal($(this.annotateFrame.spanElementList[8]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("EVENT").color );

	equal(this.annotateFrame.spanElementList[9].innerHTML, "and");
	equal(this.annotateFrame.spanElementList[9].className, "entity");
	equal($(this.annotateFrame.spanElementList[9]).getHexBackgroundColor(), "#" + this.schema.getTypeByTypeName("EVENT").color );


	// check overlap list
	equal(this.annotateFrame.overlap.length, 10);

	equal(this.annotateFrame.overlap[0].span.start, 65);
	equal(this.annotateFrame.overlap[0].span.end, 71);
	equal(this.annotateFrame.overlap[0].aObjList.length, 1);
	equal(this.annotateFrame.overlap[0].aObjList[0], this.entityList[5]);
	equal(this.annotateFrame.overlap[1].span.start, 94);
	equal(this.annotateFrame.overlap[1].span.end, 109);
	equal(this.annotateFrame.overlap[1].aObjList.length, 2);
	ok(this.annotateFrame.overlap[1].aObjList[0] == this.entityList[1]);
	ok(this.annotateFrame.overlap[1].aObjList[1] == this.relationList[1]);

	
	equal(this.annotateFrame.overlap[2].span.start, 109);
	equal(this.annotateFrame.overlap[2].span.end, 114);
	equal(this.annotateFrame.overlap[2].aObjList.length, 3);
	ok(this.annotateFrame.overlap[2].aObjList[0] == this.entityList[2]);
	ok(this.annotateFrame.overlap[2].aObjList[1] == this.entityList[1]);
	ok(this.annotateFrame.overlap[2].aObjList[2] == this.relationList[1]);
	equal(this.annotateFrame.overlap[3].span.start, 114);
	equal(this.annotateFrame.overlap[3].span.end, 119);
	equal(this.annotateFrame.overlap[3].aObjList.length, 4);
	ok(this.annotateFrame.overlap[3].aObjList[0] == this.entityList[3]);
	ok(this.annotateFrame.overlap[3].aObjList[1] == this.entityList[2]);
	ok(this.annotateFrame.overlap[3].aObjList[2] == this.entityList[1]);
	ok(this.annotateFrame.overlap[3].aObjList[3] == this.relationList[1]);
	equal(this.annotateFrame.overlap[4].span.start, 119);
	equal(this.annotateFrame.overlap[4].span.end, 127);
	equal(this.annotateFrame.overlap[4].aObjList.length, 3);
	ok(this.annotateFrame.overlap[4].aObjList[0] == this.entityList[3]);
	ok(this.annotateFrame.overlap[4].aObjList[1] == this.entityList[2]);
	ok(this.annotateFrame.overlap[4].aObjList[2] == this.relationList[1]);
	equal(this.annotateFrame.overlap[5].span.start, 127);
	equal(this.annotateFrame.overlap[5].span.end, 130);
	equal(this.annotateFrame.overlap[5].aObjList.length, 1);
	ok(this.annotateFrame.overlap[5].aObjList[0] == this.entityList[2]);
	equal(this.annotateFrame.overlap[6].span.start, 137);
	equal(this.annotateFrame.overlap[6].span.end, 143);
	equal(this.annotateFrame.overlap[6].aObjList.length, 2);
	ok(this.annotateFrame.overlap[6].aObjList[0] == this.entityList[4]);
	ok(this.annotateFrame.overlap[6].aObjList[1] == this.relationList[1]);
	equal(this.annotateFrame.overlap[7].span.start, 144);
	equal(this.annotateFrame.overlap[7].span.end, 162);
	equal(this.annotateFrame.overlap[7].aObjList.length, 1);
	ok(this.annotateFrame.overlap[7].aObjList[0] == this.entityList[6]);
	equal(this.annotateFrame.overlap[8].span.start, 163);
	equal(this.annotateFrame.overlap[8].span.end, 168);
	equal(this.annotateFrame.overlap[8].aObjList.length, 1);
	ok(this.annotateFrame.overlap[8].aObjList[0] == this.entityList[7]);
	equal(this.annotateFrame.overlap[9].span.start, 177);
	equal(this.annotateFrame.overlap[9].span.end, 180);
	equal(this.annotateFrame.overlap[9].aObjList.length, 1);
	ok(this.annotateFrame.overlap[9].aObjList[0] == this.entityList[7]);
	// change match type
});

test( "test generateOverlapListFromPosit", function() {
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();
	
	var tOverlap = [];
	this.annotateFrame.generateOverlapListFromPosit(114, 127, tOverlap);
	equal(tOverlap.length, 2);
	equal(tOverlap[0].span.start, 114);
	equal(tOverlap[0].span.end, 119);
	equal(tOverlap[0].aObjList.length, 4);
	equal(tOverlap[0].aObjList[0], this.entityList[3]);
	equal(tOverlap[0].aObjList[1], this.entityList[2]);
	equal(tOverlap[0].aObjList[2], this.entityList[1]);
	equal(tOverlap[0].aObjList[3], this.relationList[1]);
	equal(tOverlap[1].span.start, 119 );
	equal(tOverlap[1].span.end, 127);
	equal(tOverlap[1].aObjList.length, 3);
	equal(tOverlap[1].aObjList[0], this.entityList[3]);
	equal(tOverlap[1].aObjList[1], this.entityList[2]);
	equal(tOverlap[1].aObjList[2], this.relationList[1]);
});

test( "test searchMatchOverlap", function() {
	var _self = this;
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();

	// search one aObj overlap
	var matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(94);
	equal(matchedOverlapIdx, 0);
	matchedOverlap = this.annotateFrame.searchMatchOverlap(98);
	equal(matchedOverlapIdx, 0);
	matchedOverlap = this.annotateFrame.searchMatchOverlap(96);
	equal(matchedOverlapIdx, 0);
	matchedOverlap = this.annotateFrame.searchMatchOverlap(93);
	equal(matchedOverlapIdx, 0);

	// search multiple aObj overlap
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(114);
	equal(matchedOverlapIdx, 2);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(118);
	equal(matchedOverlapIdx, 2);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(116);
	equal(matchedOverlapIdx, 2);

	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(119);
	equal(matchedOverlapIdx, 3);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(123);
	equal(matchedOverlapIdx, 3);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(127);
	equal(matchedOverlapIdx, 4);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(128);
	equal(matchedOverlapIdx, 4);
	// search non-aObj
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(132);
	equal(matchedOverlapIdx, 5);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(131);
	equal(matchedOverlapIdx, 5);

	// search last element
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(144);
	equal(matchedOverlapIdx, 6);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(165);
	equal(matchedOverlapIdx, 7);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(168);
	equal(matchedOverlapIdx, 8);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(170);
	equal(matchedOverlapIdx, 8);

	// search first element
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(65);
	equal(matchedOverlapIdx, null);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(70);
	equal(matchedOverlapIdx, null);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(71);
	equal(matchedOverlapIdx, null);
	matchedOverlapIdx = this.annotateFrame.searchMatchOverlap(64);
	equal(matchedOverlapIdx, null);
})

test( "test getSpanElementIndex", function() {
	var _self = this;
	this.loadAllAObjListToAnnotateFrame();
	this.annotateFrame.generateAllAnnotateOverlapList();
	this.annotateFrame.updateAnnotateFragement();
	
	// click first span
	var span = $(this.htmlElement.find("span").eq(0));
	equal(span.text(), "Iraqis");
	equal(this.annotateFrame.getSpanElementIndex(span), 0);

	// click last span
	var span = $(this.htmlElement.find("span").eq(5));
	equal(span.text(), " of");
	equal(this.annotateFrame.getSpanElementIndex(span), 5);

	// click multipleAObj span
	var span = $(this.htmlElement.find("span").eq(2));
	equal(span.text(), "that ")
	equal(this.annotateFrame.getSpanElementIndex(span), 2);

	// click not exist span
	var span = $('<span>fackspan</span>');
	throws(function() {_self.getSpanElementIndex(span);}, "spanElement not found in spanElementList", "test span not in spanElementIndex");
	
});


function getRawText() {
	return "Kurdish paper &lt;ays A&gt; Qaeda-linked suspects in Arbil blasts were Iraqis\n" +
"\n" +
"\n" +
"A Kurdish newspaper said Wednesday that Iraqi members of an Al Qaeda- &amp;quot;linked&amp;quot; group, a Kurd and an Arab, blew themselves up in northern Iraq on February 1, killing at least 105 people.\n"+
"The twin suicide bombing was the deadliest attack in post-war Iraq and was suspected to have been carried out by foreign fighters, possibly linked to Osama bin Laden's Al-Qaeda network.\n"+
"The pair were named respectively as Abu Bakr Hawleri and Kazem Al- Juburi, alias Abu Turab, by independent newspaper Hawlani, which said they belonged to the Army of Ansar al-Sunna.\n"+
"The Kurd blew himself up in the offices of the Patriotic Union of Kurdistan (PUK) and the Arab in the offices of the Kurdistan Democratic Party (KDP), both in the Kurdish city of Arbil, said the newspaper.\n"+
"Each one carried a belt packed with four kilograms (8.8 pounds) of TNT mixed with phosphorus, a highly flammable material, the newspaper said.\n"+
'Ansar al-Sunna last week claimed the twin bombings in a statement posted on an Islamist website. The newspaper said the motive of the attack was to "punish" the two Kurdish secular groups, which control Iraqi Kurdistan, for their alliance with the US-led coalition.\n'+
"The newspaper said Ansar al-Sunna broke away from the Ansar al-Islam group last October and was led by an Arab whose alias is Abu Abdullah Hasan bin Mahmud. Ansar al-Sunna is more extreme, said the newspaper.\n"+
"The newspaper added that bin Mahmud is the brother of man whose alias is Abdullah Al-Shami, an Ansar al-Islam leader who was killed last year while fighting a US-backed onslaught by the PUK that forced the group out of its enclave near the Iranian border at the end of March last year.";
}

$.fn.getHexBackgroundColor = function() {
    var rgb = $(this).css('background-color');
    if (!rgb) {
        return '#FFFFFF'; //default color
    }
    var hex_rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/); 
    function hex(x) {return ("0" + parseInt(x).toString(16)).slice(-2);}
    if (hex_rgb) {
        return "#" + hex(hex_rgb[1]) + hex(hex_rgb[2]) + hex(hex_rgb[3]);
    } else {
	var hex_rgba = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/); 
	if (hex_rgba)
            return "#" + hex(hex_rgba[1]) + hex(hex_rgba[2]) + hex(hex_rgba[3]);
	else
            return rgb; //ie8 returns background-color in hex format then it will make                 compatible, you can improve it checking if format is in hexadecimal
    }
}
