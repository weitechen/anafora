from django import template
register = template.Library()

@register.filter
def type(value):
	if isinstance(value, str):
		return 'str'
	elif isinstance(value, bool):
		return 'bool'
	elif isinstance(value, int):
		return "int"
	return 'str'
