import handler from 'vinext/server/fetch-handler';
import { handleJournal } from './http.mjs';
const worker = {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    return handleJournal(request, env, (incoming: Request) =>
      handler.fetch(incoming, env, ctx),
    );
  },
};

export default worker;
