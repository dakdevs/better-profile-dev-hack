# Design Document

## Overview

This design outlines the integration of Mastra.ai into the Better Profile platform to create a perpetual interview chat feature. The system will provide a conversational interface where users can discuss their professional experiences with an AI Career Interviewer. This Phase 1 implementation focuses on establishing the core chat functionality with persistent conversation history using Drizzle ORM.

## Architecture

The system follows a client-server architecture that integrates seamlessly with the existing Next.js application structure:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes     │    │   Database      │
│   /interview    │◄──►│   /api/chat      │◄──►│   PostgreSQL    │
│   Chat UI       │    │   Mastra Agent   │    │   (Drizzle)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Components

1. **Frontend Chat Interface** (`/interview` page)
   - Real-time chat UI using React components
   - Message display with user/AI differentiation
   - Input field for user messages
   - Loading states and error handling

2. **Mastra Agent** (Career Interviewer)
   - Configured with career-focused instructions
   - Uses OpenAI GPT model for conversational AI
   - Maintains context across conversation turns

3. **API Layer** (oRPC endpoints)
   - Chat message handling endpoint
   - Conversation history retrieval
   - Integration with Mastra agent execution

4. **Database Layer** (Drizzle ORM)
   - Conversation storage schema
   - Message persistence with metadata
   - User association and threading

## Components and Interfaces

### Database Schema

Using Drizzle ORM with PostgreSQL, we'll create tables for storing conversation data:

```typescript
// Conversations table
conversations: {
  id: string (uuid, primary key)
  userId: string (foreign key to users)
  title: string (optional, for future use)
  createdAt: timestamp
  updatedAt: timestamp
}

// Messages table  
messages: {
  id: string (uuid, primary key)
  conversationId: string (foreign key to conversations)
  role: 'user' | 'assistant'
  content: text
  metadata: jsonb (optional, for future extensibility)
  createdAt: timestamp
}
```

### Mastra Agent Configuration

```typescript
// Career Interviewer Agent
const careerInterviewerAgent = new Agent({
  name: "Career Interviewer",
  instructions: `You are a friendly and professional Career Interviewer for Better Profile. 
    Your role is to have natural conversations with professionals about their work experiences.
    
    Guidelines:
    - Be conversational and engaging
    - Ask follow-up questions about their work
    - Show genuine interest in their professional journey
    - Keep the tone supportive and encouraging
    - Focus on recent work experiences and achievements`,
  model: openai("gpt-4o-mini"),
});
```

### API Endpoints (oRPC)

```typescript
// Chat controller
export const chatController = {
  // Send message and get AI response
  sendMessage: procedure
    .input(z.object({
      message: z.string(),
      conversationId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Implementation details
    }),

  // Get conversation history
  getConversation: procedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Implementation details
    }),

  // List user conversations
  listConversations: procedure
    .query(async ({ ctx }) => {
      // Implementation details
    }),
};
```

### Frontend Components

Following Next.js App Router best practices, we'll use server components by default with client components only as leaves:

```typescript
// Server Component - Main interview page
interface InterviewPageProps {
  searchParams: { conversationId?: string };
}

// Server Component - Chat container with initial data
interface ChatContainerProps {
  userId: string;
  conversationId?: string;
  initialMessages: Message[];
}

// Client Component - Interactive chat interface (leaf)
interface ChatInterfaceProps {
  initialMessages: Message[];
  conversationId?: string;
}

// Client Component - Message input (leaf)
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

// Server Component - Message display
interface MessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
  };
}
```

### Component Architecture

```
Page (Server Component)
├── Layout (Server Component)  
├── ChatContainer (Server Component)
│   ├── MessageList (Server Component)
│   │   └── Message (Server Component)
│   └── ChatInterface (Client Component) ← Interactive leaf
│       └── ChatInput (Client Component) ← Interactive leaf
```

## Data Models

### Conversation Model

```typescript
interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}
```

### Message Model

```typescript
interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
```

### API Response Types

```typescript
interface SendMessageResponse {
  message: Message;
  conversationId: string;
}

interface ConversationResponse {
  conversation: Conversation;
}
```

## Error Handling

### Client-Side Error Handling

- Network connectivity issues
- API timeout handling
- User input validation
- Graceful degradation for offline scenarios

### Server-Side Error Handling

- Mastra agent execution failures
- Database connection issues
- Authentication/authorization errors
- Rate limiting and abuse prevention

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

## Testing Strategy

### Unit Tests

- Database model validation
- API endpoint functionality
- Mastra agent configuration
- Frontend component behavior

### Integration Tests

- End-to-end chat flow
- Database persistence verification
- API error handling scenarios
- Authentication integration

### Manual Testing

- User experience validation
- Performance under load
- Cross-browser compatibility
- Mobile responsiveness

## Performance Considerations

### Database Optimization

- Proper indexing on frequently queried fields
- Pagination for conversation history
- Connection pooling for concurrent users

### Caching Strategy

- Conversation metadata caching
- API response caching where appropriate
- Static asset optimization

### Scalability

- Stateless API design for horizontal scaling
- Database connection management
- Mastra agent instance optimization

## Security Considerations

### Data Protection

- Conversation data encryption at rest
- Secure transmission over HTTPS
- User data isolation and access control

### Authentication Integration

- Integration with existing Better Auth system
- Session-based authentication validation
- User context preservation across requests

### Input Validation

- Message content sanitization
- SQL injection prevention
- XSS protection in chat interface

## Deployment Compatibility

### Next.js Integration

- Server-side rendering support
- API routes optimization
- Static asset handling

### Vercel Deployment

- Serverless function compatibility
- Environment variable management
- Database connection handling in serverless context
- Edge function considerations for global performance