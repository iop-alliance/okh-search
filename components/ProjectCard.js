import React from 'react'
import Head from 'next/head'
import { Card, Image } from 'semantic-ui-react'

const ProjectCard = ({ project }) => {
  const author =
    project.licensor?.name ||
    project.contributors?.[0]?.name ||
    project['manifest-author']?.name ||
    ''
  let description = project.description || ''
  if (description.length > 140) {
    description = description.slice(0, 140) + '...'
  }

  return (
    <Card style={{margin: 20}} key={project.id} as="a" href={project['documentation-home']}>
      <Image
        as="div"
        style={{
          height: 200,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
        src={project.image || '/images/placeholder.png'}
      />
      <Card.Content>
        <Card.Header
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {project.title}
        </Card.Header>
        <Card.Meta
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {author}
        </Card.Meta>
        <Card.Description
          style={{
            maxHeight: '10em',
            overflow: 'hidden',
          }}
        >
          {description}
        </Card.Description>
      </Card.Content>
    </Card>
  )
}

export default ProjectCard
