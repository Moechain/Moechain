const calc = height => {
  return Math.floor(height / 101) + (height % 101 > 0 ? 1 : 0)
}

console.log(calc(1011))
