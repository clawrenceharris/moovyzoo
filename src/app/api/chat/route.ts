import { NextRequest, NextResponse } from 'next/server';
import { createAIAgent, configureLangSmith } from '@/features/ai-chat/utils/langraph-config';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';

configureLangSmith();

let agentInstance: ReturnType<typeof createAIAgent> | null = null;
const getAgentInstance = () => {
  if (!agentInstance) {
    agentInstance = createAIAgent();
  }
  return agentInstance;
};

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  status: 'sending' | 'sent' | 'error';
}

interface ChatRequest {
  messages: ChatMessage[];
  conversationId: string;
}

function convertMessagesToLangChain(messages: ChatMessage[]): BaseMessage[] {
  return messages.map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, conversationId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const langchainMessages = convertMessagesToLangChain(messages);
    const agent = getAgentInstance();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          const agentStream = await agent.stream(
            { messages: langchainMessages },
            {
              streamMode: "messages" as const,
              configurable: {
                thread_id: conversationId
              }
            }
          );

          let hasContent = false;
          
          for await (const [message] of agentStream) {
            if (message.constructor.name == "AIMessageChunk" && message.content && typeof message.content === 'string') {
              hasContent = true;
              
              const data = JSON.stringify({
                type: 'content',
                content: message.content
              });
              
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          if (!hasContent) {
            const fallbackData = JSON.stringify({
              type: 'content',
              content: "I'm here to help you with movie recommendations and information. What would you like to know?"
            });
            controller.enqueue(encoder.encode(`data: ${fallbackData}\n\n`));
          }

          const completeData = JSON.stringify({ type: 'complete' });
          controller.enqueue(encoder.encode(`data: ${completeData}\n\n`));
          
        } catch (error) {
          console.error('LangGraph streaming error:', error);
          
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Failed to generate response'
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
