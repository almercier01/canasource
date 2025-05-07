export function getRemainingSearches(): number {
    const data = localStorage.getItem('canasourceWebSearches');
    const now = new Date();
    let searches: string[] = data ? JSON.parse(data) : [];
  
    // Remove entries older than 7 days
    searches = searches.filter((timestamp) => {
      const date = new Date(timestamp);
      return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) < 7;
    });
  
    return Math.max(0, 3 - searches.length);
  }
  