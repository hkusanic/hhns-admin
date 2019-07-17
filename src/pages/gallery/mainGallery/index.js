/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Form, Input, Button, Table, Switch } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { handleFilterGallery } from '../../../services/custom'
import styles from './style.module.scss'
import { formInputElements } from '../../../utils/addMainGalleryInput'
import { checkValidation } from '../../../utils/checkValidation'
import './index.css'

const FormItem = Form.Item

@Form.create()
@connect(({ galleryList }) => ({ galleryList }))
class MainGallery extends React.Component {
  state = {
    language: true,
    titleEn: '',
    titleRu: '',
    switchDisabled: true,
    formElements: formInputElements,
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'galleryListing/GET_MAIN_GALLERY_LIST',
    })

    dispatch({
      type: 'kirtan/RESET_STORE',
    })

    dispatch({
      type: 'video/RESET_STORE',
    })

    dispatch({
      type: 'blog/RESET_STORE',
    })
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = nextProps
    if (nextProps.galleryList.isCreated) {
      this.handleReset()
      dispatch({
        type: 'galleryListing/GET_MAIN_GALLERY_LIST',
      })
    }
    if (nextProps.galleryList.isDeleted) {
      dispatch({
        type: 'galleryListing/GET_MAIN_GALLERY_LIST',
      })
    }
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
  }

  handleDeleteMainGallery = uuid => {
    const { dispatch } = this.props
    dispatch({
      type: 'galleryListing/REMOVE_MAIN_GALLERY',
      uuid,
    })
  }

  uuidv4 = () => {
    // eslint-disable-next-line func-names
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      // eslint-disable-next-line no-bitwise
      const r = (Math.random() * 16) | 0

      // eslint-disable-next-line no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  handleFormBody = event => {
    event.preventDefault()
    const { form, dispatch } = this.props
    const { titleEn, titleRu } = this.state
    const body = {
      uuid: this.uuidv4(),
      date: new Date().toLocaleDateString(),
      name_en: titleEn,
      name_ru: titleRu,
    }
    dispatch({
      type: 'galleryListing/CREATE_MAIN_GALLERY',
      body,
    })
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
  }

  sortNumber = (a, b) => {
    return a - b
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

    if (titleEn !== '') {
      this.setState({ switchDisabled: false })
      return false
    }

    this.setState({ switchDisabled: true })
    return true
  }

  render() {
    const { form, galleryList } = this.props
    const { mainGallery, totalmainGallery } = galleryList
    const { language, titleEn, titleRu, switchDisabled, formElements } = this.state
    const mainGallery1 = handleFilterGallery(mainGallery)

    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'name_en' : 'name_ru',
        key: language ? 'name_en' : 'name_ru',
        render: title => <span>{title}</span>,
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <i
              className="fa fa-trash mr-2 closeIcon"
              onClick={() => {
                this.handleDeleteMainGallery(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]

    return (
      <div>
        <Helmet title="Main Gallery" />
        <section className="card">
          <div className="card-header mb-2">
            <div className="utils__title">
              <strong>Create Main Gallery</strong>
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
              </Form>
            </div>
            <div className={`${styles.submit} mb-3`}>
              <span className="mr-3">
                <Button type="primary" onClick={this.handleFormBody}>
                  Add
                </Button>
              </span>

              <Button type="danger" onClick={this.handleReset}>
                Discard
              </Button>
            </div>
          </div>
        </section>
        <div className="card">
          <div className="card-header">
            <div className="utils__title">
              <strong>Main Gallery List</strong>
            </div>
            <div className="card-body">
              <Table
                className="utils__scrollTable"
                scroll={{ x: '100%' }}
                columns={columns}
                dataSource={mainGallery1}
                pagination={{
                  pageSize: 5,
                  total: totalmainGallery,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MainGallery
