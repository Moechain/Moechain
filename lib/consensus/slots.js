const beginEpochTime = () => {
  const d = new Date(1507621875416)
  return d
}

const getEpochTime = time => {
  if (time === undefined) {
    time = new Date().getTime()
  }
  const d = beginEpochTime()
  const t = d.getTime()
  return Math.floor((time - t) / 1000)
}

console.log(getEpochTime())
class Slot {
  constructor() {
    this.interval = 10
    this.delegates = 101
  }

  getTime(time) {
    return getEpochTime(time)
  }

  getRealTime(epochTime) {
    if (epochTime === undefined) {
      epochTime = this.getTime()
    }
    const d = beginEpochTime()
    const t = Math.floor(d.getTime() / 1000) * 1000
    return t + epochTime * 1000
  }

  getSlotNumber(epochTime) {
    if (epochTime === undefined) {
      epochTime = this.getTime()
    }
    return Math.floor(epochTime / this.interval)
  }

  getSlotTime(slot) {
    return slot * this.interval
  }

  getNextSlot() {
    const slot = this.getSlotNumber()

    return slot + 1
  }

  getLastSlot(nextSlot) {
    return nextSlot + this.delegates
  }

  roundTime(date) {
    Math.floor(date.getTime() / 1000) * 1000
  }
}
let slot = new Slot()

// console.log(slot.getRealTime())
// console.log(slot.getNextSlot())
// console.log(slot.getSlotTime(101))
