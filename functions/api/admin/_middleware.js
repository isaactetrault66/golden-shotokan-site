// Every /api/admin/* request must carry a valid Cloudflare Access login.
import { verifyAccess } from '../../../lib/access.js';
import { json } from '../../../lib/http.js';

export async function onRequest(context) {
  const user = await verifyAccess(context.request, context.env);
  if (!user) return json({ error: 'Not signed in' }, 401);
  context.data.user = user;
  return context.next();
}
