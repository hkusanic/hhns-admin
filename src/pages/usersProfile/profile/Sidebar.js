import React, { Component } from 'react'
import { Menu, Layout } from 'antd'
import { Link, withRouter } from 'react-router-dom'

import './Sidebar.css'

const { Content, Sider } = Layout

class Sidebar extends Component {
  render() {
    const { location, children } = this.props

    let keys = '1'
    if (location.pathname === '/users/profile/basic') {
      keys = '1'
    }

    if (location.pathname === '/users/profile/disciple') {
      keys = '2'
    }

    if (location.pathname === '/users/profile/sadhana') {
      keys = '3'
    }

    if (location.pathname === '/users/profile/reports') {
      keys = '4'
    }

    return (
      <div className="card">
        <Layout>
          <Sider width={200} style={{ background: '#fff' }}>
            <Menu
              mode="inline"
              defaultSelectedKeys={[keys]}
              style={{ height: '100%', borderRight: 0 }}
            >
              <Menu.Item key="1">
                <Link to="/users/profile/basic">Basic Profile</Link>
              </Menu.Item>

              <Menu.Item key="2">
                <Link to="/users/profile/disciple">Disciple Profile</Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to="/users/profile/sadhana">Sadhana Sheets</Link>
              </Menu.Item>
              <Menu.Item key="4">
                <Link to="/users/profile/reports">Reports</Link>
              </Menu.Item>
            </Menu>
          </Sider>

          <Layout style={{ padding: '0 24px 24px' }}>
            <Content
              style={{
                background: '#fff',
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </div>
    )
  }
}

export default withRouter(Sidebar)
