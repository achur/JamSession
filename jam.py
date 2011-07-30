import os.path
from collections import defaultdict
import logging
from cPickle import dumps, loads
import traceback

import tornado.web
from tornado.options import options
import tornadio
import tornadio.router
import tornadio.server
from tornado.escape import json_encode, json_decode

import redis

try:
  import config
except ImportError:
  config = {}
logging.getLogger().setLevel(logging.DEBUG)
options.port = getattr(config, 'port', 8888)
options.debug = getattr(config, 'debug', True)

ROOT_DIR = os.path.dirname(__file__)
R = redis.Redis('youstache.com', port=6379, db=0)


class JamSessionConnection(tornadio.SocketConnection):
  """Base JamSession connection object"""
  scores = defaultdict(set) # key: score string, val: {JamSessionConnection}

  @property
  def notes(self):
    key = '.'.join([self.score, 'notes'])
    value = R.get(key)
    if value: return loads(value)
    else: return []
    
  @notes.setter
  def notes(self, notes):
    key = '.'.join([self.score, 'notes'])
    R.set(key, dumps(notes))

  @property
  def measures(self):
    key = '.'.join([self.score, 'measureBlocks'])
    value = R.get(key)
    if value: return loads(value)
    else: return []

  @measures.setter
  def measures(self, measureBlocks):
    key = '.'.join([self.score, 'measureBlocks'])
    R.set(key, dumps(measureBlocks))

  def on_open(self, *args, **kwargs):
    self.score, self.user_name = kwargs['extra'].split('-')
    self.scores[self.score].add(self)
    
  def _broadcast(self, package):
    for conn in self.scores[self.score]:
      try:
        conn.send(package)
      except:
        logging.error("Error sending message", exc_info=True)

  @staticmethod
  def __note_cmp(note):
    return note['start']

  @staticmethod
  def __measure_cmp(measure):
    return measure['onsetTime']

  def _addNote(self, note):
    notes = self.notes
    notes.append(note)
    self.notes = notes
    return note

  def _removeNote(self, note):
    notes = self.notes
    try:
      notes.remove(note)
      self.notes = notes
      return note
    except ValueError:
      pass # Cannot Find Note  
  
  def _addMeasureBlock(self, measureBlock):
    measures = self.measures
    measures.append(measureBlock)
    self.measures = measures
    return measureBlock

  def _removeMeasureBlock(self, measureBlock):
    measures = self.measures
    try:
      measures.remove(measureBlock)
      self.measures = measures
      return measureBlock
    except ValueError:
      pass

  def _getScore(self):
    # TODO: send score to user
    measures = list(self.measures)
    notes = list(self.notes)
    notes.sort(key=self.__note_cmp)
    measures.sort(key=self.__measure_cmp)
    package = {'name' : self.score,
               'measureBlocks' : measures,
               'notes' : notes}
    return package

  def _clearScore(self):
    self.notes = []
    self.measures = []
  
  def on_message(self, m):
    try:
      m = json_decode(m)
      logging.info(m)
      if m['method'] == 'getScore':
        package = self._getScore()
        if package: self.send(json_encode(package))
        return
      elif m['method'] == 'addNote':
        package = self._addNote(m['note'])
      elif m['method'] == 'removeNote':
        package = self._removeNote(m['note'])
      elif m['method'] == 'addMeasureBlock':
        package = self._addMeasureBlock(m['measureBlock'])
      elif m['method'] == 'removeMeasureBlock':
        package = self._removeMeasureBlock(m['measureBlock'])
      elif m['method'] == 'clearScore':
        package = self._clearScore()
      else:
        raise ValueError("Didn't specify valid method")
      if package: self._broadcast(json_encode(package))
    except Exception, e:
      logging.error(traceback.print_exc())
      self.send(json_encode("Python exception: %s" % str(e)))
      
  def on_close(self):
    self.scores[self.score].remove(self)
    for p in self.scores[self.score]:
      p.send("A user has left.")

class UnittestHandler(tornado.web.RequestHandler):
  def get(self):
      self.render('unittest.html')

class ScoreHandler(tornado.web.RequestHandler):
  def get(self):
      
class Application(tornado.web.Application):
  def __init__(self):
    Router = tornadio.get_router(JamSessionConnection, resource='JamSessionSocket', extra_re=r'\S+', extra_sep='/')
    handlers = [
      (r'/', UnittestHandler),
      (r'/(.*?)', ScoreHandler),
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
  tornado.options.parse_command_line()
  http_server = tornado.httpserver.HTTPServer(Application())
  http_server.listen(options.port)
  tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
  main()
