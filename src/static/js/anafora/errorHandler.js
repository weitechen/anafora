/*
 * Define different level of exception
 *
 * */
function WarningException(message) {
	Error.call(message);
	this.message = message;
	if ("captureStackTrace" in Error)
		Error.captureStackTrace(this, WarningException);
	else
		this.stack = (new Error()).stack;
}

WarningException.prototype = Object.create(Error.prototype);
WarningException.prototype.name = "WarningException";
WarningException.prototype.constructor = WarningException;

function ErrorException(message) {
	Error.call(message);
	this.message = message;
	if ("captureStackTrace" in Error)
		Error.captureStackTrace(this, ErrorException);
	else
		this.stack = (new Error()).stack;
}
ErrorException.prototype = Object.create(Error.prototype);
ErrorException.prototype.name = "ErrorException";
ErrorException.prototype.constructor = ErrorException;

function ErrorHandler(messageDiv) {
	this.messageDiv = messageDiv;
	this.mask = $("#mask");
}

ErrorHandler.prototype.fixPosition = function() {
	var popMargTop = (this.messageDiv.height()) / 2;
	var popMargLeft = (this.messageDiv.width()) / 2;
	this.messageDiv.css({ 
			'margin-top' : -popMargTop,
			'margin-left' : -popMargLeft
	});
}
ErrorHandler.prototype.popup = function() {
	this.messageDiv.fadeIn(200);
	this.mask.fadeIn(200);

}

ErrorHandler.prototype.handle = function(e, focusProject) {
	if (e instanceof ErrorException) {
		if((typeof e.message) == "string")
			e.message = e.message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/"/g, '&quot;');
		this.messageDiv.children("div:first-child").children("pre").append(e.message);
		console.log(e.stack);
	}
	else if (e instanceof WarningException) {
		;
	}
	else {
		this.messageDiv.children("div:first-child").children("pre").html(String(e.stack).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/"/g, '&quot;'));
	}

	if(_setting != undefined) {
		var _container = $(this.messageDiv).children("div:nth-child(2)").children("ul");
		$.each(_setting, function(key, value) {
			_container.append("<li><b>" + key + "</b>: " + String(value) + "</li>");
		});
		_container.append("<li><b>URL</b>: " + String(window.location.href ) + "</li>");

	}

	if(focusProject != undefined) {
		var _container = $(this.messageDiv).children("div:nth-child(3)").children("ul");
		_container.append("<li><b>schema</b>: " + String(focusProject.schema) + "</li>");
		_container.append("<li><b>annotator</b>: " + String(focusProject.annotator) + "</li>");
		console.log(focusProject);
	}
	this.fixPosition();
	this.popup();

}
