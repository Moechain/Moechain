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

class Slot {
  constructor() {
    this.interval = 10
    this.senators = 101
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
    return nextSlot + this.senators
  }

  roundTime(slot) {
    return Math.ceil(slot / 101)
  }

  getSenatorId() {
    // const thisTimeRound = this.roundTime(slot)
    // const slots = (thisTimeRound - 1) * this.senators
    // return slot - slots
    return this.getSlotNumber() % this.senators
  }
}
module.exports = Slot
// let s = new Slot()
// console.log(s.getSlotNumber())
// console.log(s.getThisTimeSenator(s.getSlotNumber()))
