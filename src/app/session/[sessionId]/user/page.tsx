'use client';
import { useRankAssignment } from '@/app/session/[sessionId]/shared/UseRankAssignment';
import { useUserState } from '@/app/session/[sessionId]/shared/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

export default function UserPage() {
  const rankAssigment = useRankAssignment();
  const [user, setUserNameServer] = useUserState(rankAssigment);
  const [userName, setUserNameLocal] = useState(user?.name ?? '');

  useEffect(() => {
    if (!user) {
      return;
    }
    setUserNameLocal(user.name);
  }, [user]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userName = formData.get('userName');
        if (typeof userName !== 'string') {
          return;
        }
        setUserNameServer(userName);
      }}
    >
      <Label>
        Username{' '}
        <Input
          name="userName"
          value={userName}
          onChange={(e) => setUserNameLocal(e.target.value)}
        />
      </Label>
      <Button type="submit">Save</Button>
    </form>
  );
}
