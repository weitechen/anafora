(function ($) {
	$.jstree.plugin("schema", {
		__init : function () {
			this.get_container()
				.bind("create_node.jstree clean_node.jstree refresh.jstree", $.proxy(function (e, data) { 
					}, this));
			},
		_fn : {
			_parse_json : function (js, obj, is_callback) {
				var d= this._parse_json.old.call(this, js, obj, is_callback);

				if(js instanceof IType) {
					var colorBlock = $('<span class="jstreeschema" style="background-color: #' + js.color + '">&nbsp;</span>');
			 		$(d).children("a").prepend(colorBlock);
					if (js.getTypeCount() != undefined) {
						var countBlock = $('<span class="jstreeschemacount">(' + js.getTypeCount().toString() + ')</span>');
						$(d).children("a").append(countBlock);

					}
				}
				$(d).bind('node_change', function(event, state) { if(currentAProject) { var tNode = currentAProject.schema.typeDict[this.id.substring(3)]; if(tNode != undefined) tNode.attr.class = state ? "jstree-unchecked" : "jstree-checked"; }});
				return d
			},
			change_state : function (obj, state) {
				var s = this.__call_old(this, obj, state);
				$(obj).trigger('node_change', [state]);
				return s;
			},
			selectAObjList : function(typeList, needTempSave, skipAObjList) {
				var _this = this;
				if(needTempSave) {
					this.data.restoreData = this.get_checked();
				}
				this.uncheck_all();
				$.each(typeList, function() {
					_this.change_state($("#" + this.id, false));
				});
				schemaCheckedChange(undefined, skipAObjList);
			},
			restore : function() {
				var _this = this;
				var restoreList = this.data.restoreData;
				if(restoreList != undefined) {
					this.uncheck_all();
					$.each(restoreList, function() {
					_this.change_state($("#" + this.id, false));
				});
				
				restoreList = undefined;
				schemaCheckedChange();
				}
			},
			refresh : function(obj) {
				var _this = this;
				var checkedNode = this.get_checked();
				var rObj = this.__call_old(obj);
				this.uncheck_all();
				$.each(checkedNode, function() {
					_this.change_state($("#" + this.id, false));
				});

				return rObj;
			}
	}});
})(jQuery);
