from django.shortcuts import render, render_to_response, redirect
from django.http import HttpResponse
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from dataController.models import CompleteDatas, LoginDatas, MessageDatas
from dataController.tools import getNextPhoto, getComplete, getMessage, getRectNumFromMessage, distributePhoto, getBookInfo

import datetime
import json


# datapath = '/static/data/'
datapath = '/static/data/closed_beta/'
BUSY_FLAG = "-2"  # the flag that indicate the server busy before
FINISHED_FLAG = "-1"  # the flag that indicate data have been all labeled

# Create your views here.


def index(request):
    if 'Email' in request.COOKIES:
        # if user has logged in, it has Email in cookies
        email = request.COOKIES.get('Email', '')
        if email:
            # initialize some result
            status = ''
            imagePath = ''
            message = ''
            completeData = []
            ret = {}
            completeCount = 0
            rectCount = 0
            bookName = ''
            volume = ''
            page = ''
            # get the imagePath and complete situation
            # imagePath = getNextPhoto(email)
            completeData = getComplete(email)
            completeCount = completeData[0]
            rectCount = completeData[1]
            imagePath = completeData[2]
            if imagePath == BUSY_FLAG:
                # no effective imagePath
                # distribute again and update
                imagePath = distributePhoto(email)
            if imagePath[0] == '-':
                # there is no new image need to be labeled
                status = imagePath
            else:
                message = getMessage(imagePath)
                bookName, volume, page = getBookInfo(imagePath)

            # set the return result
            imagePath = datapath + imagePath
            ret = {'completeCount': completeCount,
                   'rectCount': rectCount,
                   'status': status,
                   'imagePath': imagePath,
                   'message': message,
                   'bookName': bookName,
                   'volume': volume,
                   'page': page,
                   'Email': email}
            # set cookies which will expires 3 days later and return
            # response
            response = render(request, 'index.html', {'ret': ret})
            response.set_cookie(
                'Email', email, expires=datetime.datetime.now() +
                datetime.timedelta(days=3))
            return response
            # return render(request, 'index.html', {'ret': ret})
        else:
            return redirect('error')
    else:
        # if user has not logged in, redirect to the login page
        return redirect('login_with_args', state='0')


def selfCheck(request):
    if 'Email' in request.COOKIES:
        email = request.COOKIES.get('Email', '')
        storeFlagCookie = request.COOKIES.get('storeFlag', '')
        completeData = getComplete(email)
        completeCount = completeData[0]
        ret = {}
        if completeCount == 0:
            # the user has not labeled any data
            ret = {
                'checkStatus': '-1'
            }
            return render(request, 'selfCheck.html', {'ret': ret})
        checkedNum = completeData[3]
        toMarkNum = completeCount - checkedNum
        if storeFlagCookie == '1':
            # "0" for using the data from front end
            ret = {
                'checkStatus': '0'
            }
            return render(request, 'selfCheck.html', {'ret': ret})
        mesData_set = MessageDatas.objects.filter(Email=email, IsChecked=False)
        if mesData_set.count() == 0:
            # the user has finished checking his data
            ret = {
                'checkStatus': '-2'
            }
            return render(request, 'selfCheck.html', {'ret': ret})
        cnt = 0
        todoList = ''
        for rec in mesData_set:
            if cnt == 0:
                ret_photopath = datapath + rec.PhotoPath
                ret_message = rec.Message
                ret_language = rec.Language
                ret_scene = rec.Scene
                ret_rectCount = rec.RectCount
                ret_quality = rec.Quality
                cnt = 1
            else:
                todoList += "_" + datapath + rec.PhotoPath + ',' +\
                    rec.Quality + ',' + rec.Language + ',' +\
                    rec.Scene + ',' + rec.Message
        ret = {
            'checkStatus': 1,
            'Email': email,
            'photoPath': ret_photopath,
            'Message': ret_message,
            'Language': ret_language,
            'Scene': ret_scene,
            'RectCount': ret_rectCount,
            'Quality': ret_quality,
            'checkedNum': checkedNum,
            'toMarkNum': toMarkNum
        }
        if todoList != '':
            ret["todoList"] = todoList[1:]
            response = render(request, 'selfCheck.html', {'ret': ret})
            response.set_cookie('storeFlag', '1',
                                expires=datetime.datetime.now() +
                                datetime.timedelta(hours=6))
        else:
            ret["todoList"] = todoList
            response = render(request, 'selfCheck.html', {'ret': ret})
            response.set_cookie('storeFlag', '0',
                                expires=datetime.datetime.now() +
                                datetime.timedelta(hours=6))
        return response
    else:
        return redirect('login_with_args', state='0')


def introduction(request):
    return render(request, 'introduction.html')


def login(request, **kwargs):
    state = ''
    if kwargs:
        state = str(kwargs['state'])
    else:
        print 'no kwargs in login'
    return render(request, 'login.html', {'state': state})


def checkLogin(request):
    if request.method == 'POST':
        email = request.POST.get('Email', '')
        password = request.POST.get('Password', '')
        if email and password:
            if LoginDatas.objects.filter(Email=email).exists():
                tmpLoginData = LoginDatas.objects.get(Email=email)
                if password == tmpLoginData.Password:
                    # login sucessfully
                    response = redirect('index')
                    response.set_cookie(
                        'Email', email, expires=datetime.datetime.now() +
                        datetime.timedelta(days=3))
                    return response
            # somethin wrong with the email or the password
            return redirect('login_with_args', state='1')
    # shows the login page on default
    return redirect('login_with_args', state='0')


def register(request, **kwargs):
    state = ''
    if kwargs:
        # print kwargs
        state = str(kwargs['state'])
    else:
        print 'no kwargs in register'
        # assert False
    return render(request, 'register.html', {'state': state})


def checkRegister(request):
    # check if the data was transported through post method
    if request.method == 'POST':
        email = request.POST.get('Email', '')
        password = request.POST.get('Password', '')
        # check if email and password were correctly extracted
        if email and password:
            print 'Email:' + email
            print 'Password:' + password
            if LoginDatas.objects.filter(Email=email).exists():
                # the email has exists
                # print 'email has exists'
                return redirect('register_with_args', state='1')
            else:
                # the email can be used to register
                # add the user with tihs email and password
                newUser = LoginDatas(Email=email, Password=password)
                newUser.save()
                # add a record in CompleteDatas
                try:
                    imagePath = getNextPhoto(email)
                except Exception as e:
                    print e
                    imagePath = BUSY_FLAG
                # initialization for a new user
                newRec = CompleteDatas(
                    Email=email, Count=0, RectCount=0, CheckedCount=0,
                    CurrentImg=imagePath)
                newRec.save()
                # set cookies which will expires 3 days later and return
                # response
                response = redirect('register_with_args', state='0')
                response.set_cookie(
                    'Email', email, expires=datetime.datetime.now() +
                    datetime.timedelta(days=3))
                return response
        else:
            # email and password extracting with error
            return HttpResponse('Error in getting post data!')
    else:
        # the data was not transported through post method
        return redirect(reverse('register'))


def error(request):
    # set the default error message
    message = 'there is something wrong with the action'
    if request.method == 'GET' and 's' in request.GET:
        s = request.GET.get('s', '')
        # s=-5, for the log out operation
        if s == '-5':
            if 'Email' in request.COOKIES:
                email = request.COOKIES.get('Email', '')
                if email:
                    message = 'Sucessfully logged out'
                    response = render(request, 'error.html',
                                      {'Message': message})
                    response.set_cookie(
                        'Email', email, expires=datetime.datetime.now() -
                        datetime.timedelta(days=1))
                    # sucessfully looged out and remove the cookies
                    return response
                else:
                    message = 'You have not logged in'
            else:
                message = 'You have not logged in!'
        elif s == '-1':
            message = 'All the data has been labeled!'
        elif s == '-2':
            message = 'Server busy!'
        elif s == '-4':
            message = 'Parameters error!'
    # finally
    return render(request, 'error.html', {'Message': message})

# the data will be posted here


@csrf_exempt
def setMessage(request):
    # check the email first
    if 'Email' in request.COOKIES:
        # get the data and update the database
        email = request.COOKIES.get('Email', '')
        if email:
            # extract data
            message = request.POST.get("Message", '')
            photoPath = request.POST.get('PhotoPath', '')
            # update database
            if MessageDatas.objects.filter(PhotoPath=photoPath).exists():
                rec = MessageDatas.objects.get(PhotoPath=photoPath)
                rec.Email = email
                rec.Message = message.encode('utf8')
                rec.RectCount = getRectNumFromMessage(message.encode('utf8'))
                rec.Status = '11'
                rec.save()
                # get complete situation
                # get next imagePath
                usrComplt = CompleteDatas.objects.get(Email=email)
                usrComplt.Count += 1
                usrComplt.RectCount += rec.RectCount
                try:
                    imagePath = getNextPhoto(email)
                except Exception as e:
                    print e
                    imagePath = BUSY_FLAG
                usrComplt.CurrentImg = imagePath
                usrComplt.save()
                # return result
                ret = {}
                status = 0
                if imagePath[0] == '-':
                    # there is no new image need to be labeled
                    status = imagePath
                else:
                    message = getMessage(imagePath)
                    bookName, volume, page = getBookInfo(imagePath)
                ret = {"status": status,
                       "nextImage": datapath + imagePath,
                       "completeCount": usrComplt.Count,
                       "rectTotalRect": usrComplt.RectCount,
                       "message": message,
                       "bookName": bookName,
                       "volume": volume,
                       "page": page,
                       }
                return HttpResponse(json.dumps(ret), content_type='text/json')
            else:
                return redirect('error')
        else:
            return redirect('error')
    else:
        return redirect('login_with_args', state='0')


@csrf_exempt
def setCheckMessage(request):
    # check the email first
    if 'Email' in request.COOKIES:
        # get the data and update the database
        email = request.COOKIES.get('Email', '')
        if email:
            # extract data
            message = request.POST.get("Message", '')
            photoPath = request.POST.get('PhotoPath', '')
            language = request.POST.get('Language', '')
            scene = request.POST.get('Scene', '')
            quality = request.POST.get('Quality', '')
            # check complete datas
            if CompleteDatas.objects.filter(Email=email).exists():
                completeData = getComplete(email)
                checkedNum = completeData[3]
                toCheckedNum = completeData[0] - checkedNum
                # update database
                if MessageDatas.objects.filter(PhotoPath=photoPath).exists():
                    rec = MessageDatas.objects.get(PhotoPath=photoPath)
                    rec.Email = email
                    rec.Message = message.encode('utf8')
                    rec.Language = language
                    rec.Scene = scene
                    rec.RectCount = len(message.split(';'))
                    rec.Quality = quality
                    rec.Status = '11'
                    print "Email, Message, Language, Scene, RectCount, Quality"
                    print email, rec.Message, language, scene,\
                        len(message.split(';')), quality
                    # print type(rec.Message)
                    if rec.IsChecked:
                        rec.save()
                        ret = {
                            "status": 0,
                            "checkedNum": checkedNum,
                            "toCheckedNum": toCheckedNum
                        }
                    else:
                        # update and return
                        rec.IsChecked = True
                        rec.save()
                        usrComplt = CompleteDatas.objects.get(Email=email)
                        usrComplt.CheckedCount += 1
                        usrComplt.save()
                        ret = {
                            "status": "0",
                            "checkedNum": checkedNum + 1,
                            "toCheckedNum": toCheckedNum - 1
                        }
                    # return result
                    return HttpResponse(json.dumps(ret),
                                        content_type='text/json')
                else:
                    return HttpResponse(json.dumps({"status": "-4"}),
                                        content_type='text/json')
            else:
                return HttpResponse(json.dumps({"status": "-3"}),
                                    content_type='text/json')
        else:
            return HttpResponse(json.dumps({"status": "-2"}),
                                content_type='text/json')
    else:
        return redirect('login_with_args', state='0')


@csrf_exempt
def getCheckedDetail(request):
    if 'Email' in request.COOKIES:
        email = request.COOKIES.get('Email', '')
        if email:
            photoPath = request.POST.get('photoPath', '')
            if MessageDatas.objects.filter(PhotoPath=photoPath).exists():
                rec = MessageDatas.objects.get(PhotoPath=photoPath)
                ret = {
                    "status": 0,
                    "Message": rec.Message,
                    "PhotoPath": datapath + rec.PhotoPath,
                    "Language": rec.Language,
                    "Scene": rec.Scene,
                    "Quality": rec.Quality
                }
                return HttpResponse(json.dumps(ret),
                                    content_type='text/json')
            else:
                return HttpResponse(json.dumps({"status": "-1"}),
                                    content_type='text/json')
        else:
            return HttpResponse(json.dumps({"status": "-2"}),
                                content_type='text/json')
    else:
        return redirect('login_with_args', state='0')


@csrf_exempt
def getTodoList(request):
    if 'Email' in request.COOKIES:
        email = request.COOKIES.get('Email', '')
        mesData_set = MessageDatas.objects.filter(Email=email, IsChecked=False)
        if mesData_set.count() == 0:
            # the user has finished checking his data
            ret = {
                'status': -2
            }
            return HttpResponse(json.dumps(ret),
                                content_type='text/json')
        todoList = ''
        for rec in mesData_set:
            todoList += "_" + datapath + rec.PhotoPath + ',' +\
                rec.Quality + ',' + rec.Language + ',' +\
                rec.Scene + ',' + rec.Message
        ret = {
            "status": 0,
            "message": todoList[1:]
        }
    else:
        return HttpResponse(json.dumps({"status": -1}),
                            content_type='text/json')


@csrf_exempt
def getAllChecked(request):
    if 'Email' in request.COOKIES:
        email = request.COOKIES.get('Email', '')
        checkedData_set = MessageDatas.objects.filter(
            Email=email, IsChecked=True)
        if checkedData_set.count() == 0:
            return HttpResponse(json.dumps({"status": -2}),
                                content_type='text/json')
        tmpStr = ''
        for rec in checkedData_set:
            tmpStr += "," + datapath + rec.PhotoPath
        ret = {
            "status": 0,
            "path": tmpStr[1:]
        }
        return HttpResponse(json.dumps(ret),
                            content_type='text/json')
    else:
        return HttpResponse(json.dumps({"status": -1}),
                            content_type='text/json')


def display_meta(request):
    values = request.META.items()
    values.sort()
    html = []
    for k, v in values:
        html.append('<tr><td>%s</td><td>%s</td></tr>' % (k, v))
    return HttpResponse('<table>%s</table>' % '\n'.join(html))


def search_form(request):
    return render_to_response('search_form.html')


def search(request):
    if 'q' in request.GET:
        message = 'You searched for: %r' % request.GET['q']
    else:
        message = 'You submitted an empty form.'
    return HttpResponse(message)
