function AObjSelectionMenu(element) {
	this.element = element;
}

AObjSelectionMenu.prototype.createMenu = function(aObjList, spanElement) {
	var _self = this;
	var offset = spanElement.offset();
	this.element.children("ul").children("li").remove();

	$.each(aObjList, function() {
		var elementLi = $('<li><span class="jstreeschema" style="background-color:#' + this.type.color + '">' + (this.isCrossObj() ? 'C' : '') + '</span>' + getTextFromEntity(this) + '</li>');
		_self.element.children("ul").append(elementLi);
	});

	this.element.offset({left: offset.left, top: offset.top + spanElement.height()});
	this.element.show();
}
