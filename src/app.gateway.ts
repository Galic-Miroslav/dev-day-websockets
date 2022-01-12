import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
@WebSocketGateway()
export class AppGateway implements OnGatewayDisconnect {
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('AppGateway');
  private usersOnPage: Map<string, Set<string>> = new Map<
    string,
    Set<string>
  >();
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, msg: JSON): any {
    const pageOfDoc = msg['foleonDocId'] + '-' + msg['pageId'];
    if (this.usersOnPage.get(pageOfDoc) === undefined) {
      this.usersOnPage.set(pageOfDoc, new Set<string>());
    }
    this.usersOnPage.get(pageOfDoc).add(client.id);
    this.wss.emit(pageOfDoc, {
      clientId: client.id,
      text: 'Someone else is also editing this page!',
    });

    console.log(msg);
    console.log('Users on page after connect:');
    console.log(this.usersOnPage);

    if (this.usersOnPage.get(pageOfDoc).size > 1) {
      return {
        event: pageOfDoc,
        data: {
          text:
            'There are ' +
            (this.usersOnPage.get(pageOfDoc).size - 1) +
            ' other users editing same page!',
        },
      };
    }
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    console.log(this.usersOnPage);
    this.usersOnPage.forEach((clients, pages) => {
      clients.delete(client.id);
    });
    console.log('Users on page after disconnect:');
    console.log(this.usersOnPage);
  }
}
