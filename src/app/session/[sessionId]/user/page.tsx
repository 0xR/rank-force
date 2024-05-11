import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UserPage() {
  return (
    <form>
      <Label>
        Username <Input />
      </Label>
      <Button type="submit">Save</Button>
    </form>
  );
}
