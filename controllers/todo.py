#!/usr/bin/env python
# coding: utf-8
import web
from config import settings
from datetime import datetime
import random
import sys
import json
import os

reload(sys)
sys.setdefaultencoding('utf-8')

render = settings.render
db = settings.db
tb = 'todo'
user = 'user'
video = 'video'
score = 'score'
action = 'action'
playdb = 'play'
questiondb = 'question'

session = web.config._session


def get_by_id(id):
    s = db.select(video, where='id=$id', vars=locals())
    if not s:
        return False
    return s[0]


def get_plays_by_id(id):
    s = db.select(playdb, where='vid=$id', vars=locals())
    if not s:
        return False
    return s


def get_user_by_name(name):
    s = db.select(user, where='name=$name', vars=locals())
    if not s:
        return False
    return s[0]


class New:

    def POST(self):
        x = web.input(fileUpload={})
        print x.keys()
        title = x['title']
        f = x['fileUpload']
        t = x['type']
        print t

        print f.filename
        nowTime = datetime.now().strftime("%Y%m%d%H%M%S")
        randomNum = random.randint(0, 100)
        if randomNum <= 10:
            randomNum = str(0) + str(randomNum);
        uniqueNum = str(nowTime) + str(randomNum);
        tempf = open('static/video/%s.mp4' % uniqueNum, 'wb')
        tempf.write(f.value)
        tempf.close()

        if not title:
            return render.error('标题是必须的', None)
        db.insert(video, type=t, name=title, path='/static/video/%s.mp4' % uniqueNum, isExp=0)
        raise web.seeother('/admin')


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
        v = get_by_id(id)
        if not v:
            return render.error('没找到这条记录', None)

        print v['path']
        os.remove('./%s' % v['path'])
        db.delete(video, where='id=$id', vars=locals())
        db.delete(playdb, where='vid=$id', vars=locals())
        return render.error('删除成功！', '/admin')


class Index:

    def GET(self):
        if session.get('logged_in', False):
            videos1 = db.select(video, where='type=1', order='id asc')
            videos2 = db.select(video, where='type=2', order='id asc')
            videos3 = db.select(video, where='type=3', order='id asc')
            videos4 = db.select(video, where='type=4', order='id asc')

            return render.index(videos1, videos2, videos3, videos4)
        else:
            raise web.seeother('/login')


class Main:

    def GET(self):
        if session.get('logged_in', False):

            return render.main()
        else:
            raise web.seeother('/login')


class Sign:

    def GET(self, id):
        if not session.get('logged_in', False):
            raise web.seeother('/login')
        if not session.get('admin', False):
            raise web.seeother('/')
        v = get_by_id(id)
        return render.sign(v)


class Sign_read:

    def GET(self, id):
        if not session.get('logged_in', False):
            raise web.seeother('/login')
        v = get_by_id(id)
        return render.sign_read(v)


class Insert_play_data:
    def POST(self, id):
        if not session.get('logged_in', False):
            raise web.seeother('/login')
        if not session.get('admin', False):
            raise web.seeother('/')
        play = web.input()

        vid = int(id)
        t = int(play['type'])
        length = int(play['length'])
        time = float(play['time'])
        title = play['title']
        url = play['url'][7:]
        desc = play['desc']
        topY = play['topY'][:-1]
        leftX = play['leftX'][:-1]
        print topY, leftX
        result = db.insert(playdb, vid=vid, type=t, length=length,
                           time=time, title=title, url=url, des=desc,
                           topY=topY, leftX=leftX)
        if result:
            return 'true'
        else:
            return 'false'


class Insert_question_data:
    def POST(self, id):
        if not session.get('logged_in', False):
            raise web.seeother('/login')
        if not session.get('admin', False):
            raise web.seeother('/')
        play = web.input()
        print(play.keys())
        vid = int(id)
        t = int(play['type'])
        length = int(play['length'])
        time = float(play['time'])
        title = play['title']
        url = play['url'][7:]
        desc = play['desc']
        topY = play['topY'][:-1]
        leftX = play['leftX'][:-1]
        questions = json.loads(play["questions"])
        question = {}
        for i in range(1, 11):
            tem = str(i)
            question.setdefault(tem, questions.get(tem, ""))
        result = db.insert(playdb, vid=vid, type=t, length=length,
                           time=time, title=title, url=url, des=desc,
                           topY=topY, leftX=leftX)
        print(result)
        result1 = db.insert(questiondb, vid=vid, btnId=result, Q1=question["1"],
                            Q2=question["2"], Q3=question["3"], Q4=question["4"],
                            Q5=question["5"], Q6=question["6"], Q7=question["7"],
                            Q8=question["8"], Q9=question["9"], Q10=question["10"])
        print(result1)
        if result1:
            return 'true'
        else:
            return 'false'


class Select_play_data:
    def POST(self, id):
        plays = get_plays_by_id(id)
        if not plays:
            return json.dumps([])

        plays = list(plays)
        for p in plays:
            p['topY'] = '%.14f%%' % float(p['topY'])
            p['leftX'] = '%.14f%%' % float(p['leftX'])
            p['url'] = 'http://%s' % p['url']
            p['desc'] = p['des']

        result = json.dumps(plays)
        print result
        if plays:
            return json.dumps(plays)
        else:
            return json.dumps([])


class Select_index_data:
    def POST(self, id):
        plays = get_plays_by_id(id)
        play = web.input()
        print play
        ind = int(play['index'])

        if not plays:
            return json.dumps([])

        plays = list(plays)
        for p in plays:
            p['topY'] = '%.14f%%' % float(p['topY'])
            p['leftX'] = '%.14f%%' % float(p['leftX'])
            p['url'] = 'http://%s' % p['url']
            p['desc'] = p['des']

        result = json.dumps(plays[ind])
        print result
        if plays:
            return result
        else:
            return json.dumps([])


class Clear:
    def POST(self, id):
        db.delete(playdb, where='vid=$id', vars=locals())
        return render.error('删除成功！', '/sign')


class AddUser:

    def GET(self):
        pass

    def POST(self):
        if not session.get('logged_in', False):
            raise web.seeother('/login')
        i = web.input()
        username = i.get('username')
        pwd = i.get('pwd')
        result = get_user_by_name(username)
        if not result:
            db.insert(user, name=username, pwd=pwd, admin='0')
        raise web.seeother('/manage')


class AddUsers:

    def GET(self):
        pass

    def POST(self):
        x = web.input()
        f = x['userfile']
        userlist = f.split("\r\n")
        print(len(userlist))
        if len(userlist) > 0:
            db.delete(user, where='admin=0', vars=locals())
        for item in userlist:
            temp = item.split(",")
            print(temp[0], temp[1], temp[2])
            db.insert(user, name=temp[0], pwd=temp[1], admin=temp[2]);
        raise web.seeother('/manage')


class DelUser:

    def GET(self, id):
        u = get_by_id(id)
        if not u:
            return false

        db.delete(user, where='id=$id', vars=locals())
        return render.error('删除成功！', '/manage')
        pass

    def POST(self):
        pass


class Logout:

    def GET(self):
        session.kill()
        return render.login()


class Login:

    def GET(self):
        return render.login()
        pass

    def POST(self):
        i = web.input()
        username = i.get('username')
        passwd = i.get('passwd')
        print username, passwd

        result = get_user_by_name(username)
        print result and result['pwd'] == passwd
        if result and result['pwd'] == passwd:
            print "Login success"
            session.uid = result['id']
            session.logged_in = True
            session.admin = False
            print session.get('logged_in', False)
            print session.get('admin', False)

            web.setcookie('userid', result['id'], 60)
            if result['admin'] == u'1':
                session.admin = True
                raise web.seeother('/admin')
            else:
                raise web.seeother('/main')
        else:
            return render.login()


class Score:

    def GET(self):
        pass

    def POST(self, id):
        if not session.get('logged_in', False):
            raise web.seeother('/login')
        data = web.input()

        vid = int(id)
        uid = session.get('uid', 0)
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        value = float(data['score'])
        result = db.insert(score, vid=vid, uid=uid, timestamp=timestamp,
                           value=value)
        if result:
            return 'true'
        else:
            return 'false'

        pass


class Action:

    def GET(self):
        pass

    def POST(self, id):
        if not session.get('logged_in', False):
            raise web.seeother('/login')
        data = web.input()

        vid = int(id)
        uid = session.get('uid', 0)
        bid = 0
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        value = data['action']
        result = db.insert(action, vid=vid, uid=uid, bid=bid, timestamp=timestamp,
                           action=value)
        if result:
            return 'true'
        else:
            return 'false'

        pass


class Admin:

    def GET(self):
        print session.get('logged_in', False)
        print session.get('admin', False)
        if not session.get('logged_in', False):
            raise web.seeother('/login')
        if not session.get('admin', False):
            raise web.seeother('/')

        videos1 = db.select(video, where='type=1', order='id asc')
        videos2 = db.select(video, where='type=2', order='id asc')
        videos3 = db.select(video, where='type=3', order='id asc')
        videos4 = db.select(video, where='type=4', order='id asc')

        return render.admin(videos1, videos2, videos3, videos4)
        pass

    def POST(self):
        pass


class Manage:

    def GET(self):
        if not session.get('logged_in', False):
            raise web.seeother('/login')
        if not session.get('admin', False):
            raise web.seeother('/')

        users = db.select(user, order='id asc')
        allvideos = db.select(video, order='type desc')
        return render.manage(users, allvideos)
        pass

    def POST(self):
        pass


class Update_video_data:
    def POST(self):
        if not session.get('logged_in', False):
            raise web.seeother('/login')
        data = web.input()
        for item in data:
            print(item)
            print(data[item])
            result = db.update(video, isExp=data[item], where='id=$item', vars=locals())
        if result:
            return 'true'
        else:
            return 'false'
        pass
