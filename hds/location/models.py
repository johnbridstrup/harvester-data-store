from django.db import models

class Distributor(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Location(models.Model):
    distributor = models.ForeignKey(Distributor, on_delete=models.CASCADE)
    ranch = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.ranch