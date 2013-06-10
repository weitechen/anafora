module( "anafora project module", {
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
		projectName: "EventWorkshop",
		taskName: "workshop_AFP_ENG_20040211.0147",
		schema: "EVENTCoref",
		annotator: "crooksk",
		corpusName: "CMU",
		root_url: "/~wech5560/anafora"
		};
  }
});

test( "anafora project constructor", function() {
	ok( true );
});

test( "anafora getXML", function() {
	var xmlAnaforaText;
	AnaforaProject.getXML(function(data){ xmlAnaforaText = data;}, this._setting);
	equal( xmlAnaforaText.length, 24094, "default get xml"  );
	equal( xmlAnaforaText.substr(233,42), "1@e@workshop_AFP_ENG_20040211.0147@crooksk");
});
