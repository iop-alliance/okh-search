import * as React from 'react'
import { Button, Icon } from 'semantic-ui-react'
import VisuallyHidden from '@reach/visually-hidden'

export default function FilterSelect({ onChange, options, className = "" }) {
  const [selected, setSelected] = React.useState([])
  const [isExpanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    if (onChange != null) {
      onChange(selected)
    }
  }, [selected.toString()])

  const optionsToShow = isExpanded ? options : options.slice(0, 5)
  return (
    <div className={className}>
      <div className="flex justify-end w-full h-11">
        {selected.length > 0 && (
          <Button basic onClick={() => setSelected([])}>
            clear
          </Button>
        )}
      </div>
      <div className="flex flex-wrap justify-start align-center space-x-4 space-y-2">
        <div />
        {optionsToShow.map(o => (
          <SelectInput
            key={o}
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
          <div
            className="cursor-pointer border-1 pl-2 pr-2 text-xl rounded-full p-2"
            onClick={() => setExpanded(true)}
          >
            <Icon name="plus" />
            {'more ...'}
          </div>
        )}
        {isExpanded && (
          <div
            className="cursor-pointer border-1 pl-2 pr-2 text-xl rounded-full p-2"
            onClick={() => setExpanded(false)}
          >
            <Icon name="minus" />
            {'hide'}
          </div>
        )}
      </div>
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
          checked={isChecked}
          id={id}
          name="goban-size"
          type="checkbox"
          value={value}
          onChange={() => onChange(!isChecked)}
        />
      </VisuallyHidden>
      <label className="cursor-pointer" htmlFor={id}>
        {value}
      </label>
    </div>
  )
}
