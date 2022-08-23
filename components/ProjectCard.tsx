import React from 'react'
import { Card } from 'semantic-ui-react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import querystring from 'querystring'
import Link from 'next/link'

import TagButton from './TagButton'

const ProjectCard = ({ project, setOnlyFilter }) => {
  const author =
    project.licensor?.name ||
    project.contact?.name ||
    project.contributors?.[0]?.name ||
    ''
  let description = project.description || ''
  if (description.length > 140) {
    description = description.slice(0, 140) + '...'
  }

  const domain = project['source-domain']
  const keywords = project.keywords || []
  const files = project.fileExtensions

  return (
    <Card style={{ margin: 20 }} key={project.id} link>
      <a style={{height: 200}} href={project['documentation-home']}>
        <LazyLoadImage
          style={{ width: 290, height: 200, objectFit: 'cover' }}
          src={project.image || 'images/placeholder.png'}
        />
      </a>
      <Card.Content as="a" href={project['documentation-home']}>
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
      <Card.Content
        style={{
          maxHeight: 63,
          overflow: 'hidden',
          cursor: 'default',
          display: 'flex',
          flexWrap: 'wrap',
        }}
        extra
      >
        <Button tagType="source" tagName={domain} setOnlyFilter={setOnlyFilter} />
        {keywords.map(kw => (
          <Button
            key={`kw:${kw}`}
            tagType="keywords"
            tagName={kw}
            setOnlyFilter={setOnlyFilter}
          />
        ))}
        {files.map(ext => (
          <Button
            key={`ext:${ext}`}
            tagType="files"
            tagName={ext}
            setOnlyFilter={setOnlyFilter}
          />
        ))}
      </Card.Content>
    </Card>
  )
}

function Button({ tagType, tagName, setOnlyFilter }) {
  const href = '#' + querystring.encode({ [tagType]: tagName })
  return (
    <div style={{marginBottom: 20}}>
      <TagButton
        as="a"
        href={href}
        size="tiny"
        onClick={e => {
          e.preventDefault()
          setOnlyFilter(tagType, tagName)
        }}
      >
        {tagName}
      </TagButton>
    </div>
  )
}

export default ProjectCard
