import Ranking from '@/app/session/[sessionId]/Ranking';
import {
  getCurrentData,
  storeData,
} from '@/app/session/[sessionId]/repository';
import { redirect } from 'next/navigation';
import { decodeTime } from 'ulid';

export default async function Page({
  params: { sessionId },
}: {
  params: { sessionId: string };
}) {
  try {
    const decodedTime = decodeTime(sessionId);
    if (decodedTime > Date.now()) {
      redirect('/');
    }
  } catch (error) {
    redirect('/');
  }

  const onChange = async (data: string) => {
    'use server';
    await storeData(sessionId, data);
  };

  let currentData = await getCurrentData(sessionId);

  return (
    <Ranking
      onChange={onChange}
      defaultValue={currentData}
      getServerData={async () => {
        'use server';
        const newData = await getCurrentData(sessionId);
        if (newData === currentData) {
          return;
        }
        currentData = newData;
        return newData;
      }}
    />
  );
}
