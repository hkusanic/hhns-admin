/* eslint-disable */
import React from 'react'
import { Timeline } from 'antd'

const AuditTimeline = ({ audit }) => {
  audit = audit.reverse()

  return (
    <div>
      <Timeline>
        {audit &&
          audit.map((item, index) => {
            item = JSON.parse(item)
            return (
              <Timeline.Item key={index}>
                {item.fullName} {item.dateTime}
              </Timeline.Item>
            )
          })}
      </Timeline>
    </div>
  )
}

export default AuditTimeline
