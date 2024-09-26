from typing import Any

from django import template

register = template.Library()


@register.filter(name="add_class")
def add_class(value, arg) -> Any:
    """Добавляет класс к полю формы."""
    return value.as_widget(attrs={"class": arg})
