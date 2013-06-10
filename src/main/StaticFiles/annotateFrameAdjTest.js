module( "annotateFrameAdj module", {
  setup: function() {

	this.schema = new Schema();

        var xmlSchemaText0 = $.ajax({
                type: "GET",
                url: "https://verbs.colorado.edu/~wech5560/anafora/annotate/schema/EVENTCoref/0",
                cache: false,
                async: false}).responseText;

	var schemaJSON0 = $.parseJSON(xmlSchemaText0);
	var schemaXMLStr0 = schemaJSON0.schemaXML;
        var xmlSchemaDom0 = $.parseXML( schemaXMLStr0 );
        this.schema.parseSchemaXML(xmlSchemaDom0);

        var xmlSchemaText1 = $.ajax({
                type: "GET",
                url: "https://verbs.colorado.edu/~wech5560/anafora/annotate/schema/EVENTCoref/1",
                cache: false,
                async: false}).responseText;

	var schemaJSON1 = $.parseJSON(xmlSchemaText1);
	var schemaXMLStr1 = schemaJSON1.schemaXML;
        var xmlSchemaDom1 = $.parseXML( schemaXMLStr1 );
        this.schema.parseSchemaXML(xmlSchemaDom1);

	// setting
	this._setting = {
		schemaMap: "{&quot;PropBank&quot;: 0, &quot;Temporal&quot;: [&quot;Relation&quot;, &quot;Entity&quot;], &quot;EVENTCoref&quot;: 0, &quot;SHARPn&quot;: 0, &quot;Coreference&quot;: 0}",
		app_name: "annotate",
		isAdjudication: true,
		remoteUser: "wech5560",
		projectName: "EventWorkshop",
		taskName: "workshop_AFP_ENG_20040211.0147",
		schema: "EVENTCoref",
		annotator: "wech5560",
		corpusName: "CMU",
		root_url: "/~wech5560/anafora"
		};
	
	var rawText = getAdjRawText();
	var htmlElement = $('<div>' + rawText + '</div>');
//.replace(/\</g,"&lt;").replace(/\>/g,"&gt;").replace(/\&/g, "&amp;") + '</div>');
	$("#attachElement").empty();
	$("#attachElement").append(htmlElement);
	this.htmlElement = htmlElement
	this.annotateFrame = new AnnotateFrame(htmlElement, this._setting, rawText);

	var xmlData = loadAdjXMLData();
	this.adjProject = new AnaforaAdjudicationProject(this.schema, this._setting.taskName);
	//AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting);
	this.adjProject.setAnnotateFrame(this.annotateFrame);
	this.adjProject.readFromXMLDOM($.parseXML(xmlData["wech5560"]));

	this.adjProject.annotateFrame.updateAnnotateFragement();
  },
});

test( "initial test", function() {
	equal(this.annotateFrame.overlap.length, 43 );
	equal(this.annotateFrame.spanElementList.length, 43);

	equal(this.annotateFrame.overlap[0].aObjList.length, 5);
	ok(this.annotateFrame.overlap[0].aObjList[0] === this.adjProject.adjudicationEntityList[1]);
	equal(this.adjProject.adjudicationEntityList[1].markElement.length, 1);
	ok(this.adjProject.adjudicationEntityList[1].markElement[0] === this.annotateFrame.overlap[0]);
	ok(this.annotateFrame.overlap[0].aObjList[1] === this.adjProject.projectList["stylerw"].entityList[1]);
	equal(this.adjProject.projectList["stylerw"].entityList[1].markElement.length, 1);
	ok(this.adjProject.projectList["stylerw"].entityList[1].markElement[0], this.annotateFrame.overlap[0]);
	ok(this.annotateFrame.overlap[0].aObjList[2] === this.adjProject.projectList["crooksk"].entityList[27]);
	equal(this.adjProject.projectList["crooksk"].entityList[27].markElement.length, 1);
	ok(this.adjProject.projectList["crooksk"].entityList[27].markElement[0], this.annotateFrame.overlap[0]);
	ok(this.annotateFrame.overlap[0].aObjList[3] === this.adjProject.projectList["crooksk"].relationList[3]);
	equal(this.adjProject.projectList["crooksk"].relationList[3].markElement.length, 2);
	ok(this.adjProject.projectList["crooksk"].relationList[3].markElement[0], this.annotateFrame.overlap[0]);
	ok(this.adjProject.projectList["crooksk"].relationList[3].markElement[1], this.annotateFrame.overlap[3]);
	ok(this.annotateFrame.overlap[0].aObjList[4] === this.adjProject.projectList["stylerw"].relationList[1]);
	equal(this.adjProject.projectList["stylerw"].relationList[1].markElement.length, 3);
	ok(this.adjProject.projectList["stylerw"].relationList[1].markElement[0], this.annotateFrame.overlap[0]);
	ok(this.adjProject.projectList["stylerw"].relationList[1].markElement[1], this.annotateFrame.overlap[1]);
	ok(this.adjProject.projectList["stylerw"].relationList[1].markElement[2], this.annotateFrame.overlap[2]);
	equal(this.annotateFrame.overlap[0].span.start, 14);
	equal(this.annotateFrame.overlap[0].span.end, 18);

	equal(this.annotateFrame.spanElementList[0].innerHTML, "&lt;ays");
	equal(this.annotateFrame.spanElementList[0].className, "entity adjConflict multipleAObj");

	// second overlap
	equal(this.annotateFrame.overlap[1].aObjList.length, 7);
	ok(this.annotateFrame.overlap[1].aObjList[0] === this.adjProject.adjudicationEntityList[2]);
	equal(this.adjProject.adjudicationEntityList[2].markElement.length, 2);
	ok(this.adjProject.adjudicationEntityList[2].markElement[0] === this.annotateFrame.overlap[1]);
	ok(this.adjProject.adjudicationEntityList[2].markElement[1] === this.annotateFrame.overlap[2]);
	ok(this.annotateFrame.overlap[1].aObjList[1] === this.adjProject.projectList["stylerw"].entityList[2]);
	equal(this.adjProject.projectList["stylerw"].entityList[2].markElement.length, 2);
	ok(this.adjProject.projectList["stylerw"].entityList[2].markElement[0] === this.annotateFrame.overlap[1]);
	ok(this.adjProject.projectList["stylerw"].entityList[2].markElement[1] === this.annotateFrame.overlap[2]);
	ok(this.annotateFrame.overlap[1].aObjList[2] === this.adjProject.projectList["stylerw"].relationList[1]);
	ok(this.annotateFrame.overlap[1].aObjList[3] === this.adjProject.projectList["stylerw"].relationList[1]);
	ok(this.annotateFrame.overlap[1].aObjList[4] === this.adjProject.projectList["stylerw"].relationList[1]);

	console.log(this.annotateFrame.overlap[1].aObjList);
	console.log(AnnotateFrame.matchAObjFromOverlap(this.annotateFrame.overlap[1].aObjList));

	/*
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
	*/
});

function getAdjRawText() {
	return "Kurdish paper &lt;ays A&gt; Qaeda-linked suspects in Arbil blasts were Iraqis\n" +
"\n" +
"\n" +
"A Kurdish newspaper said Wednesday that Iraqi members of an Al Qaeda- &amp;quot; group, a Kurd and an Arab, blew themselves up in northern Iraq on February 1, killing at least 105 people.\n"+
"The twin suicide bombing was the deadliest attack in post-war Iraq and was suspected to have been carried out by foreign fighters, possibly linked to Osama bin Laden's Al-Qaeda network.\n"+
"The pair were named respectively as Abu Bakr Hawleri and Kazem Al- Juburi, alias Abu Turab, by independent newspaper Hawlani, which said they belonged to the Army of Ansar al-Sunna.\n"+
"The Kurd blew himself up in the offices of the Patriotic Union of Kurdistan (PUK) and the Arab in the offices of the Kurdistan Democratic Party (KDP), both in the Kurdish city of Arbil, said the newspaper.\n"+
"Each one carried a belt packed with four kilograms (8.8 pounds) of TNT mixed with phosphorus, a highly flammable material, the newspaper said.\n"+
'Ansar al-Sunna last week claimed the twin bombings in a statement posted on an Islamist website. The newspaper said the motive of the attack was to "punish" the two Kurdish secular groups, which control Iraqi Kurdistan, for their alliance with the US-led coalition.\n'+
"The newspaper said Ansar al-Sunna broke away from the Ansar al-Islam group last October and was led by an Arab whose alias is Abu Abdullah Hasan bin Mahmud. Ansar al-Sunna is more extreme, said the newspaper.\n"+
"The newspaper added that bin Mahmud is the brother of man whose alias is Abdullah Al-Shami, an Ansar al-Islam leader who was killed last year while fighting a US-backed onslaught by the PUK that forced the group out of its enclave near the Iranian border at the end of March last year.";

}
