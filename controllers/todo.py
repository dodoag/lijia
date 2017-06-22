#!/usr/bin/env python
# coding: utf-8
import web
from config import settings
from datetime import datetime
import random
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

render = settings.render
db = settings.db
tb = 'todo'
user='user'
video = 'video'



def get_by_id(id):
    s = db.select(video, where='id=$id', vars=locals())
    if not s:
        return False
    return s[0]

class New:

    def POST(self):
        x = web.input(fileUpload={})
        print x.keys()
        title = x['title']
        f = x['fileUpload']

        print f.filename
        nowTime=datetime.now().strftime("%Y%m%d%H%M%S")
        randomNum=random.randint(0,100)
        if randomNum<=10:
            randomNum=str(0)+str(randomNum);  
        uniqueNum=str(nowTime)+str(randomNum);
        tempf = open('static/video/%s.mp4'%uniqueNum,'wb')
        tempf.write(f.value)
        tempf.close()

        if not title:
            return render.error('标题是必须的', None)
        db.insert(video, name=title, path='/static/video/%s.mp4'%uniqueNum)
        raise web.seeother('/')


class Finish:

    def GET(self, id):
        todo = get_by_id(id)
        if not todo:
            return render.error('没找到这条记录', None)
        i = web.input()
        status = i.get('status', 'yes')
        if status == 'yes':
            finished = 1
        elif status == 'no':
            finished = 0
        else:
            return render.error('您发起了一个不允许的请求', '/')
        db.update(tb, finished=finished, where='id=$id', vars=locals())
        raise web.seeother('/')


class Edit:

    def GET(self, id):
        todo = get_by_id(id)
        if not todo:
            return render.error('没找到这条记录', None)
        return render.todo.edit(todo)

    def POST(self, id):
        todo = get_by_id(id)
        if not todo:
            return render.error('没找到这条记录', None)
        i = web.input()
        title = i['title']
        if not title:
            return render.error('标题是必须的', None)
        db.update(tb, title=title, where='id=$id', vars=locals())
        return render.error('修改成功！', '/')

class Delete:

    def GET(self, id):
        todo = get_by_id(id)
        if not todo:
            return render.error('没找到这条记录', None)
        db.delete(video, where='id=$id', vars=locals())
        return render.error('删除成功！', '/')


class Index:

    def GET(self):
        videos = db.select(video, order='id asc')

        return render.index(videos)

class Sign:

    def GET(self, id):
        v = get_by_id(id)
        return render.sign(v)

class Insert_play_data:
    def GET(self, id):

class AddUser:

    def GET():
        return render.adduser()

    def POST():
        pass

class Login:

    def GET():
        pass

    def POST():
        pass


class Admin:

    def GET():
        pass

    def POST():
        pass
