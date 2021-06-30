import { Kafka, KafkaMessage, logLevel } from 'kafkajs';
import Adaptor, { MessageProduced } from './adaptor';

import { AdaptorConfig } from '../';

type Message = { key?: string, value: string }

function isArray<T>(ar: T[] | object): ar is T[] {
  return (ar as T[]).length >= 0;
}

export default class KafkaClient extends Adaptor {
  constructor(
    private config: AdaptorConfig,
    private client: Kafka = new Kafka({ ...config, logLevel: logLevel.DEBUG })
  ) {
    super();
  }

  buildAMessage<T>({ value, key }: MessageProduced<T>): Message {

    const message: { value: string, key?: string } = {
      value: JSON.stringify(value)
    }

    if (key) {
      message.key = key;
    }

    return message;
  }

  buildMessages<T>(messages: MessageProduced<T>[]): Message[] {

    return messages.map(message => this.buildAMessage(message));
  }


  async produce<T>(topic: string, message: MessageProduced<T> | MessageProduced<T>[]) {
    let m: Message[];

    if (isArray(message)) {
      m = this.buildMessages(message);
    } else {
      m = [this.buildAMessage(message)];
    }

    try {

      const producer = this.client.producer();

      await producer.connect();

      await producer.send({
        topic,
        messages: m
      });

      await producer.disconnect();
    }
    catch (ex) {
      throw new Error(ex);
    }
  }

  async consume(topic: string): Promise<(receiver: (m: KafkaMessage) => void) => void> {
    const consumer = this.client.consumer({ groupId: this.config.clientId });

    await consumer.connect()
    await consumer.subscribe({ topic })

    return (receiver: (m: KafkaMessage) => void) => {
      consumer.run({
        eachMessage: async ({ message }) => {
          receiver(message);
        },
      })
    }
  }

}
