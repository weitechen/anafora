/*
 * Define different level of exception
 *
 * */
function WarningException(message) {
	Error.call(message);
	this.message = message;
	if ("captureStackTrace" in Error)
		Error.captureStackTrace(this, Error);
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
		Error.captureStackTrace(this, Error);
	else
		this.stack = (new Error()).stack;
}
ErrorException.prototype = Object.create(Error.prototype);
ErrorException.prototype.name = "ErrorException";
ErrorException.prototype.constructor = ErrorException;
