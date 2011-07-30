from os import path as op

import tornado.web
import tornadio
import tornadio.router
import tornadio.server

import config

class JamSessionConnection(tornadio.SocketConnection):
  """Base JamSession connection object"""
  def on_open(self, *args, **kwargs):
    pass

  def on_message(self, message):
    for p in self.participants:
      p.send(message)

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
                       'flashsocket',
                       'xhr-multipart',
                       'xhr-polling'],
  flash_policy_port = 843,
  flash_policy_file = op.join(config.ROOT, 'flashpolicy.xml'),
  socket_io_port = 8001
)

if __name__ == "__main__":
  import logging
  logging.getLogger().setLevel(logging.DEBUG)

  tornadio.server.SocketServer(application)
    
