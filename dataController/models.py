from django.db import models

# Create your models here.


class CompleteDatas(models.Model):
    # logging the completion situation of each user
    Email = models.CharField(max_length=30)
    Count = models.IntegerField()
    RectCount = models.IntegerField()
    CheckedCount = models.IntegerField()
    CurrentImg = models.CharField(max_length=128)

    def __unicode__(self):
        return self.Email


class LoginDatas(models.Model):
    # logging the info of user, email and password
    Email = models.CharField(max_length=30)
    Password = models.CharField(max_length=20)

    def __unicode__(self):
        return self.Email


class MessageDatas(models.Model):
    # logging the info of each photo
    PhotoPath = models.CharField(max_length=128)
    Email = models.CharField(max_length=30)
    Message = models.CharField(max_length=3600)
    Language = models.CharField(max_length=2)
    Scene = models.CharField(max_length=10)
    RectCount = models.IntegerField()
    Quality = models.CharField(max_length=2)
    Status = models.CharField(max_length=2)
    IsChecked = models.BooleanField()

    def __unicode__(self):
        return self.PhotoPath
