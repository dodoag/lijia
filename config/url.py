#!/usr/bin/env python
# coding: utf-8

pre_fix = 'controllers.'

urls = (
    '/',                    pre_fix + 'todo.Index',
    '/admin',                    pre_fix + 'todo.Admin',
    '/login',                    pre_fix + 'todo.Login',
    '/todo/new',            pre_fix + 'todo.New',
    '/todo/(\d+)',          pre_fix + 'todo.View',
    '/todo/(\d+)/edit',     pre_fix + 'todo.Edit',
    '/todo/(\d+)/delete',   pre_fix + 'todo.Delete',
    '/todo/(\d+)/finish',   pre_fix + 'todo.Finish',
    '/AddUser',             pre_fix + 'todo.AddUser',
    '/Admin',               pre_fix + 'todo.Admin',
    '/Login',               pre_fix + 'todo.Login',
    '/sign/(\d+)',          pre_fix + 'todo.Sign',
    '/sign/(\d+)/read',          pre_fix + 'todo.Sign_read',
    '/sign/(\d+)/score',          pre_fix + 'todo.Score',
    '/sign/(\d+)/action',          pre_fix + 'todo.Action',
    '/sign/(\d+)/insert-play-data',          pre_fix + 'todo.Insert_play_data',
    '/sign/(\d+)/select-play-data',          pre_fix + 'todo.Select_play_data',
    '/sign/(\d+)/select-index-data',          pre_fix + 'todo.Select_index_data',

)
