'use client'

type NumericKeypadProps = {
  value: string
  onChange: (value: string) => void
  maxLength: number
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

export default function NumericKeypad({ value, onChange, maxLength }: NumericKeypadProps) {
  const handlePress = (key: string) => {
    if (key === 'clear') {
      onChange('')
      return
    }
    if (key === 'back') {
      onChange(value.slice(0, -1))
      return
    }
    if (value.length < maxLength) {
      onChange(value + key)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handlePress(key)}
          className="rounded-2xl border border-[#D9D5CC] bg-white py-5 text-2xl font-semibold text-[#355C46] shadow-sm transition active:scale-95 active:bg-[#EEE5D6] sm:py-6 sm:text-3xl"
        >
          {key === 'clear' ? '清除' : key === 'back' ? '⌫' : key}
        </button>
      ))}
    </div>
  )
}
