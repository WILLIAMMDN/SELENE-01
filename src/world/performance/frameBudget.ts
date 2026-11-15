/** Conservative DPR changes after sustained load, with warmup and asymmetric hysteresis. */
export class FrameBudget {
  private warmup = 5
  private seconds = 0
  private frames = 0
  private fastWindows = 0
  sample(delta: number, dpr: number, maximum: number): number | null {
    if (!Number.isFinite(delta) || delta <= 0 || delta > 0.25) {
      this.seconds = 0
      this.frames = 0
      this.fastWindows = 0
      return null
    }
    if (this.warmup > 0) {
      this.warmup -= delta
      return null
    }
    this.seconds += delta
    this.frames++
    if (this.seconds < 3) return null
    const fps = this.frames / this.seconds
    this.seconds = 0
    this.frames = 0
    if (fps < 40) {
      this.fastWindows = 0
      return dpr > 1 ? Math.max(1, Math.round((dpr - 0.15) * 100) / 100) : null
    }
    this.fastWindows = fps > 58 ? this.fastWindows + 1 : 0
    if (this.fastWindows >= 3 && dpr < maximum) {
      this.fastWindows = 0
      return Math.min(maximum, Math.round((dpr + 0.1) * 100) / 100)
    }
    return null
  }
}
