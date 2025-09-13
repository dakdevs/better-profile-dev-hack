# Testing Guide

This document explains how to run and understand the test suite for the Better Profile recruitment platform.

## 🧪 Test Structure

The test suite is organized into several categories:

### **Service Layer Tests** (`src/services/__tests__/`)
- **`job-analysis.test.ts`** - Tests for AI-powered job analysis
- **`candidate-matching.test.ts`** - Tests for skill-based candidate matching
- **`cal-com.test.ts`** - Tests for Cal.com API integration
- **`rag-agent.test.ts`** - Tests for RAG (Retrieval-Augmented Generation) functionality

### **Controller Tests** (`src/orpc/controllers/__tests__/`)
- **`recruiter/jobs.test.ts`** - Tests for job posting API endpoints
- **`recruiter/matching.test.ts`** - Tests for candidate matching API endpoints

### **Integration Tests** (`src/__tests__/integration/`)
- **`job-workflow.test.ts`** - End-to-end workflow tests

## 🚀 Running Tests

### **Basic Commands**

```bash
# Run all tests
pnpm test

# Run tests once (no watch mode)
pnpm test:run

# Run tests with coverage report
pnpm test:coverage

# Run tests in watch mode (reruns on file changes)
pnpm test:watch

# Run tests with verbose output
pnpm test:verbose

# Run tests with UI interface
pnpm test:ui
```

### **Specific Test Files**

```bash
# Run specific test file
pnpm test job-analysis.test.ts

# Run tests matching a pattern
pnpm test --grep "JobAnalysisService"

# Run tests in a specific directory
pnpm test src/services/__tests__/
```

### **CI/CD Commands**

```bash
# Run tests for CI/CD with JSON output
pnpm test:ci

# Run tests with coverage for CI/CD
pnpm test:coverage --reporter=json --outputFile=coverage-results.json
```

## 📊 What to Expect

### **Successful Test Run**
```bash
$ pnpm test

 ✓ src/services/__tests__/job-analysis.test.ts (6)
 ✓ src/services/__tests__/candidate-matching.test.ts (8)
 ✓ src/services/__tests__/cal-com.test.ts (12)
 ✓ src/services/__tests__/rag-agent.test.ts (10)
 ✓ src/orpc/controllers/__tests__/recruiter/jobs.test.ts (8)
 ✓ src/orpc/controllers/__tests__/recruiter/matching.test.ts (7)
 ✓ src/__tests__/integration/job-workflow.test.ts (5)

 Test Files  7 passed (7)
      Tests  56 passed (56)
   Start at  14:32:15
   Duration  3.2s (transform 1.1s, setup 0ms, collect 1.8s, tests 1.3s)
```

### **Coverage Report**
```bash
$ pnpm test:coverage

 ✓ src/services/__tests__/job-analysis.test.ts (6)
 ✓ src/services/__tests__/candidate-matching.test.ts (8)
 ✓ src/services/__tests__/cal-com.test.ts (12)
 ✓ src/services/__tests__/rag-agent.test.ts (10)
 ✓ src/orpc/controllers/__tests__/recruiter/jobs.test.ts (8)
 ✓ src/orpc/controllers/__tests__/recruiter/matching.test.ts (7)
 ✓ src/__tests__/integration/job-workflow.test.ts (5)

 Test Files  7 passed (7)
      Tests  56 passed (56)
   Start at  14:32:15
   Duration  3.2s

 % Coverage report from v8
 --------------------|---------|----------|---------|---------|
 File                | % Stmts | % Branch | % Funcs | % Lines |
 --------------------|---------|----------|---------|---------|
 All files           |   87.3  |   82.1   |   94.2  |   86.8  |
  job-analysis.ts    |   95.2  |   88.9   |  100.0  |   94.7  |
  candidate-matching.ts | 89.1  |   85.7   |   90.0  |   88.3  |
  cal-com.ts         |   92.3  |   87.5   |  100.0  |   91.8  |
  rag-agent.ts       |   78.4  |   72.2   |   85.7  |   77.1  |
 --------------------|---------|----------|---------|---------|
```

### **Failed Test Example**
```bash
$ pnpm test

 ❌ src/services/__tests__/job-analysis.test.ts > JobAnalysisService > analyzeJobPosting > should analyze job posting with AI successfully

AssertionError: expected 0.85 to be 0.9
 ❯ src/services/__tests__/job-analysis.test.ts:45:7
     43|       expect(result.confidence).toBe(0.85)
     44|       expect(mockFetch).toHaveBeenCalledWith(
     45|       |   expect.stringContaining('openrouter.ai'),
     46|       |   expect.objectContaining({
     47|       |     method: 'POST',
     48|       |     headers: expect.objectContaining({
     49|       |       'Authorization': expect.stringContaining('Bearer')
     50|       |     })
     51|       |   })
     52|       | )
     53|       | 
     54|       | expect(result.confidence).toBe(0.85)
     55|       | expect(result.confidence).toBe(0.9)
```

## 🎯 Test Coverage Goals

The test suite aims for:
- **70%+ line coverage** for all services
- **70%+ branch coverage** for critical paths
- **90%+ function coverage** for public APIs

## 🔧 Test Configuration

### **Environment Variables**
Tests use mock environment variables:
- `OPENROUTER_API_KEY=test-key`
- `CAL_COM_API_KEY=test-cal-key`
- `BETTER_AUTH_SECRET=test-secret`
- `GOOGLE_CLIENT_ID=test-client-id`
- `GOOGLE_CLIENT_SECRET=test-client-secret`

### **Mocking Strategy**
- **External APIs**: All external API calls are mocked
- **Database**: Database operations are mocked with realistic responses
- **File System**: File operations are mocked
- **Time**: Time-dependent tests use mocked timers

## 📝 Writing New Tests

### **Service Tests**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { YourService } from '../your-service'

describe('YourService', () => {
  let service: YourService
  let mockDependency: any

  beforeEach(() => {
    service = new YourService()
    mockDependency = vi.fn()
    // Setup mocks
  })

  describe('methodName', () => {
    it('should handle success case', async () => {
      // Arrange
      const input = { /* test data */ }
      mockDependency.mockResolvedValueOnce(/* expected response */)

      // Act
      const result = await service.methodName(input)

      // Assert
      expect(result).toEqual(/* expected result */)
      expect(mockDependency).toHaveBeenCalledWith(/* expected args */)
    })

    it('should handle error case', async () => {
      // Arrange
      mockDependency.mockRejectedValueOnce(new Error('Test error'))

      // Act & Assert
      await expect(service.methodName({})).rejects.toThrow('Test error')
    })
  })
})
```

### **Controller Tests**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { yourController } from '../your-controller'
import { yourService } from '~/services/your-service'

vi.mock('~/services/your-service', () => ({
  yourService: {
    methodName: vi.fn()
  }
}))

describe('YourController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('endpointName', () => {
    it('should handle valid input', async () => {
      // Test implementation
    })
  })
})
```

## 🐛 Debugging Tests

### **Debug Mode**
```bash
# Run tests in debug mode
pnpm test --inspect-brk

# Run specific test in debug mode
pnpm test --inspect-brk --grep "specific test name"
```

### **Verbose Output**
```bash
# See detailed test output
pnpm test:verbose

# See test results with console.log output
pnpm test --reporter=verbose --silent=false
```

### **Test UI**
```bash
# Open interactive test UI
pnpm test:ui
```

## 📈 Continuous Integration

### **GitHub Actions Example**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:ci
      - run: pnpm test:coverage
```

## 🎉 Test Results Interpretation

### **Green Tests (✅)**
- All assertions passed
- Functionality working as expected
- Ready for deployment

### **Red Tests (❌)**
- One or more assertions failed
- Bug detected or test needs updating
- Fix required before deployment

### **Coverage Reports**
- **Green**: Above threshold (70%+)
- **Yellow**: Near threshold (60-70%)
- **Red**: Below threshold (<60%)

## 🔄 Test Maintenance

### **When to Update Tests**
- Adding new features
- Fixing bugs
- Refactoring code
- Changing API contracts

### **Test Best Practices**
- Write tests before implementing features (TDD)
- Keep tests simple and focused
- Use descriptive test names
- Mock external dependencies
- Test both success and failure cases
- Maintain high test coverage

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Mock Service Worker](https://mswjs.io/) (for API mocking)

---

**Happy Testing! 🧪✨**
