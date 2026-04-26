import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Route } from '@/routes/~session/~$documentId.tsx';
import { useRankAssignment } from '@/routes/~session/~$documentId/shared/UseRankAssignment';
import { useUserState } from '@/routes/~session/~$documentId/shared/useUser';
import { useNavigatorName } from '@/shared/useNavigator';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UserPage() {
  const rankAssigment = useRankAssignment();
  const [user, setUserNameServer] = useUserState(rankAssigment);
  const [navigatorName, setNavigatorName] = useNavigatorName();
  const [userName, setUserNameLocal] = useState(
    user?.name ?? navigatorName ?? '',
  );
  const navigate = useNavigate();
  const params = Route.useParams();

  useEffect(() => {
    if (user) setUserNameLocal(user.name);
  }, [user]);

  const valid = userName.trim().length > 0;

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cyan-bg text-cyan">
          <UserCircle2 className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-cream">
          What's your name?
        </h1>
      </div>

      <p className="text-sm text-space-6 mb-6 leading-relaxed">
        Your name appears on the rankings everyone in the session can see.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          const trimmed = userName.trim();
          setNavigatorName(trimmed);
          setUserNameServer(trimmed);
          navigate({ to: '/session/$documentId/configure', params });
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="userName"
            className="text-2xs font-mono uppercase tracking-coord text-space-6"
          >
            Your name
          </Label>
          <Input
            id="userName"
            name="userName"
            value={userName}
            onChange={(e) => setUserNameLocal(e.target.value)}
            placeholder="Your name"
            className="h-12 text-base"
            autoFocus
            maxLength={40}
          />
        </div>
        <Button type="submit" size="lg" disabled={!valid}>
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
