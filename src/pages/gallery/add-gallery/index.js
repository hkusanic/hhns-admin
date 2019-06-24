/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable func-names */
/* eslint-disable one-var */
/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-comment-textnodes */
import React from 'react'
import {
  DatePicker,
  Checkbox,
  Form,
  Input,
  Select,
  Upload,
  Icon,
  notification,
  Button,
  Switch,
  Tabs,
  Progress,
} from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Editor } from 'react-draft-wysiwyg'
import axios from 'axios'

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { EditorState, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import $ from 'jquery'
import moment from 'moment'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'
import BackNavigation from '../../../common/BackNavigation/index'
import { uuidv4, handleFilterGallery } from '../../../services/custom'
import styles from './style.module.scss'
import serverAddress from '../../../services/config'
import { formInputElements } from '../../../utils/addGalleryInput'
import { checkValidation } from '../../../utils/checkValidation'
import './index.css'

const FormItem = Form.Item
const { TabPane } = Tabs
const { Option } = Select
const { Dragger } = Upload

function formatDate(date) {
  const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0]

  return dateString
}

@Form.create()
@connect(({ gallery, router }) => ({ gallery, router }))
class CreateGallery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      photoFiles: [],
      galleryBody: EditorState.createEmpty(),
      createDate: new Date(),
      publishDate: new Date(),
      gallery: '2019',
      editGallery: '',
      uploading: true,
      language: true,
      translationRequired: false,
      titleEn: '',
      titleRu: '',
      formElements: formInputElements,
      switchDisabled: true,
      fileList: [],
    }
  }

  componentDidMount() {
    const { dispatch, router } = this.props
    const { location } = router
    const { state } = location
    if (state !== undefined) {
      const { id, language } = state
      const uuid = id
      setTimeout(
        this.setState({
          language,
        }),
        0,
      )
      if (uuid !== undefined) {
        const body = {
          uuid,
        }

        dispatch({
          type: 'gallery/GET_GALLERY_BY_ID',
          payload: body,
        })
      }
    }

    dispatch({
      type: 'gallery/GET_GALLERY_LIST',
    })

    dispatch({
      type: 'kirtan/RESET_STORE',
    })

    dispatch({
      type: 'video/RESET_STORE',
    })
  }

  componentWillReceiveProps(nextProps) {
    const { uploading } = this.state

    if (nextProps.gallery.editGallery !== '' && uploading) {
      const { gallery } = nextProps
      const { editGallery } = gallery

      const titleEn = gallery.editGallery.title_en

      const titleRu = gallery.editGallery.title_ru

      const tempPhotoFiles = []
      let tempPhotoObject = {}
      const tempPhotos = editGallery.photos || []

      for (let i = 0; i < tempPhotos.length; i += 1) {
        tempPhotoObject = {
          fileName: tempPhotos[i],
          percentage: 'zeroPercent',
        }
        tempPhotoFiles.push(tempPhotoObject)
      }

      this.setState(
        {
          editGallery,
          gallery: editGallery.gallery || '2019',
          photoFiles: tempPhotoFiles,
          createDate: editGallery.date || '',
          publishDate: editGallery.publish_date || '',
          translationRequired: editGallery.translation_required,
          titleEn,
          titleRu,
        },
        () => {
          this.onFieldValueChange()
        },
      )
    }
    if (nextProps.gallery.isGalleryCreated) {
      this.handleReset()
    }
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
  }

  componentWillUnmount() {
    const { form } = this.props
    form.resetFields()
    this.setState({
      photoFiles: [],
      galleryBody: EditorState.createEmpty(),
      createDate: new Date(),
      publishDate: new Date(),
      gallery: '2019',
      editGallery: '',
      uploading: true,
      language: true,
      translationRequired: false,
      titleEn: '',
      titleRu: '',
      formElements: formInputElements,
    })
  }

  handleCheckbox = event => {
    this.setState({
      translationRequired: event.target.checked,
    })
  }

  onEditorStateChange: Function = editorState => {
    this.setState({
      galleryBody: editorState,
    })
  }

  hadleSelectGallery = gallery => {
    this.setState({ gallery, uploading: false })
  }

  beforeUploadAudio = file => {
    const isJPG = file.type === 'image/jpg' || 'image/jpeg'
    if (!isJPG) {
      notification.error({
        message: 'error',
        description: 'You can only upload jpg/jpeg file!',
      })
    }
    return isJPG
  }

  dummyRequest = ({ file, onSuccess }) => {
    // console.info(file)
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }

  handleFileChange = info => {
    if (info.file.status === 'uploading') {
      this.setState(
        {
          fileList: info.fileList,
          uploading: false,
        },
        () => {
          this.uploads3(info)
        },
      )
    }
  }

  uploads3 = info => {
    const fileName = info.file.name
    const fileType = info.file.type

    const { photoFiles } = this.state

    axios({
      method: 'GET',
      url: `${serverAddress}/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
    })
      .then(response => {
        const { data } = response
        const temp = data.presignedUrl.toString()
        const finalUrl = temp.substr(0, temp.lastIndexOf('?'))

        for (let i = 0; i < photoFiles.length; i += 1) {
          if (photoFiles[i].fileName === finalUrl) {
            notification.warning({
              message: 'error',
              description: `You can't upload file with the same name.`,
            })
            return
          }
        }

        this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, info, finalUrl)
      })
      .catch(err => {
        console.log(err)
      })
  }

  uploadFileToS3UsingPresignedUrl = (presignedUrl, info, finalUrl) => {
    const { fileList } = this.state

    axios({
      method: 'PUT',
      url: presignedUrl,
      data: info.file.originFileObj,
      headers: {
        'Content-Type': info.file.type,
      },
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100)

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < fileList.length; i++) {
          if (fileList[i].name === finalUrl.split('/').pop(-1))
            fileList[i].percent = percentCompleted
        }

        this.setUploadedFiles(finalUrl, percentCompleted, fileList)
      },
    })
      .then(response => {
        // console.log(response)
      })
      .catch(err => {
        notification.warning({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      })
  }

  setUploadedFiles = (finalUrl, percentCompleted, fileList) => {
    const { photoFiles } = this.state

    const tempPhotoFiles = [...photoFiles]

    const tempFileList = [...fileList]

    const objIndex = tempPhotoFiles.findIndex(obj => obj.fileName === finalUrl)

    if (objIndex > -1) {
      tempPhotoFiles[objIndex].percentage = percentCompleted
    } else {
      const tempPhotoObject = {
        fileName: finalUrl,
        percentage: percentCompleted,
      }
      tempPhotoFiles.push(tempPhotoObject)
    }

    const result = tempFileList.every((val, index, arr) => {
      if (val.percent === 100) {
        return true
      }
      return false
    })

    if (result) {
      notification.success({
        message: 'Success',
        description: `${fileList.length} file(s) have been uploaded successfully`,
      })
      this.setState({
        fileList: [],
      })
    }

    this.setState({
      photoFiles: tempPhotoFiles,
    })
  }

  handleCreateDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        createDate: dateString,
        uploading: false,
      })
    }, 0)
  }

  handlePublishDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        publishDate: dateString,
        uploading: false,
      })
    }, 0)
  }

  handleFormBody = event => {
    event.preventDefault()
    const { dispatch, router } = this.props
    const { location } = router
    // const uuid = location.state
    const { state } = location

    let uuid = ''
    if (state !== undefined) {
      const { id } = state
      uuid = id
    }
    const {
      photoFiles,
      galleryBody,
      gallery,
      editGallery,
      translationRequired,
      titleEn,
      titleRu,
    } = this.state
    // const title = form.getFieldValue('title')
    let { publishDate, createDate } = this.state

    const bodyEn = draftToHtml(convertToRaw(galleryBody.getCurrentContent()))

    const dateFormat = 'YYYY/MM/DD'
    if (publishDate === '' || publishDate === null || publishDate === undefined) {
      publishDate = formatDate(new Date())
    }
    if (createDate === '' || createDate === null || createDate === undefined) {
      createDate = formatDate(new Date())
    }

    if (titleEn === '' || titleEn === undefined || titleEn === null) {
      notification.error({
        message: 'Error',
        description: 'Please fill all the fields',
      })

      return
    }

    const tempPhotoFiles = []
    for (let i = 0; i < photoFiles.length; i += 1) {
      tempPhotoFiles.push(photoFiles[i].fileName)
    }

    const body = {
      uuid: uuid || uuidv4(),
      gallery,
      date: createDate,
      publish_date: publishDate,
      photos: tempPhotoFiles,
      body: bodyEn,
      translation_required: translationRequired,
      title_en: titleEn,
      title_ru: titleRu,
    }
    if (editGallery !== '' && uuid) {
      body.audit = editGallery.audit
      const payload = {
        body,
        uuid,
      }
      dispatch({
        type: 'gallery/UPDATE_GALLERY',
        payload,
      })
      this.scrollToTopPage()
    } else {
      dispatch({
        type: 'gallery/CREATE_GALLERY',
        body,
      })
      this.scrollToTopPage()
      this.handleStateReset()
    }
  }

  handleStateReset = () => {
    this.setState({
      photoFiles: [],
      galleryBody: EditorState.createEmpty(),
      createDate: new Date(),
      publishDate: new Date(),
      gallery: '2019',
      editGallery: '',
      uploading: true,
      language: true,
      translationRequired: false,
      titleEn: '',
      titleRu: '',
      formElements: formInputElements,
      switchDisabled: true,
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

  deleteFile = item => {
    document.getElementById(item).style.pointerEvents = 'none'
    document.getElementById(item).style.opacity = '0.4'

    const fileName = item.substr(item.lastIndexOf('.com/') + 5)

    const tempFileName = fileName.split('/').pop(-1)

    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/deleteFile/?filename=${fileName}`,
      success: () => {
        notification.success({
          message: 'File Deleted',
          description: `${tempFileName} has been successfully deleted`,
        })
        this.handelDeleteSetFiles(item)
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  handelDeleteSetFiles = item => {
    const { photoFiles } = this.state

    for (let i = 0; i < photoFiles.length; i += 1) {
      if (photoFiles[i].fileName === item) {
        photoFiles.splice(i, 1)
        break
      }
    }
    this.setState({
      photoFiles,
    })
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      photoFiles: [],
      galleryBody: EditorState.createEmpty(),
      createDate: '',
      publishDate: '',
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

  onFieldValueChange = () => {
    const { titleEn } = this.state

    if (titleEn === '' || titleEn === undefined) {
      this.setState({ switchDisabled: true })
      return true
    }

    this.setState({ switchDisabled: false })
    return false
  }

  render() {
    const { form, gallery } = this.props
    let { mainGallery } = gallery
    mainGallery = handleFilterGallery(mainGallery)
    const dateFormat = 'YYYY/MM/DD'

    const {
      galleryBody,
      photoFiles,
      editGallery,
      language,
      translationRequired,
      titleEn,
      titleRu,
      switchDisabled,
      formElements,
    } = this.state
    let customStyle = {}
    if (photoFiles.length > 5) {
      customStyle = { overflowY: 'auto', height: '250px' }
    }

    const linkState = {
      galleryYear: editGallery.gallery,
    }

    return (
      <div>
        <BackNavigation link="/gallery/list" title="Gallery List" linkState={linkState} />
        {editGallery ? (
          <div style={{ paddingTop: '10px' }}>
            <div>
              <strong>Title :</strong>
              &nbsp;&nbsp;
              <span>
                {language
                  ? editGallery.title_en
                    ? editGallery.title_en
                    : ''
                  : editGallery.title_ru
                  ? editGallery.title_ru
                  : ''}
              </span>
            </div>
          </div>
        ) : null}
        <Helmet title="Create Gallery" />
        <Tabs defaultActiveKey="1">
          <TabPane tab="Gallery" key="1">
            <section className="card">
              <div className="card-header mb-2">
                <div className="utils__title">
                  <strong>Create Gallery</strong>
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
                  <Form className="mt-3">
                    <div className="form-group">
                      <FormItem label="Title">
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
                      <FormItem label="Body">
                        {form.getFieldDecorator('content')(
                          <div className={styles.editor}>
                            <Editor
                              wrapperClassName="demo-wrapper"
                              editorClassName="demo-editor"
                              editorState={galleryBody}
                              onEditorStateChange={this.onEditorStateChange}
                            />
                          </div>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Gallery">
                        <Select
                          id="gallery-item"
                          // defaultValue="2019"
                          value={this.state.gallery}
                          showSearch
                          style={{ width: '25%' }}
                          onChange={this.hadleSelectGallery}
                          placeholder="Select Gallery"
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {mainGallery && mainGallery.length > 0
                            ? mainGallery.map(item => {
                                return (
                                  <Option key={item.uuid} value={item.name_en}>
                                    {language ? item.name_en : item.name_ru}
                                  </Option>
                                )
                              })
                            : null}
                        </Select>
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem>
                        <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                          Need Translation ?
                        </Checkbox>
                        ,
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Created Date">
                        {form.getFieldDecorator('create_date', {
                          rules: [
                            {
                              required: true,
                              message: 'Date is required',
                            },
                          ],
                          initialValue:
                            editGallery && editGallery.date
                              ? moment(editGallery.date, dateFormat)
                              : moment(new Date(), dateFormat),
                        })(<DatePicker onChange={this.handleCreateDate} />)}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Published Date">
                        {form.getFieldDecorator('publish_date', {
                          rules: [
                            {
                              required: true,
                              message: 'Publish Date is required',
                            },
                          ],
                          initialValue:
                            editGallery && editGallery.publish_date
                              ? moment(editGallery.publish_date, dateFormat)
                              : moment(new Date(), dateFormat),
                        })(<DatePicker disabled onChange={this.handlePublishDate} />)}
                      </FormItem>
                    </div>
                    <div className="form-group" style={customStyle}>
                      <FormItem label="Uploaded Photos">
                        <ul>
                          {photoFiles.length > 0 &&
                            photoFiles.map((item, index) => {
                              return (
                                <li className="filesList" key={index}>
                                  <div className="fileDisplay">
                                    <div className="uploadedFileName">
                                      {item.fileName
                                        .split('/')
                                        .pop(-1)
                                        .substring(0, 30)}
                                    </div>
                                    <div
                                      className="deleteIcon"
                                      key={item.fileName}
                                      id={item.fileName}
                                    >
                                      <i
                                        className="fa fa-trash closeIcon"
                                        onClick={() => {
                                          this.deleteFile(item.fileName)
                                        }}
                                      />
                                    </div>
                                    <div className="progressBar">
                                      {item.percentage !== 'zeroPercent' ? (
                                        <Progress percent={item.percentage} />
                                      ) : null}
                                    </div>
                                  </div>
                                </li>
                              )
                            })}
                        </ul>
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Upload Photos">
                        {form.getFieldDecorator('Files')(
                          <Dragger
                            fileList={this.state.fileList}
                            multiple
                            showUploadList={false}
                            customRequest={this.dummyRequest}
                            onChange={this.handleFileChange}
                          >
                            <p className="ant-upload-drag-icon">
                              <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">
                              Click or drag file to this area to upload
                            </p>
                            <p className="ant-upload-hint">
                              Support for a single or bulk upload. Strictly prohibit from uploading
                              company data or other band files
                            </p>
                          </Dragger>,
                        )}
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
                {/* <AuditTimeline
                  audit={editGallery.audit ? editGallery.audit : gallery.galleryAudit}
                /> */}
                <AuditTimeline audit={editGallery.audit && editGallery.audit} />
              </div>
            </section>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default CreateGallery
