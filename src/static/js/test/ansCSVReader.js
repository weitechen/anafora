function parseAnsCSV(ansCSVStr) {
	var ansCSVDict = {};
	var ansLineList = ansCSVStr.split("\n");
	ansCSVDict.ansDict = {};
	ansCSVDict.numOfGoldEntity = 0;
	ansCSVDict.numOfComparePairEntity = 0;
	ansCSVDict.numOfIdenticalEntity = 0;
	ansCSVDict.numOfStandaloneEntity0 = 0;
	ansCSVDict.numOfStandaloneEntity1 = 0;
	ansCSVDict.numOfGoldRelation = 0;
	ansCSVDict.numOfComparePairRelation = 0;
	ansCSVDict.numOfIdenticalRelation = 0;
	ansCSVDict.numOfStandaloneRelation0 = 0;
	ansCSVDict.numOfStandaloneRelation1 = 0;

	ansCSVDict.preDefineScore = {};
	
	ansLineList.forEach(function(ansLine) {
		ansLine = ansLine.trim();
		if(ansLine != "") {
			var ansTerm = ansLine.split(",");
			if(ansTerm[0] != "") {
				ansCSVDict.ansDict[ansTerm[0]] = 1.0;
				if(ansTerm[0].indexOf("@e@") >=0)
					ansCSVDict.numOfGoldEntity++;
				else
					ansCSVDict.numOfGoldRelation++;
			}
			else if(ansTerm[1] != "" && ansTerm[2] != "") {
				if(ansTerm[3] == "") {
					ansCSVDict.ansDict[ansTerm[1] + "|" + ansTerm[2]] = undefined;
					if(ansTerm[1].indexOf("@e@") >=0)
						ansCSVDict.numOfComparePairEntity++;
					else
						ansCSVDict.numOfComparePairRelation++;
				}
				else {
					ansCSVDict.ansDict[ansTerm[1] + "|" + ansTerm[2]] = parseFloat(ansTerm[3]);
					if(ansTerm[1].indexOf("@e@") >=0) {
						if(ansCSVDict.ansDict[ansTerm[1] + "|" + ansTerm[2]] == 1.0)
							ansCSVDict.numOfIdenticalEntity++;
						else
							ansCSVDict.numOfComparePairEntity++;
						ansCSVDict.preDefineScore[ansTerm[1] + "|" + ansTerm[2]] = ansCSVDict.ansDict[ansTerm[1] + "|" + ansTerm[2]];
					}
					else {
						if(ansCSVDict.ansDict[ansTerm[1] + "|" + ansTerm[2]] == 1.0)
							ansCSVDict.numOfIdenticalRelation++;
						else
							ansCSVDict.numOfComparePairRelation++;
					}
				}
			}
			else if(ansTerm[1] != "") {
				if(ansTerm[3] == "")
					ansCSVDict.ansDict[ansTerm[1]] = undefined;
				else
					ansCSVDict.ansDict[ansTerm[1]] = parseFloat(ansTerm[3]);
				if(ansTerm[1].indexOf("@e@") >=0)
					ansCSVDict.numOfStandaloneEntity0++;
				else
					ansCSVDict.numOfStandaloneRelation0++;

			}
			else if(ansTerm[2] != "") {
				if(ansTerm[3] == "")
					ansCSVDict.ansDict[ansTerm[2]] = undefined;
				else
					ansCSVDict.ansDict[ansTerm[2]] = parseFloat(ansTerm[3]);
				if(ansTerm[2].indexOf("@e@") >=0)
					ansCSVDict.numOfStandaloneEntity1++;
				else
					ansCSVDict.numOfStandaloneRelation1++;
			}
		}
	});
	return ansCSVDict;
}
