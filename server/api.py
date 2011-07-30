import os.path

import tornado.web
from tornado.options import define, options
import tornadio
import tornadio.router
import tornadio.server

from tornado.escape import json_encode

import config
options.port = getattr(config, 'port', 8888)
options.debug = getattr(config, 'debug', True)

ROOT_DIR = os.path.dirname(__file__)

class JamSessionConnection(tornadio.SocketConnection):
  """Base JamSession connection object"""
  scores =        { } # key: scoreId, val: set<userId>
  users =         { } # key: userId,  val: JamSessionConnection
  connections = set() # item: JamSessionConnection

  def _broadcastAll(self,m):
    for p in self.users.iterkeys():
      p.send(json_encode(m))

  def _broadcastScore(self,m,scoreId):
    for u in self.scores[scoreId]:
      self.users[u].send(json_encode(m))

  def on_open(self, *args, **kwargs):
    self.connections.add(self)
    self.send('Welcome!')

  def _init(self,m,userId):
    if userId not in self.users:
      self.users[userId] = self
      self._broadcastAll(m)
  
  def _editScore(self,m,userId,scoreId):
    if userId in self.users and scoreId in self.scores:
      self.scores.add(userId)
      self._broadcastScore(self,m,scoreId)

  def _closeScore(self,m,userId,scoreId):
    if userId in self.users and scoreId in self.scores:
      self.scores[scoreId].remove(userId)
      self._broadcastScore(self,m,scoreId)
  
  def _addNote(self,m,userId,scoreId,note):
    if userId in self.users and scoreId in self.scores \
       and userId in self.scores[scoreId]:
      # TODO: Add note to score
      self._broadcastScore(self,m,scoreId)

  def _addMeasureBlock(self,m,userId,scoreId,measureBlock):
    if userId in self.users and scoreId in self.scores \
       and userId in self.scores[scoreId]:
      # TODO: Add note to score
      self._broadcastScore(self,m,scoreId)

  def _removeNote(self,m,userId,scoreId,note):
    if userId in self.users and scoreId in self.scores \
       and userId in self.scores[scoreId]:
      # TODO: Add note to score
      self._broadcastScore(self,m,scoreId)

  def _removeMeasureBlock(self,m,userId,scoreId):
    if userId in self.users and scoreId in self.scores \
       and userId in self.scores[scoreId]:
      # TODO: Add note to score
      self._broadcastScore(self,m,scoreId)

  def _getScore(self,m,userId,scoreId):
    if userId in self.users and scoreId in self.scores \
       and userId in self.scores[scoreId]:
      # TODO: send score to user

  def on_message(self, m):
    if m.method == 'init':
      self._init(m,m.userId)
    elif m.method == 'editScore':
      self._editScore(m,m.userId,m.scoreId)
    elif m.method == 'closeScore':
      self._closeScore(m,m.userId,m.scoreId)
    elif m.method == 'addNote':
      self._addNote(m,m.userId,m.scoreId,m.note)
    elif m.method == 'removeNote':
      self._removeNote(m,m.userId,m.scoreId,m.note)
    elif m.method == 'addMeasureBlock':
      self._addMeasureBlock(m,m.userId,m.scoreId,m.measureBlock)
    elif m.method == 'removeMeasureBlock':
      self._removeMeasureBlock(m,m.userId,m.scoreId,m.measureBlock)
    elif m.method == 'getScore':
      self._getScore(m,m.userId,m.scoreId)

  def on_close(self):
    self.participants.remove(self)
    for p in self.participants:
      p.send("A user has left.")


class Application(tornado.web.Application):
  def __init__(self):
    Router = tornadio.get_router(JamSessionConnection, resource='socket', extra_re=r'\S+', extra_sep='/')
    handlers = [
      Router.route(),
      ]
    settings = dict(
      cookie_secret="12oETzKXQAG5OkPL5gEmGeJJFuYh7EQQp2XdTP1o/Vo=",
      template_path=os.path.join(os.path.dirname(__file__), "templates"),
      static_path=os.path.join(os.path.dirname(__file__), "static"),
      xsrf_cookies=False,
      enabled_protocols=['websocket', 'xhr-multipart', 'xhr-polling'],
      debug=options.debug,
      socket_io_port=options.port
      )
    tornado.web.Application.__init__(self, handlers, **settings)

def main():
  import logging
  logging.getLogger().setLevel(logging.DEBUG)
  tornado.options.parse_command_line()
  http_server = tornado.httpserver.HTTPServer(Application())
  http_server.listen(options.port)
  tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
  main()
