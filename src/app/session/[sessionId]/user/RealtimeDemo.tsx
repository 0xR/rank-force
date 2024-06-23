'use client';
import { MqttClient } from '@/app/session/[sessionId]/user/mqtt';
import { useMqttToken } from '@/app/session/[sessionId]/user/useMqttToken';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';

export function RealtimeDemo() {
  const mqttToken = useMqttToken();

  const mqttClient = useMemo(
    () => mqttToken && new MqttClient(mqttToken),
    [mqttToken],
  );

  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!mqttClient) {
      return;
    }
    mqttClient.onMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => {};
  }, [mqttClient]);

  return (
    <div className="flex flex-col gap-6 w-1/2">
      <div>Realtime demo</div>
      {mqttClient && (
        <Button
          onClick={() => {
            mqttClient?.publishMessage(
              'Hello from client time=' + new Date().toLocaleString('nl-NL'),
            );
          }}
        >
          Send message
        </Button>
      )}
      <ul>
        {messages.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
