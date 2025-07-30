import { useAtom } from 'jotai';
import { requestAtom, replyAtom, loadingAtom, errorAtom, nameAtom } from './atoms';
import { sayHello as sayHelloAction } from './service';
import { HelloRequest } from './types';

/**
 * Hook for using the Greeter domain in components
 * Provides state and actions for interacting with the Greeter service
 */
export const useGreeter = () => {
  const [request, setRequest] = useAtom(requestAtom);
  const [reply, setReply] = useAtom(replyAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const [name, setName] = useAtom(nameAtom);

  /**
   * Say hello to the server
   * @param customRequest Optional custom request to override the current request state
   */
  const sayHello = async (customRequest?: HelloRequest) => {
    const requestToSend = customRequest || request;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await sayHelloAction(requestToSend);
      
      setReply(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    request,
    reply,
    loading,
    error,
    name,
    
    // Setters
    setRequest,
    setName,
    
    // Actions
    sayHello,
  };
};