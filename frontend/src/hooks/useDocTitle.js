import { useEffect } from 'react';

const useDocTitle = (title) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | Smart Agri Hub` : 'Smart Agri Hub';
    return () => { document.title = prev; };
  }, [title]);
};

export default useDocTitle;
