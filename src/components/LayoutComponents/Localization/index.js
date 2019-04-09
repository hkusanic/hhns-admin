import React from 'react'
import { LocaleProvider } from 'antd'
import { IntlProvider, addLocaleData } from 'react-intl'
import { connect } from 'react-redux'
import english from 'locales/en-US'
import russian from 'locales/ru-RU'

addLocaleData(english.localeData)
addLocaleData(russian.localeData)

const locales = {
  'en-US': english,
  'ru-RU': russian,
}

@connect(({ settings }) => ({ settings }))
class Localization extends React.Component {
  render() {
    const {
      children,
      settings: { locale },
    } = this.props
    const currentLocale = locales[locale]
    return (
      <LocaleProvider locale={currentLocale.antdData}>
        <IntlProvider locale={currentLocale.locale} messages={currentLocale.messages}>
          {children}
        </IntlProvider>
      </LocaleProvider>
    )
  }
}

export default Localization
