import { NavigationMenuDemo } from '@/app/session/[sessionId]/Navigation';
import {
  getCurrentData,
  storeData,
} from '@/app/session/[sessionId]/repository';
import { StateProvider } from '@/app/session/[sessionId]/StateProvider';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { decodeTime } from 'ulid';

export default async function Page({
  params: { sessionId },
  children,
}: PropsWithChildren<{
  params: { sessionId: string };
}>) {
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
    <StateProvider
      onChange={onChange}
      defaultValue={currentData}
      getServerData={async () => {
        'use server';
        return await getCurrentData(sessionId);
      }}
    >
      <NavigationMenuDemo />
      <div
        className="flex flex-col gap-5 bg-gray-100 max-w-7xl mx-auto p-5
      "
      >
        {children}
      </div>
    </StateProvider>
  );
}
