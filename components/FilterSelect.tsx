import * as React from 'react'
import { Button, Icon } from 'semantic-ui-react'
import TagButton from './TagButton'
import styles from './FilterSelect.module.css'

export default function FilterSelect({ onSelect, options, className = '' }) {
  const [isExpanded, setExpanded] = React.useState(false)

  const optionsToShow = isExpanded ? options : options.slice(0, 5)
  return (
    <div className={className}>
      <div className={styles.filterSelect}>
        {optionsToShow.map(o => (
          <TagButton size="large" key={o} onClick={() => onSelect(o)}>
            {o}
          </TagButton>
        ))}
        {optionsToShow.length < options.length && (
          <div className={styles.showOrHide} onClick={() => setExpanded(true)}>
            <Icon name="plus" />
            {'more ...'}
          </div>
        )}
        {isExpanded && (
          <div className={styles.showOrHide} onClick={() => setExpanded(false)}>
            <Icon name="minus" />
            {'hide'}
          </div>
        )}
      </div>
    </div>
  )
}
