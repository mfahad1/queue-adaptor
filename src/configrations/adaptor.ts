import { AdaptorConfig } from ".."

export type MessageProduced<T> = { key?: string, value: T }

export default class Adaptor {

  constructor(
  ) {
    console.log('Adaptor');
  }

  async produce<T>(topic: string, message: MessageProduced<T> | MessageProduced<T>[]) {
    console.log('Produce');
  }
  async consume(topic: string): Promise<(receiver: <T>(m: T) => void) => void> {

    return new Promise((resolve, reject) => {
      console.log('Adaptor');
    })
  }
}