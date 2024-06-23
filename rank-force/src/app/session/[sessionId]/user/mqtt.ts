import { MqttToken } from '@/shared/MqttToken';

import { iot, mqtt } from 'aws-iot-device-sdk-v2';
import { ulid } from 'ulid';

export class MqttClient {
  private endpoint = process.env.NEXT_PUBLIC_REALTIME_ENDPOINT!;
  private authorizer = process.env.NEXT_PUBLIC_REALTIME_AUTHORIZER!;
  private connection: mqtt.MqttClientConnection | undefined;
  private topic: string;

  constructor(private token: MqttToken) {
    this.topic =
      process.env.NEXT_PUBLIC_REALTIME_TOPIC_PREFIX! + token.sessionId;
    this.setupConnection();
  }

  async setupConnection() {
    if (this.connection) {
      return this.connection;
    }
    const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
      .with_clean_session(true)
      .with_client_id('client_' + ulid())
      .with_endpoint(this.endpoint)
      .with_custom_authorizer(
        '',
        this.authorizer,
        '',
        JSON.stringify(this.token),
      )
      .with_keep_alive_seconds(1200)
      .build();
    const client = new mqtt.MqttClient();
    const connection = client.new_connection(config);
    this.connection = connection;
    connection.on('connect', async () => {
      console.log('WS connected');
      if (!connection) {
        return;
      }
      await connection.subscribe(this.topic, mqtt.QoS.AtLeastOnce);
      console.log('WS subscribed to chat');
    });
    connection.on('error', (e) => {
      console.log('connection error', e);
    });
    connection.on('resume', console.log);
    connection.on('disconnect', console.log);
    connection.on('interrupt', (e) => {
      console.log('interrupted, restarting', e, JSON.stringify(e));
      this.setupConnection();
    });
    await connection.connect();
    return this.connection;
  }

  async publishMessage(message: string) {
    console.log('publishing', message);
    this.connection?.publish(this.topic, message, mqtt.QoS.AtLeastOnce);
  }

  onMessage(callback: (message: string) => void) {
    this.connection?.on('message', (_fullTopic, payload) => {
      const message = new TextDecoder('utf8').decode(new Uint8Array(payload));
      callback(message);
    });
  }
}
