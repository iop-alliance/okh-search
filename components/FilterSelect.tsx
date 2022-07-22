import * as React from 'react'
import VisuallyHidden from '@reach/visually-hidden'

export default function FilterSelect({ onChange, options }) {
  const [selected, setSelected] = React.useState([])

  React.useEffect(() => {
    if (onChange != null) {
      onChange(selected)
    }
  }, [selected.toString(), onChange])
  return (
    <div>
      {options.map(o => (
        <SelectInput
          value={o}
          isChecked={selected.includes(o)}
          onChange={isChecked =>
            setSelected(selected => {
              if (isChecked && !selected.includes(o)) {
                return selected.concat([o])
              } else if (!isChecked) {
                return selected.filter(x => x !== o)
              }
              return selected
            })
          }
        />
      ))}
    </div>
  )
}

function SelectInput({ value, isChecked, onChange }) {
  const id = `select-${value}`
  return (
    <div>
      <input
        key={id}
        checked={isChecked}
        id={id}
        name="goban-size"
        type="checkbox"
        value={value}
        onChange={() => onChange(!isChecked)}
      />
      <label key={id + '-label'} htmlFor={id}>
        {value}
      </label>
    </div>
  )
}
