export interface WebResult {
    title: string;
    link: string;
    snippet: string;
  }
  
  export async function searchWithAvesAPI(query: string, language: 'en' | 'fr'): Promise<WebResult[]> {
    try {
      const res = await fetch(`/.netlify/functions/avesapiProxy?q=${encodeURIComponent(query)}&lang=${language}`);
      if (!res.ok) throw new Error("Failed to fetch AvesAPI via proxy");
  
      const data = await res.json();
      console.log("✅ AvesAPI raw response:", data);
  
      return (data.result?.organic_results || []).map((item: any) => ({
        title: item.title,
        link: item.url, // ✅ not `link`
        snippet: item.description || '', // ✅ not `snippet`
      }));
    } catch (error) {
      console.error("❌ Error during AvesAPI search:", error);
      return [];
    }
  }
  
  