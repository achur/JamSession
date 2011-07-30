import os.path
from collections import defaultdict
import logging
from cPickle import dumps, loads

import tornado.web
from tornado.options import options
import tornadio
import tornadio.router
import tornadio.server
from tornado.escape import json_encode, json_decode

import redis

import config
logging.getLogger().setLevel(logging.DEBUG)
options.port = getattr(config, 'port', 8888)
options.debug = getattr(config, 'debug', True)

ROOT_DIR = os.path.dirname(__file__)
R = redis.Redis('youstache.com', port=6379, db=0)

def redisGetMeasureBlocks(score):
  key = '.'.join([score, 'measureBlocks'])
  value = R.get(key)
  if value: return loads(value)
  else: return []

def redisGetNotes(score):
  key = '.'.join([score, 'notes'])
  value = R.get(key)
  if value: return loads(value)
  else: return []

def redisSetMeasureBlocks(score, measureBlocks):
  key = '.'.join([score, 'measureBlocks'])
  R.set(key, dumps(measureBlocks))

def redisSetNotes(score, notes):
  key = '.'.join([score, 'note'])
  R.set(key, dumps(notes))

class JamSessionConnection(tornadio.SocketConnection):
  """Base JamSession connection object"""
  scores = defaultdict(set) # key: score string, val: {JamSessionConnection}

  def on_open(self, *args, **kwargs):
    self.score, self.user_name = kwargs['extra'].split('-')
    self.scores[self.score].add(self)
    self.send('Welcome!')
    
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

  def _addNote(self, m, note):
    key = '.'.join([self.score, 'notes'])
    notes = loads(R.get(key))
    notes.append(note)
    notes.sort(key=self.__note_cmp)
    R.set(key, dumps(notes))
    return note

  def _removeNote(self, m, note):
    key = '.'.join([self.score, 'notes'])
    notes = loads(R.get(key))
    try:
      notes.remove(note)
      R.set(key, dumps(notes))
      return note
    except ValueError:
      pass # Cannot Find Note  
  
  def _addMeasureBlock(self, m, measureBlock):
    key = '.'.join([self.score, 'measureBlocks'])
    measures = R.get(key)
    measures.append(measureBlock)
    measures.sort(key=self.__measure_cmp)
    R.set(key, dumps(measures))
    return measureBlock

  def _removeMeasureBlock(self, m, measureBlock):
    key = '.'.join([self.score, 'measureBlocks'])
    measures = loads(R.get(key))
    try:
      measures.remove(measureBlock)
      R.set(key, dumps(measures))
      return measureBlock
    except ValueError:
      pass

  def _getScore(self):
    # TODO: send score to user
    measureBlocks = redisGetMeasureBlocks(self.score)
    notes = redisGetNotes(self.score)
    package = {'name' : self.score,
               'measureBlocks' : measureBlocks,
               'notes' : notes}
    return package

  def on_message(self, m):
    if m['method'] == 'getScore':
      package = self._getScore()
      if package: self.send(package)
    else:
      if m['method'] == 'addNote':
        package = self._addNote(m, m['note'])
      elif m['method'] == 'removeNote':
        package = self._removeNote(m, m['note'])
      elif m['method'] == 'addMeasureBlock':
        package = self._addMeasureBlock(m, m['measureBlock'])
      elif m['method'] == 'removeMeasureBlock':
        package = self._removeMeasureBlock(m, m['measureBlock'])
      elif m['method'] == 'getScore':
        package = self._getScore()
      else: return
      if package: self._broadcast(package)
      
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
  tornado.options.parse_command_line()
  http_server = tornado.httpserver.HTTPServer(Application())
  http_server.listen(options.port)
  tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
  main()
