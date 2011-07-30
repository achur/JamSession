import os.path

import tornado.web
import tornadio
import tornadio.router
import tornadio.server

import config

ROOT_DIR = os.path.dirname(__file__)

class JamSessionConnection(tornadio.SocketConnection):
  """Base JamSession connection object"""
  scores =        { } # key: scoreId, val: [userId]
  users =         { } # key: userId,  val: JamSessionConnection
  connections = set() # item: JamSessionConnection

  def on_open(self, *args, **kwargs):
    self.connections.add(self)
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

#use the routes classmethod to build the correct resource
ChatRouter = tornadio.get_router(ChatConnection)

#configure the Tornado application
application = tornado.web.Application(
  [(r"/", IndexHandler), ChatRouter.route()],
  enabled_protocols = ['websocket',
                       'xhr-multipart',
                       'xhr-polling'],
  socket_io_port = 8001
)

if __name__ == "__main__":
  import logging
  logging.getLogger().setLevel(logging.DEBUG)

  tornadio.server.SocketServer(application)
    
