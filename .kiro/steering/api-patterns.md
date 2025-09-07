# API Patterns & Guidelines

## oRPC Controller Standards

### Core Principles
- **Type Safety First**: Let oRPC infer types from implementation rather than explicit schemas
- **Minimal Boilerplate**: Avoid unnecessary type definitions that can be inferred
- **Consistent Patterns**: Follow established conventions across all controllers

### Controller Structure

#### Input Schema Patterns
```typescript
// ✅ CORRECT: Inline input schema
export const sendMessage = protectedBase
  .input(z.object({
    message: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
    conversationId: z.string().uuid().optional(),
  }))
  .handler(async ({ input, context }) => {
    // Implementation
  })

// ❌ INCORRECT: Separate schema variable
const sendMessageSchema = z.object({
  message: z.string(),
  conversationId: z.string().uuid().optional(),
})

export const sendMessage = protectedBase
  .input(sendMessageSchema)
  .handler(async ({ input, context }) => {
    // Implementation
  })
```

#### Output Schema Patterns
```typescript
// ✅ CORRECT: No explicit output schema - let oRPC infer
export const getConversation = protectedBase
  .input(z.object({
    conversationId: z.string().uuid(),
  }))
  .handler(async ({ input, context }) => {
    return {
      id: conversation.id,
      title: conversation.title,
      messages: conversationMessages,
    }
  })

// ❌ INCORRECT: Explicit output schema
export const getConversation = protectedBase
  .input(z.object({
    conversationId: z.string().uuid(),
  }))
  .output(z.object({
    id: z.string(),
    title: z.string().nullable(),
    messages: z.array(messageSchema),
  }))
  .handler(async ({ input, context }) => {
    // Implementation
  })
```

### Middleware Usage

#### Authentication Patterns
```typescript
// ✅ Use protectedBase for authenticated endpoints
export const getUserData = protectedBase
  .input(z.object({ userId: z.string() }))
  .handler(async ({ input, context }) => {
    const userId = context.auth.user.id // Available from middleware
    // Implementation
  })

// ✅ Use publicBase for public endpoints
export const getPublicData = publicBase
  .input(z.object({ query: z.string() }))
  .handler(async ({ input, context }) => {
    // context.auth may be null
    // Implementation
  })
```

### Error Handling
```typescript
// ✅ CORRECT: Throw descriptive errors
export const getConversation = protectedBase
  .input(z.object({
    conversationId: z.string().uuid(),
  }))
  .handler(async ({ input, context }) => {
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, input.conversationId)
    })
    
    if (!conversation) {
      throw new Error('Conversation not found or access denied')
    }
    
    return conversation
  })
```

### Export Patterns
```typescript
// ✅ CORRECT: Export individual handlers, then combine
export const sendMessage = protectedBase
  .input(z.object({ /* ... */ }))
  .handler(async ({ input, context }) => { /* ... */ })

export const getConversation = protectedBase
  .input(z.object({ /* ... */ }))
  .handler(async ({ input, context }) => { /* ... */ })

export const listConversations = protectedBase
  .handler(async ({ context }) => { /* ... */ })

export default {
  sendMessage,
  getConversation,
  listConversations,
}
```

### Database Integration Patterns

#### Transaction Usage
```typescript
// ✅ Use transactions for multi-step operations
export const createWithRelations = protectedBase
  .input(z.object({ /* ... */ }))
  .handler(async ({ input, context }) => {
    const result = await db.transaction(async (tx) => {
      const parent = await tx.insert(parentTable).values(/* ... */).returning()
      const child = await tx.insert(childTable).values(/* ... */).returning()
      return { parent, child }
    })
    
    return result
  })
```

#### Query Patterns
```typescript
// ✅ Use proper error handling for not found cases
export const getById = protectedBase
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input, context }) => {
    const records = await db
      .select()
      .from(table)
      .where(eq(table.id, input.id))
      .limit(1)
    
    if (records.length === 0) {
      throw new Error('Record not found')
    }
    
    return records[0]
  })
```

### Validation Patterns

#### Input Validation
```typescript
// ✅ Include descriptive error messages
.input(z.object({
  email: z.string().email('Invalid email format'),
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  priority: z.enum(['low', 'medium', 'high'], { 
    errorMap: () => ({ message: 'Priority must be low, medium, or high' })
  }),
}))
```

#### Optional vs Required Fields
```typescript
// ✅ Use optional() for truly optional fields
.input(z.object({
  title: z.string().min(1), // Required
  description: z.string().optional(), // Optional
  tags: z.array(z.string()).default([]), // Optional with default
}))
```

## Integration Patterns

### Mastra Agent Integration
```typescript
// ✅ Proper agent integration with context
export const chatWithAgent = protectedBase
  .input(z.object({
    message: z.string().min(1),
    conversationId: z.string().uuid().optional(),
  }))
  .handler(async ({ input, context }) => {
    // Prepare context from conversation history
    const conversationHistory = await getConversationHistory(input.conversationId)
    const contextMessages = conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))
    
    // Generate response with proper context
    const response = await mastra.getAgent('agentName').generate([
      ...contextMessages,
      { role: 'user', content: input.message }
    ])
    
    return {
      message: response.text,
      conversationId: input.conversationId,
    }
  })
```

### File Organization
- One controller per feature/domain (e.g., `chat.ts`, `profile.ts`, `matches.ts`)
- Group related endpoints in the same controller
- Use descriptive handler names that match the API operation
- Keep controllers focused and avoid mixing concerns

### Testing Patterns
- Test input validation schemas separately from business logic
- Mock external dependencies (database, agents, etc.)
- Focus on edge cases and error conditions
- Use descriptive test names that explain the scenario