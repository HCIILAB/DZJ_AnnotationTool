#!/bin/bash
# Progarm:
# 	this script runs the TextMarkTool Web App
# History:
# 	2016.11.09 	Kelvin		V1
python manage.py syncdb
python manage.py runserver 0.0.0.0:8000
