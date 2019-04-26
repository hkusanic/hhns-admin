/* eslint-disable */
import React from 'react'
import { Timeline } from 'antd'

const AuditTimeline = ({ audit }) => {
  // console.log(audit)

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
