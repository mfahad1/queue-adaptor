import Adaptor from "./configrations/adaptor";
import KafkaClient from "./configrations/kafka";

export type AdaptorConfig = {
  clientId: string;
  brokers: string[];
}

type Adaptors = {
  kafka: "kafka",
  sqs: "sqs"
}

export default class Queue {
  client;

  constructor(
    private type: Adaptors,
    private config: AdaptorConfig,
  ) {
    if (this.type.kafka) {
      this.client = new KafkaClient(config);
    }
    if (this.type.sqs) {
      throw new Error('WIP');
    }
  }
}