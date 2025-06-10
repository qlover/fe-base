import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    if (!title) {
      return;
    }

    const prevTitle = document.title;
    document.title = title;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
