'use client';
import { useRankAssignment } from '@/app/session/[sessionId]/shared/UseRankAssignment';
import { useUserState } from '@/app/session/[sessionId]/shared/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UserPage() {
  const rankAssigment = useRankAssignment();
  const [user, setUserName] = useUserState(rankAssigment);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userName = formData.get('userName');
        if (typeof userName !== 'string') {
          return;
        }
        setUserName(userName);
      }}
    >
      <Label>
        Username <Input name="userName" defaultValue={user?.name} />
      </Label>
      <Button type="submit">Save</Button>
    </form>
  );
}
