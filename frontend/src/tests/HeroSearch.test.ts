import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import HeroSearch from '../components/home/HeroSearch.vue'

describe('HeroSearch', () => {
  it('emits update:modelValue when typing', async () => {
    const wrapper = mount(HeroSearch, {
      props: { modelValue: '' }
    })

    await wrapper.get('input').setValue('pasta')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['pasta'])
  })
})
