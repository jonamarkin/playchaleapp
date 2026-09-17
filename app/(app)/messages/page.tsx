import { requireProfile } from '@/lib/auth/guards';
import MessagesView from './messages-view';

export default async function MessagesPage() {
  await requireProfile('/messages');
  return <MessagesView />;
}
