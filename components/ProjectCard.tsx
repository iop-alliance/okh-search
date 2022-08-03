import React from 'react'
import { Card, Label } from 'semantic-ui-react'
import { LazyLoadImage } from 'react-lazy-load-image-component'

const ProjectCard = ({ project }) => {
  const author =
    project.licensor?.name ||
    project.contact?.name ||
    project.contributors?.[0]?.name ||
    ''
  let description = project.description || ''
  if (description.length > 140) {
    description = description.slice(0, 140) + '...'
  }

  const tags = [project['source-domain']]
    .concat(project.keywords || [])
    .concat(project.fileExtensions)

  return (
    <Card
      style={{ margin: 20 }}
      key={project.id}
      as="a"
      href={project['documentation-home']}
    >
      <LazyLoadImage
        style={{ width: 290, height: 200, objectFit: 'cover' }}
        src={project.image || 'images/placeholder.png'}
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
      <Card.Content style={{ maxHeight: 55, overflow: 'hidden' }} extra>
        {tags.map(t => (
          <Label
            style={{
              marginBottom: 12,
              color: 'rgba(0, 0, 0, 0.6)',
              padding: '10px !important',
            }}
            key={t}
            basic
            circular
          >
            {t}
          </Label>
        ))}
      </Card.Content>
    </Card>
  )
}

export default ProjectCard
