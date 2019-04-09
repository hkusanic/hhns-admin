import React from 'react'
import { Menu, Dropdown } from 'antd'
import { connect } from 'react-redux'
import reactCookie from 'react-cookies'
import styles from './style.module.scss'

@connect(({ settings }) => ({ settings }))
class LanguageSelector extends React.Component {
  changeLang = ({ key }) => {
    const { dispatch } = this.props
    dispatch({
      type: 'settings/CHANGE_SETTING',
      payload: {
        setting: 'locale',
        value: key,
      },
    })

    setTimeout(() => {
      if (window.localStorage['app.settings.locale'] === '"ru-RU"') {
        reactCookie.save('languageCode', 'ru', { path: '/' })
      } else {
        reactCookie.save('languageCode', 'en', { path: '/' })
      }
      window.location.reload()
    }, 300)
  }

  render() {
    const {
      settings: { locale },
    } = this.props
    const language = locale.substr(0, 2)

    const langMenu = (
      <Menu className={styles.menu} selectedKeys={[locale]} onClick={this.changeLang}>
        <Menu.Item key="en-US">
          <span role="img" aria-label="English" className="mr-2">
            🇬🇧
          </span>
          English
        </Menu.Item>
        <Menu.Item key="ru-RU">
          <span role="img" aria-label="Русский" className="mr-2">
            🇷🇺
          </span>
          Русский
        </Menu.Item>
      </Menu>
    )
    return (
      <Dropdown overlay={langMenu} trigger={['click']}>
        <div className={styles.dropdown}>
          <strong className="text-uppercase">{language}</strong>
        </div>
      </Dropdown>
    )
  }
}

export default LanguageSelector
