import React from 'react'
import { Button, Icon } from 'semantic-ui-react'

import styles from './TagButton.module.css'

export default function TagButton({ children, onClick, icon }) {
  return (
    <Button size="large" className={styles.button} icon circular basic>
      <div style={{ display: 'flex' }}>
        {children}
        {icon && (
          <div style={{ height: '100%', marginLeft: 10, marginTop: 1 }}>
            <Icon name={icon} />
          </div>
        )}
      </div>
    </Button>
  )
}
