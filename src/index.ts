import Adaptor from "./configrations/adaptor";
import KafkaClient from "./configrations/kafka";

export type AdaptorConfig = {
  clientId: string;
  brokers: string[];
}

export enum Adaptors {
  kafka = 'kafka',
  sqs = 'sqs'
}

export default class Queue {
  client;

  constructor(
    private type: Adaptors,
    private config: AdaptorConfig,
  ) {
    if (this.type === Adaptors.kafka) {
      this.client = new KafkaClient(this.config);
    }
    if (this.type === Adaptors.sqs) {
      throw new Error('WIP');
    }
  }
}