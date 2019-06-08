/* eslint-disable react/destructuring-assignment */
/* eslint-disable eqeqeq */
/* eslint-disable func-names */
/* eslint-disable one-var */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import {
  Switch,
  Form,
  Button,
  Input,
  Icon,
  Select,
  DatePicker,
  Checkbox,
  Tabs,
  Upload,
  notification,
  Progress,
} from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Editor } from 'react-draft-wysiwyg'
import axios from 'axios'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import $ from 'jquery'
import moment from 'moment'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'
import BackNavigation from '../../../common/BackNavigation/index'
import { uuidv4 } from '../../../services/custom'
import styles from './style.module.scss'
import serverAddress from '../../../services/config'
import { formInputElements } from '../../../utils/addKirtanInput'
import { checkValidation } from '../../../utils/checkValidation'
import './index.css'

const FormItem = Form.Item
const { TabPane } = Tabs
const { Option } = Select
const { Dragger } = Upload

@Form.create()
@connect(({ kirtan, lecture, router }) => ({ kirtan, lecture, router }))
class AddKirtan extends React.Component {
  state = {
    language: true,
    audioLink: '',
    createDate: new Date(),
    publishDate: new Date(),
    translationRequired: false,
    editingKirtan: '',
    editorState: EditorState.createEmpty(),
    titleEn: '',
    titleRu: '',
    eventEn: '',
    eventRu: '',
    locationEn: '',
    locationRu: '',
    switchDisabled: true,
    formElements: formInputElements,
    bodyContentEn: EditorState.createEmpty(),
    bodyContentRu: EditorState.createEmpty(),
    percentage: 0,
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
          type: 'kirtan/GET_KIRTAN_BY_ID',
          payload: body,
        })
      }
    }
    dispatch({
      type: 'lecture/GET_EVENTS',
    })
    dispatch({
      type: 'lecture/GET_LOCATIONS',
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.kirtan.isKirtanCreated) {
      this.handleReset()
    }
    if (nextProps.kirtan.editKirtan !== '') {
      const { kirtan } = nextProps
      const { editKirtan } = kirtan
      const { language } = this.state
      this.handleUpdateBody(language, editKirtan)

      const titleEn = editKirtan ? editKirtan.en.title : ''
      const titleRu = editKirtan ? editKirtan.ru.title : ''

      const locationEn = editKirtan ? editKirtan.en.location : ''
      const locationRu = editKirtan ? editKirtan.ru.location : ''

      const eventEn = editKirtan ? editKirtan.en.event : ''
      const eventRu = editKirtan ? editKirtan.ru.event : ''

      let bodyContentEn = ''
      let bodyContentRu = ''

      const htmlBodyEn = editKirtan ? editKirtan.en.body : ''

      const htmlBodyRu = editKirtan ? editKirtan.ru.body : ''

      if (htmlBodyEn && htmlBodyEn.length > 0) {
        const contentBlockEn = htmlToDraft(htmlBodyEn)
        if (contentBlockEn) {
          const contentStateEn = ContentState.createFromBlockArray(contentBlockEn.contentBlocks)
          bodyContentEn = EditorState.createWithContent(contentStateEn)
        }
      }

      if (htmlBodyRu && htmlBodyRu.length > 0) {
        const contentBlockRu = htmlToDraft(htmlBodyRu)
        if (contentBlockRu) {
          const contentStateRu = ContentState.createFromBlockArray(contentBlockRu.contentBlocks)
          bodyContentRu = EditorState.createWithContent(contentStateRu)
        }
      }

      this.setState(
        {
          editingKirtan: editKirtan,
          audioLink: editKirtan.audio_link,
          createDate: editKirtan ? editKirtan.created_date : '',
          publishDate: editKirtan && editKirtan.published_date ? editKirtan.published_date : '',
          translationRequired: editKirtan ? editKirtan.translation_required : false,
          titleEn,
          titleRu,
          locationEn,
          locationRu,
          eventEn,
          eventRu,
          bodyContentEn,
          bodyContentRu,
        },
        () => {
          if (!this.onFieldValueChange()) {
            this.setState({ switchDisabled: false })
          }
        },
      )
    }
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
  }

  componentWillUnmount() {
    this.handleReset()
    this.setState({
      language: true,
      audioLink: '',
      createDate: new Date(),
      publishDate: new Date(),
      translationRequired: false,
      editingKirtan: '',
      editorState: EditorState.createEmpty(),
      titleEn: '',
      titleRu: '',
      eventEn: '',
      eventRu: '',
      locationEn: '',
      locationRu: '',
      switchDisabled: true,
      formElements: formInputElements,
      bodyContentEn: EditorState.createEmpty(),
      bodyContentRu: EditorState.createEmpty(),
      percentage: 0,
    })
  }

  handleUpdateBody = (language, editKirtan) => {
    const html = editKirtan ? (language ? editKirtan.en.body : editKirtan.ru.body) : ''
    let editorState = ''
    if (html && html.length > 0) {
      const contentBlock = htmlToDraft(html)
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
        editorState = EditorState.createWithContent(contentState)
      }
      this.setState({
        editorState,
      })
    }
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  handleCreateDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        createDate: dateString,
      })
    }, 0)
  }

  handlePublishDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        publishDate: dateString,
      })
    }, 0)
  }

  onEditorStateChange: Function = editorState => {
    const { language } = this.state

    if (language) {
      this.setState({
        bodyContentEn: editorState,
      })
    }

    if (!language) {
      this.setState({
        bodyContentRu: editorState,
      })
    }

    // this.setState({
    //   editorState,
    // })
  }

  handleUploading = info => {
    this.setState({ percentage: 0 }, () => {
      this.uploads3(info.file)
    })
    // if (info.file.status === 'uploading') {
    //   notification.success({
    //     message: 'Uploading Started',
    //     description: 'File uploading is started',
    //   })
    // }
    // if (info.file.status === 'done') {
    //   this.uploads3(info.file)
    // }
  }

  uploads3 = file => {
    const fileName = file.name
    const fileType = file.type

    axios({
      method: 'GET',
      url: `${serverAddress}/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
    })
      .then(response => {
        const { data } = response
        const temp = data.presignedUrl.toString()
        const finalUrl = temp.substr(0, temp.lastIndexOf('?'))
        this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, file, finalUrl)
      })
      .catch(error => {
        notification.error({
          message: 'error',
          description: `Some error occured. Please check your internet connection`,
        })
      })

    // $.ajax({
    //   type: 'GET',
    //   url: `${serverAddress}/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
    //   success: data => {
    //     const temp = data.presignedUrl.toString()
    //     const finalUrl = temp.substr(0, temp.lastIndexOf('?'))
    //     // this.setUploadedFiles(finalUrl)
    //     this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, file, finalUrl)
    //   },
    //   error() {
    //     notification.error({
    //       message: 'Error',
    //       description: 'Error occured during uploading, try again',
    //     })
    //   },
    // })
  }

  uploadFileToS3UsingPresignedUrl = (presignedUrl, file, finalUrl) => {
    axios({
      method: 'PUT',
      url: presignedUrl,
      data: file,
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100)

        this.setUploadedFiles(finalUrl, percentCompleted)
      },
    })
      .then(response => {
        // notification.success({
        //   message: 'Success',
        //   description: 'file has been uploaded successfully',
        // })
      })
      .catch(err => {
        // notification.warning({
        //   message: 'error',
        //   description: 'Error occured during uploading, try again',
        // })
      })

    // $.ajax({
    //   type: 'PUT',
    //   url: presignedUrl,
    //   data: file.originFileObj,
    //   headers: {
    //     'Content-Type': file.type,
    //     reportProgress: true,
    //   },
    //   processData: false,
    //   success: data => {
    //     console.info(data)
    //     notification.success({
    //       message: 'Success',
    //       description: 'file has been uploaded successfully',
    //     })
    //   },
    //   error() {
    //     notification.warning({
    //       message: 'error',
    //       description: 'Error occured during uploading, try again',
    //     })
    //   },
    // })
  }

  deleteFile = item => {
    const fileName = item.substr(item.lastIndexOf('.com/') + 5)

    const tempFileName = fileName.split('/').pop(-1)

    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/deleteFile/?filename=${fileName}`,
      success: data => {
        // console.info(data)
        notification.success({
          message: 'File Deleted',
          description: `${tempFileName} has been successfully deleted`,
        })
        this.handelDeleteSetFiles()
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  beforeUploadAudio = file => {
    this.setState({ percentage: 0 })
    const isJPG = file.type === 'audio/mp3'
    if (!isJPG) {
      notification.error({
        message: 'error',
        description: 'You can only upload MP3 file!',
      })
    }
    return isJPG
  }

  handelDeleteSetFiles = () => {
    this.setState({ audioLink: '' })
  }

  setUploadedFiles = (finalUrl, percentCompleted) => {
    this.setState(
      {
        audioLink: finalUrl,
        percentage: percentCompleted,
      },
      () => {
        if (this.state.percentage === 100) {
          notification.success({
            message: 'Success',
            description: 'File has been uploaded successfully',
          })
        }
      },
    )
  }

  dummyRequest = ({ file, onSuccess }) => {
    // console.info(file)
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  handleSubmitForm = () => {
    const { form, dispatch, router } = this.props
    // const uuid = router.location.state
    const { location } = router
    const { state } = location

    let uuid = ''
    if (state !== undefined) {
      const { id } = state
      uuid = id
    }
    const {
      // language,
      audioLink,
      createDate,
      publishDate,
      translationRequired,
      // editorState,
      editingKirtan,
      titleEn,
      titleRu,
      eventEn,
      eventRu,
      locationEn,
      locationRu,
      bodyContentEn,
      bodyContentRu,
    } = this.state
    // const titlekirtan = form.getFieldValue('title')
    // const kirtanBody = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    // const locationKirtan = form.getFieldValue('location')
    // const event = form.getFieldValue('event')
    const type = form.getFieldValue('type')
    const artist = form.getFieldValue('artist')
    const kirtanLanguage = form.getFieldValue('language')

    let editorbodyContentEn = null
    let editorbodyContentRu = null

    editorbodyContentEn = draftToHtml(convertToRaw(bodyContentEn.getCurrentContent()))
    editorbodyContentRu = draftToHtml(convertToRaw(bodyContentRu.getCurrentContent()))

    // form.validateFields(['title', 'create_date'], (err, values) => {
    //   console.info(values)
    //   if (!err) {

    if (titleEn === '' || locationEn === '' || eventEn === '') {
      notification.error({
        message: 'Error',
        description: 'Please fill all the fields',
      })

      return
    }

    const body = {
      uuid: uuid || uuidv4(),
      created_date: createDate,
      published_date: publishDate,
      language: kirtanLanguage,
      audio_link: audioLink,
      translation_required: translationRequired,
      artist,
      type,
      en: {
        title: titleEn,
        event: eventEn,
        topic: '',
        location: locationEn,
        body: editorbodyContentEn,
      },
      ru: {
        title: titleRu,
        event: eventRu,
        topic: '',
        location: locationRu,
        body: editorbodyContentRu,
      },
    }

    if (editingKirtan !== '' && uuid) {
      body.audit = editingKirtan.audit
      const payload = {
        body,
        uuid,
      }
      dispatch({
        type: 'kirtan/UPDATE_KIRTAN',
        payload,
      })
      this.scrollToTopPage()
    } else {
      dispatch({
        type: 'kirtan/CREATE_KIRTAN',
        payload: body,
      })
      this.scrollToTopPage()
      this.handleStateReset()
    }
    // }
    // })
  }

  handleStateReset = () => {
    this.setState({
      language: true,
      audioLink: '',
      createDate: new Date(),
      publishDate: new Date(),
      translationRequired: false,
      editingKirtan: '',
      editorState: EditorState.createEmpty(),
      titleEn: '',
      titleRu: '',
      eventEn: '',
      eventRu: '',
      locationEn: '',
      locationRu: '',
      switchDisabled: true,
      formElements: formInputElements,
      bodyContentEn: EditorState.createEmpty(),
      bodyContentRu: EditorState.createEmpty(),
      percentage: 0,
      paginationCurrentPage: '',
    })
  }

  scrollToTopPage = () => {
    // $('html, body').animate({ scrollTop: 0 }, 'fast')
    // return false

    const scrollDuration = 500
    const scrollStep = -window.scrollY / (scrollDuration / 15),
      scrollInterval = setInterval(function() {
        if (window.scrollY != 0) {
          window.scrollBy(0, scrollStep)
        } else clearInterval(scrollInterval)
      }, 10)
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      language: true,
      audioLink: '',
      createDate: new Date(),
      publishDate: new Date(),
      translationRequired: false,
      editingKirtan: '',
      editorState: EditorState.createEmpty(),
      titleEn: '',
      titleRu: '',
      eventEn: '',
      eventRu: '',
      locationEn: '',
      locationRu: '',
      switchDisabled: true,
      formElements: formInputElements,
      bodyContentEn: EditorState.createEmpty(),
      bodyContentRu: EditorState.createEmpty(),
      percentage: 0,
    })
  }

  handleLanguage = () => {
    const { language, editingKirtan } = this.state
    if (editingKirtan !== '') {
      this.handleUpdateBody(!language, editingKirtan)
    }
    this.setState({
      language: !language,
    })
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

  handleLocationChange = location => {
    this.setState(
      {
        locationEn: location.title_en,
        locationRu: location.title_ru,
      },
      () => this.onFieldValueChange(),
    )
  }

  handleEventChange = event => {
    this.setState(
      {
        eventEn: event.title_en,
        eventRu: event.title_ru,
      },
      () => this.onFieldValueChange(),
    )
  }

  onFieldValueChange = () => {
    const { titleEn, locationEn, eventEn } = this.state

    if (titleEn !== '' && locationEn !== '' && eventEn !== '') {
      this.setState({ switchDisabled: false })
      return false
    }

    this.setState({ switchDisabled: true })
    return true
  }

  render() {
    const { form, lecture, kirtan } = this.props
    const { events, locations } = lecture
    const {
      language,
      audioLink,
      translationRequired,
      editorState,
      editingKirtan,
      switchDisabled,
      titleEn,
      titleRu,
      eventEn,
      eventRu,
      locationEn,
      locationRu,
      formElements,
      bodyContentEn,
      bodyContentRu,
      percentage,
      paginationCurrentPage,
    } = this.state
    const dateFormat = 'YYYY/MM/DD'

    const linkState = {
      paginationCurrentPage,
    }

    return (
      <React.Fragment>
        <div>
          <BackNavigation link="/kirtan/list" title="Kirtan List" linkState={linkState} />
          {editingKirtan && editingKirtan.en && editingKirtan.ru ? (
            <div style={{ paddingTop: '10px' }}>
              <div>
                <strong>Title :</strong>
                &nbsp;&nbsp;
                <span>{language ? editingKirtan.en.title : editingKirtan.ru.title}</span>
              </div>
            </div>
          ) : null}
          <Helmet title="Add Kirtan" />
          <Tabs defaultActiveKey="1">
            <TabPane tab="Kirtan" key="1">
              <section className="card">
                <div className="card-header mb-2">
                  <div className="utils__title">
                    <strong>Kirtan Add/Edit</strong>
                    <Switch
                      disabled={switchDisabled}
                      defaultChecked
                      checkedChildren={language ? 'en' : 'ru'}
                      unCheckedChildren={language ? 'en' : 'ru'}
                      onChange={this.handleLanguage}
                      className="toggle"
                      style={{ width: '100px', marginLeft: '10px' }}
                    />
                  </div>
                </div>
                <div className="card-body">
                  <div className={styles.addPost}>
                    <Form className="mt-3">
                      <div className="form-group">
                        <FormItem label={language ? 'Title' : 'Title'}>
                          <Input
                            onChange={this.handleTitleChange}
                            value={language ? titleEn : titleRu}
                            placeholder="Kirtan title"
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
                        <FormItem label="Language">
                          {form.getFieldDecorator('language', {
                            initialValue: editingKirtan ? editingKirtan.language : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select language"
                              onChange={this.handleKirtanLanguage}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              <Option value="english">English</Option>
                              <Option value="russian">Russian</Option>
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Type">
                          {form.getFieldDecorator('type', {
                            initialValue: editingKirtan ? editingKirtan.type : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Type"
                              optionFilterProp="children"
                              onChange={this.handleSelectType}
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              <Option value="Kirtan">Kirtan</Option>
                              <Option value="Bhajan">Bhajan</Option>
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Artist">
                          {form.getFieldDecorator('artist', {
                            initialValue: editingKirtan ? editingKirtan.artist : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Artist"
                              onChange={this.handleSelectArtist}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              <Option value="Aditi Dukhaha Prabhu">Aditi Dukhaha Prabhu</Option>
                              <Option value="Amala Harinama Dasa"> Amala Harinama Dasa</Option>
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Date">
                          {form.getFieldDecorator('create_date', {
                            rules: [
                              {
                                required: true,
                                message: 'Create Date is required',
                              },
                            ],
                            initialValue:
                              editingKirtan && editingKirtan.created_date
                                ? moment(editingKirtan.created_date, dateFormat)
                                : moment(new Date(), dateFormat),
                          })(<DatePicker onChange={this.handleCreateDate} />)}
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
                              editingKirtan && editingKirtan.published_date
                                ? moment(editingKirtan.published_date, dateFormat)
                                : moment(new Date(), dateFormat),
                          })(<DatePicker onChange={this.handlePublishDate} disabled />)}
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
                            initialValue: editingKirtan ? editingKirtan.translation_required : '',
                          })(
                            <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                              &nbsp; Need Translation ?
                            </Checkbox>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Location">
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select Location"
                            optionFilterProp="children"
                            value={language ? locationEn : locationRu}
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {locations && locations.length > 0
                              ? locations.map(item => {
                                  return (
                                    <Option
                                      onClick={() => {
                                        this.handleLocationChange(item)
                                      }}
                                      key={item._id}
                                      value={language ? item.title_en : item.title_ru}
                                    >
                                      {language ? item.title_en : item.title_ru}
                                    </Option>
                                  )
                                })
                              : null}
                          </Select>

                          {/* {form.getFieldDecorator('location', {
                            // initialValue:
                            //   editingKirtan && editingKirtan.en && editingKirtan.ru
                            //     ? language
                            //       ? editingKirtan.en.location
                            //       : editingKirtan.ru.location
                            //     : '',
                            initialValue: language ? locationEn : locationRu,
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Location"
                              optionFilterProp="children"
                              // onChange={this.handleSelectLocation}
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              {locations && locations.length > 0
                                ? locations.map(item => {
                                    return (
                                      <Option
                                        onClick={() => {
                                          this.handleLocationChange(item)
                                        }}
                                        key={item._id}
                                        value={language ? item.title_en : item.title_ru}
                                      >
                                        {language ? item.title_en : item.title_ru}
                                      </Option>
                                    )
                                  })
                                : null}
                            </Select>,
                          )} */}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Event">
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select Event"
                            optionFilterProp="children"
                            value={language ? eventEn : eventRu}
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {events && events.length > 0
                              ? events.map(item => {
                                  return (
                                    <Option
                                      onClick={() => {
                                        this.handleEventChange(item)
                                      }}
                                      key={item._id}
                                      value={language ? item.title_en : item.title_ru}
                                    >
                                      {language ? item.title_en : item.title_ru}
                                    </Option>
                                  )
                                })
                              : null}
                          </Select>

                          {/* {form.getFieldDecorator('event', {
                            // initialValue:
                            //   editingKirtan && editingKirtan.en && editingKirtan.ru
                            //     ? language
                            //       ? editingKirtan.en.event
                            //       : editingKirtan.ru.event
                            //     : '',
                            initialValue: language ? eventEn : eventRu,
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Event"
                              optionFilterProp="children"
                              // onChange={this.handleSelectEvent}
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              {events && events.length > 0
                                ? events.map(item => {
                                    return (
                                      <Option
                                        onClick={() => {
                                          this.handleEventChange(item)
                                        }}
                                        key={item._id}
                                        value={language ? item.title_en : item.title_ru}
                                      >
                                        {language ? item.title_en : item.title_ru}
                                      </Option>
                                    )
                                  })
                                : null}
                            </Select>,
                          )} */}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Body' : 'Body'}>
                          <div className={styles.editor} style={{ backgroundColor: '#fff' }}>
                            <Editor
                              editorState={language ? bodyContentEn : bodyContentRu}
                              onEditorStateChange={this.onEditorStateChange}
                            />
                          </div>
                        </FormItem>

                        {/* <FormItem label="Body">
                          {form.getFieldDecorator('content', {
                            initialValue: editorState || '',
                          })(
                            <div className={styles.editor}>
                              <Editor
                                editorState={editorState}
                                onEditorStateChange={this.onEditorStateChange}
                              />
                            </div>,
                          )}
                        </FormItem> */}
                      </div>
                      <div className="form-group">
                        <FormItem label="Attachment">
                          {audioLink ? (
                            <ul>
                              {/* <li className="filesList">
                                {audioLink}
                                &nbsp;&nbsp;
                                <i
                                  className="fa fa-close closeIcon"
                                  onClick={() => {
                                    this.deleteFile(audioLink, 'audio')
                                  }}
                                />
                              </li> */}

                              <li className="filesList">
                                <div
                                  style={{
                                    display: 'inline-block',
                                    width: 'auto',
                                    paddingLeft: '15px',
                                    marginRight: '15px',
                                  }}
                                >
                                  {audioLink.split('/').pop(-1)}
                                  &nbsp;&nbsp;&nbsp;
                                  <i
                                    className="fa fa-trash closeIcon"
                                    onClick={() => {
                                      this.deleteFile(audioLink)
                                    }}
                                  />
                                </div>
                                {percentage !== 0 ? (
                                  <div style={{ display: 'inline-block', width: '20rem' }}>
                                    <Progress percent={percentage} />
                                  </div>
                                ) : null}
                              </li>
                            </ul>
                          ) : (
                            ''
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem>
                          {form.getFieldDecorator('Files')(
                            <Dragger
                              beforeUpload={this.beforeUploadAudio}
                              multiple={false}
                              showUploadList={false}
                              customRequest={this.handleUploading}
                              // onChange={this.handleUploading}
                            >
                              <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                              </p>
                              <p className="ant-upload-text">
                                Click or drag file to this area to upload
                              </p>
                              <p className="ant-upload-hint">
                                Support for a single or bulk upload. Strictly prohibit from
                                uploading company data or other band files
                              </p>
                            </Dragger>,
                          )}
                        </FormItem>
                      </div>
                      <FormItem>
                        <div className={styles.submit}>
                          <span className="mr-3">
                            <Button
                              type="primary"
                              htmlType="submit"
                              onClick={this.handleSubmitForm}
                            >
                              Save and Post
                            </Button>
                          </span>
                          <Button type="danger" onClick={this.handleReset}>
                            Discard
                          </Button>
                        </div>
                      </FormItem>
                    </Form>
                  </div>
                </div>
              </section>
            </TabPane>
            <TabPane tab="Audit" key="2">
              <section className="card">
                <div className="card-body">
                  <AuditTimeline
                    // audit={editingKirtan.audit ? editingKirtan.audit : kirtan.kirtanAudit}
                    audit={editingKirtan.audit && editingKirtan.audit}
                  />
                </div>
              </section>
            </TabPane>
          </Tabs>
        </div>
      </React.Fragment>
    )
  }
}

export default AddKirtan
