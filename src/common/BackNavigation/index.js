import React from 'react'
import { Icon } from 'antd'
import { Link } from 'react-router-dom'

const BackNavigation = props => {
  const { link, title } = props
  return (
    <Link to={link}>
      <span>
        <Icon type="arrow-left" style={{ fontSize: '15px' }} />
        <span style={{ fontSize: '15px', fontWeight: '400', paddingLeft: '10px' }}>{title}</span>
      </span>
    </Link>
  )
}

export default BackNavigation
