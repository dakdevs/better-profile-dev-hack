import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the server config before importing the service
vi.mock('~/config/server-config', () => ({
  serverConfig: {
    cal: {
      apiKey: 'test-cal-key'
    }
  }
}))

import { CalComService } from '../cal-com'

describe('CalComService', () => {
  let service: CalComService
  let mockFetch: any

  beforeEach(() => {
    service = new CalComService('test-api-key')
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  describe('constructor', () => {
    it('should initialize with API key', () => {
      const serviceWithKey = new CalComService('valid-key')
      expect(serviceWithKey).toBeInstanceOf(CalComService)
    })
  })

  describe('getUser', () => {
    it('should fetch user data successfully', async () => {
      const mockUser = {
        id: 123,
        username: 'testuser',
        email: 'test@example.com'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser })
      })

      const result = await service.getUser()

      expect(result).toEqual(mockUser)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/me?apiKey=test-api-key'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized')
      })

      await expect(service.getUser()).rejects.toThrow('Cal.com API error: 401')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(service.getUser()).rejects.toThrow('Network error')
    })
  })

  describe('getSchedules', () => {
    it('should fetch schedules successfully', async () => {
      const mockSchedules = [
        { id: 1, name: 'Default Schedule' },
        { id: 2, name: 'Weekend Schedule' }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ schedules: mockSchedules })
      })

      const result = await service.getSchedules()

      expect(result).toEqual(mockSchedules)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/schedules?apiKey=test-api-key'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })
  })

  describe('getEventTypes', () => {
    it('should fetch event types successfully', async () => {
      const mockEventTypes = [
        { id: 1, title: '30 Minute Meeting' },
        { id: 2, title: '1 Hour Meeting' }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ event_types: mockEventTypes })
      })

      const result = await service.getEventTypes()

      expect(result).toEqual(mockEventTypes)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/event-types?apiKey=test-api-key'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })
  })

  describe('createEventType', () => {
    it('should create event type successfully', async () => {
      const eventTypeData = {
        title: 'Test Meeting',
        slug: 'test-meeting',
        length: 30,
        scheduleId: 1,
        hidden: false
      }

      const mockEventType = {
        id: 123,
        ...eventTypeData
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ event_type: mockEventType })
      })

      const result = await service.createEventType(eventTypeData)

      expect(result).toEqual(mockEventType)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/event-types?apiKey=test-api-key'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            ...eventTypeData,
            metadata: {},
            hidden: false
          })
        })
      )
    })
  })

  describe('getAvailableSlots', () => {
    it('should fetch available slots successfully', async () => {
      const params = {
        eventTypeId: 123,
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-01T23:59:59Z'
      }

      const mockSlots = [
        { time: '2024-01-01T09:00:00Z' },
        { time: '2024-01-01T10:00:00Z' }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ slots: mockSlots })
      })

      const result = await service.getAvailableSlots(params)

      expect(result).toEqual(mockSlots)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/slots?eventTypeId=123&startTime=2024-01-01T00:00:00Z&endTime=2024-01-01T23:59:59Z&apiKey=test-api-key'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })

    it('should handle empty slots response', async () => {
      const params = {
        eventTypeId: 123,
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-01T23:59:59Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ slots: null })
      })

      const result = await service.getAvailableSlots(params)
      expect(result).toEqual([])
    })
  })

  describe('createBooking', () => {
    it('should create booking successfully', async () => {
      const bookingData = {
        eventTypeId: 123,
        start: '2024-01-01T10:00:00Z',
        end: '2024-01-01T11:00:00Z',
        timeZone: 'UTC',
        responses: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      }

      const mockBooking = {
        id: 456,
        ...bookingData,
        status: 'ACCEPTED'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ booking: mockBooking })
      })

      const result = await service.createBooking(bookingData)

      expect(result).toEqual(mockBooking)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bookings?apiKey=test-api-key'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            ...bookingData,
            language: 'en',
            status: 'ACCEPTED'
          })
        })
      )
    })

    it('should create booking with custom status', async () => {
      const bookingData = {
        eventTypeId: 123,
        start: '2024-01-01T10:00:00Z',
        end: '2024-01-01T11:00:00Z',
        timeZone: 'UTC',
        responses: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        status: 'PENDING'
      }

      const mockBooking = {
        id: 456,
        ...bookingData
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ booking: mockBooking })
      })

      const result = await service.createBooking(bookingData)

      expect(result).toEqual(mockBooking)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bookings?apiKey=test-api-key'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            ...bookingData,
            language: 'en',
            status: 'PENDING'
          })
        })
      )
    })
  })

  describe('getBookings', () => {
    it('should fetch bookings without parameters', async () => {
      const mockBookings = [
        { id: 1, title: 'Meeting 1' },
        { id: 2, title: 'Meeting 2' }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ bookings: mockBookings })
      })

      const result = await service.getBookings()

      expect(result).toEqual(mockBookings)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bookings?apiKey=test-api-key'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })

    it('should fetch bookings with parameters', async () => {
      const params = {
        status: 'ACCEPTED',
        userId: 123,
        eventTypeId: 456
      }

      const mockBookings = [{ id: 1, status: 'ACCEPTED' }]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ bookings: mockBookings })
      })

      const result = await service.getBookings(params)

      expect(result).toEqual(mockBookings)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bookings?status=ACCEPTED&userId=123&eventTypeId=456&apiKey=test-api-key'),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })

    it('should handle empty bookings response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      const result = await service.getBookings()
      expect(result).toEqual([])
    })
  })

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      await service.cancelBooking(123, 'No longer needed')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bookings/123/cancel?apiKey=test-api-key'),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ reason: 'No longer needed' })
        })
      )
    })

    it('should cancel booking without reason', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      await service.cancelBooking(123)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bookings/123/cancel?apiKey=test-api-key'),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ reason: undefined })
        })
      )
    })
  })

  describe('rescheduleBooking', () => {
    it('should reschedule booking successfully', async () => {
      const rescheduleParams = {
        start: '2024-01-02T10:00:00Z',
        end: '2024-01-02T11:00:00Z',
        timeZone: 'UTC'
      }

      const mockBooking = {
        id: 123,
        ...rescheduleParams,
        status: 'ACCEPTED'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ booking: mockBooking })
      })

      const result = await service.rescheduleBooking(123, rescheduleParams)

      expect(result).toEqual(mockBooking)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bookings/123/reschedule?apiKey=test-api-key'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(rescheduleParams)
        })
      )
    })
  })

  describe('validateApiKey', () => {
    it('should return true for valid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: 123 } })
      })

      const result = await service.validateApiKey()
      expect(result).toBe(true)
    })

    it('should return false for invalid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      const result = await service.validateApiKey()
      expect(result).toBe(false)
    })
  })

  describe('getDefaultSchedule', () => {
    it('should return first schedule when schedules exist', async () => {
      const mockSchedules = [
        { id: 1, name: 'Default Schedule' },
        { id: 2, name: 'Weekend Schedule' }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ schedules: mockSchedules })
      })

      const result = await service.getDefaultSchedule()
      expect(result).toEqual(mockSchedules[0])
    })

    it('should return null when no schedules exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ schedules: [] })
      })

      const result = await service.getDefaultSchedule()
      expect(result).toBeNull()
    })
  })

  describe('setupInterviewEventType', () => {
    it('should create interview event type with correct parameters', async () => {
      const mockEventType = {
        id: 789,
        title: '45-Minute Candidate Interview',
        slug: 'candidate-interview-1234567890',
        length: 45
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ event_type: mockEventType })
      })

      const result = await service.setupInterviewEventType(123)

      expect(result).toEqual(mockEventType)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/event-types?apiKey=test-api-key'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"title":"45-Minute Candidate Interview"')
        })
      )
    })
  })
})
