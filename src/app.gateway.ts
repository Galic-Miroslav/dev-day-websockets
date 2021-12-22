import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class AppGateway {
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, msg: JSON): any {
    this.wss.emit(msg['foleonDocId'] + '-' + msg['pageId'], {
      userId: msg['userId'],
      text: 'Someone else is also editing this page!',
    });
    console.log(msg);
  }
}
