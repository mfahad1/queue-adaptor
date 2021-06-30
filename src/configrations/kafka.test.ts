import { Kafka, logLevel, Producer, ProducerRecord, ProducerEvents, RecordMetadata } from "kafkajs";

import KafkaClient from './kafka';

type MockMessage = { foo: string }

const kafkaClientConfig = { clientId: 'kafka', brokers: ['broker 1'], logLevel: logLevel.DEBUG };
const producerMock = (): Producer => ({
  connect: () => Promise.resolve(),
  send: (record: ProducerRecord) => Promise.resolve([] as RecordMetadata[]),
  sendBatch: jest.fn(),
  events: 'producer.connect' as unknown as ProducerEvents,
  disconnect: jest.fn(),
  transaction: jest.fn(),
  logger: jest.fn(),
  isIdempotent: jest.fn(),
  on: jest.fn(),
})

const kafkaClientMock: Kafka = {
  producer: producerMock,
  consumer: jest.fn(),
  admin: jest.fn(),
  logger: jest.fn(),
}

const kafkaClient = new KafkaClient(kafkaClientConfig, kafkaClientMock);
const mockMessage = { key: 'message', value: { foo: 'bar' } };
const mockMessage2 = { key: 'message1', value: { foo: 'bar1' } };
const mockMessage3 = { key: 'message2', value: { foo: 'bar2' } };

afterEach(() => {
  jest.clearAllMocks();
});


it('should test buildAMessage to return serialized message', () => {
  expect(kafkaClient.buildAMessage<MockMessage>(mockMessage))
    .toStrictEqual({ key: mockMessage.key, value: JSON.stringify(mockMessage.value) });
});

it('should test buildMessages to return serialized message array', () => {

  const messages = [mockMessage, mockMessage2, mockMessage3];

  expect(kafkaClient.buildMessages<MockMessage>(messages))
    .toStrictEqual(messages.map(m => ({ key: m.key, value: JSON.stringify(m.value) })));
});


it('should call buildMessages from kafkaClient', async () => {
  const buildMessages = jest.spyOn(kafkaClient, 'buildMessages');

  await kafkaClient.produce<MockMessage>('topic1', [{ key: 'M1', value: { foo: 'bar' } }]);

  expect(buildMessages).toHaveBeenCalled();
});

it('should call buildAMessage from kafkaClient', async () => {
  const buildMessages = jest.spyOn(kafkaClient, 'buildMessages');
  const buildAMessage = jest.spyOn(kafkaClient, 'buildAMessage');

  await kafkaClient.produce<MockMessage>('topic1', { key: 'M1', value: { foo: 'bar' } });

  expect(buildMessages).not.toHaveBeenCalled();
  expect(buildAMessage).toHaveBeenCalled();
});
