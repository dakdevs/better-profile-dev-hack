"use client"

import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  life: number
  maxLife: number
  targetY: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      const particleCount = Math.min(40, Math.floor((canvas.width * canvas.height) / 25000))

      for (let i = 0; i < particleCount; i++) {
        const y = Math.random() * canvas.height
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: y,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1 - 0.05, // Slight upward bias for inspiration
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          hue: Math.random() * 80 + 200, // Blue to warm teal range
          life: 0,
          maxLife: Math.random() * 400 + 300,
          targetY: y - Math.random() * 100 - 50, // Gentle upward drift target
        })
      }
    }

    initParticles()

    // Mouse tracking for subtle interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.015)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Create gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2,
      )
      gradient.addColorStop(0, "rgba(252, 252, 253, 0.95)")
      gradient.addColorStop(0.4, "rgba(248, 250, 252, 0.97)")
      gradient.addColorStop(0.8, "rgba(241, 245, 249, 0.98)")
      gradient.addColorStop(1, "rgba(236, 242, 249, 1)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        const upwardForce = Math.sin(particle.life * 0.005) * 0.002
        particle.vy -= upwardForce

        // Update position with gentle drift
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life++

        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 200) {
          const force = ((200 - distance) / 200) * 0.0003
          particle.vx += dx * force
          particle.vy += dy * force
        }

        particle.vx *= 0.995
        particle.vy *= 0.995

        // Boundary wrapping
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        const breathe = Math.sin(particle.life * 0.008) * 0.15 + 0.85
        const currentOpacity = particle.opacity * breathe * 2.5 // Increased base opacity

        const hueShift = Math.sin(particle.life * 0.003) * 10
        const currentHue = particle.hue + hueShift

        // Draw particle with better contrast
        ctx.save()

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${currentHue}, 45%, 45%, ${currentOpacity * 0.12})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${currentHue}, 55%, 35%, ${currentOpacity * 0.25})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${currentHue}, 65%, 25%, ${currentOpacity * 0.8})`
        ctx.fill()

        ctx.restore()

        // Reset particle if it's lived too long
        if (particle.life > particle.maxLife) {
          particle.x = Math.random() * canvas.width
          particle.y = Math.random() * canvas.height
          particle.life = 0
          particle.hue = Math.random() * 80 + 200
          particle.maxLife = Math.random() * 400 + 300
        }
      })

      ctx.strokeStyle = "rgba(71, 85, 105, 0.15)"
      ctx.lineWidth = 0.8

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 80) {
            const opacity = ((80 - distance) / 80) * 0.2 // Increased connection opacity
            ctx.strokeStyle = `rgba(71, 85, 105, ${opacity})`
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "linear-gradient(135deg, #fcfcfd 0%, #f8fafc 50%, #ecf2f9 100%)" }}
    />
  )
}
