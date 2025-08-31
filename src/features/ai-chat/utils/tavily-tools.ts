import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { tavily } from '@tavily/core';

// Initialize Tavily client
const createTavilyClient = () => {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        throw new Error('Tavily API key is required. Please set TAVILY_API_KEY in your environment variables.');
    }

    return tavily({ apiKey });
};

// Tool for web search using Tavily
export const tavilySearchTool = tool(async (input) => {
    try {
        const { query, search_depth, include_domains, exclude_domains, max_results } = input as {
            query: string;
            search_depth?: 'basic' | 'advanced';
            include_domains?: string[];
            exclude_domains?: string[];
            max_results?: number;
        };

        const client = createTavilyClient();
        console.log("🔍 tavilySearchTool called with query:", query);

        const searchResults = await client.search(query, {
            searchDepth: search_depth || 'basic',
            includeDomains: include_domains,
            excludeDomains: exclude_domains,
            maxResults: max_results || 5,
            includeAnswer: true,
            includeImages: false,
            includeRawContent: false
        });

        if (!searchResults.results || searchResults.results.length === 0) {
            return `No search results found for "${query}". Try rephrasing your search or using different keywords.`;
        }

        // Format the search results
        let formattedResults = '';

        // Include the AI-generated answer if available
        if (searchResults.answer) {
            formattedResults += `**Quick Answer:**\n${searchResults.answer}\n\n`;
        }

        formattedResults += `**Search Results for "${query}":**\n\n`;

        const results = searchResults.results.slice(0, max_results || 5).map((result: { title?: string; url?: string; content?: string }, index: number) => {
            const title = result.title || 'No title';
            const url = result.url || '';
            const content = result.content ? result.content.substring(0, 200) + '...' : 'No description available';

            return `${index + 1}. **${title}**\n   URL: ${url}\n   ${content}`;
        }).join('\n\n');

        formattedResults += results;

        return formattedResults;
    } catch (error) {
        console.error('Tavily search error:', error);
        return `Error performing web search: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
}, {
    name: 'web_search',
    description: 'Search the web for current information, news, facts, and general knowledge using Tavily. Use this when movie/TV database tools cannot answer the user\'s question or when they need current information beyond entertainment content.',
    schema: z.object({
        query: z.string().min(1).describe('The search query to find information about'),
        search_depth: z.enum(['basic', 'advanced']).optional().default('basic').describe('Search depth: basic for quick results, advanced for more comprehensive search'),
        include_domains: z.array(z.string()).optional().describe('Optional list of domains to include in search (e.g., ["wikipedia.org", "imdb.com"])'),
        exclude_domains: z.array(z.string()).optional().describe('Optional list of domains to exclude from search'),
        max_results: z.number().min(1).max(10).optional().default(5).describe('Maximum number of search results to return (1-10)')
    })
});

// Tool for extracting content from URLs using Tavily
export const tavilyExtractTool = tool(async (input) => {
    try {
        const { urls } = input as { urls: string[] };

        const client = createTavilyClient();
        console.log("📄 tavilyExtractTool called with URLs:", urls);

        if (!urls || urls.length === 0) {
            return 'No URLs provided for content extraction.';
        }

        const extractResults = await client.extract(urls, {format: 'text'});

        if (!extractResults.results || extractResults.results.length === 0) {
            return 'No content could be extracted from the provided URLs. The URLs might be inaccessible or contain no extractable text content.';
        }

        // Format the extracted content
        let formattedContent = `**Extracted Content from ${urls.length} URL(s):**\n\n`;

        extractResults.results.forEach((result: { url?: string; rawContent?: string }, index: number) => {
            const url = result.url || urls[index] || 'Unknown URL';
            const content = result.rawContent || 'No content extracted';

            formattedContent += `**${index + 1}. ${url}**\n`;

            // Limit content length for readability
            if (content.length > 5000) {
                formattedContent += `${content.substring(0, 5000)}...\n\n`;
            } else {
                formattedContent += `${content}\n\n`;
            }
        });

        return formattedContent;
    } catch (error) {
        console.error('Tavily extract error:', error);
        return `Error extracting content from URLs: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
}, {
    name: 'extract_content',
    description: 'Extract and read the full text content from one or more web pages. Useful for getting detailed information from specific articles, blog posts, or web pages that users reference.',
    schema: z.object({
        urls: z.array(z.url()).min(1).max(5).describe('Array of URLs to extract content from (maximum 5 URLs)')
    })
});

// Export Tavily tools as an array
export const tavilyTools = [
    tavilySearchTool,
    tavilyExtractTool
];