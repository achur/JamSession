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
  scores = defaultdict(set) # key: scoreId, val: {JamSessionConnection}

  def on_open(self, *args, **kwargs):
    self.score, self.user_name = kwargs['extra'].split('-')
    self.scores[self.score].add(self)
    self.send('Welcome!')
    
  def _broadcast(self,m):
    for p in self.scores[self.score]:
      p.send(json_encode(m))

  def _addNote(self,m,note):
    # TODO: add note to score
    self._broadcast(self,m)

  def _addMeasureBlock(self,m,measureBlock):
    # TODO: add measureBlock to score
    self._broadcast(self,m)

  def _removeNote(self,m,note):
    # TODO: remove note from score
    self._broadcast(self,m)

  def _removeMeasureBlock(self,m,measureBlock):
    # TODO: remove measureBlock from score
    self._broadcast(self,m)

  def _getScore(self):
    # TODO: send score to user
    pass

  def on_message(self, m):
    elif m.method == 'addNote':
      self._addNote(m,m.note)
    elif m.method == 'removeNote':
      self._removeNote(m,m.note)
    elif m.method == 'addMeasureBlock':
      self._addMeasureBlock(m,m.measureBlock)
    elif m.method == 'removeMeasureBlock':
      self._removeMeasureBlock(m,m.measureBlock)
    elif m.method == 'getScore':
      self._getScore()
      
  def on_close(self):
    self.scores[self.score].remove(self)
    for p in self.scores[self.score]:
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
