import { MqttToken } from '@/shared/MqttToken';
import mqtt, { type MqttClient as MqttJsClient } from 'mqtt';
import { ulid } from 'ulid';

export class MqttClient {
  private endpoint = import.meta.env.VITE_REALTIME_ENDPOINT!;
  private authorizer = import.meta.env.VITE_REALTIME_AUTHORIZER!;
  private topic: string;
  private connection: MqttJsClient;
  private ready: Promise<MqttJsClient>;

  constructor(token: MqttToken) {
    this.topic = import.meta.env.VITE_REALTIME_TOPIC_PREFIX! + token.documentId;
    this.connection = mqtt.connect(
      `wss://${this.endpoint}/mqtt?x-amz-customauthorizer-name=${this.authorizer}`,
      {
        protocolVersion: 5,
        manualConnect: true,
        username: '',
        password: JSON.stringify(token),
        clientId: `client_${ulid()}`,
      },
    );
    this.ready = new Promise((resolve, reject) => {
      this.connection.once('connect', () => resolve(this.connection));
      this.connection.once('error', reject);
    });
    this.connection.on('error', (err) => console.error('mqtt error', err));
    this.connection.connect();
  }

  async subscribe() {
    const c = await this.ready;
    await c.subscribeAsync(this.topic, { qos: 1 });
  }

  async publish(bytes: Uint8Array) {
    const c = await this.ready;
    // mqtt.js types insist on Buffer but the runtime accepts any Uint8Array.
    await c.publishAsync(this.topic, bytes as unknown as Buffer, { qos: 1 });
  }

  async close() {
    await this.connection.endAsync();
  }

  onMessage(callback: (bytes: Uint8Array) => void) {
    this.connection.on('message', (_topic, payload) => {
      callback(new Uint8Array(payload));
    });
  }

  onStatus(callback: (state: 'connected' | 'disconnected') => void) {
    this.connection.on('connect', () => callback('connected'));
    this.connection.on('close', () => callback('disconnected'));
    this.connection.on('offline', () => callback('disconnected'));
    this.connection.on('end', () => callback('disconnected'));
    this.connection.on('error', () => callback('disconnected'));
    callback(this.connection.connected ? 'connected' : 'disconnected');
  }
}
