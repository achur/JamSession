import os.path
from collections import defaultdict

import tornado.web
from tornado.options import define, options
import tornadio
import tornadio.router
import tornadio.server

import config
options.port = getattr(config, 'port', 8888)
options.debug = getattr(config, 'debug', True)

ROOT_DIR = os.path.dirname(__file__)

class JamSessionConnection(tornadio.SocketConnection):
  """Base JamSession connection object"""
  scores = defaultdict(set) # key: scoreId, val: [userId]

  def on_open(self, *args, **kwargs):
    self.score, self.user_name = kwargs['extra'].split('-')
    self.scores[self.score].add(self)
    self.send('Welcome!')
    
  def _init(userId):
    pass

  def _editScore(userId,scoreId):
    pass
  
  def _addNote(userId,scoreId,note):
    pass

  def _addMeasureBlock(userId,scoreId,measureBlock):
    pass

  def _removeNote(userId,scoreId,note):
    pass

  def _removeMeasureBlock(userId,scoreId):
    pass

  def _getScore(userId,scoreId):
    pass

  def on_message(self, m):
    if m.method == 'init':
      self._init(m.userId)
    elif m.method == 'editScore':
      self._editScore(m.userId,m.scoreId)
    elif m.method == 'addNote':
      self._addNote(m.userId,m.scoreId,m.note)
    elif m.method == 'removeNote':
      self._removeNote(m.userId,m.scoreId,m.note)
    elif m.method == 'addMeasureBlock':
      self._addMeasureBlock(m.userId,m.scoreId,m.measureBlock)
    elif m.method == 'removeMeasureBlock':
      self._removeMeasureBlock(m.userId,m.scoreId,m.measureBlock)
    elif m.method == 'getScore':
      self._getScore(m.userId,m.scoreId)
      
  def on_close(self):
    self.participants.remove(self)
    for p in self.participants:
      p.send("A user has left.")


class Application(tornado.web.Application):
  def __init__(self):
    Router = tornadio.get_router(JamSessionConnection, resource='JamSessionSocket', extra_re=r'\S+', extra_sep='/')
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
