from django.db import models

class Job(models.Model):

    STATUS_UNASSIGNED = 'unassigned'
    STATUS_OPEN = 'open'
    STATUS_COMPLETED = 'completed'

    STATUS_CHOICES = (
        (STATUS_UNASSIGNED, 'Unassigned'),
        (STATUS_OPEN, 'Open'),
        (STATUS_COMPLETED, 'Completed'),
    )

    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_UNASSIGNED)
    name = models.CharField(max_length=255)
    message = models.CharField(max_length=255)