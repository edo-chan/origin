import { useAtom } from 'jotai';
import { nameAtom, replyAtom, loadingAtom, errorAtom } from './atoms';
import { sayHello } from './action';

export const useGreeter = () => {
  const [name, setName] = useAtom(nameAtom);
  const [reply, setReply] = useAtom(replyAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);

  const handleSayHello = async () => {
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await sayHello({ name });
      setReply({ message: response.message });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    reply,
    loading,
    error,
    sayHello: handleSayHello,
  };
};