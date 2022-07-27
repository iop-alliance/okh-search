import * as React from 'react'
import { Button, Icon } from 'semantic-ui-react'
import VisuallyHidden from '@reach/visually-hidden'
import TagButton from './TagButton'

export default function FilterSelect({ onChange, options, className = '' }) {
  const [selected, setSelected] = React.useState([])
  const [isExpanded, setExpanded] = React.useState(false)

  const doSelect = o => {
    setSelected(selected => {
      if (!selected.includes(o)) {
        return selected.concat([o])
      }
      return selected
    })
  }

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
        {optionsToShow
          .filter(o => !selected.includes(o))
          .map(o => (
            <TagButton key={o} onClick={() => doSelect(o)}>{o}</TagButton>
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
