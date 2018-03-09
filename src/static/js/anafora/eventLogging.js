
function EventLogging() {
	this.logList = [];
}

EventLogging.prototype.addNewEvent = function(newEvent) {
	this.logList.push(newEvent);
}

EventLogging.prototype.clear = function() {
	this.logList = [];	
}

var EventType = { MENU_CLICK:{v:0, name:"menu_click"},
		SPAN_CLICK:{v:1, name:"span_click"},
		SPAN_MENU_CLICK:{v:2, name:"span_ment_click"},
		REL_ROW_CLICK:{v:3, name:"rel_row_click"},
		DELETE_BTN_CLICK:{v:4, name:"delete_btn_click"},
		ADJ_BTN_CLICK:{v:5, name:"adj_btn_click"},
		LIST_CLICK:{v:6, name:"list_click"},
		VAL_CLICK:{v:7, name:"val_click"},
		HOTKEY_PRESS:{v:8, name:"hotkey_press"},
		ADJ_PRESS:{v:9, name:"adj_press"},
		PROP_PRESS:{v:10, name:"prop_press"},
		MOVE_PRESS:{v:11, name:"move_press"},
		ESC_PRESS:{v:12, name:"esc_press"}}

function EventLog(eventType, val) {
	this.eventType = eventType;
	this.val = val;
	var d = new Date();
	this.t = d.toLocaleString("en-GB");
}

EventLog.prototype.toString = function() {
	return this.t + "  : " + this.eventType.name + " - " + this.val;

}
