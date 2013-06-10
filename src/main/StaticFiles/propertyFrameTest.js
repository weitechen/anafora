module( "property frame module", {
  setup: function() {
  	// schema
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

	// setting
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

	var xmlData;
	this.adjProject = new AnaforaAdjudicationProject(this.schema, this._setting.taskName);
	AnaforaProject.getXML(function(data) {xmlData = data;}, this._setting);
	this.adjProject.readFromXMLDOM($.parseXML(xmlData));
	
	var htmlElement = $('<div class="propertyHidden"><div class="propertyBlock"><span class="typeColorBlock jstreeschema"></span><span class="typeName"></span><input class="objDeleteBtn" type="button" value="Delete annotation"></input><input class="goldBtn" type="button" value="Mark as Gold"></input><input class="cancelGoldBtn" type="button" value="Cancel Gold "></input><input class="cancelNotGoldBtn" type="button" value="Resume Gold"></input></div><div class="propertyBlock"><h4>ID</h4><span class="objID"></span></div><div class="propertyBlock"><h4>TEXT</h4><span class="spanText"></span>	<div><table class="spanTable"><thead><tr><th class="delBtnCol">&nbsp;</th><th class="spinCol">Start</th><th class="spinCol">End</th><th>Span</th></tr></thead><tbody></tbody></table></div></div><div class="propertyBlock"><h4>PROPERTY</h4><table class="propertyTable"><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody></tbody></table></div></div>');

	$("#attachElement").empty();
	$("#attachElement").append(htmlElement);

	this.pf = new PropertyFrame(htmlElement);
  }
});

test("test propertyFrame constructor", function() {
});
