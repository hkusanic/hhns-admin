/* eslint-disable */
import React from 'react'
import moment from 'moment'
import { Timeline } from 'antd'

const AuditTimeline = ({ audit }) => {
  if (!audit) {
    return <div>No Audit is availble</div>
  }
  audit = audit.reverse()

  return (
    <div>
      <Timeline>
        {audit &&
          audit.map((item, index) => {
            item = JSON.parse(item)
            return (
              <Timeline.Item key={index}>
                {item.fullName}{' '}
                {moment(item.dateTime, 'YYYYMMDDTHHmmssZ').format('h:mm a, MMMM Do YYYY')}
              </Timeline.Item>
            )
          })}
      </Timeline>
    </div>
  )
}

export default AuditTimeline
