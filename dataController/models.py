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
    Message = models.TextField()
    RectCount = models.IntegerField()
    Status = models.CharField(max_length=2)
    IsChecked = models.BooleanField()
    BookName = models.CharField(max_length=50)
    Volume = models.CharField(max_length=10)
    Page = models.CharField(max_length=10)

    def __unicode__(self):
        return self.PhotoPath
