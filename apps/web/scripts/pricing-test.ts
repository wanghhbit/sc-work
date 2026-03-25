import assert from 'node:assert/strict'
import { calcCartTotal, calcLineTotal } from '@/features/storefront/services/pricing'

function run() {
  assert.equal(calcLineTotal(10, 2), 20)
  assert.equal(calcLineTotal(0, 99), 0)
  assert.equal(calcLineTotal(-10, 2), 0)
  assert.equal(calcLineTotal(19.9, 3), 59.7)

  const total = calcCartTotal([
    { productId: 'p1', size: 'M', unitPrice: 100, quantity: 2 },
    { productId: 'p2', size: 'S', unitPrice: 59.5, quantity: 3 },
  ])
  assert.equal(total, 100 * 2 + 59.5 * 3)
}

run()
console.log('pricing-test: ok')

