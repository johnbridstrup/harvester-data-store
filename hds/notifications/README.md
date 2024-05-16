# Notifications

This app provides a generalized framework for creating and sending notifications to team members. The heart
of the app is the `Notification` object, which contains the columns:
- `trigger_on` - The name of the model which will trigger the notification,
- `recipients` - A list of `User` objects,
- `criteria`, `criteria_type`, `criteria_id` - A `GenericForeignKey` setup, allowing ANY object in HDS to be set as the criteria for a notification to be set.

In addition to these columns, the model also defines a `notify` method, which will notify each of the `recipients` if the triggering criteria is met.

### Criteria types
To add a new `criteria_type` to an existing `trigger`, update the corresponding key in `serializers.NotificationSerializer.TRIGGER_MAP` with
the appropriate model and serializer. In general, these will be models for which the `trigger` model has a foreign key. Then,
update the appropriate handler function in `signals.py` to account for this new `criteria` model. Generally, these handler functions
will check if the criteria matches the foreign key in the `instance` of the `trigger` object.
```
TRIGGER_MAP = {
    AFTException.__name__: {
        'aftexceptioncode': (
            AFTExceptionCode,
            AFTExceptionCodeSerializer
        ),
        'somenewcriteria': (
            SomeModel,
            SomeModelSerializer
        )
    },
```
In this example, a user can now create a notification on `AFTException`, specifying a single object contained in the `SomeModel` table, that will fire whenever an exception is created with a foreign key that matches that object.

### Triggers
To add a new `trigger`, create a new entry in `serializers.NotificationSerializer.TRIGGER_MAP` and add a `criteria`. Then, define a
new handler function using the `@receiver` decorator in `signals.py`. The decorator should specify that `sender=TheNewModel`.
```
TRIGGER_MAP = {
    AFTException.__name__: {
        'aftexceptioncode': (
            AFTExceptionCode,
            AFTExceptionCodeSerializer
        )
    },
    TheNewModel.__name__: {
        'somecriteria': (
            SomeCriteria,
            SomeCriteriaSerializer
        )
    }
```

```
@receiver(post_save, sender=TheNewModel)
def new_notifcation(sender, instance, **kwargs):
    notifications = Notification.objects.filter(trigger_on=TheNewModel.__name__).all()
    for notification in notifications:
        if criteria is met:
            notification.notify()
```

We currently only use the `post_save` signal, but others are available in the django `signals` framework.
