module( "anafora adjudication module", {
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
}});


// =============== test initial compare two project =================== //
test( "test initial compare two project", function() {
	var adjProject = new AnaforaAdjudicationProject(this.schema, this._setting.taskName);
	var xmlData = loadXMLData();
	var aProjectList = {};
	var aProj1 = new AnaforaProject(this.schema, "crooksk", this._setting.taskName);
	//AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting, "crooksk", false);
	aProj1.readFromXMLDOM($.parseXML(xmlData["crooksk"]), this._setting.schema_moode);
	aProjectList["crooksk"] = aProj1;
	var aProj2 = new AnaforaProject(this.schema, "stylerw", this._setting.taskName);
	//AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting, "stylerw", false);
	aProj2.readFromXMLDOM($.parseXML(xmlData["stylerw"]), this._setting.schema_mode);
	aProjectList["stylerw"] = aProj2;

	adjProject.addAnaforaProjectList(aProjectList);

	adjProjectLoadTest(adjProject);
	/*
	equal(Object.keys(this.adjProject.projectList).length, 2);
	// check adjudicationEnityList
	equal(Object.keys(this.adjProject.adjudicationEntityList).length, 17, "adjudication project entity list number" );

	// check adjudicationRelationList
	equal(Object.keys(this.adjProject.adjudicationRelationList).length, 8, "adjudication project relation list number" );
	var relation0 = aProj1.relationList[13];
	var relation1 = aProj2.relationList[8];
	var _self = this;
	var tFunc = function(aObj0, aObj1) { return  AnaforaAdjudicationProject.adjEntityComparePropertyFunc(aObj0, aObj1, _self.adjProject); };

	deepEqual(IAdjudicationAnaforaObj.compareAObjPropertyList(relation0 ,relation1, tFunc), [1], "check compareAObjPropertyList function");

	var entity0 = aProj1.entityList[15];
	var entity1 = aProj2.entityList[10];
	equal(relation0.propertyList[0][0], entity0, "check compare pair list correct"); 
	equal(relation1.propertyList[0][0], entity1, "check compare pair list correct"); 
	ok(IAdjudicationAnaforaObj.compareProperty(relation0.type.propertyTypeList[0], relation0.propertyList[0], relation1.propertyList[0], tFunc), "check compareProperty func" );
	ok(AnaforaAdjudicationProject.adjEntityComparePropertyFunc(entity0, entity1, this.adjProject), "check compare pair list correct");

	// check type count
	equal(this.adjProject.typeCount["EVENT"], 36);
	equal(this.adjProject.typeCount["TIMEX3"], 6);

	// check comparePairEntity
	//equal(Object.keys(this.adjProject.comparePairEntity).length, 34, "adjudication project comparePairEntity list length" );
	//// Randomly select entity to check the comparePair
	var entity1 = this.adjProject.projectList["crooksk"].entityList[27];
	var comparePairEntityList1 = entity1.getAdditionalData("comparePair");
	var entity2 = this.adjProject.projectList["stylerw"].entityList[1];
	var comparePairEntityList2 = entity2.getAdditionalData("comparePair");
	var adjudicationEntity = this.adjProject.adjudicationEntityList[1];
	equal(comparePairEntityList1.length, 2, "27@e@crooksk length");
	equal(comparePairEntityList1[0], entity2, "27@e@crooksk list item 1");
	equal(comparePairEntityList1[1], adjudicationEntity, "27@e@crooksk list item 2");
	equal(comparePairEntityList2.length, 2, "1@e@stylerw length");
	equal(comparePairEntityList2[0], entity1, "1@e@stylerw list item 1");
	equal(comparePairEntityList2[1], adjudicationEntity, "1@e@stylerw list item 2");

	var entity3 = this.adjProject.projectList["crooksk"].entityList[40];
	var comparePairEntityList3 = entity3.getAdditionalData("comparePair");
	equal(comparePairEntityList3, undefined, "40@e@crooksk not in comparePairEntity list" );
	
	// check comparePairRelation
	deepEqual(adjudicationEntity.diffProp, [1]);
	var adjudicationEntity2 = this.adjProject.adjudicationEntityList[2];
	deepEqual(adjudicationEntity2.diffProp, []);

	var adjudicationRelation1 = this.adjProject.adjudicationRelationList[1];
	equal(adjudicationRelation1.diffProp.length, 0);
	var adjudicationRelation4 = this.adjProject.adjudicationRelationList[4];
	deepEqual(adjudicationRelation4.diffProp, [1]);
	*/
})


test( "test save and load adjudication project", function() {

	var origProject = new AnaforaAdjudicationProject(this.schema, this._setting.taskName);
	var xmlData = loadXMLData();
	var aProjectList = {};
	var aProj1 = new AnaforaProject(this.schema, "crooksk", this._setting.taskName);
	//AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting, "crooksk", false);
	aProj1.readFromXMLDOM($.parseXML(xmlData["crooksk"]), this._setting.schema_moode);
	aProjectList["crooksk"] = aProj1;
	var aProj2 = new AnaforaProject(this.schema, "stylerw", this._setting.taskName);
	//AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting, "stylerw", false);
	aProj2.readFromXMLDOM($.parseXML(xmlData["stylerw"]), this._setting.schema_mode);
	aProjectList["stylerw"] = aProj2;

	origProject.addAnaforaProjectList(aProjectList);
	// save file
	$.ajax({type: 'POST', url:  this._setting.root_url + "/" + this._setting.app_name + "/saveFile/" + this._setting.projectName + "/" + this._setting.corpusName + "/" + this._setting.taskName + "/" + this._setting.schema + (this._setting.isAdjudication ? ".Adjudication" : "") + "/", data: {'fileContent':origProject.writeXML()}, cache: false, async: false, headers:{"X-CSRFToken":$.cookie('csrftoken') }, success: function(data) {;},error: function (xhr, ajaxOptions, thrownError) { console.log(xhr.responseText); }} );

	var adjProject = new AnaforaAdjudicationProject(this.schema, this._setting.taskName);
	AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting);
	adjProject.readFromXMLDOM($.parseXML(xmlData));

	adjProjectLoadTest(adjProject);
});

test( "test change adjcompareEntityList", function() {
	this.adjProject = new AnaforaAdjudicationProject(this.schema, this._setting.taskName);
	var xmlData = loadXMLData();
	var aProjectList = {};
	var aProj1 = new AnaforaProject(this.schema, "crooksk", this._setting.taskName);
	//AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting, "crooksk", false);
	aProj1.readFromXMLDOM($.parseXML(xmlData["crooksk"]), this._setting.schema_moode);
	aProjectList["crooksk"] = aProj1;
	var aProj2 = new AnaforaProject(this.schema, "stylerw", this._setting.taskName);
	//AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting, "stylerw", false);
	aProj2.readFromXMLDOM($.parseXML(xmlData["stylerw"]), this._setting.schema_mode);
	aProjectList["stylerw"] = aProj2;

	this.adjProject.addAnaforaProjectList(aProjectList);
	var origEntity = this.adjProject.projectList["crooksk"].entityList[27];
	var tEntity = new Entity("19@e@workshop_AFP_ENG_20040211.0147@stylerw", this.schema.typeDict["EVENT"], [new SpanType(14, 18)]);
	var tAdjEntity = new AdjudicationEntity("1@e@workshop_AFP_ENG_20040211.0147@gold", origEntity, tEntity);
	var replaceEntity = this.adjProject.projectList["stylerw"].entityList[1];

	this.adjProject.addAdjEntityToAdjudicationInCompareEntityPair(origEntity, tEntity, tAdjEntity);
	this.adjProject.addAdjEntityToAdjudicationInCompareEntityPair(tEntity, origEntity, tAdjEntity);
	var origComparePairEntityList = origEntity.getAdditionalData("comparePair");
	var tComparePairEntityList = tEntity.getAdditionalData("comparePair");
	var replaceComparePairEntityList = replaceEntity.getAdditionalData("comparePair");

	equal(origComparePairEntityList.length, 3);
	equal(origComparePairEntityList[0], tEntity);
	equal(origComparePairEntityList[2], tAdjEntity);

	equal(tComparePairEntityList.length, 2);
	equal(tComparePairEntityList[0], origEntity);
	equal(tComparePairEntityList[1], tAdjEntity);

	equal(replaceComparePairEntityList.length, 1);
	equal(replaceComparePairEntityList[0], origEntity);

	// check adjEntity diffProp
	var adjEntity1 = this.adjProject.adjudicationEntityList[1];
});

test("test annotation mark as gold", function() {
	var xmlData = loadAdjXMLData();
	this.adjProject = new AnaforaAdjudicationProject(this.schema, this._setting.taskName);
	//AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting);
	
	this.adjProject.readFromXMLDOM($.parseXML(xmlData["wech5560"]));

	// =============== Mark Entity ===============
	//// mark undecided one
	var goldEntity = this.adjProject.projectList["stylerw"].entityList[1];
	var notGoldEntity = this.adjProject.projectList["crooksk"].entityList[27];
	var adjEntity = this.adjProject.adjudicationEntityList[1];
	ok(adjEntity.decideIdx === undefined);
	ok(goldEntity.getAdditionalData("adjudication") === undefined);
	ok(notGoldEntity.getAdditionalData("adjudication") === undefined);

	this.adjProject.markGold(goldEntity);
	equal(adjEntity.decideIdx, 1, "decided idx changed");
	equal(goldEntity.getAdditionalData("adjudication"), "gold", "gold entity has been marked")
	equal(notGoldEntity.getAdditionalData("adjudication"), "not gold", "notgold entity has been marked")
	equal(this.adjProject.completeAdjudication, 19);
	equal(this.adjProject.totalAdjudication, 65);

	//// change decided one
	goldEntity = this.adjProject.projectList["stylerw"].entityList[2];
	notGoldEntity = this.adjProject.projectList["crooksk"].entityList[1];
	adjEntity = this.adjProject.adjudicationEntityList[2];
	equal(adjEntity.decideIdx, 0);
	equal(goldEntity.getAdditionalData("adjudication"), "not gold");
	equal(notGoldEntity.getAdditionalData("adjudication"), "gold");

	this.adjProject.markGold(goldEntity);
	equal(adjEntity.decideIdx, 1, "decided idx changed");
	equal(goldEntity.getAdditionalData("adjudication"), "gold", "gold entity has been marked")
	equal(notGoldEntity.getAdditionalData("adjudication"), "not gold", "notgold entity has been marked")
	equal(this.adjProject.completeAdjudication, 19);
	equal(this.adjProject.totalAdjudication, 65);

	//// mark im-compared pair
	goldEntity = this.adjProject.projectList["crooksk"].entityList[3];
	ok(goldEntity.getAdditionalData("adjudication") === undefined);
	this.adjProject.markGold(goldEntity);
	equal(goldEntity.getAdditionalData("adjudication"), "gold", "gold entity has been marked")
	equal(this.adjProject.completeAdjudication, 20);
	equal(this.adjProject.totalAdjudication, 65);

	//// re-mark gold data
	this.adjProject.markGold(goldEntity);
	equal(goldEntity.getAdditionalData("adjudication"), "gold", "gold entity has been marked")
	equal(this.adjProject.completeAdjudication, 20);
	equal(this.adjProject.totalAdjudication, 65);

	// ============= Mark Relation ================
	//// mark undecided one
	var adjRelation = this.adjProject.adjudicationRelationList[4];
	var goldRelation = this.adjProject.projectList["stylerw"].relationList[7];
	var notGoldRelation = this.adjProject.projectList["crooksk"].relationList[8];
	var goldPEntity_1_1 = this.adjProject.projectList["stylerw"].entityList[4];
	var goldPEntity_2_1 = this.adjProject.projectList["stylerw"].entityList[8];
	var goldPEntity_2_2 = this.adjProject.projectList["stylerw"].entityList[9];
	var notGoldPEntity_1_1 = this.adjProject.projectList["crooksk"].entityList[4];
	var notGoldPEntity_2_1 = this.adjProject.projectList["crooksk"].entityList[14];
	var adjEntity_1_1 = this.adjProject.adjudicationEntityList[4];
	var adjEntity_2_1 = this.adjProject.adjudicationEntityList[8];
	ok(adjRelation.decideIdx === undefined);
	ok(goldRelation.getAdditionalData("adjudication") === undefined);
	ok(notGoldRelation.getAdditionalData("adjudication") === undefined);
	equal(goldPEntity_1_1.getAdditionalData("adjudication"), "not gold");
	equal(goldPEntity_2_1.getAdditionalData("adjudication"), "not gold");
	ok(goldPEntity_2_2.getAdditionalData("adjudication") === undefined);
	equal(notGoldPEntity_1_1.getAdditionalData("adjudication"), "gold");
	equal(notGoldPEntity_2_1.getAdditionalData("adjudication"), "gold");
	equal(adjEntity_1_1.decideIdx, 0);
	equal(adjEntity_2_1.decideIdx, 0);

	this.adjProject.markGold(goldRelation);
	
	equal(adjRelation.decideIdx, 1);
	equal(goldRelation.getAdditionalData("adjudication"), "gold");
	equal(notGoldRelation.getAdditionalData("adjudication"), "not gold");
	equal(goldPEntity_1_1.getAdditionalData("adjudication"), "gold");
	equal(goldPEntity_2_1.getAdditionalData("adjudication"), "gold");
	equal(goldPEntity_2_2.getAdditionalData("adjudication"), "gold");
	equal(notGoldPEntity_1_1.getAdditionalData("adjudication"), "not gold");
	equal(notGoldPEntity_2_1.getAdditionalData("adjudication"), "not gold");
	equal(adjEntity_1_1.decideIdx, 1);
	equal(adjEntity_2_1.decideIdx, 1);

	equal(this.adjProject.completeAdjudication, 22);
	equal(this.adjProject.totalAdjudication, 65);

	//// change decided one
	adjRelation = this.adjProject.adjudicationRelationList[5];
	goldRelation = this.adjProject.projectList["stylerw"].relationList[2];
	notGoldRelation = this.adjProject.projectList["crooksk"].relationList[10];
	goldPEntity_1_1 = this.adjProject.projectList["stylerw"].entityList[3];
	goldPEntity_2_1 = this.adjProject.projectList["stylerw"].entityList[4];
	goldPEntity_2_2 = this.adjProject.projectList["stylerw"].entityList[5];
	notGoldPEntity_1_1 = this.adjProject.projectList["crooksk"].entityList[2];
	notGoldPEntity_2_1 = this.adjProject.projectList["crooksk"].entityList[4];
	notGoldPEntity_2_2 = this.adjProject.projectList["crooksk"].entityList[6];
	adjEntity_1_1 = this.adjProject.adjudicationEntityList[3];
	adjEntity_2_1 = this.adjProject.adjudicationEntityList[4];
	adjEntity_2_2 = this.adjProject.adjudicationEntityList[5];

	equal(adjRelation.decideIdx, 0);
	equal(goldRelation.getAdditionalData("adjudication"), "not gold");
	equal(notGoldRelation.getAdditionalData("adjudication"), "gold");
	ok(goldPEntity_1_1.getAdditionalData("adjudication") === undefined);
	equal(goldPEntity_2_1.getAdditionalData("adjudication"), "gold");
	equal(goldPEntity_2_2.getAdditionalData("adjudication"), "not gold");
	ok(notGoldPEntity_1_1.getAdditionalData("adjudication") === undefined);
	equal(notGoldPEntity_2_1.getAdditionalData("adjudication"), "not gold");
	equal(notGoldPEntity_2_2.getAdditionalData("adjudication"), "gold");
	ok(adjEntity_1_1.decideIdx === undefined);
	equal(adjEntity_2_1.decideIdx, 1);
	equal(adjEntity_2_2.decideIdx, 0);

	this.adjProject.markGold(goldRelation);

	equal(adjRelation.decideIdx, 1);
	equal(goldRelation.getAdditionalData("adjudication"), "gold");
	equal(notGoldRelation.getAdditionalData("adjudication"), "not gold");
	equal(goldPEntity_1_1.getAdditionalData("adjudication"), "gold");
	equal(goldPEntity_2_1.getAdditionalData("adjudication"), "gold");
	equal(goldPEntity_2_2.getAdditionalData("adjudication"), "gold");
	equal(notGoldPEntity_1_1.getAdditionalData("adjudication"), "not gold");
	equal(notGoldPEntity_2_1.getAdditionalData("adjudication"), "not gold");
	equal(notGoldPEntity_2_2.getAdditionalData("adjudication"), "not gold");
	equal(adjEntity_1_1.decideIdx, 1);
	equal(adjEntity_2_1.decideIdx, 1);
	equal(adjEntity_2_2.decideIdx, 1);
	equal(this.adjProject.completeAdjudication, 23);
	equal(this.adjProject.totalAdjudication, 65);

	// mark un-compare-pair relation
	goldRelation = this.adjProject.projectList["crooksk"].relationList[29];
	goldPEntity_1 = this.adjProject.projectList["crooksk"].entityList[37];
	goldPEntity_2 = this.adjProject.projectList["crooksk"].entityList[38];
	ok(goldRelation.getAdditionalData("adjudication") === undefined);
	ok(goldPEntity_1.getAdditionalData("adjudication") === undefined);
	ok(goldPEntity_2.getAdditionalData("adjudication") === undefined);

	this.adjProject.markGold(goldRelation);

	equal(goldRelation.getAdditionalData("adjudication"), "gold");
	equal(goldPEntity_1.getAdditionalData("adjudication"), "gold");
	equal(goldPEntity_2.getAdditionalData("adjudication"), "gold");

	equal(this.adjProject.completeAdjudication, 26);
	equal(this.adjProject.totalAdjudication, 65);

});

test("test annotation cancel gold", function() {
	var xmlData = loadAdjXMLData() ;
	this.adjProject = new AnaforaAdjudicationProject(this.schema, this._setting.taskName);
	//AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting);
	this.adjProject.readFromXMLDOM($.parseXML(xmlData["wech5560"]));

	// =============== Cancel Entity ===============
	//// cancel gold one
	var entity1 = this.adjProject.projectList["stylerw"].entityList[2];
	var entity2 = this.adjProject.projectList["crooksk"].entityList[1];
	var adjEntity = this.adjProject.adjudicationEntityList[2];
	equal(adjEntity.decideIdx, 0);
	equal(entity1.getAdditionalData("adjudication"), "not gold");
	equal(entity2.getAdditionalData("adjudication"), "gold");

	this.adjProject.cancelGold(entity2);
	ok(adjEntity.decideIdx === undefined, "decided idx set to undefined");
	ok(entity1.getAdditionalData("adjudication") === undefined, "gold entity has been undefined");
	ok(entity2.getAdditionalData("adjudication") === undefined, "gold entity has been undefined");
	equal(this.adjProject.completeAdjudication, 17);
	equal(this.adjProject.totalAdjudication, 65);

	//// canel not gold one
	entity1 = this.adjProject.projectList["stylerw"].entityList[5];
	entity2 = this.adjProject.projectList["crooksk"].entityList[6];
	adjEntity = this.adjProject.adjudicationEntityList[5];
	equal(adjEntity.decideIdx, 0);
	equal(entity1.getAdditionalData("adjudication"), "not gold");
	equal(entity2.getAdditionalData("adjudication"), "gold");

	this.adjProject.cancelGold(entity1);
	ok(adjEntity.decideIdx === undefined, "decided idx set to undefined");
	ok(entity1.getAdditionalData("adjudication") === undefined, "gold entity has been undefined");
	ok(entity2.getAdditionalData("adjudication") === undefined, "gold entity has been undefined");
	equal(this.adjProject.completeAdjudication, 16);
	equal(this.adjProject.totalAdjudication, 65);

	//// cancel undefined pair
	entity1 = this.adjProject.projectList["stylerw"].entityList[1];
	entity2 = this.adjProject.projectList["crooksk"].entityList[27];
	adjEntity = this.adjProject.adjudicationEntityList[1];
	ok(adjEntity.decideIdx === undefined);
	ok(entity1.getAdditionalData("adjudication") === undefined);
	ok(entity2.getAdditionalData("adjudication") === undefined);

	this.adjProject.cancelGold(entity1);

	ok(adjEntity.decideIdx === undefined, "decided idx set to undefined");
	ok(entity1.getAdditionalData("adjudication") === undefined, "gold entity has been undefined");
	ok(entity2.getAdditionalData("adjudication") === undefined, "gold entity has been undefined");
	equal(this.adjProject.completeAdjudication, 16);
	equal(this.adjProject.totalAdjudication, 65);

	//// cancel not compared one
	entity1 = this.adjProject.projectList["crooksk"].entityList[3];
	this.adjProject.cancelGold(entity1);
	ok(entity1.getAdditionalData("adjudication") === undefined, "gold entity has been undefined");
	equal(this.adjProject.completeAdjudication, 16);
	equal(this.adjProject.totalAdjudication, 65);

	this.adjProject.markGold(entity1);
	equal(entity1.getAdditionalData("adjudication"), "gold", "gold entity has been undefined");
	equal(this.adjProject.completeAdjudication, 17);
	equal(this.adjProject.totalAdjudication, 65);

	this.adjProject.cancelGold(entity1);
	ok(entity1.getAdditionalData("adjudication") === undefined, "gold entity has been undefined");
	equal(this.adjProject.completeAdjudication, 16);
	equal(this.adjProject.totalAdjudication, 65);

	// =============== Cancel Relation ===============
	//// cancel not gold adj
	var adjRelation = this.adjProject.adjudicationRelationList[5];
	var relation1 = this.adjProject.projectList["stylerw"].relationList[2];
	var relation2 = this.adjProject.projectList["crooksk"].relationList[10];

	equal(adjRelation.decideIdx, 0);
	equal(relation1.getAdditionalData("adjudication"), "not gold");
	equal(relation2.getAdditionalData("adjudication"), "gold");

	this.adjProject.cancelGold(relation1);

	ok(adjRelation.decideIdx === undefined);
	ok(relation1.getAdditionalData("adjudication") === undefined);
	ok(relation2.getAdditionalData("adjudication") === undefined);

	equal(this.adjProject.completeAdjudication, 15);
	equal(this.adjProject.totalAdjudication, 65);

	//// cancel gold adj
	adjRelation = this.adjProject.adjudicationRelationList[7];
	relation1 = this.adjProject.projectList["stylerw"].relationList[10];
	relation2 = this.adjProject.projectList["crooksk"].relationList[14];

	equal(adjRelation.decideIdx, 0);
	equal(relation1.getAdditionalData("adjudication"), "not gold");
	equal(relation2.getAdditionalData("adjudication"), "gold");

	this.adjProject.cancelGold(relation2);

	ok(adjRelation.decideIdx === undefined);
	ok(relation1.getAdditionalData("adjudication") === undefined);
	ok(relation2.getAdditionalData("adjudication") === undefined);

	equal(this.adjProject.completeAdjudication, 14);
	equal(this.adjProject.totalAdjudication, 65);

	//// cancel not decided adj
	adjRelation = this.adjProject.adjudicationRelationList[4];
	relation1 = this.adjProject.projectList["stylerw"].relationList[7];
	relation2 = this.adjProject.projectList["crooksk"].relationList[8];

	ok(adjRelation.decideIdx === undefined);
	ok(relation1.getAdditionalData("adjudication") === undefined);
	ok(relation2.getAdditionalData("adjudication") === undefined);

	this.adjProject.cancelGold(relation2);

	ok(adjRelation.decideIdx === undefined);
	ok(relation1.getAdditionalData("adjudication") === undefined);
	ok(relation2.getAdditionalData("adjudication") === undefined);

	equal(this.adjProject.completeAdjudication, 14);
	equal(this.adjProject.totalAdjudication, 65);

	//// cancel un-compared relation
	relation1 = this.adjProject.projectList["crooksk"].relationList[29];
	ok(relation1.getAdditionalData("adjudication") === undefined);

	this.adjProject.cancelGold(relation1);
	ok(relation1.getAdditionalData("adjudication") === undefined);
	equal(this.adjProject.completeAdjudication, 14);
	equal(this.adjProject.totalAdjudication, 65);
	
	this.adjProject.markGold(relation1);
	equal(relation1.getAdditionalData("adjudication"), "gold");
	equal(this.adjProject.completeAdjudication, 17);
	equal(this.adjProject.totalAdjudication, 65);

	this.adjProject.cancelGold(relation1);
	ok(relation1.getAdditionalData("adjudication") === undefined);
	equal(this.adjProject.completeAdjudication, 16);
	equal(this.adjProject.totalAdjudication, 65);
});
// ================================================================================
function adjProjectLoadTest(adjProject) {

	ok(adjProject != undefined);

	// check projectList
	equal(Object.keys(adjProject.projectList).length, 2, "check project list length");
	ok("stylerw" in adjProject.projectList, "check annotator key in projectList" );
	ok("crooksk" in adjProject.projectList, "check annotator key in projectList" );
	// check compared project: stylerw
	equal(Object.keys(adjProject.projectList["stylerw"].entityList).length, 18);
	equal(Object.keys(adjProject.projectList["stylerw"].relationList).length, 10);
	// check compared project: crooksk
	equal(Object.keys(adjProject.projectList["crooksk"].entityList).length, 41);
	equal(Object.keys(adjProject.projectList["crooksk"].relationList).length, 21);
	// check adjudicationEnityList
	equal(Object.keys(adjProject.adjudicationEntityList).length, 17, "adjudication project entity list number" );

	// check adjudicationRelationList
	equal(Object.keys(adjProject.adjudicationRelationList).length, 8, "adjudication project relation list number" );
	var relation0 = adjProject.projectList["crooksk"].relationList[13];
	var relation1 = adjProject.projectList["stylerw"].relationList[8];
	var tFunc = function(aObj0, aObj1) { return  AnaforaAdjudicationProject.adjEntityComparePropertyFunc(aObj0, aObj1, adjProject); };

	deepEqual(IAdjudicationAnaforaObj.compareAObjPropertyList(relation0 ,relation1, tFunc), [1], "check compareAObjPropertyList function");

	var entity0 = adjProject.projectList["crooksk"].entityList[15];
	var entity1 = adjProject.projectList["stylerw"].entityList[10];
	equal(relation0.propertyList[0][0], entity0, "check compare pair list correct"); 
	equal(relation1.propertyList[0][0], entity1, "check compare pair list correct"); 
	ok(IAdjudicationAnaforaObj.compareProperty(relation0.type.propertyTypeList[0], relation0.propertyList[0], relation1.propertyList[0], tFunc), "check compareProperty func" );
	ok(AnaforaAdjudicationProject.adjEntityComparePropertyFunc(entity0, entity1, adjProject), "check compare pair list correct");

	// check type count
	equal(adjProject.typeCount["EVENT"], 36);
	equal(adjProject.typeCount["TIMEX3"], 6);
	equal(adjProject.typeCount["Identical"], 2);
	equal(adjProject.typeCount["Whole/Part"], 3);
	equal(adjProject.typeCount["Set/Subset"], 1);
	equal(adjProject.typeCount["Cause/Effect"], 3);
	equal(adjProject.typeCount["Enablement"], 2);
	equal(adjProject.typeCount["Intent"], 3);
	equal(adjProject.typeCount["Reporting"], 9);
	ok(!("Appositive" in adjProject.typeCount));

	// check comparePairEntity
	//// Randomly select entity to check the comparePair
	var entity1 = adjProject.projectList["crooksk"].entityList[27];
	var comparePairEntityList1 = entity1.getAdditionalData("comparePair");
	var entity2 = adjProject.projectList["stylerw"].entityList[1];
	var comparePairEntityList2 = entity2.getAdditionalData("comparePair");
	var adjudicationEntity = adjProject.adjudicationEntityList[1];
	equal(comparePairEntityList1.length, 2, "27@e@crooksk length");
	equal(comparePairEntityList1[0], entity2, "27@e@crooksk list item 1");
	equal(comparePairEntityList1[1], adjudicationEntity, "27@e@crooksk list item 2");
	equal(comparePairEntityList2.length, 2, "1@e@stylerw length");
	equal(comparePairEntityList2[0], entity1, "1@e@stylerw list item 1");
	equal(comparePairEntityList2[1], adjudicationEntity, "1@e@stylerw list item 2");

	var entity3 = adjProject.projectList["crooksk"].entityList[40];
	var comparePairEntityList3 = entity3.getAdditionalData("comparePair");
	equal(comparePairEntityList3, undefined, "40@e@crooksk not in comparePairEntity list" );

	// check diffProp
	deepEqual(adjudicationEntity.diffProp, [1]);
	var adjudicationEntity2 = adjProject.adjudicationEntityList[2];
	deepEqual(adjudicationEntity2.diffProp, []);

	var adjudicationRelation1 = adjProject.adjudicationRelationList[1];
	equal(adjudicationRelation1.diffProp.length, 0);
	var adjudicationRelation4 = adjProject.adjudicationRelationList[4];
	deepEqual(adjudicationRelation4.diffProp, [1]);

	// check decideIdx
	equal(adjudicationEntity.decideIdx, undefined);
	equal(adjudicationEntity2.decideIdx, 0);

	deepEqual(adjudicationRelation1.decideIdx, 0);
	ok(adjudicationRelation4.decideIdx === undefined);

	// check comlete adjudication
	equal(adjProject.completeAdjudication, 18);
	equal(adjProject.totalAdjudication, 65);

	// check is gold
	equal(adjProject.projectList["stylerw"].entityList[1].getAdditionalData("adjudication"), undefined);
	equal(adjProject.projectList["crooksk"].entityList[27].getAdditionalData("adjudication"), undefined);
	equal(adjProject.projectList["stylerw"].entityList[2].getAdditionalData("adjudication"), "not gold");
	equal(adjProject.projectList["crooksk"].entityList[1].getAdditionalData("adjudication"), "gold")
	ok(adjProject.projectList["crooksk"].entityList[3].getAdditionalData("adjudication") === undefined);

	equal(adjProject.projectList["stylerw"].relationList[6].getAdditionalData("adjudication"), "not gold");
	equal(adjProject.projectList["crooksk"].relationList[2].getAdditionalData("adjudication"), "gold")
	ok(adjProject.projectList["stylerw"].relationList[7].getAdditionalData("adjudication") === undefined);
	ok(adjProject.projectList["crooksk"].relationList[8].getAdditionalData("adjudication") === undefined);
	ok(adjProject.projectList["stylerw"].relationList[1].getAdditionalData("adjudication") === undefined);
}

function loadXMLData() {
	var rXMLData = {};
	rXMLData["crooksk"] = '<?xml version="1.0" encoding="UTF-8"?><data><info>  <savetime>13:15:14 04-03-2013</savetime>  <progress>completed</progress></info><schema path="./" protocol="file">temporal.schema.xml</schema><annotations><entity><id>1@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>53,59</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>2@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>94,98</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>3@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>99,108</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>4@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>178,182</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>5@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>214,227</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>6@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>229,236</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>7@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>275,282</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>8@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>301,307</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>9@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>333,342</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE/OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>10@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>356,363</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>11@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>458,463</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>12@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>576,580</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>13@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>586,594</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>14@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>635,639</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>15@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>812,816</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>16@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>841,848</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>17@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>969,973</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>18@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1000,1007</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>19@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>990,999</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>20@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1017,1025</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>21@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1041,1047</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>22@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1086,1090</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>23@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1109,1115</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>25@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1170,1177</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE/OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>26@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1205,1213</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE/OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>27@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>14,18</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>28@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1275,1280</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>29@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1255,1259</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>30@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1316,1328</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>31@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1337,1340</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>32@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1421,1428</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE/OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>33@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1430,1434</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>34@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1575,1581</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>35@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1582,1591</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>36@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1598,1606</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>37@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1619,1628</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>38@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1645,1651</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>39@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1705,1734</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>40@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>398,404</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>41@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1493,1500</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>42@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1095,1101</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><relation><id>2@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Identical</type><parentsType>CorefChains</parentsType><properties><FirstInstance>1@e@workshop_AFP_ENG_20040211.0147@crooksk</FirstInstance><Coreferring_String>7@e@workshop_AFP_ENG_20040211.0147@crooksk</Coreferring_String><Coreferring_String>8@e@workshop_AFP_ENG_20040211.0147@crooksk</Coreferring_String><Coreferring_String>20@e@workshop_AFP_ENG_20040211.0147@crooksk</Coreferring_String><Coreferring_String>23@e@workshop_AFP_ENG_20040211.0147@crooksk</Coreferring_String></properties></relation><relation><id>3@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Identical</type><parentsType>CorefChains</parentsType><properties><FirstInstance>27@e@workshop_AFP_ENG_20040211.0147@crooksk</FirstInstance><Coreferring_String>2@e@workshop_AFP_ENG_20040211.0147@crooksk</Coreferring_String></properties></relation><relation><id>4@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><properties><Whole>1@e@workshop_AFP_ENG_20040211.0147@crooksk</Whole><Part>4@e@workshop_AFP_ENG_20040211.0147@crooksk</Part><Part>6@e@workshop_AFP_ENG_20040211.0147@crooksk</Part></properties></relation><relation><id>6@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><properties><Whole>12@e@workshop_AFP_ENG_20040211.0147@crooksk</Whole><Part>11@e@workshop_AFP_ENG_20040211.0147@crooksk</Part></properties></relation><relation><id>7@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><properties><Whole>36@e@workshop_AFP_ENG_20040211.0147@crooksk</Whole><Part>34@e@workshop_AFP_ENG_20040211.0147@crooksk</Part></properties></relation><relation><id>8@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Set/Subset</type><parentsType>CorefChains</parentsType><properties><Set>4@e@workshop_AFP_ENG_20040211.0147@crooksk</Set><Subset>14@e@workshop_AFP_ENG_20040211.0147@crooksk</Subset></properties></relation><relation><id>10@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>2@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>4@e@workshop_AFP_ENG_20040211.0147@crooksk</Event><Event>6@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties></relation><relation><id>12@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>12@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>13@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties></relation><relation><id>13@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>15@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>14@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties></relation><relation><id>14@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>17@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>16@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties></relation><relation><id>17@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>22@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>42@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties></relation><relation><id>18@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>29@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>28@e@workshop_AFP_ENG_20040211.0147@crooksk</Event><Event>31@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties></relation><relation><id>20@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>33@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>32@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties></relation><relation><id>21@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Cause/Effect</type><parentsType>CorefChains</parentsType><properties><Cause>10@e@workshop_AFP_ENG_20040211.0147@crooksk</Cause><Effect>8@e@workshop_AFP_ENG_20040211.0147@crooksk</Effect></properties></relation><relation><id>22@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Cause/Effect</type><parentsType>CorefChains</parentsType><properties><Cause>26@e@workshop_AFP_ENG_20040211.0147@crooksk</Cause><Effect>23@e@workshop_AFP_ENG_20040211.0147@crooksk</Effect></properties></relation><relation><id>23@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Cause/Effect</type><parentsType>CorefChains</parentsType><properties><Cause>37@e@workshop_AFP_ENG_20040211.0147@crooksk</Cause><Effect>36@e@workshop_AFP_ENG_20040211.0147@crooksk</Effect></properties></relation><relation><id>24@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Intent</type><parentsType>CorefChains</parentsType><properties><Action>4@e@workshop_AFP_ENG_20040211.0147@crooksk</Action><Intent>6@e@workshop_AFP_ENG_20040211.0147@crooksk</Intent></properties></relation><relation><id>25@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Intent</type><parentsType>CorefChains</parentsType><properties><Action>21@e@workshop_AFP_ENG_20040211.0147@crooksk</Action><Intent>18@e@workshop_AFP_ENG_20040211.0147@crooksk</Intent></properties></relation><relation><id>27@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Enablement</type><parentsType>CorefChains</parentsType><properties><Precondition>16@e@workshop_AFP_ENG_20040211.0147@crooksk</Precondition><Enablement>8@e@workshop_AFP_ENG_20040211.0147@crooksk</Enablement></properties></relation><relation><id>28@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Enablement</type><parentsType>CorefChains</parentsType><properties><Precondition>36@e@workshop_AFP_ENG_20040211.0147@crooksk</Precondition><Enablement>34@e@workshop_AFP_ENG_20040211.0147@crooksk</Enablement></properties></relation><relation><id>29@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Intent</type><parentsType>CorefChains</parentsType><properties><Action>37@e@workshop_AFP_ENG_20040211.0147@crooksk</Action><Intent>38@e@workshop_AFP_ENG_20040211.0147@crooksk</Intent></properties></relation></annotations><adjudication></adjudication></data>';
	rXMLData["stylerw"] = '<?xml version="1.0" encoding="UTF-8"?><data><info>  <savetime>10:25:16 10-04-2013</savetime>  <progress>completed</progress></info><schema path="./" protocol="file">temporal.schema.xml</schema><annotations><entity><id>1@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>14,18</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>2@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>53,59</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>3@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>94,98</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>4@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>178,182</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>5@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>229,236</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>6@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>275,282</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>7@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>301,307</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>8@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>635,639</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>9@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>716,723</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>10@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>812,816</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>11@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>841,848</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>12@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>969,973</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>13@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1000,1007</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>14@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1017,1025</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>15@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1086,1090</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>16@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1109,1115</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>17@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1575,1581</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>18@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1598,1606</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><relation><id>1@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>1@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>2@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties></relation><relation><id>2@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>3@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>4@e@workshop_AFP_ENG_20040211.0147@stylerw</Event><Event>5@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties></relation><relation><id>4@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><properties><Whole>2@e@workshop_AFP_ENG_20040211.0147@stylerw</Whole><Part>4@e@workshop_AFP_ENG_20040211.0147@stylerw</Part><Part>5@e@workshop_AFP_ENG_20040211.0147@stylerw</Part><Part>11@e@workshop_AFP_ENG_20040211.0147@stylerw</Part></properties></relation><relation><id>6@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Identical</type><parentsType>CorefChains</parentsType><properties><FirstInstance>2@e@workshop_AFP_ENG_20040211.0147@stylerw</FirstInstance><Coreferring_String>6@e@workshop_AFP_ENG_20040211.0147@stylerw</Coreferring_String><Coreferring_String>7@e@workshop_AFP_ENG_20040211.0147@stylerw</Coreferring_String><Coreferring_String>14@e@workshop_AFP_ENG_20040211.0147@stylerw</Coreferring_String><Coreferring_String>16@e@workshop_AFP_ENG_20040211.0147@stylerw</Coreferring_String></properties></relation><relation><id>7@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Set/Subset</type><parentsType>CorefChains</parentsType><properties><Set>4@e@workshop_AFP_ENG_20040211.0147@stylerw</Set><Subset>8@e@workshop_AFP_ENG_20040211.0147@stylerw</Subset><Subset>9@e@workshop_AFP_ENG_20040211.0147@stylerw</Subset></properties></relation><relation><id>8@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>10@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>8@e@workshop_AFP_ENG_20040211.0147@stylerw</Event><Event>9@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties></relation><relation><id>10@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>12@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>11@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties></relation><relation><id>12@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>13@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>14@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties></relation><relation><id>13@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>15@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>16@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties></relation><relation><id>14@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><properties><Whole>18@e@workshop_AFP_ENG_20040211.0147@stylerw</Whole><Part>17@e@workshop_AFP_ENG_20040211.0147@stylerw</Part></properties></relation></annotations><adjudication></adjudication></data>';
	return rXMLData;
}

function loadAdjXMLData() {
	var rXMLData = {};
rXMLData["wech5560"] = '<?xml version="1.0" encoding="UTF-8"?><data><info>  <savetime>11:48:55 02-05-2013</savetime>  <progress>in-progress</progress></info><schema path="./" protocol="file">temporal.schema.xml</schema><annotations><entity><id>1@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>53,59</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><comparePair>2@e@workshop_AFP_ENG_20040211.0147@stylerw,2@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>2@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>94,98</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><comparePair>3@e@workshop_AFP_ENG_20040211.0147@stylerw,3@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>3@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>99,108</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>4@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>178,182</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>4@e@workshop_AFP_ENG_20040211.0147@stylerw,4@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>5@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>214,227</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>6@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>229,236</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>5@e@workshop_AFP_ENG_20040211.0147@stylerw,5@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>7@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>275,282</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>6@e@workshop_AFP_ENG_20040211.0147@stylerw,6@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>8@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>301,307</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>7@e@workshop_AFP_ENG_20040211.0147@stylerw,7@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>9@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>333,342</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE/OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>10@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>356,363</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>11@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>458,463</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>12@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>576,580</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>13@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>586,594</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>14@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>635,639</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>8@e@workshop_AFP_ENG_20040211.0147@stylerw,8@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>15@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>812,816</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>10@e@workshop_AFP_ENG_20040211.0147@stylerw,9@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>16@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>841,848</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>11@e@workshop_AFP_ENG_20040211.0147@stylerw,10@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>17@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>969,973</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>12@e@workshop_AFP_ENG_20040211.0147@stylerw,11@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>18@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1000,1007</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><comparePair>13@e@workshop_AFP_ENG_20040211.0147@stylerw,12@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>19@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>990,999</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>20@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1017,1025</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>14@e@workshop_AFP_ENG_20040211.0147@stylerw,13@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>21@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1041,1047</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>22@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1086,1090</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>15@e@workshop_AFP_ENG_20040211.0147@stylerw,14@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>23@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1109,1115</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>16@e@workshop_AFP_ENG_20040211.0147@stylerw,15@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>25@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1170,1177</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE/OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>26@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1205,1213</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE/OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>27@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>14,18</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><comparePair>1@e@workshop_AFP_ENG_20040211.0147@stylerw,1@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>28@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1275,1280</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>29@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1255,1259</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>30@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1316,1328</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>31@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1337,1340</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>32@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1421,1428</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE/OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>33@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1430,1434</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>34@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1575,1581</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>17@e@workshop_AFP_ENG_20040211.0147@stylerw,16@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>35@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1582,1591</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>36@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1598,1606</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>gold</adjudication><comparePair>18@e@workshop_AFP_ENG_20040211.0147@stylerw,17@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>37@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1619,1628</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>38@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1645,1651</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>39@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1705,1734</span><type>TIMEX3</type><parentsType>TemporalEntities</parentsType><properties><Class>DATE</Class></properties></entity><entity><id>40@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>398,404</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>41@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1493,1500</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>42@e@workshop_AFP_ENG_20040211.0147@crooksk</id><span>1095,1101</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>OVERLAP</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>1@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>14,18</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><comparePair>27@e@workshop_AFP_ENG_20040211.0147@crooksk,1@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>2@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>47,59</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><comparePair>1@e@workshop_AFP_ENG_20040211.0147@crooksk,2@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>3@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>94,98</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><comparePair>2@e@workshop_AFP_ENG_20040211.0147@crooksk,3@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>4@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>178,182</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>4@e@workshop_AFP_ENG_20040211.0147@crooksk,4@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>5@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>229,236</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>6@e@workshop_AFP_ENG_20040211.0147@crooksk,5@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>6@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>275,282</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>7@e@workshop_AFP_ENG_20040211.0147@crooksk,6@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>7@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>301,307</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>8@e@workshop_AFP_ENG_20040211.0147@crooksk,7@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>8@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>635,639</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>14@e@workshop_AFP_ENG_20040211.0147@crooksk,8@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>9@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>716,723</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties></entity><entity><id>10@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>812,816</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>15@e@workshop_AFP_ENG_20040211.0147@crooksk,9@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>11@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>841,848</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>16@e@workshop_AFP_ENG_20040211.0147@crooksk,10@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>12@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>969,973</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>17@e@workshop_AFP_ENG_20040211.0147@crooksk,11@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>13@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1000,1007</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><comparePair>18@e@workshop_AFP_ENG_20040211.0147@crooksk,12@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>14@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1017,1025</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>20@e@workshop_AFP_ENG_20040211.0147@crooksk,13@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>15@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1086,1090</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>EVIDENTIAL</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>22@e@workshop_AFP_ENG_20040211.0147@crooksk,14@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>16@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1109,1115</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>23@e@workshop_AFP_ENG_20040211.0147@crooksk,15@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>17@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1575,1581</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>34@e@workshop_AFP_ENG_20040211.0147@crooksk,16@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><entity><id>18@e@workshop_AFP_ENG_20040211.0147@stylerw</id><span>1598,1606</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><properties><DocTimeRel>BEFORE</DocTimeRel><Type>N/A</Type><Degree>N/A</Degree><Polarity>POS</Polarity><ContextualModality>ACTUAL</ContextualModality><ContextualAspect>N/A</ContextualAspect><Permanence>UNDETERMINED</Permanence></properties><addition><adjudication>not gold</adjudication><comparePair>36@e@workshop_AFP_ENG_20040211.0147@crooksk,17@e@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></entity><relation><id>2@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Identical</type><parentsType>CorefChains</parentsType><properties><FirstInstance>1@e@workshop_AFP_ENG_20040211.0147@crooksk</FirstInstance><Coreferring_String>7@e@workshop_AFP_ENG_20040211.0147@crooksk</Coreferring_String><Coreferring_String>8@e@workshop_AFP_ENG_20040211.0147@crooksk</Coreferring_String><Coreferring_String>20@e@workshop_AFP_ENG_20040211.0147@crooksk</Coreferring_String><Coreferring_String>23@e@workshop_AFP_ENG_20040211.0147@crooksk</Coreferring_String></properties><addition><adjudication>gold</adjudication><comparePair>6@r@workshop_AFP_ENG_20040211.0147@stylerw,1@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>3@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Identical</type><parentsType>CorefChains</parentsType><properties><FirstInstance>27@e@workshop_AFP_ENG_20040211.0147@crooksk</FirstInstance><Coreferring_String>2@e@workshop_AFP_ENG_20040211.0147@crooksk</Coreferring_String></properties></relation><relation><id>4@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><properties><Whole>1@e@workshop_AFP_ENG_20040211.0147@crooksk</Whole><Part>4@e@workshop_AFP_ENG_20040211.0147@crooksk</Part><Part>6@e@workshop_AFP_ENG_20040211.0147@crooksk</Part></properties><addition><comparePair>4@r@workshop_AFP_ENG_20040211.0147@stylerw,2@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>6@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><properties><Whole>12@e@workshop_AFP_ENG_20040211.0147@crooksk</Whole><Part>11@e@workshop_AFP_ENG_20040211.0147@crooksk</Part></properties></relation><relation><id>7@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><properties><Whole>36@e@workshop_AFP_ENG_20040211.0147@crooksk</Whole><Part>34@e@workshop_AFP_ENG_20040211.0147@crooksk</Part></properties><addition><adjudication>gold</adjudication><comparePair>14@r@workshop_AFP_ENG_20040211.0147@stylerw,3@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>8@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Set/Subset</type><parentsType>CorefChains</parentsType><properties><Set>4@e@workshop_AFP_ENG_20040211.0147@crooksk</Set><Subset>14@e@workshop_AFP_ENG_20040211.0147@crooksk</Subset></properties><addition><comparePair>7@r@workshop_AFP_ENG_20040211.0147@stylerw,4@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>10@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>2@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>4@e@workshop_AFP_ENG_20040211.0147@crooksk</Event><Event>6@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties><addition><adjudication>gold</adjudication><comparePair>2@r@workshop_AFP_ENG_20040211.0147@stylerw,5@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>12@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>12@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>13@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties></relation><relation><id>13@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>15@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>14@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties><addition><comparePair>8@r@workshop_AFP_ENG_20040211.0147@stylerw,6@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>14@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>17@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>16@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties><addition><adjudication>gold</adjudication><comparePair>10@r@workshop_AFP_ENG_20040211.0147@stylerw,7@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>17@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>22@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>42@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties><addition><comparePair>13@r@workshop_AFP_ENG_20040211.0147@stylerw,8@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>18@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>29@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>28@e@workshop_AFP_ENG_20040211.0147@crooksk</Event><Event>31@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties></relation><relation><id>20@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>33@e@workshop_AFP_ENG_20040211.0147@crooksk</Report><Event>32@e@workshop_AFP_ENG_20040211.0147@crooksk</Event></properties></relation><relation><id>21@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Cause/Effect</type><parentsType>CorefChains</parentsType><properties><Cause>10@e@workshop_AFP_ENG_20040211.0147@crooksk</Cause><Effect>8@e@workshop_AFP_ENG_20040211.0147@crooksk</Effect></properties></relation><relation><id>22@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Cause/Effect</type><parentsType>CorefChains</parentsType><properties><Cause>26@e@workshop_AFP_ENG_20040211.0147@crooksk</Cause><Effect>23@e@workshop_AFP_ENG_20040211.0147@crooksk</Effect></properties></relation><relation><id>23@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Cause/Effect</type><parentsType>CorefChains</parentsType><properties><Cause>37@e@workshop_AFP_ENG_20040211.0147@crooksk</Cause><Effect>36@e@workshop_AFP_ENG_20040211.0147@crooksk</Effect></properties></relation><relation><id>24@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Intent</type><parentsType>CorefChains</parentsType><properties><Action>4@e@workshop_AFP_ENG_20040211.0147@crooksk</Action><Intent>6@e@workshop_AFP_ENG_20040211.0147@crooksk</Intent></properties></relation><relation><id>25@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Intent</type><parentsType>CorefChains</parentsType><properties><Action>21@e@workshop_AFP_ENG_20040211.0147@crooksk</Action><Intent>18@e@workshop_AFP_ENG_20040211.0147@crooksk</Intent></properties></relation><relation><id>27@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Enablement</type><parentsType>CorefChains</parentsType><properties><Precondition>16@e@workshop_AFP_ENG_20040211.0147@crooksk</Precondition><Enablement>8@e@workshop_AFP_ENG_20040211.0147@crooksk</Enablement></properties></relation><relation><id>28@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Enablement</type><parentsType>CorefChains</parentsType><properties><Precondition>36@e@workshop_AFP_ENG_20040211.0147@crooksk</Precondition><Enablement>34@e@workshop_AFP_ENG_20040211.0147@crooksk</Enablement></properties></relation><relation><id>29@r@workshop_AFP_ENG_20040211.0147@crooksk</id><type>Intent</type><parentsType>CorefChains</parentsType><properties><Action>37@e@workshop_AFP_ENG_20040211.0147@crooksk</Action><Intent>38@e@workshop_AFP_ENG_20040211.0147@crooksk</Intent></properties></relation><relation><id>1@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>1@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>2@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties></relation><relation><id>2@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>3@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>4@e@workshop_AFP_ENG_20040211.0147@stylerw</Event><Event>5@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties><addition><adjudication>not gold</adjudication><comparePair>10@r@workshop_AFP_ENG_20040211.0147@crooksk,5@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>4@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><properties><Whole>2@e@workshop_AFP_ENG_20040211.0147@stylerw</Whole><Part>4@e@workshop_AFP_ENG_20040211.0147@stylerw</Part><Part>5@e@workshop_AFP_ENG_20040211.0147@stylerw</Part><Part>11@e@workshop_AFP_ENG_20040211.0147@stylerw</Part></properties><addition><comparePair>4@r@workshop_AFP_ENG_20040211.0147@crooksk,2@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>6@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Identical</type><parentsType>CorefChains</parentsType><properties><FirstInstance>2@e@workshop_AFP_ENG_20040211.0147@stylerw</FirstInstance><Coreferring_String>6@e@workshop_AFP_ENG_20040211.0147@stylerw</Coreferring_String><Coreferring_String>7@e@workshop_AFP_ENG_20040211.0147@stylerw</Coreferring_String><Coreferring_String>14@e@workshop_AFP_ENG_20040211.0147@stylerw</Coreferring_String><Coreferring_String>16@e@workshop_AFP_ENG_20040211.0147@stylerw</Coreferring_String></properties><addition><adjudication>not gold</adjudication><comparePair>2@r@workshop_AFP_ENG_20040211.0147@crooksk,1@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>7@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Set/Subset</type><parentsType>CorefChains</parentsType><properties><Set>4@e@workshop_AFP_ENG_20040211.0147@stylerw</Set><Subset>8@e@workshop_AFP_ENG_20040211.0147@stylerw</Subset><Subset>9@e@workshop_AFP_ENG_20040211.0147@stylerw</Subset></properties><addition><comparePair>8@r@workshop_AFP_ENG_20040211.0147@crooksk,4@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>8@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>10@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>8@e@workshop_AFP_ENG_20040211.0147@stylerw</Event><Event>9@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties><addition><comparePair>13@r@workshop_AFP_ENG_20040211.0147@crooksk,6@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>10@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>12@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>11@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties><addition><adjudication>not gold</adjudication><comparePair>14@r@workshop_AFP_ENG_20040211.0147@crooksk,7@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>12@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>13@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>14@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties></relation><relation><id>13@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Reporting</type><parentsType>CorefChains</parentsType><properties><Report>15@e@workshop_AFP_ENG_20040211.0147@stylerw</Report><Event>16@e@workshop_AFP_ENG_20040211.0147@stylerw</Event></properties><addition><comparePair>17@r@workshop_AFP_ENG_20040211.0147@crooksk,8@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation><relation><id>14@r@workshop_AFP_ENG_20040211.0147@stylerw</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><properties><Whole>18@e@workshop_AFP_ENG_20040211.0147@stylerw</Whole><Part>17@e@workshop_AFP_ENG_20040211.0147@stylerw</Part></properties><addition><adjudication>not gold</adjudication><comparePair>7@r@workshop_AFP_ENG_20040211.0147@crooksk,3@r@workshop_AFP_ENG_20040211.0147@gold</comparePair></addition></relation></annotations><adjudication><entity><id>1@e@workshop_AFP_ENG_20040211.0147@gold</id><span>14,18</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>27@e@workshop_AFP_ENG_20040211.0147@crooksk,1@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp>1</diffProp></addition></entity><entity><id>2@e@workshop_AFP_ENG_20040211.0147@gold</id><span>47,59</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>1@e@workshop_AFP_ENG_20040211.0147@crooksk,2@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>3@e@workshop_AFP_ENG_20040211.0147@gold</id><span>94,98</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>2@e@workshop_AFP_ENG_20040211.0147@crooksk,3@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp>1</diffProp></addition></entity><entity><id>4@e@workshop_AFP_ENG_20040211.0147@gold</id><span>178,182</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>4@e@workshop_AFP_ENG_20040211.0147@crooksk,4@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>5@e@workshop_AFP_ENG_20040211.0147@gold</id><span>229,236</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>6@e@workshop_AFP_ENG_20040211.0147@crooksk,5@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>6@e@workshop_AFP_ENG_20040211.0147@gold</id><span>275,282</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>7@e@workshop_AFP_ENG_20040211.0147@crooksk,6@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>7@e@workshop_AFP_ENG_20040211.0147@gold</id><span>301,307</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>8@e@workshop_AFP_ENG_20040211.0147@crooksk,7@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>8@e@workshop_AFP_ENG_20040211.0147@gold</id><span>635,639</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>14@e@workshop_AFP_ENG_20040211.0147@crooksk,8@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>9@e@workshop_AFP_ENG_20040211.0147@gold</id><span>812,816</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>15@e@workshop_AFP_ENG_20040211.0147@crooksk,10@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>10@e@workshop_AFP_ENG_20040211.0147@gold</id><span>841,848</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>16@e@workshop_AFP_ENG_20040211.0147@crooksk,11@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>11@e@workshop_AFP_ENG_20040211.0147@gold</id><span>969,973</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>17@e@workshop_AFP_ENG_20040211.0147@crooksk,12@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>12@e@workshop_AFP_ENG_20040211.0147@gold</id><span>1000,1007</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>18@e@workshop_AFP_ENG_20040211.0147@crooksk,13@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp>1</diffProp></addition></entity><entity><id>13@e@workshop_AFP_ENG_20040211.0147@gold</id><span>1017,1025</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>20@e@workshop_AFP_ENG_20040211.0147@crooksk,14@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>14@e@workshop_AFP_ENG_20040211.0147@gold</id><span>1086,1090</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>22@e@workshop_AFP_ENG_20040211.0147@crooksk,15@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>15@e@workshop_AFP_ENG_20040211.0147@gold</id><span>1109,1115</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>23@e@workshop_AFP_ENG_20040211.0147@crooksk,16@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>16@e@workshop_AFP_ENG_20040211.0147@gold</id><span>1575,1581</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>34@e@workshop_AFP_ENG_20040211.0147@crooksk,17@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><entity><id>17@e@workshop_AFP_ENG_20040211.0147@gold</id><span>1598,1606</span><type>EVENT</type><parentsType>TemporalEntities</parentsType><addition><compareEntity>36@e@workshop_AFP_ENG_20040211.0147@crooksk,18@e@workshop_AFP_ENG_20040211.0147@stylerw</compareEntity><diffProp></diffProp></addition></entity><relation><id>1@r@workshop_AFP_ENG_20040211.0147@gold</id><type>Identical</type><parentsType>CorefChains</parentsType><addition><compareRelation>2@r@workshop_AFP_ENG_20040211.0147@crooksk;6@r@workshop_AFP_ENG_20040211.0147@stylerw</compareRelation><diffProp></diffProp></addition></relation><relation><id>2@r@workshop_AFP_ENG_20040211.0147@gold</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><addition><compareRelation>4@r@workshop_AFP_ENG_20040211.0147@crooksk;4@r@workshop_AFP_ENG_20040211.0147@stylerw</compareRelation><diffProp>1</diffProp></addition></relation><relation><id>3@r@workshop_AFP_ENG_20040211.0147@gold</id><type>Whole/Part</type><parentsType>CorefChains</parentsType><addition><compareRelation>7@r@workshop_AFP_ENG_20040211.0147@crooksk;14@r@workshop_AFP_ENG_20040211.0147@stylerw</compareRelation><diffProp></diffProp></addition></relation><relation><id>4@r@workshop_AFP_ENG_20040211.0147@gold</id><type>Set/Subset</type><parentsType>CorefChains</parentsType><addition><compareRelation>8@r@workshop_AFP_ENG_20040211.0147@crooksk;7@r@workshop_AFP_ENG_20040211.0147@stylerw</compareRelation><diffProp>1</diffProp></addition></relation><relation><id>5@r@workshop_AFP_ENG_20040211.0147@gold</id><type>Reporting</type><parentsType>CorefChains</parentsType><addition><compareRelation>10@r@workshop_AFP_ENG_20040211.0147@crooksk;2@r@workshop_AFP_ENG_20040211.0147@stylerw</compareRelation><diffProp></diffProp></addition></relation><relation><id>6@r@workshop_AFP_ENG_20040211.0147@gold</id><type>Reporting</type><parentsType>CorefChains</parentsType><addition><compareRelation>13@r@workshop_AFP_ENG_20040211.0147@crooksk;8@r@workshop_AFP_ENG_20040211.0147@stylerw</compareRelation><diffProp>1</diffProp></addition></relation><relation><id>7@r@workshop_AFP_ENG_20040211.0147@gold</id><type>Reporting</type><parentsType>CorefChains</parentsType><addition><compareRelation>14@r@workshop_AFP_ENG_20040211.0147@crooksk;10@r@workshop_AFP_ENG_20040211.0147@stylerw</compareRelation><diffProp></diffProp></addition></relation><relation><id>8@r@workshop_AFP_ENG_20040211.0147@gold</id><type>Reporting</type><parentsType>CorefChains</parentsType><addition><compareRelation>17@r@workshop_AFP_ENG_20040211.0147@crooksk;13@r@workshop_AFP_ENG_20040211.0147@stylerw</compareRelation><diffProp>1</diffProp></addition></relation></adjudication></data>';

	return rXMLData;
}
