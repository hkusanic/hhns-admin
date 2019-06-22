/* eslint-disable eqeqeq */
/* eslint-disable func-names */
/* eslint-disable one-var */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
import React from 'react'
import { Editor } from 'react-draft-wysiwyg'

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import {
  Form,
  Input,
  Button,
  Checkbox,
  DatePicker,
  Select,
  Upload,
  Icon,
  message,
  notification,
  Switch,
  Tabs,
} from 'antd'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import $ from 'jquery'
import moment from 'moment'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import BackNavigation from '../../../common/BackNavigation/index'
import { uuidv4 } from '../../../services/custom'
import styles from './style.module.scss'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'
import { checkValidation } from '../../../utils/checkValidation'
import { formInputElements, formInputSourceQuote } from '../../../utils/addQuoteInput'
import './index.css'

const { Option } = Select
const { TabPane } = Tabs
const FormItem = Form.Item
const { Dragger } = Upload

@Form.create()
@connect(({ quote, router }) => ({ quote, router }))
class AddQuote extends React.Component {
  state = {
    files: [],
    editorState: EditorState.createEmpty(),
    editingQuote: '',
    editedBody: '',
    language: true,
    translationRequired: true,
    titleEn: '',
    titleRu: '',
    bodyContentEn: '',
    bodyContentRu: '',
    switchDisabled: true,
    formElements: formInputElements,
    formSourceQuote: formInputSourceQuote,
    sourceOfQuoteEn: '',
    sourceOfQuoteRu: '',
    paginationCurrentPage: '',
  }

  componentDidMount() {
    const { dispatch, router } = this.props
    const { location } = router
    const { state } = location
    if (state !== undefined) {
      const { language, currentPage } = state
      setTimeout(
        this.setState({
          language,
          paginationCurrentPage: currentPage,
        }),
        0,
      )
      const { id } = state

      const uuid = id
      if (uuid !== undefined) {
        const body = {
          uuid,
        }
        dispatch({
          type: 'quote/GET_QUOTE_BY_ID',
          payload: body,
        })
        dispatch({
          type: 'quote/GET_TOPICS',
        })
      }
    }

    dispatch({
      type: 'kirtan/RESET_STORE',
    })

    dispatch({
      type: 'video/RESET_STORE',
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.quote.editQuote) {
      const { quote } = nextProps
      const { editQuote } = quote
      const { language } = this.state

      const titleEn = editQuote ? (editQuote.en ? editQuote.en.title : '') : ''
      const titleRu = editQuote ? (editQuote.ru ? editQuote.ru.title : '') : ''

      const sourceOfQuoteEn = editQuote ? (editQuote.en ? editQuote.en.source_of_quote : '') : ''
      const sourceOfQuoteRu = editQuote ? (editQuote.ru ? editQuote.ru.source_of_quote : '') : ''
      const author = editQuote ? (editQuote.author ? editQuote.author : '') : ''

      let bodyContentEn = ''
      let bodyContentRu = ''

      const htmlbodyContentEn = editQuote ? (editQuote.en ? editQuote.en.body : '') : ''

      const htmlbodyContentRu = editQuote ? (editQuote.ru ? editQuote.ru.body : '') : ''

      if (htmlbodyContentEn && htmlbodyContentEn.length > 0) {
        const contentBlockEn = htmlToDraft(htmlbodyContentEn)
        if (contentBlockEn) {
          const contentStateEn = ContentState.createFromBlockArray(contentBlockEn.contentBlocks)
          bodyContentEn = EditorState.createWithContent(contentStateEn)
        }
      }

      if (htmlbodyContentRu && htmlbodyContentRu.length > 0) {
        const contentBlockRu = htmlToDraft(htmlbodyContentRu)
        if (contentBlockRu) {
          const contentStateRu = ContentState.createFromBlockArray(contentBlockRu.contentBlocks)
          bodyContentRu = EditorState.createWithContent(contentStateRu)
        }
      }

      this.setState(
        {
          editingQuote: quote.editQuote,
          bodyContentEn,
          bodyContentRu,
          titleEn,
          titleRu,
          sourceOfQuoteEn,
          sourceOfQuoteRu,
          // eslint-disable-next-line react/no-unused-state
          author,
        },
        () => {
          this.onFieldValueChange()
        },
      )
    }
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
  }

  componentWillUnmount() {
    this.setState({
      files: [],
      editorState: EditorState.createEmpty(),
      editingQuote: '',
      editedBody: '',
      language: true,
      translationRequired: true,
    })
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      files: [],
      editorState: EditorState.createEmpty(),
      editingQuote: '',
      editedBody: '',
      language: true,
      translationRequired: true,
    })
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  handleFormBody = event => {
    event.preventDefault()
    const { form, dispatch, router, english } = this.props
    // const { location } = router
    // const uuid = location.state
    const { location } = router
    const { state } = location

    let uuid = ''
    if (state !== undefined) {
      const { id } = state
      uuid = id
    }

    const {
      files,
      editorState,
      editingQuote,
      translationRequired,
      topics,
      language,
      titleEn,
      titleRu,
      bodyContentEn,
      bodyContentRu,
      sourceOfQuoteEn,
      sourceOfQuoteRu,
    } = this.state
    // const titleEn = form.getFieldValue('title')
    const topic = form.getFieldValue('topic')
    const date = form.getFieldValue('date')
    const publishDate = form.getFieldValue('publish_date')
    const author = form.getFieldValue('author')
    const languageData = form.getFieldValue('language')
    const bodyEn = draftToHtml(convertToRaw(editorState.getCurrentContent()))

    let editorbodyContentEn = ''
    let editorbodyContentRu = ''

    if (bodyContentEn) {
      editorbodyContentEn = draftToHtml(convertToRaw(bodyContentEn.getCurrentContent()))
    }

    if (bodyContentRu) {
      editorbodyContentRu = draftToHtml(convertToRaw(bodyContentRu.getCurrentContent()))
    }

    if (titleEn === '') {
      notification.error({
        message: 'Error',
        description: 'Please fill all the fields',
      })

      return
    }

    const body = {
      author,
      uuid: uuid || uuidv4(),
      language: languageData,
      date,
      published_date: publishDate,
      needs_translation: translationRequired,
      en: {
        title: titleEn,
        source_of_quote: sourceOfQuoteEn,
        // topic: language ? topic : editingQuote ? editingQuote.en.topic : '',
        body: editorbodyContentEn,
      },
      ru: {
        title: titleRu,
        source_of_quote: sourceOfQuoteRu,
        // topic: language ? (editingQuote ? editingQuote.ru.topic : '') : topic,
        body: editorbodyContentRu,
      },
    }
    if (editingQuote) {
      body.audit = editingQuote.audit
      const payload = {
        body,
        uuid,
      }
      dispatch({
        type: 'quote/UPDATE_QUOTE',
        payload,
      })

      this.scrollToTopPage()
    } else {
      dispatch({
        type: 'quote/CREATE_QUOTE',
        payload: body,
      })
      this.scrollToTopPage()
      this.handleStateReset()
    }
  }

  handleStateReset = () => {
    this.setState({
      files: [],
      editorState: EditorState.createEmpty(),
      editingQuote: '',
      editedBody: '',
      language: true,
      translationRequired: true,
      titleEn: '',
      titleRu: '',
      bodyContentEn: '',
      bodyContentRu: '',
      switchDisabled: true,
      formElements: formInputElements,
      paginationCurrentPage: '',
      sourceOfQuoteEn: '',
      sourceOfQuoteRu: '',
    })
  }

  scrollToTopPage = () => {
    const scrollDuration = 500
    const scrollStep = -window.scrollY / (scrollDuration / 15),
      scrollInterval = setInterval(function() {
        if (window.scrollY != 0) {
          window.scrollBy(0, scrollStep)
        } else clearInterval(scrollInterval)
      }, 10)
  }

  onEditorStateChange: Function = editorState => {
    this.setState({
      editorState,
    })
  }

  onEditorChangeStatebodyContent = bodyContent => {
    const { language } = this.state

    if (language) {
      this.setState({
        bodyContentEn: bodyContent,
      })
    }

    if (!language) {
      this.setState({
        bodyContentRu: bodyContent,
      })
    }
  }

  handleTitleChange = event => {
    const { language, formElements } = this.state

    const updatedFormElements = {
      ...formElements,
      [event.target.name]: {
        ...formElements[event.target.name],
        value: event.target.value,
        touched: true,
        valid: checkValidation(event.target.value, formElements[event.target.name].validation),
      },
    }

    this.setState({ formElements: updatedFormElements })

    if (language) {
      this.setState(
        {
          titleEn: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }

    if (!language) {
      this.setState(
        {
          titleRu: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }
  }

  handleSourceOfQuote = event => {
    const { language, formSourceQuote } = this.state

    const updatedFormElements = {
      ...formSourceQuote,
      [event.target.name]: {
        ...formSourceQuote[event.target.name],
        value: event.target.value,
        touched: true,
        valid: checkValidation(event.target.value, formSourceQuote[event.target.name].validation),
      },
    }

    this.setState({ formSourceQuote: updatedFormElements })

    if (language) {
      this.setState(
        {
          sourceOfQuoteEn: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }

    if (!language) {
      this.setState(
        {
          sourceOfQuoteRu: event.target.value,
        },
        () => this.onFieldValueChange(),
      )
    }
  }

  handleLanguage = () => {
    const { language } = this.state

    this.setState({ language: !language })
  }

  onFieldValueChange = () => {
    const { titleEn, formElements } = this.state

    if (titleEn !== '') {
      this.setState({ switchDisabled: false })
      return false
    }

    this.setState({ switchDisabled: true })
    return true
  }

  render() {
    const { form, english, quote } = this.props

    const {
      editingQuote,
      editedBody,
      editorState,
      translationRequired,
      language,
      titleEn,
      titleRu,
      sourceOfQuoteEn,
      sourceOfQuoteRu,
      bodyContentEn,
      bodyContentRu,
      formElements,
      switchDisabled,
      paginationCurrentPage,
    } = this.state
    const { files } = this.state
    const { topics } = quote
    const dateFormat = 'YYYY/MM/DD'

    const linkState = {
      paginationCurrentPage,
    }

    return (
      <div>
        <BackNavigation link="/quote/list" title="Quote List" linkState={linkState} />
        {editingQuote && editingQuote.en && editingQuote.ru ? (
          <div style={{ paddingTop: '10px' }}>
            <div>
              <strong>Title :</strong>
              &nbsp;&nbsp;
              <span>
                {language ? editingQuote.en.title : editingQuote.ru ? editingQuote.ru.title : ''}
              </span>
            </div>
          </div>
        ) : null}
        <Helmet title="Create Quote" />
        <Tabs defaultActiveKey="1">
          <TabPane tab="Quote" key="1">
            <section className="card">
              <div className="card-header mb-2">
                <div className="utils__title">
                  <strong>Quote Add/Edit</strong>
                  <Switch
                    disabled={switchDisabled}
                    defaultChecked
                    checkedChildren={language ? 'en' : 'ru'}
                    unCheckedChildren={language ? 'en' : 'ru'}
                    onChange={this.handleLanguage}
                    className="toggle"
                    style={{ width: '100px', float: 'right', margin: '0px 10px 10px 0px' }}
                  />
                </div>
              </div>
              <div className="card-body">
                <div className={styles.addPost}>
                  <Form className="mt-3" onSubmit={this.handleFormBody}>
                    <div className="form-group">
                      <FormItem label={language ? 'Title' : 'Title'}>
                        <Input
                          onChange={this.handleTitleChange}
                          value={language ? titleEn : titleRu}
                          placeholder="lecture title"
                          name="title"
                        />
                        {!formElements.title.valid &&
                        formElements.title.validation &&
                        formElements.title.touched ? (
                          <div className="invalidFeedback">{formElements.title.errorMessage}</div>
                        ) : null}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label={language ? 'Topic' : 'Topic'}>
                        {form.getFieldDecorator('topic', {
                          initialValue:
                            editingQuote && editingQuote.en && editingQuote.ru
                              ? language
                                ? editingQuote.en.topic
                                : editingQuote.ru.topic
                              : '',
                        })(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select Topic"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {topics && topics.length > 0
                              ? topics.map(item => {
                                  return (
                                    <Option
                                      key={item.uuid}
                                      value={language ? item.name_en : item.name_ru}
                                    >
                                      {language ? item.name_en : item.name_ru}
                                    </Option>
                                  )
                                })
                              : null}
                          </Select>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Author">
                        {form.getFieldDecorator('author', {
                          initialValue: editingQuote ? editingQuote.author : '',
                        })(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select Author"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option value="Niranjana Swami">Niranjana Swami</Option>
                            <Option value="Srila Prabhupada">Srila Prabhupada</Option>
                            <Option value="Other">Other</Option>
                          </Select>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Language">
                        {form.getFieldDecorator('language', {
                          rules: [
                            {
                              required: true,
                              message: 'Language is required',
                            },
                          ],
                          initialValue: editingQuote ? editingQuote.language : 'Select a Language',
                        })(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select a Language"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option value="english">English</Option>
                            <Option value="russian">Russian</Option>
                          </Select>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Date">
                        {form.getFieldDecorator('date', {
                          rules: [
                            {
                              required: true,
                              message: 'Date is required',
                            },
                          ],
                          initialValue:
                            editingQuote && editingQuote.date
                              ? moment(new Date(editingQuote.date), dateFormat)
                              : moment(new Date(), dateFormat),
                        })(<DatePicker onChange={this.handleDate} />)}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Publish Date">
                        {form.getFieldDecorator('publish_date', {
                          rules: [
                            {
                              required: true,
                              message: 'Publish Date is required',
                            },
                          ],
                          initialValue:
                            editingQuote && editingQuote.published_date
                              ? moment(editingQuote.published_date, dateFormat)
                              : moment(new Date(), dateFormat),
                        })(<DatePicker disabled />)}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label={language ? 'Source of Quote' : 'Source of Quote'}>
                        <Input
                          onChange={this.handleSourceOfQuote}
                          value={language ? sourceOfQuoteEn : sourceOfQuoteRu}
                          placeholder="Source of Quote"
                          name="sourceOfQuote"
                        />
                        {formElements.sourceOfQuote &&
                        !formElements.sourceOfQuote.valid &&
                        formElements.sourceOfQuote.validation &&
                        formElements.sourceOfQuote.touched ? (
                          <div className="invalidFeedback">
                            {formElements.sourceOfQuote.errorMessage}
                          </div>
                        ) : null}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem>
                        {form.getFieldDecorator('translation', {
                          rules: [
                            {
                              required: true,
                              message: 'Need Translation is required',
                            },
                          ],
                          initialValue: editingQuote ? editingQuote.needs_translation : '',
                        })(
                          <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                            &nbsp; Need Translation ?
                          </Checkbox>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label={english ? 'Body' : 'Body'}>
                        <div className={styles.editor} style={{ backgroundColor: '#fff' }}>
                          <Editor
                            wrapperClassName="demo-wrapper"
                            editorClassName="demo-editor"
                            editorState={language ? bodyContentEn : bodyContentRu}
                            onEditorStateChange={this.onEditorChangeStatebodyContent}
                          />
                        </div>
                      </FormItem>
                    </div>
                  </Form>
                </div>
                <div className={styles.submit}>
                  <span className="mr-3">
                    <Button type="primary" onClick={this.handleFormBody}>
                      Save and Post
                    </Button>
                  </span>
                  <Button type="danger" onClick={this.handleStateReset}>
                    Discard
                  </Button>
                </div>
              </div>
            </section>
          </TabPane>
          <TabPane tab="Audit" key="2">
            <section className="card">
              <div className="card-body">
                {/* <AuditTimeline audit={editingQuote.audit ? editingQuote.audit : quote.quoteAudit} /> */}
                <AuditTimeline audit={editingQuote.audit && editingQuote.audit} />
              </div>
            </section>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default AddQuote
