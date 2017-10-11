exports.calc = height => {
  return Math.floor(height / 100) + (height % 100 > 0 ? 1 : 0)
}
