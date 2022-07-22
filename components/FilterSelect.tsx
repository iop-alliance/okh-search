import * as React from 'react'
import { Button, Icon } from 'semantic-ui-react'
import VisuallyHidden from '@reach/visually-hidden'

export default function FilterSelect({ onChange, options }) {
  const [selected, setSelected] = React.useState([])
  const [isExpanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    if (onChange != null) {
      onChange(selected)
    }
  }, [selected.toString()])

  const optionsToShow = isExpanded ? options : options.slice(0, 6)
  return (
    <div className="flex flex-wrap items-center justify-center space-x-4 space-y-2">
      <Button basic size="tiny" onClick={() => setSelected([])}>
        <Icon name="x" />
        clear
      </Button>
      {optionsToShow.map(o => (
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
      {optionsToShow.length < options.length && (
        <Button size="tiny" basic onClick={() => setExpanded(true)}>
          <Icon name="plus" />
          {'more ...'}
        </Button>
      )}
      {optionsToShow.length === options.length && (
        <Button size="tiny" basic onClick={() => setExpanded(false)}>
          <Icon name="minus" />
          {'show less'}
        </Button>
      )}
    </div>
  )
}

function SelectInput({ value, isChecked, onChange }) {
  const id = `select-${value}`
  const borderStyle = isChecked ? 'border-gray-800' : 'border-gray-100'
  return (
    <div
      className={`border ${borderStyle} border-1 pl-2 pr-2 text-xl rounded-full p-2`}
    >
      <VisuallyHidden>
        <input
          key={id}
          checked={isChecked}
          id={id}
          name="goban-size"
          type="checkbox"
          value={value}
          onChange={() => onChange(!isChecked)}
        />
      </VisuallyHidden>
      <label className="cursor-pointer" key={id + '-label'} htmlFor={id}>
        {value}
      </label>
    </div>
  )
}
