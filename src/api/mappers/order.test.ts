import { describe, expect, it } from 'vitest'
import { IMAGE_PLACEHOLDER } from '@/lib/media'
import { toOrder, toOrderListItem } from './order'

describe('toOrderListItem', () => {
  it('maps the documented list row', () => {
    expect(
      toOrderListItem({
        id: 10,
        customer_name: 'Emir Tekayev',
        phone_number: '+99365123456',
        city: 'Ashgabat',
        total_product: 2,
        total_price: 2400,
        is_send: false,
        is_new: true,
      }),
    ).toEqual({
      id: 10,
      customerName: 'Emir Tekayev',
      phone: '+99365123456',
      city: 'Ashgabat',
      productCount: 2,
      totalPrice: 2400,
      isSent: false,
      isNew: true,
    })
  })

  it('defaults missing fields instead of leaking null', () => {
    expect(toOrderListItem({ id: 1 })).toEqual({
      id: 1,
      customerName: '',
      phone: '',
      city: '',
      productCount: 0,
      totalPrice: 0,
      isSent: false,
      isNew: false,
    })
  })
})

describe('toOrder', () => {
  it('maps the documented detail response and keeps the route id', () => {
    const order = toOrder(10, {
      phone_number: '+99365123456',
      city: 'Ashgabat',
      delivery_address: 'Berzengi, 15-nji jaý, 24-nji öý',
      notes: 'Please deliver after 18:00',
      total_product: 2,
      products: [{ id: 2, name: 'iPhone 15', price: 1200, discount_price: null, image: null, total: 2 }],
      total_price: 2400,
      is_send: false,
    })
    expect(order).toMatchObject({
      id: 10,
      deliveryAddress: 'Berzengi, 15-nji jaý, 24-nji öý',
      notes: 'Please deliver after 18:00',
      productCount: 2,
      totalPrice: 2400,
      isSent: false,
    })
    expect(order.products).toEqual([
      { id: 2, name: 'iPhone 15', price: 1200, discountPrice: null, image: IMAGE_PLACEHOLDER, quantity: 2 },
    ])
  })

  it('treats a missing product list as empty', () => {
    expect(toOrder(3, {}).products).toEqual([])
  })
})
