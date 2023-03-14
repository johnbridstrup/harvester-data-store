import logging
import django_filters.rest_framework as filters

from common.filters import CommonInfoFilterset

from .models import Notification




class NotificationFilter(CommonInfoFilterset):
    category = filters.CharFilter(method="created_or_recipient")

    def created_or_recipient(self, queryset, name, category):
        if category is None:
            return queryset
        if category == "created":
            return queryset.filter(creator=self.request.user)
        if category == "is_recipient":
            return queryset.filter(recipients__in=[self.request.user])
        
        logging.warn(f"Unrecognized category {category} in NotificationFilter.")
        return queryset

    class Meta:
        model = Notification
        fields = CommonInfoFilterset.FIELDS_BASE + [
            'category',
        ]
